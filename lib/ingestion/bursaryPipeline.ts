import { extractStructuredData } from "./extract";
import { diffValue } from "./diff";
import { routeProposal } from "./route";
import { fetchSource } from "./fetchSourceText";
import { bursaryExtractionSchema, type BursaryExtractionItem } from "./schemas/bursary";
import { detectBursaryRiskFlags } from "./bursaryScamModel/detectRisk";
import type { ListingSourceType } from "./bursarySafety";
import { INGESTION_KILL_SWITCH } from "@/config/ingestion";
import type { Bursary, Source, VerificationQueueItem } from "@/lib/firestore/types";
import type { BudgetCheckResult } from "./types";

/**
 * Third real end-to-end orchestrator, same fetch -> extract -> diff ->
 * route -> persist shape as applicationWindowPipeline.ts/
 * programmeRequirementsPipeline.ts, with one addition neither of those
 * needs: every extracted bursary is screened by
 * bursaryScamModel/detectRisk.ts (keyword checks + the trained ML
 * classifier) before it's queued, and the resulting riskFlags are
 * queued as a field of their own -- visible to whoever reviews the
 * queue, never used to silently drop a listing before a human sees it.
 * bursaries never auto-publish regardless of confidence or risk score
 * (config/ingestion.ts CADENCE_RULES: "Never -- scam risk"), so this
 * queues every field of every extracted bursary unconditionally rather
 * than gating on routeProposal's confidence threshold the way the other
 * two pipelines do for their (non-high-risk) fields -- there is no
 * autoPublish path for this task to gate against.
 *
 * Unlike the other two pipelines, sources here are institution-agnostic
 * by design (Source.institutionId is null for bursary providers/
 * aggregators -- NSFAS, corporate bursary schemes, etc, per
 * lib/firestore/types.ts's own Source.institutionId doc comment), so
 * there is no skippedNoInstitution outcome and no institutionId field to
 * propose.
 */

const MAX_SOURCE_TEXT_CHARS = 20_000; // a bursary listing/aggregator page can be long, same order as programme lists
const ESTIMATED_OUTPUT_TOKENS = 2000; // an array of bursaries needs room, same order as programmeRequirements

const EXTRACTION_INSTRUCTIONS =
  "You are extracting bursary listings from a South African bursary provider or " +
  "aggregator web page's text. Find every distinct bursary mentioned. Always respond " +
  'with a JSON object shaped exactly {"bursaries": [...]} -- even if the page ' +
  "describes only one bursary, still wrap it in a bursaries array; never return a " +
  "bare array as the top-level response. For each bursary: name (the bursary's actual " +
  "title), provider (the organisation offering it), fieldsOfStudy (array of eligible " +
  "study fields, or an empty array if any field qualifies), levelRequired (one of " +
  "matricOnly/currentlyEnrolled/completedQualification), opensOn/closesOn (ISO date " +
  "strings YYYY-MM-DD, or null if not stated -- never guess a date), value (what the " +
  "bursary covers, e.g. 'Full tuition and accommodation', as stated), criteria (array " +
  "of eligibility requirements as stated), applyUrl (the specific application link, " +
  "or the page's own URL if no separate one is given), providerWebsiteUrl (the " +
  "provider's own official website if one is stated or linked, distinct from " +
  "wherever this page itself is hosted, else null), description (a 1-3 sentence " +
  "excerpt of this bursary's own descriptive text as it actually appears on the " +
  "page -- do not summarise across multiple bursaries). Set confidence (0-1) to how " +
  "certain you are this is a real, current bursary with accurately extracted details, " +
  "and extractionNotes to a one-sentence note on where you found it. Extract the " +
  "listing faithfully even if it looks suspicious (e.g. asks for payment, uses " +
  "urgent/guaranteed language) -- do not filter or judge legitimacy yourself, that " +
  "happens after extraction; just report what the page actually says, accurately, " +
  "including anything that reads as a scam pattern. If this page is not actually a " +
  "bursary listing (e.g. it's a general homepage with no bursaries named), return an " +
  "empty bursaries array -- never invent a bursary that isn't genuinely on the page.";

export type BursaryOutcome =
  | "queued"
  | "noChange"
  | "skippedDisabled"
  | "skippedRobots"
  | "fetchError"
  | "extractionError"
  | "budgetExceeded";

export interface BursarySourceResult {
  sourceId: string;
  outcome: BursaryOutcome;
  detail?: string;
  tokensUsed: number;
  bursariesFound: number;
  fieldsQueued: number;
  /** Set for each bursary that came back with at least one risk flag,
   * surfaced here too (not just inside the queued riskFlags field) so a
   * run summary is scannable without opening every queue item. */
  flaggedBursaryNames: string[];
  fetchedAt?: string;
  statusCode?: number | null;
  etag?: string | null;
  lastModified?: string | null;
  contentHash?: string;
}

export interface BursaryIngestionSummary {
  startedAt: string;
  finishedAt: string;
  results: BursarySourceResult[];
  totalTokensUsed: number;
  itemsQueued: number;
}

