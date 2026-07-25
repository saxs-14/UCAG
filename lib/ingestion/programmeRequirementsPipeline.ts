import { extractStructuredData } from "./extract";
import { diffValue } from "./diff";
import { routeProposal } from "./route";
import { fetchSourceText } from "./fetchSourceText";
import {
  programmeRequirementsExtractionSchema,
  type ProgrammeExtractionItem,
} from "./schemas/programmeRequirements";
import { INGESTION_KILL_SWITCH } from "@/config/ingestion";
import type { Programme, Source, SubjectRequirement, VerificationQueueItem } from "@/lib/firestore/types";
import type { BudgetCheckResult } from "./types";

/**
 * The second real end-to-end orchestrator, same shape as
 * applicationWindowPipeline.ts: fetch -> extract -> diff -> route ->
 * persist, respecting kill-switch/enabled/robots/budget. The real
 * difference: one source page can list MANY programmes (a faculty's
 * qualification list), not one fixed record -- see
 * lib/ingestion/schemas/programmeRequirements.ts for why that schema is
 * an array, and for the deliberate scope decision to extract only the
 * fields that drive APS matching (name/qualificationType/minAps/
 * subjectRequirements), not every field Programme has room for.
 *
 * programmeRequirements never auto-publishes (config/ingestion.ts
 * CADENCE_RULES: "feeds the APS engine directly") -- exactly the same
 * discipline as applicationWindows, for the same reason: a wrong APS
 * threshold or subject requirement is a fact a learner acts on directly.
 */

const MAX_SOURCE_TEXT_CHARS = 20_000; // programme-list pages run longer than a dates page
const ESTIMATED_OUTPUT_TOKENS = 2000; // an array of programmes needs more room than 3 date fields

const EXTRACTION_INSTRUCTIONS =
  "You are extracting undergraduate programme/qualification requirements from a " +
  "South African university admissions or programme-list web page's text. Find every " +
  "distinct programme/qualification mentioned with enough detail to identify its " +
  "admission requirements. For each: name (the programme's actual title, not a " +
  "faculty or category heading), facultyName (the faculty/school it belongs to, or " +
  "null if not stated), qualificationType (one of higherCertificate/diploma/" +
  "advancedDiploma/bachelorsDegree/bachelorsDegreeExtended/postgraduateDiploma/" +
  "honoursDegree -- infer from the title/context, e.g. 'BSc' is bachelorsDegree), " +
  "nqfLevel (the NQF level number if stated, else null), duration (e.g. '3 years', " +
  "or null), minAps (the minimum APS/admission score if stated as a single number, " +
  "else null), subjectRequirements (an array of {subjectCode, minLevel, minPercent} " +
  "using ONLY canonical NSC subject codes -- MATH, MATHLIT, TECHMATH, LO, or an " +
  "elective/language code; never invent a code for a subject you can't map to one of " +
  "these), additionalRequirements (any other stated requirement as short strings, " +
  "e.g. 'portfolio submission required'), applyUrl (a specific apply link for this " +
  "programme if one is given, else null). Set confidence (0-1) per programme to how " +
  "certain you are this is a real, current programme with accurately extracted " +
  "requirements, and extractionNotes to a one-sentence note on where you found it. " +
  "If this page is not actually a programme list (e.g. it's a general homepage with " +
  "no qualifications named), return an empty programmes array -- never invent a " +
  "programme that isn't genuinely on the page.";

export type ProgrammeRequirementsOutcome =
  | "queued"
  | "noChange"
  | "skippedDisabled"
  | "skippedRobots"
  | "skippedNoInstitution"
  | "fetchError"
  | "extractionError"
  | "budgetExceeded";

export interface ProgrammeRequirementsSourceResult {
  sourceId: string;
  institutionId: string | null;
  outcome: ProgrammeRequirementsOutcome;
  detail?: string;
  tokensUsed: number;
  programmesFound: number;
  fieldsQueued: number;
}

export interface ProgrammeRequirementsSummary {
  startedAt: string;
  finishedAt: string;
  results: ProgrammeRequirementsSourceResult[];
  totalTokensUsed: number;
  itemsQueued: number;
}

export interface ProgrammeRequirementsDeps {
  llmClient: import("./llm/client").LlmClient;
  fetchImpl?: typeof fetch;
  now?: Date;
  /** Looks up an existing programme by its derived docId
   * (`${institutionId}-${slug(name)}`), or null if this is the first
   * time it's been seen. */
  getExistingProgramme: (docId: string) => Promise<Programme | null>;
  persistProposal: (item: Omit<VerificationQueueItem, "id">) => Promise<string>;
  checkBudgetLive: (estimatedTokens: number, tokensUsedThisRun: number) => Promise<BudgetCheckResult>;
}

const PROGRAMME_CORE_FIELDS = [
  "name",
  "facultyId",
  "schoolId",
  "qualificationType",
  "nqfLevel",
  "duration",
  "minAps",
  "subjectRequirements",
  "additionalRequirements",
  "applyUrl",
] as const;

/** Deterministic, not a verified identifier -- two genuinely distinct
 * programmes that happen to share a name (different campuses, different
 * intake years with reworded titles) will collide onto the same docId,
 * and minor wording drift between runs will NOT collide (creating a
 * near-duplicate instead of updating the existing one). A known,
 * disclosed limitation, not a hidden one -- resolving it properly needs
 * a real programme catalogue/matching strategy, out of scope here. */
/** Programme.subjectRequirements (lib/firestore/types.ts) uses optional
 * (`minLevel?`/`minPercent?`) fields that a real stored document omits
 * rather than storing as null -- but the extraction schema always emits
 * both as explicit null when not applicable (so a model can't silently
 * skip a field, same reasoning as applicationWindow's date fields).
 * Without normalizing, an unchanged programme's subjectRequirements
 * diffs as "changed" purely because `{minLevel:5}` and
 * `{minLevel:5,minPercent:null}` JSON.stringify differently -- caught by
 * the "reports noChange" test below. */
