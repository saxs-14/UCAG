import { extractStructuredData } from "./extract";
import { diffValue } from "./diff";
import { routeProposal } from "./route";
import { fetchSourceText } from "./fetchSourceText";
import { applicationWindowExtractionSchema } from "./schemas/applicationWindow";
import { INGESTION_KILL_SWITCH } from "@/config/ingestion";
import type { LlmClient } from "./llm/client";
import type { ApplicationWindow, Source, VerificationQueueItem } from "@/lib/firestore/types";
import type { BudgetCheckResult } from "./types";

/**
 * The first real end-to-end pipeline: fetch -> respect the source
 * register's robots.txt/enabled flags -> extract via whichever LlmClient
 * is configured -> diff against what's on record -> route (always queues
 * for this task -- application dates are never auto-published, see
 * config/ingestion.ts CADENCE_RULES) -> persist. Everything before this
 * was individually-tested pieces (Phase 4) with nothing wiring them
 * together against a real provider; this is that wiring.
 *
 * Dependencies are injectable (same pattern as lib/ingestion/pipeline.ts's
 * runLinkHealthCheck) specifically so the routing/skip/budget logic is
 * fully unit-testable without a real LLM key or live Firestore.
 */

const MAX_SOURCE_TEXT_CHARS = 15_000; // ~3-4K tokens -- a direct cost cap, not just a safety net
const ESTIMATED_OUTPUT_TOKENS = 300;

const EXTRACTION_INSTRUCTIONS =
  "You are extracting university application open/close dates from an admissions " +
  "web page's text. Find the general undergraduate application window for the " +
  "upcoming academic year. Respond with opensOn/closesOn/lateClosesOn as ISO date " +
  'strings (YYYY-MM-DD) or null if genuinely not stated -- never guess a date. Set ' +
  "confidence (0-1) to how certain you are this is the correct, current window, " +
  "and extractionNotes to a one-sentence note on where in the text you found it (or " +
  "why you couldn't).";

export type ApplicationWindowOutcome =
  | "queued"
  | "noChange"
  | "skippedDisabled"
  | "skippedRobots"
  | "skippedNoInstitution"
  | "fetchError"
  | "extractionError"
  | "budgetExceeded";

export interface ApplicationWindowSourceResult {
  sourceId: string;
  institutionId: string | null;
  outcome: ApplicationWindowOutcome;
  detail?: string;
  tokensUsed: number;
  fieldsQueued: string[];
}

export interface ApplicationWindowIngestionSummary {
  startedAt: string;
  finishedAt: string;
  results: ApplicationWindowSourceResult[];
  totalTokensUsed: number;
  itemsQueued: number;
}

export interface ApplicationWindowIngestionDeps {
  llmClient: LlmClient;
  fetchImpl?: typeof fetch;
  now?: Date;
  getCurrentWindow: (institutionId: string) => Promise<ApplicationWindow | null>;
  persistProposal: (item: Omit<VerificationQueueItem, "id">) => Promise<string>;
  /** Injected so tests don't need a live Firestore for month-to-date
   * usage -- see lib/ingestion/budgetTracker.ts for the real implementation. */
  checkBudgetLive: (estimatedTokens: number, tokensUsedThisRun: number) => Promise<BudgetCheckResult>;
}

