import { describe, expect, it } from "vitest";
import { isEditableFactCollection, isEditableFactField } from "./allowlist";

describe("admin fact allowlist", () => {
  it("allows supported learner-facing fact fields", () => {
    expect(isEditableFactCollection("programmes")).toBe(true);
    expect(isEditableFactField("programmes", "minAps")).toBe(true);
    expect(isEditableFactField("applicationWindows", "closesOn")).toBe(true);
    expect(isEditableFactField("bursaries", "applyUrl")).toBe(true);
  });

  it("rejects provenance and document identity fields", () => {
    for (const field of ["id", "sourceUrl", "verifiedOn", "academicYear", "year", "publisher"]) {
      expect(isEditableFactField("programmes", field)).toBe(false);
    }
  });

  it("rejects fields from the wrong collection", () => {
    expect(isEditableFactField("programmes", "closesOn")).toBe(false);
    expect(isEditableFactField("applicationWindows", "minAps")).toBe(false);
    expect(isEditableFactField("notACollection", "name")).toBe(false);
  });
});