export interface BursaryIngestionDeps {
  llmClient: import("./llm/client").LlmClient;
  fetchImpl?: typeof fetch;
  now?: Date;
  /** Looks up an existing bursary by its derived docId
   * (`${slug(provider)}-${slug(name)}`), or null if this is the first
   * time it's been seen. Same disclosed name-collision/drift limitation
   * as programmeRequirementsPipeline.ts's getExistingProgramme. */
  getExistingBursary: (docId: string) => Promise<Bursary | null>;
  persistProposal: (item: Omit<VerificationQueueItem, "id">) => Promise<string>;
  checkBudgetLive: (estimatedTokens: number, tokensUsedThisRun: number) => Promise<BudgetCheckResult>;
}

const BURSARY_CORE_FIELDS = [
  "name",
  "provider",
  "fieldsOfStudy",
  "levelRequired",
  "opensOn",
  "closesOn",
  "value",
  "criteria",
  "applyUrl",
  "riskFlags",
] as const;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

/** governmentRegister/institutionAdmissions/etc sources aren't part of
 * this pipeline's Zod-validated "is this actually a bursary provider"
 * question -- ListingSourceType is a different axis (how much to trust
 * the page, for scam screening) than Source.type (what kind of body
 * publishes it). A registered bursaryProvider source is the closest
 * match to "an official site we already vetted enough to register";
 * everything else this pipeline might run against is treated as an
 * aggregator for screening purposes -- there is no path from a real
 * `Source` (curated, robots.txt-checked) to "socialMedia" today. */
function toListingSourceType(source: Source): ListingSourceType {
  return source.type === "bursaryProvider" ? "officialProviderSite" : "aggregator";
}

function queueFieldsForBursary(
  bursary: BursaryExtractionItem,
  existing: Bursary | null,
  sourceType: ListingSourceType
): { field: string; currentValue: unknown; proposedValue: unknown }[] {
  const riskFlags = detectBursaryRiskFlags({
    name: bursary.name,
    value: bursary.value,
    criteria: bursary.criteria,
    providerWebsiteUrl: bursary.providerWebsiteUrl,
    sourceType,
    rawText: bursary.description,
  });

  const proposedValues: Record<string, unknown> = {
    name: bursary.name,
    provider: bursary.provider,
    fieldsOfStudy: bursary.fieldsOfStudy,
    levelRequired: bursary.levelRequired,
    opensOn: bursary.opensOn,
    closesOn: bursary.closesOn,
    value: bursary.value,
    criteria: bursary.criteria,
    applyUrl: bursary.applyUrl,
    riskFlags,
  };

  // Every changed field queues (not gated through routeProposal's
  // confidence/autoPublish check the way the other two pipelines' fields
  // are -- bursaries never auto-publish regardless of confidence, so
  // there's no threshold to gate against; routeProposal is still called
  // to respect its diffChanged skip, so a field genuinely unchanged from
  // what's on record doesn't re-queue every run). riskFlags in
  // particular must always be able to reach the queue even when nothing
  // else about the listing changed, since a listing can go from safe to
  // flagged (or the reverse, e.g. a provider adds a verifiable website)
  // on a later run with identical other fields.
  const queued: { field: string; currentValue: unknown; proposedValue: unknown }[] = [];
  for (const field of BURSARY_CORE_FIELDS) {
    const diff = diffValue(existing?.[field as keyof Bursary], proposedValues[field]);
    const decision = routeProposal({
      taskAutoPublish: false,
      confidence: 1, // irrelevant to the outcome here -- taskAutoPublish is already false
      corroboratingSourceCount: 1,
      isHighRiskField: true,
      diffChanged: diff.changed,
    });
    if (decision === "queueForReview") {
      queued.push({ field, currentValue: diff.currentValue ?? null, proposedValue: diff.proposedValue });
    }
  }
  return queued;
}

