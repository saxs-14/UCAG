import { describe, expect, it } from "vitest";
import { calculateReadiness } from "./readiness";
import { APPLICATION_CHECKLIST_ITEMS } from "@/config/applicationDocuments";
import type { MatchResult } from "@/lib/matching/types";

function makeMatchResult(reasons: MatchResult["reasons"]): MatchResult {
  return {
    programmeId: "test-programme",
    bucket: "qualify",
    apsResult: {
      formulaType: "pointBandSum",
      score: 30,
      countedSubjects: [],
      droppedSubjects: [],
      excludedSubjects: [],
      loTreatmentMessage: "",
      appliedBonuses: [],
      warnings: [],
    },
    reasons,
    unmetReasons: reasons.filter((r) => !("met" in r) || !r.met),
    suggestedNextStep: null,
    passTypeEvaluated: false,
  };
}

const TOTAL_CHECKLIST_ITEMS = APPLICATION_CHECKLIST_ITEMS.length;

describe("calculateReadiness", () => {
  it("is 100% when there are no subject requirements and every checklist item is checked", () => {
    const allChecked = new Set(APPLICATION_CHECKLIST_ITEMS.map((i) => i.id));
    const result = calculateReadiness(makeMatchResult([]), allChecked);
    expect(result.percent).toBe(100);
    expect(result.totalCount).toBe(TOTAL_CHECKLIST_ITEMS);
  });

  it("is 0% when nothing is met and nothing is checked", () => {
    const reasons: MatchResult["reasons"] = [
      { type: "aps", met: false, required: 30, achieved: 20, gap: 10 },
    ];
    const result = calculateReadiness(makeMatchResult(reasons), new Set());
    expect(result.percent).toBe(0);
    expect(result.totalCount).toBe(1 + TOTAL_CHECKLIST_ITEMS);
  });

  it("combines subject requirements and checklist items into one percentage", () => {
    const reasons: MatchResult["reasons"] = [
      { type: "aps", met: true, required: 30, achieved: 34, gap: 0 },
      { type: "subjectLevel", subjectCode: "MATH", label: "Mathematics", met: false, requiredLevel: 5, achievedLevel: 4, gap: 1 },
    ];
    const oneChecked = new Set([APPLICATION_CHECKLIST_ITEMS[0]!.id]);
    const result = calculateReadiness(makeMatchResult(reasons), oneChecked);
    // met: 1 aps + 1 checklist item = 2; total: 2 reasons + N checklist items
    expect(result.metCount).toBe(2);
    expect(result.totalCount).toBe(2 + TOTAL_CHECKLIST_ITEMS);
    expect(result.percent).toBe(Math.round((2 / (2 + TOTAL_CHECKLIST_ITEMS)) * 100));
  });

  it("treats a subject-missing reason (no `met` field at all) as unmet, not as met", () => {
    const reasons: MatchResult["reasons"] = [
      { type: "subjectMissing", subjectCode: "PHS", label: "Physical Sciences" },
    ];
    const result = calculateReadiness(makeMatchResult(reasons), new Set());
    expect(result.metCount).toBe(0);
    expect(result.totalCount).toBe(1 + TOTAL_CHECKLIST_ITEMS);
  });

  it("rounds to the nearest whole percent rather than truncating", () => {
    // 1 met out of 3 total (2 reasons unmet/met mixed + checklist all unchecked
    // trimmed down for a clean fraction) -- construct a case with a known
    // non-integer ratio and confirm standard rounding, not floor/ceil.
    const reasons: MatchResult["reasons"] = [
      { type: "aps", met: true, required: 30, achieved: 34, gap: 0 },
      { type: "aps", met: false, required: 30, achieved: 20, gap: 10 },
    ];
    const result = calculateReadiness(makeMatchResult(reasons), new Set());
    const expected = Math.round((1 / (2 + TOTAL_CHECKLIST_ITEMS)) * 100);
    expect(result.percent).toBe(expected);
  });
});
