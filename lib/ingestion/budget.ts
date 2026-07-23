import { INGESTION_BUDGET, INGESTION_KILL_SWITCH } from "@/config/ingestion";
import type { BudgetCheckResult, BudgetState } from "./types";

/**
 * The one function every LLM call in the pipeline must pass through
 * before spending a single token. Checked here, not left to each call
 * site to remember -- CLAUDE.md non-negotiable #4 and
 * docs/MASTER_PROMPT_v2.md Phase 4 guardrails (per-run/per-month token
 * budget, global kill switch).
 */
export function checkBudget(
  state: BudgetState,
  estimatedTokensForThisCall: number
): BudgetCheckResult {
  if (INGESTION_KILL_SWITCH) {
    return { allowed: false, reason: "Ingestion kill switch is enabled (config/ingestion.ts)." };
  }

  if (estimatedTokensForThisCall + state.tokensUsedThisRun > INGESTION_BUDGET.perRunTokenLimit) {
    return {
      allowed: false,
      reason: `Per-run token limit (${INGESTION_BUDGET.perRunTokenLimit}) would be exceeded.`,
    };
  }

  if (estimatedTokensForThisCall + state.tokensUsedThisMonth > INGESTION_BUDGET.perMonthTokenLimit) {
    return {
      allowed: false,
      reason: `Per-month token limit (${INGESTION_BUDGET.perMonthTokenLimit}) would be exceeded.`,
    };
  }

  return { allowed: true, reason: null };
}
