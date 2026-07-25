import { z } from "zod";
import { ALL_SEED_SUBJECTS, HOME_LANGUAGE_OPTIONS, LANGUAGE_CODES } from "@/config/subjects";

/**
 * Every canonical subject code the APS engine actually understands --
 * the fixed elective/Mathematics/LO codes plus every derived language
 * code (12 languages x HL/FAL). A model extracting "Physical Sciences"
 * or "Mathematics" from prose must map it to one of these, and an
 * unrecognised code is rejected (Zod .refine, not z.enum -- this set is
 * computed from config/subjects.ts at runtime, not a literal tuple type)
 * rather than silently accepted as a free-text string the APS engine
 * could never actually match against.
 */
const VALID_SUBJECT_CODES = new Set<string>([
  ...ALL_SEED_SUBJECTS.map((s) => s.code),
  ...HOME_LANGUAGE_OPTIONS.flatMap((lang) => [`${LANGUAGE_CODES[lang]}-HL`, `${LANGUAGE_CODES[lang]}-FAL`]),
]);

const subjectRequirementExtractionSchema = z.object({
  subjectCode: z.string().superRefine((code, ctx) => {
    if (!VALID_SUBJECT_CODES.has(code)) {
      ctx.addIssue({
        code: "custom",
        message: `subjectCode "${code}" is not one of the canonical NSC codes from config/subjects.ts`,
      });
    }
  }),
  minLevel: z.number().min(1).max(7).nullable(),
  minPercent: z.number().min(0).max(100).nullable(),
});

/** Models are inconsistent about wrapping a single free-text requirement
 * in an array despite instructions -- observed emitting a bare string or
 * null instead of string[] for additionalRequirements (live-verified
 * against real UMP pages). This normalizes the SHAPE only (null -> [],
 * a lone string -> a one-item array) before validation; it never invents
 * or drops actual content, so it stays inside "reject bad content, don't
 * coerce bad content" -- only genuinely equivalent shapes are accepted. */
const stringArrayLenient = z.preprocess((value) => {
  if (value === null || value === undefined) return [];
  if (typeof value === "string") return [value];
  return value;
}, z.array(z.string()));

/**
 * One extracted programme. Deliberately scoped to the fields that
 * actually drive APS matching (lib/aps, lib/matching) -- name,
 * qualification type, minAps, subjectRequirements -- not every field
 * Programme (lib/firestore/types.ts) has room for. modeOfDelivery,
 * campuses, saqaId, careerOutcomes, fieldTags are lower-value / harder
 * to verify from prose and are left for manual entry via the admin
 * content editor after these core fields are approved, same as how a
 * newly-ingested programme is never a single atomic write -- every
 * field is its own queue item regardless.
 *
 * facultyName is free text, not a resolved Faculty document reference --
 * no real Faculty/School records exist for any real institution yet
 * (only lib/config/sampleData.ts's fictional ones do; building that is
 * the separate, not-yet-built facultySchoolStructure ingestion task).
 * The orchestrator derives an internal grouping key from this name
 * rather than claiming it's a verified Faculty id.
 */
const programmeExtractionItemSchema = z.object({
  name: z.string().min(1),
  facultyName: z.string().nullable(),
  qualificationType: z.enum([
    "higherCertificate",
    "diploma",
    "advancedDiploma",
    "bachelorsDegree",
    "bachelorsDegreeExtended",
    "postgraduateDiploma",
    "honoursDegree",
  ]),
  nqfLevel: z.number().nullable(),
  duration: z.string().nullable(),
  minAps: z.number().nullable(),
  subjectRequirements: z.array(subjectRequirementExtractionSchema),
  additionalRequirements: stringArrayLenient,
  applyUrl: z.string().nullable(),
  /** The model's own confidence in this one programme's extraction, 0-1
   * -- programmeRequirements never auto-publishes regardless (see
   * config/ingestion.ts CADENCE_RULES: "feeds the APS engine directly"),
   * but still useful for prioritising the verification queue. */
  confidence: z.number().min(0).max(1),
  extractionNotes: z.string(),
});

export type ProgrammeExtractionItem = z.infer<typeof programmeExtractionItemSchema>;

/** A single source page can list many programmes (a faculty's full
 * qualification list, a "fields of study" page) -- unlike
 * applicationWindow's one-record-per-page shape, this is deliberately
 * an array. An empty array is a valid, honest result for a page that
 * turns out not to be a programme list at all. */
export const programmeRequirementsExtractionSchema = z.object({
  programmes: z.array(programmeExtractionItemSchema),
});

export type ProgrammeRequirementsExtraction = z.infer<typeof programmeRequirementsExtractionSchema>;
