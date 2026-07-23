import { isStatVerified } from "@/lib/firestore/types";
import type { Statistic } from "@/lib/firestore/types";

/**
 * The gate every chart must go through: "if a statistic has no verified
 * source, the chart does not render" (docs/MASTER_PROMPT_v2.md Phase 5).
 * Filters to a specific dataset AND requires full provenance -- a record
 * with a dataset match but no sourceUrl/verifiedOn/publisher/year never
 * reaches a chart component.
 */
export function getVerifiedStatisticsForDataset(
  all: Statistic[],
  datasetKey: string
): Statistic[] {
  return all.filter((s) => s.dataset === datasetKey && isStatVerified(s));
}
