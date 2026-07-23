import { describe, expect, it } from "vitest";
import { diffValue } from "./diff";

describe("diffValue", () => {
  it("reports no change when values are equal", () => {
    const result = diffValue("2027-04-01", "2027-04-01");
    expect(result.changed).toBe(false);
  });

  it("reports a change when values differ", () => {
    const result = diffValue("2027-04-01", "2027-04-15");
    expect(result.changed).toBe(true);
  });

  it("treats undefined current value as a change (first-time publish)", () => {
    const result = diffValue(undefined, "2027-04-01");
    expect(result.changed).toBe(true);
  });

  it("compares objects structurally, not by reference", () => {
    const a = { minAps: 30, subjectRequirements: [{ subjectCode: "MATH", minLevel: 5 }] };
    const b = { minAps: 30, subjectRequirements: [{ subjectCode: "MATH", minLevel: 5 }] };
    expect(diffValue(a, b).changed).toBe(false);
  });
});
