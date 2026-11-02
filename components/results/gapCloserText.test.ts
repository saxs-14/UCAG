import { describe, expect, it } from "vitest";
import { gapCloserText } from "./gapCloserText";
import type { MatchReason } from "@/lib/matching/types";

describe("gapCloserText", () => {
  it("returns null for a met APS reason", () => {
    const reason: MatchReason = { type: "aps", met: true, required: 30, achieved: 32, gap: 0 };
    expect(gapCloserText(reason)).toBeNull();
  });

  it("phrases an unmet APS gap as a total-points action", () => {
    const reason: MatchReason = { type: "aps", met: false, required: 32, achieved: 28, gap: 4 };
    expect(gapCloserText(reason)).toBe(
      "Raise your total APS by 4 points across any of your subjects to close this gap."
    );
  });

  it("uses singular 'point' for a 1-point APS gap", () => {
    const reason: MatchReason = { type: "aps", met: false, required: 30, achieved: 29, gap: 1 };
    expect(gapCloserText(reason)).toBe(
      "Raise your total APS by 1 point across any of your subjects to close this gap."
    );
  });

  it("phrases an unmet subjectPercent reason with a from/to target", () => {
    const reason: MatchReason = {
      type: "subjectPercent",
      subjectCode: "MATH",
      label: "Mathematics",
      met: false,
      requiredPercent: 66,
      achievedPercent: 62,
      gap: 4,
    };
    expect(gapCloserText(reason)).toBe(
      "Raise Mathematics from 62% to 66% to meet this requirement."
    );
  });

  it("returns null for a met subjectPercent reason", () => {
    const reason: MatchReason = {
      type: "subjectPercent",
      subjectCode: "MATH",
      label: "Mathematics",
      met: true,
      requiredPercent: 66,
      achievedPercent: 70,
      gap: 0,
    };
    expect(gapCloserText(reason)).toBeNull();
  });

  it("phrases an unmet subjectLevel reason with a level target", () => {
    const reason: MatchReason = {
      type: "subjectLevel",
      subjectCode: "PHYS",
      label: "Physical Sciences",
      met: false,
      requiredLevel: 5,
      achievedLevel: 4,
      gap: 1,
    };
    expect(gapCloserText(reason)).toBe(
      "Raise Physical Sciences from level 4 to level 5 to meet this requirement."
    );
  });

  it("phrases a subjectMissing reason as an add-this-subject action", () => {
    const reason: MatchReason = {
      type: "subjectMissing",
      subjectCode: "ACC",
      label: "Accounting",
    };
    expect(gapCloserText(reason)).toBe(
      "Add Accounting as one of your subjects to meet this requirement."
    );
  });

  it("phrases a subjectWrongVariant reason without a fabricated numeric target", () => {
    const reason: MatchReason = {
      type: "subjectWrongVariant",
      requiredSubjectCode: "MATH",
      requiredLabel: "Mathematics",
      achievedSubjectCode: "MATHLIT",
      achievedLabel: "Mathematical Literacy",
    };
    expect(gapCloserText(reason)).toBe(
      "This requires Mathematics specifically -- Mathematical Literacy doesn't count toward it."
    );
  });
});
