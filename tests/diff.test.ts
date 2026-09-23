import { describe, expect, it } from "vitest";
import { diffValue } from "@/lib/ingestion/diff";

describe("diffValue", () => {
  it("does not report a change when object keys are reordered", () => {
    expect(
      diffValue(
        { minLevel: 5, minPercent: 60 },
        { minPercent: 60, minLevel: 5 }
      ).changed
    ).toBe(false);
  });

  it("canonicalizes nested objects as well", () => {
    expect(
      diffValue(
        { subject: { code: "MATH", rule: { min: 60, max: 100 } } },
        { subject: { rule: { max: 100, min: 60 }, code: "MATH" } }
      ).changed
    ).toBe(false);
  });

  it("keeps array order meaningful", () => {
    expect(diffValue(["MATH", "PHYS"], ["PHYS", "MATH"]).changed).toBe(true);
  });

  it("still detects a real scalar change", () => {
    expect(diffValue({ minAps: 30 }, { minAps: 31 }).changed).toBe(true);
  });

  it("distinguishes null from undefined", () => {
    expect(diffValue(null, undefined).changed).toBe(true);
  });
});
