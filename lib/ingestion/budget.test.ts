import { describe, expect, it } from "vitest";
import { checkBudget } from "./budget";
import { INGESTION_BUDGET } from "@/config/ingestion";

describe("checkBudget", () => {
  it("allows a call well within both limits", () => {
    const result = checkBudget({ tokensUsedThisRun: 0, tokensUsedThisMonth: 0 }, 1000);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeNull();
  });

  it("rejects when the per-run limit would be exceeded", () => {
    const result = checkBudget(
      { tokensUsedThisRun: INGESTION_BUDGET.perRunTokenLimit - 100, tokensUsedThisMonth: 0 },
      1000
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/per-run/i);
  });

  it("rejects when the per-month limit would be exceeded", () => {
    const result = checkBudget(
      { tokensUsedThisRun: 0, tokensUsedThisMonth: INGESTION_BUDGET.perMonthTokenLimit - 100 },
      1000
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/per-month/i);
  });

  it("allows a call that exactly hits the limit, not one that exceeds it", () => {
    const exact = checkBudget(
      { tokensUsedThisRun: 0, tokensUsedThisMonth: 0 },
      INGESTION_BUDGET.perRunTokenLimit
    );
    expect(exact.allowed).toBe(true);

    const overBy1 = checkBudget(
      { tokensUsedThisRun: 0, tokensUsedThisMonth: 0 },
      INGESTION_BUDGET.perRunTokenLimit + 1
    );
    expect(overBy1.allowed).toBe(false);
  });
});
