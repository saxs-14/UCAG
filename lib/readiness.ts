import { APPLICATION_CHECKLIST_ITEMS } from "@/config/applicationDocuments";
import type { MatchResult } from "@/lib/matching/types";

/**
 * Pure, same discipline as lib/aps and lib/matching -- no Firebase/React
 * imports. Combines two independent signals into one "how ready am I to
 * actually apply" number: (a) this specific programme's subject/APS
 * requirements, already computed by lib/matching/engine, and (b) the
 * generic application-readiness checklist (config/applicationDocuments.ts),
 * which is the same for every programme since it's not institution-
 * specific. A programme with zero listed requirements and a fully-ticked
 * checklist reads as 100%, not undefined/NaN.
 */
export interface ReadinessResult {
  /** 0-100, rounded. */
  percent: number;
  metCount: number;
  totalCount: number;
}

export function calculateReadiness(
  matchResult: MatchResult,
  checkedItemIds: ReadonlySet<string>
): ReadinessResult {
  const subjectTotal = matchResult.reasons.length;
  const subjectMet = matchResult.reasons.filter((r) => "met" in r && r.met).length;

  const checklistTotal = APPLICATION_CHECKLIST_ITEMS.length;
  const checklistMet = APPLICATION_CHECKLIST_ITEMS.filter((item) =>
    checkedItemIds.has(item.id)
  ).length;

  const totalCount = subjectTotal + checklistTotal;
  const metCount = subjectMet + checklistMet;

  return {
    percent: totalCount === 0 ? 100 : Math.round((metCount / totalCount) * 100),
    metCount,
    totalCount,
  };
}
