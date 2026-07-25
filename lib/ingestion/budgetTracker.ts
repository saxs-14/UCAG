import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { checkBudget } from "./budget";
import type { BudgetCheckResult } from "./types";

/**
 * The Firestore-aware half of budget enforcement. lib/ingestion/budget.ts's
 * checkBudget() is pure and already tested; this is what actually feeds
 * it real month-to-date usage, by summing IngestionRun.tokensUsed for
 * runs started this calendar month (UTC) -- a single inequality filter on
 * one field, no composite index needed.
 *
 * checkBudget() existed since Phase 4 but nothing ever called it in a
 * real call path -- found and fixed alongside adding a real (Gemini)
 * provider, since going live with actual API spend without the budget
 * gate wired in would defeat the point.
 */
function startOfCurrentMonthIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function getTokensUsedThisMonth(): Promise<number> {
  const db = getAdminDb();
  const snapshot = await db
    .collection("ingestionRuns")
    .where("startedAt", ">=", startOfCurrentMonthIso())
    .get();

  let total = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data() as { tokensUsed?: number };
    total += data.tokensUsed ?? 0;
  }
  return total;
}

/** Call this before every real LLM call in a live orchestrator --
 * `estimatedTokensForThisCall` should be a conservative over-estimate
 * (reject-before-spend, not reject-after-the-fact). */
export async function checkBudgetLive(
  estimatedTokensForThisCall: number,
  tokensUsedThisRun: number
): Promise<BudgetCheckResult> {
  const tokensUsedThisMonth = await getTokensUsedThisMonth();
  return checkBudget({ tokensUsedThisRun, tokensUsedThisMonth }, estimatedTokensForThisCall);
}