function normalizeSubjectRequirements(
  requirements: { subjectCode: string; minLevel: number | null; minPercent: number | null }[]
): SubjectRequirement[] {
  return requirements.map(({ subjectCode, minLevel, minPercent }) => ({
    subjectCode,
    ...(minLevel !== null ? { minLevel } : {}),
    ...(minPercent !== null ? { minPercent } : {}),
  }));
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

function queueFieldsForProgramme(
  programme: ProgrammeExtractionItem,
  existing: Programme | null,
  docId: string,
  institutionId: string,
  facultyId: string
): { field: string; currentValue: unknown; proposedValue: unknown }[] {
  const proposedValues: Record<string, unknown> = {
    name: programme.name,
    facultyId,
    schoolId: facultyId, // see file header -- no verified School structure exists yet either; grouped 1:1 with faculty for now
    qualificationType: programme.qualificationType,
    nqfLevel: programme.nqfLevel,
    duration: programme.duration,
    minAps: programme.minAps,
    subjectRequirements: normalizeSubjectRequirements(programme.subjectRequirements),
    additionalRequirements: programme.additionalRequirements,
    applyUrl: programme.applyUrl,
  };

  const queued: { field: string; currentValue: unknown; proposedValue: unknown }[] = [];
  for (const field of PROGRAMME_CORE_FIELDS) {
    const diff = diffValue(existing?.[field as keyof Programme], proposedValues[field]);
    const decision = routeProposal({
      taskAutoPublish: false, // CADENCE_RULES.programmeRequirements.autoPublish -- always false
      confidence: programme.confidence,
      corroboratingSourceCount: 1,
      isHighRiskField: true, // feeds the APS engine directly -- never auto-publish
      diffChanged: diff.changed,
    });
    if (decision === "queueForReview") {
      queued.push({ field, currentValue: diff.currentValue ?? null, proposedValue: diff.proposedValue });
    }
  }
  return queued;
}

export async function runProgrammeRequirementsIngestion(
  sources: Source[],
  deps: ProgrammeRequirementsDeps
): Promise<ProgrammeRequirementsSummary> {
  const startedAt = new Date().toISOString();
  const fetchImpl = deps.fetchImpl ?? fetch;
  const now = deps.now ?? new Date();
  const results: ProgrammeRequirementsSourceResult[] = [];
  let tokensUsedThisRun = 0;
  let itemsQueued = 0;

  for (const source of sources) {
    if (INGESTION_KILL_SWITCH) {
      results.push({ sourceId: source.id, institutionId: source.institutionId, outcome: "skippedDisabled", detail: "Ingestion kill switch is enabled.", tokensUsed: 0, programmesFound: 0, fieldsQueued: 0 });
      continue;
    }
    if (!source.enabled) {
      results.push({ sourceId: source.id, institutionId: source.institutionId, outcome: "skippedDisabled", tokensUsed: 0, programmesFound: 0, fieldsQueued: 0 });
      continue;
    }
    if (!source.robotsAllowed) {
      results.push({ sourceId: source.id, institutionId: source.institutionId, outcome: "skippedRobots", tokensUsed: 0, programmesFound: 0, fieldsQueued: 0 });
      continue;
    }
    if (!source.institutionId) {
      results.push({ sourceId: source.id, institutionId: null, outcome: "skippedNoInstitution", tokensUsed: 0, programmesFound: 0, fieldsQueued: 0 });
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
        programmesFound: 0,
        fieldsQueued: 0,
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
        programmesFound: 0,
        fieldsQueued: 0,
      });
      break; // budget is shared across the whole run -- stop here, not just this source
    }

    const extraction = await extractStructuredData(deps.llmClient, {
      sourceText,
      instructions: EXTRACTION_INSTRUCTIONS,
      schema: programmeRequirementsExtractionSchema,
    });

    if (!extraction.success) {
      results.push({
        sourceId: source.id,
        institutionId: source.institutionId,
        outcome: "extractionError",
        detail: extraction.error,
        tokensUsed: 0,
        programmesFound: 0,
        fieldsQueued: 0,
      });
      continue;
    }
    tokensUsedThisRun += extraction.tokensUsed;

    const extractedAt = now.toISOString();
    let fieldsQueuedThisSource = 0;

    for (const programme of extraction.data.programmes) {
      const docId = `${source.institutionId}-${slugify(programme.name)}`;
      const facultyId = programme.facultyName
        ? `${source.institutionId}-fac-${slugify(programme.facultyName)}`
        : `${source.institutionId}-fac-unspecified`;
      const existing = await deps.getExistingProgramme(docId);

      const fieldsToQueue = queueFieldsForProgramme(programme, existing, docId, source.institutionId, facultyId);
      for (const { field, currentValue, proposedValue } of fieldsToQueue) {
        await deps.persistProposal({
          collection: "programmes",
          docId,
          field,
          currentValue,
          proposedValue,
          confidence: programme.confidence,
          sourceUrl: source.url,
          extractedAt,
          corroboratingSources: [source.url],
          status: "pending",
          reviewedBy: null,
          reviewedAt: null,
        });
        fieldsQueuedThisSource++;
        itemsQueued++;
      }
    }

    results.push({
      sourceId: source.id,
      institutionId: source.institutionId,
      outcome: fieldsQueuedThisSource > 0 ? "queued" : "noChange",
      tokensUsed: extraction.tokensUsed,
      programmesFound: extraction.data.programmes.length,
      fieldsQueued: fieldsQueuedThisSource,
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
