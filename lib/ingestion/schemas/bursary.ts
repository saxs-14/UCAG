import { z } from "zod";

/**
 * Same "structured JSON output only, Zod-validated" pattern as
 * applicationWindow.ts/programmeRequirements.ts, applied to bursaries. A
 * source page can list many bursaries (an aggregator/provider listing
 * page), so this is an array, same reasoning as programmeRequirements.
 *
 * `description` carries the model's excerpt of that specific bursary's
 * own descriptive text (not the whole page) -- this is what
 * bursaryScamModel/detectRisk.ts screens, via
 * BursaryScamCheckInput.rawText. Screening the whole page would let one
 * scam listing on an aggregator page taint an unrelated legitimate one
 * (or the reverse), which defeats the point.
 */
export const bursaryExtractionSchema = z.object({
  bursaries: z.array(
    z.object({
      name: z.string(),
      provider: z.string(),
      fieldsOfStudy: z.array(z.string()),
      levelRequired: z.enum(["matricOnly", "currentlyEnrolled", "completedQualification"]),
      opensOn: z.string().nullable(),
      closesOn: z.string().nullable(),
      value: z.string(),
      criteria: z.array(z.string()),
      applyUrl: z.string(),
      /** The bursary's own provider site, distinct from the page this was
       * found on (e.g. found on a bursary-listing aggregator, but the
       * provider is a real company with its own site) -- null if no such
       * link is stated. Feeds detectBursaryRiskFlags's
       * noVerifiableProviderWebsite check. */
      providerWebsiteUrl: z.string().nullable(),
      /** This specific bursary's own descriptive text as it appears on
       * the page -- see file header. */
      description: z.string(),
      confidence: z.number().min(0).max(1),
      extractionNotes: z.string(),
    })
  ),
});

export type BursaryExtractionItem = z.infer<typeof bursaryExtractionSchema>["bursaries"][number];
