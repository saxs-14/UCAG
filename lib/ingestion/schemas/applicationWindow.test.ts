import { describe, expect, it } from "vitest";
import { applicationWindowExtractionSchema } from "./applicationWindow";

const VALID = {
  opensOn: "2027-04-01",
  closesOn: "2027-11-30",
  lateClosesOn: null,
  confidence: 0.95,
  extractionNotes: "Found on the admissions page's key dates table.",
};

describe("applicationWindowExtractionSchema", () => {
  it("accepts a well-formed extraction", () => {
    expect(applicationWindowExtractionSchema.parse(VALID)).toEqual(VALID);
  });

  it("requires an explicit null for a date the model didn't find, not an omitted field", () => {
    const withoutOpensOn: Partial<typeof VALID> = { ...VALID };
    delete withoutOpensOn.opensOn;
    expect(() => applicationWindowExtractionSchema.parse(withoutOpensOn)).toThrow();
  });

  it("rejects confidence above 1", () => {
    expect(() => applicationWindowExtractionSchema.parse({ ...VALID, confidence: 1.5 })).toThrow();
  });

  it("rejects negative confidence", () => {
    expect(() => applicationWindowExtractionSchema.parse({ ...VALID, confidence: -0.1 })).toThrow();
  });

  it("rejects a non-string date value (e.g. a Date object or number) rather than coercing it", () => {
    expect(() =>
      applicationWindowExtractionSchema.parse({ ...VALID, closesOn: 20271130 })
    ).toThrow();
  });

  it("rejects a missing extractionNotes field", () => {
    const withoutNotes: Partial<typeof VALID> = { ...VALID };
    delete withoutNotes.extractionNotes;
    expect(() => applicationWindowExtractionSchema.parse(withoutNotes)).toThrow();
  });

  it("accepts all three dates being null (the model found nothing, which is itself information)", () => {
    const allNull = { ...VALID, opensOn: null, closesOn: null, lateClosesOn: null };
    expect(applicationWindowExtractionSchema.parse(allNull)).toEqual(allNull);
  });
});