export async function runApplicationWindowIngestion(
  sources: Source[],
  deps: ApplicationWindowIngestionDeps
): Promise<ApplicationWindowIngestionSummary> {
  const startedAt = new Date().toISOString();
  const fetchImpl = deps.fetchImpl ?? fetch;
  const now = deps.now ?? new Date();
  const results: ApplicationWindowSourceResult[] = [];
  let tokensUsedThisRun = 0;
  let itemsQueued = 0;

  for (const source of sources) {
    if (INGESTION_KILL_SWITCH) {
      results.push({ sourceId: source.id, institutionId: source.institutionId, outcome: "skippedDisabled", detail: "Ingestion kill switch is enabled.", tokensUsed: 0, fieldsQueued: [] });
      continue;
    }
    if (!source.enabled) {
      results.push({ sourceId: source.id, institutionId: source.institutionId, outcome: "skippedDisabled", tokensUsed: 0, fieldsQueued: [] });
      continue;
    }
    if (!source.robotsAllowed) {
      results.push({ sourceId: source.id, institutionId: source.institutionId, outcome: "skippedRobots", tokensUsed: 0, fieldsQueued: [] });
      continue;
    }
    if (!source.institutionId) {
      results.push({ sourceId: source.id, institutionId: null, outcome: "skippedNoInstitution", tokensUsed: 0, fieldsQueued: [] });
      continue;
    }

    let sourceText: string;
    try {
      sourceText = await fetchSourceText(source.url, fetchImpl, MAX_SOURCE_TEXT_CHARS);
    } catch (err) {
      results.push({
        sourceId: source.id,
        institutionId: source.institutionId,
        outcome: "fetchError",
        detail: err instanceof Error ? err.message : String(err),
        tokensUsed: 0,
        fieldsQueued: [],
      });
      continue;
    }

    const estimatedTokens = Math.ceil(sourceText.length / 4) + ESTIMATED_OUTPUT_TOKENS;
    const budgetCheck = await deps.checkBudgetLive(estimatedTokens, tokensUsedThisRun);
    if (!budgetCheck.allowed) {
      results.push({
        sourceId: source.id,
        institutionId: source.institutionId,
        outcome: "budgetExceeded",
        detail: budgetCheck.reason ?? undefined,
        tokensUsed: 0,
        fieldsQueued: [],
      });
      break; // budget is shared across the whole run -- stop here, not just this source
    }

    const extraction = await extractStructuredData(deps.llmClient, {
      sourceText,
      instructions: EXTRACTION_INSTRUCTIONS,
      schema: applicationWindowExtractionSchema,
    });

    if (!extraction.success) {
      results.push({
        sourceId: source.id,
        institutionId: source.institutionId,
        outcome: "extractionError",
        detail: extraction.error,
        tokensUsed: 0,
        fieldsQueued: [],
      });
      continue;
    }
    tokensUsedThisRun += extraction.tokensUsed;

    const currentWindow = await deps.getCurrentWindow(source.institutionId);
    const docId = currentWindow?.id ?? `${source.institutionId}-general`;
    const extractedAt = now.toISOString();
    const fieldsQueued: string[] = [];

    const dateFields = ["opensOn", "closesOn", "lateClosesOn"] as const;
    for (const field of dateFields) {
      // No `?? undefined` here -- currentWindow?.[field] already correctly
      // yields undefined when there's no document at all, and must be
      // allowed to yield a real `null` when the document exists and the
      // field is genuinely recorded as "no date." Collapsing that null to
      // undefined made diffValue see a change on every already-correct
      // null field, since JSON.stringify(undefined) and
      // JSON.stringify(null) are never equal (a real bug caught by the
      // "reports noChange" test below).
      const diff = diffValue(currentWindow?.[field], extraction.data[field]);
      const decision = routeProposal({
        taskAutoPublish: false, // CADENCE_RULES.applicationWindows.autoPublish -- always false
        confidence: extraction.data.confidence,
        corroboratingSourceCount: 1, // no cross-source corroboration built yet
        isHighRiskField: true, // a wrong date costs a learner a year -- never auto-publish
        diffChanged: diff.changed,
      });

      if (decision === "queueForReview") {
        await deps.persistProposal({
          collection: "applicationWindows",
          docId,
          field,
          currentValue: diff.currentValue ?? null,
          proposedValue: diff.proposedValue,
          confidence: extraction.data.confidence,
          sourceUrl: source.url,
          extractedAt,
          corroboratingSources: [source.url],
          status: "pending",
          reviewedBy: null,
          reviewedAt: null,
        });
        fieldsQueued.push(field);
        itemsQueued++;
      }
    }

    // A genuinely new institution (no applicationWindows doc at all yet)
    // also needs its structural identity fields proposed once -- these
    // are certain (derived from the source register, not the model's
    // guess), so confidence 1.0, but still queued rather than written
    // directly: the target collection is never client- or
    // pipeline-writable outside the verification queue (firestore.rules).
    if (!currentWindow) {
      for (const [field, proposedValue] of [
        ["institutionId", source.institutionId] as const,
        ["programmeId", null] as const,
      ]) {
        await deps.persistProposal({
          collection: "applicationWindows",
          docId,
          field,
          currentValue: null,
          proposedValue,
          confidence: 1,
          sourceUrl: source.url,
          extractedAt,
          corroboratingSources: [source.url],
          status: "pending",
          reviewedBy: null,
          reviewedAt: null,
        });
        fieldsQueued.push(field);
        itemsQueued++;
      }
    }

    results.push({
      sourceId: source.id,
      institutionId: source.institutionId,
      outcome: fieldsQueued.length > 0 ? "queued" : "noChange",
      tokensUsed: extraction.tokensUsed,
      fieldsQueued,
    });
  }

  return {
    startedAt,
    finishedAt: new Date().toISOString(),
    results,
    totalTokensUsed: tokensUsedThisRun,
    itemsQueued,
  };
}