export async function runBursaryIngestion(
  sources: Source[],
  deps: BursaryIngestionDeps
): Promise<BursaryIngestionSummary> {
  const startedAt = new Date().toISOString();
  const fetchImpl = deps.fetchImpl ?? fetch;
  const now = deps.now ?? new Date();
  const results: BursarySourceResult[] = [];
  let tokensUsedThisRun = 0;
  let itemsQueued = 0;

  for (const source of sources) {
    if (INGESTION_KILL_SWITCH) {
      results.push({ sourceId: source.id, outcome: "skippedDisabled", detail: "Ingestion kill switch is enabled.", tokensUsed: 0, bursariesFound: 0, fieldsQueued: 0, flaggedBursaryNames: [] });
      continue;
    }
    if (!source.enabled) {
      results.push({ sourceId: source.id, outcome: "skippedDisabled", tokensUsed: 0, bursariesFound: 0, fieldsQueued: 0, flaggedBursaryNames: [] });
      continue;
    }
    if (!source.robotsAllowed) {
      results.push({ sourceId: source.id, outcome: "skippedRobots", tokensUsed: 0, bursariesFound: 0, fieldsQueued: 0, flaggedBursaryNames: [] });
      continue;
    }

    const fetchOutcome = await fetchSource(source, fetchImpl, MAX_SOURCE_TEXT_CHARS, now);
    if (fetchOutcome.skipped) {\n      results.push({ sourceId: source.id, ...(source.institutionId !== undefined ? { institutionId: source.institutionId } : {}), outcome: "skipped", detail: fetchOutcome.error ?? "Source is not due for fetching.", tokensUsed: 0, ...(path.includes("bursary") ? { bursariesFound: 0, fieldsQueued: 0, flaggedBursaryNames: [] } : path.includes("programme") ? { programmesFound: 0, fieldsQueued: 0 } : { fieldsQueued: [] }), fetchedAt: fetchOutcome.fetchedAt, statusCode: fetchOutcome.statusCode, etag: fetchOutcome.etag, lastModified: fetchOutcome.lastModified, contentHash: fetchOutcome.contentHash });\n      continue;\n    }\n    if (fetchOutcome.error || fetchOutcome.body === null) {
      results.push({
        sourceId: source.id,
        outcome: "fetchError",
        detail: fetchOutcome.error ?? "Source returned no body.",
        tokensUsed: 0,
        bursariesFound: 0,
        fieldsQueued: 0,
        flaggedBursaryNames: [],
        fetchedAt: fetchOutcome.fetchedAt,
        statusCode: fetchOutcome.statusCode,
        etag: fetchOutcome.etag,
        lastModified: fetchOutcome.lastModified,
        contentHash: fetchOutcome.contentHash,
      });
      continue;
    }

    if (!fetchOutcome.changed) {
      results.push({ sourceId: source.id, outcome: "noChange", tokensUsed: 0, bursariesFound: 0, fieldsQueued: 0, flaggedBursaryNames: [], fetchedAt: fetchOutcome.fetchedAt, statusCode: fetchOutcome.statusCode, etag: fetchOutcome.etag, lastModified: fetchOutcome.lastModified, contentHash: fetchOutcome.contentHash });
      continue;
    }
    const sourceText = fetchOutcome.body;
    const estimatedTokens = Math.ceil(sourceText.length / 4) + ESTIMATED_OUTPUT_TOKENS;
    const budgetCheck = await deps.checkBudgetLive(estimatedTokens, tokensUsedThisRun);
    if (!budgetCheck.allowed) {
      results.push({
        sourceId: source.id,
        outcome: "budgetExceeded",
        detail: budgetCheck.reason ?? undefined,
        tokensUsed: 0,
        bursariesFound: 0,
        fieldsQueued: 0,
        flaggedBursaryNames: [],
      });
      break; // budget is shared across the whole run -- stop here, not just this source
    }

    const extraction = await extractStructuredData(deps.llmClient, {
      sourceText,
      instructions: EXTRACTION_INSTRUCTIONS,
      schema: bursaryExtractionSchema,
    });

    if (!extraction.success) {
      results.push({
        sourceId: source.id,
        outcome: "extractionError",
        detail: extraction.error,
        tokensUsed: 0,
        bursariesFound: 0,
        fieldsQueued: 0,
        flaggedBursaryNames: [],
      });
      continue;
    }
    tokensUsedThisRun += extraction.tokensUsed;

    const extractedAt = now.toISOString();
    const sourceType = toListingSourceType(source);
    let fieldsQueuedThisSource = 0;
    const flaggedBursaryNames: string[] = [];

    for (const bursary of extraction.data.bursaries) {
      const docId = `${slugify(bursary.provider)}-${slugify(bursary.name)}`;
      const existing = await deps.getExistingBursary(docId);
      const fieldsToQueue = queueFieldsForBursary(bursary, existing, sourceType);

      for (const { field, currentValue, proposedValue } of fieldsToQueue) {
        await deps.persistProposal({
          collection: "bursaries",
          docId,
          field,
          currentValue,
          proposedValue,
          confidence: bursary.confidence,
          sourceUrl: source.url,
          extractedAt,
          corroboratingSources: [source.url],
          status: "pending",
          reviewedBy: null,
          reviewedAt: null,
        });
        fieldsQueuedThisSource++;
        itemsQueued++;

        if (field === "riskFlags" && Array.isArray(proposedValue) && proposedValue.length > 0) {
          flaggedBursaryNames.push(bursary.name);
        }
      }
    }

    results.push({
      sourceId: source.id,
      outcome: fieldsQueuedThisSource > 0 ? "queued" : "noChange",
      tokensUsed: extraction.tokensUsed,
      bursariesFound: extraction.data.bursaries.length,
      fieldsQueued: fieldsQueuedThisSource,
      flaggedBursaryNames,
      fetchedAt: fetchOutcome.fetchedAt,
      statusCode: fetchOutcome.statusCode,
      etag: fetchOutcome.etag,
      lastModified: fetchOutcome.lastModified,
      contentHash: fetchOutcome.contentHash,
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
