import { describe, expect, it } from "vitest";
import { resolveApsRule } from "./resolveApsRule";
import type { ApsRule } from "@/lib/firestore/types";

// Test fixtures only -- not verified production data, see lib/aps/engine.test.ts header.

function fixtureRule(overrides: Partial<ApsRule>): ApsRule {
  return {
    id: "test-rule",
    institutionId: "test-institution",
    facultyId: null,
    scaleName: "Test scale",
    formulaType: "pointBandSum",
    bands: [],
    usesRawPercentage: false,
    loPolicy: "exclude",
    bestNSubjects: 6,
    excludedSubjects: [],
    forcedSubjects: [],
    extraCountedSubjects: [],
    mathLitPolicy: "equal",
    nbtPolicy: "none",
    bonusRules: [],
    notes: "",
    sourceUrl: "https://example.test",
    verifiedOn: "2026-09-27",
    academicYear: 2027,
    ...overrides,
  };
}

describe("resolveApsRule", () => {
  it("returns the institution-wide default rule when no faculty-specific rule exists", () => {
    const general = fixtureRule({ id: "general", institutionId: "su", facultyId: null });
    const result = resolveApsRule([general], "su", "su-faculty-theology");
    expect(result?.id).toBe("general");
  });

  it("returns the faculty-specific rule when one exists, over the institution-wide default", () => {
    const general = fixtureRule({ id: "general", institutionId: "su", facultyId: null });
    const engineering = fixtureRule({
      id: "engineering",
      institutionId: "su",
      facultyId: "su-faculty-engineering",
    });
    const result = resolveApsRule([general, engineering], "su", "su-faculty-engineering");
    expect(result?.id).toBe("engineering");
  });

  it("falls back to the institution-wide default for a faculty with no override", () => {
    const general = fixtureRule({ id: "general", institutionId: "su", facultyId: null });
    const engineering = fixtureRule({
      id: "engineering",
      institutionId: "su",
      facultyId: "su-faculty-engineering",
    });
    const result = resolveApsRule([general, engineering], "su", "su-faculty-theology");
    expect(result?.id).toBe("general");
  });

  it("returns undefined when the institution has no rule at all", () => {
    const other = fixtureRule({ id: "other", institutionId: "up", facultyId: null });
    const result = resolveApsRule([other], "unlisted-institution", "some-faculty");
    expect(result).toBeUndefined();
  });

  it("never returns a rule belonging to a different institution's faculty of the same name", () => {
    const uctScience = fixtureRule({
      id: "uct-science",
      institutionId: "uct",
      facultyId: "faculty-science",
    });
    const result = resolveApsRule([uctScience], "su", "faculty-science");
    expect(result).toBeUndefined();
  });
});
