import { describe, expect, it } from "vitest";
import { reasonText } from "./reasonText";

describe("reasonText", () => {
  it("APS gap: states the achieved number, required number, and exact shortfall", () => {
    expect(
      reasonText({ type: "aps", met: false, required: 30, achieved: 28, gap: 2 })
    ).toBe("You have 28 APS. This programme needs 30. You are 2 points short.");
  });

  it("APS gap of exactly 1 point uses singular 'point'", () => {
    expect(
      reasonText({ type: "aps", met: false, required: 30, achieved: 29, gap: 1 })
    ).toMatch(/1 point short\./);
  });

  it("wrong subject variant names both the required and achieved subject", () => {
    expect(
      reasonText({
        type: "subjectWrongVariant",
        requiredSubjectCode: "MATH",
        requiredLabel: "Mathematics",
        achievedSubjectCode: "MATHLIT",
        achievedLabel: "Mathematical Literacy",
      })
    ).toBe("This programme requires Mathematics. You have Mathematical Literacy.");
  });

  it("subject level gap names the subject, required level, and achieved level", () => {
    expect(
      reasonText({
        type: "subjectLevel",
        subjectCode: "PHS",
        label: "Physical Sciences",
        met: false,
        requiredLevel: 5,
        achievedLevel: 3,
        gap: 2,
      })
    ).toBe("This programme requires Physical Sciences at level 5. You have level 3.");
  });

  it("never emits a vague fallback for any reason type", () => {
    const text = reasonText({
      type: "subjectMissing",
      subjectCode: "PHS",
      label: "Physical Sciences",
    });
    expect(text).not.toMatch(/nearly|almost made it/i);
    expect(text).toContain("Physical Sciences");
  });
});
