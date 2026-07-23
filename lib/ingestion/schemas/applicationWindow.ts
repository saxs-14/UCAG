import { z } from "zod";

/**
 * One concrete example of the "structured JSON output only, validated
 * against a Zod schema" pattern (docs/MASTER_PROMPT_v2.md Phase 4),
 * applied to the highest-trust extraction task: application open/close
 * dates. Dates are ISO strings or null (never omitted) so a model can't
 * silently skip a field it's unsure about -- an explicit null is a
 * distinguishable "the model found no date," not "the field wasn't in
 * the response."
 */
export const applicationWindowExtractionSchema = z.object({
  opensOn: z.string().nullable(),
  closesOn: z.string().nullable(),
  lateClosesOn: z.string().nullable(),
  /** The model's own confidence in this extraction, 0-1 -- feeds
   * lib/ingestion/route.ts's auto-publish threshold. Application windows
   * never auto-publish regardless (see config/ingestion.ts CADENCE_RULES),
   * but the field is still useful for prioritising the verification queue. */
  confidence: z.number().min(0).max(1),
  extractionNotes: z.string(),
});

export type ApplicationWindowExtraction = z.infer<typeof applicationWindowExtractionSchema>;
