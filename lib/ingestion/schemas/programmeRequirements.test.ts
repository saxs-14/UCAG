import { describe, expect, it } from "vitest";
import { programmeRequirementsExtractionSchema } from "./programmeRequirements";

function makeProgramme(overrides: Record<string, unknown> = {}) {
  return {
    name: "BSc Computer Science",
    facultyName: "Faculty of Science",
    qualificationType: "bachelorsDegree",
    nqfLevel: 7,
    duration: "3 years",
    minAps: 30,
    subjectRequirements: [],
    additionalRequirements: [],
    applyUrl: null,
    confidence: 0.9,
    extractionNotes: "test",
    ...overrides,
  };
}

describe("programmeRequirementsExtractionSchema", () => {
  it("accepts a proper additionalRequirements array unchanged", () => {
    const result = programmeRequirementsExtractionSchema.parse({
      programmes: [makeProgramme({ additionalRequirements: ["Portfolio required"] })],
    });
    expect(result.programmes[0]!.additionalRequirements).toEqual(["Portfolio required"]);
  });

  it("normalizes a null additionalRequirements to an empty array rather than rejecting it", () => {
    // Live-verified against real UMP pages: models are inconsistent about
    // wrapping a single free-text requirement in an array despite explicit
    // instructions -- this is shape normalization, not content invention.
    const result = programmeRequirementsExtractionSchema.parse({
      programmes: [makeProgramme({ additionalRequirements: null })],
    });
    expect(result.programmes[0]!.additionalRequirements).toEqual([]);
  });

  it("normalizes a bare string additionalRequirements into a one-item array", () => {
    const result = programmeRequirementsExtractionSchema.parse({
      programmes: [makeProgramme({ additionalRequirements: "NCV Level 4 in Hospitality accepted" })],
    });
    expect(result.programmes[0]!.additionalRequirements).toEqual(["NCV Level 4 in Hospitality accepted"]);
  });

  it("rejects (does not coerce) an unrecognised subjectCode, with the invalid value in the message", () => {
    const attempt = () =>
      programmeRequirementsExtractionSchema.parse({
        programmes: [
          makeProgramme({
            subjectRequirements: [{ subjectCode: "NOT-A-REAL-CODE", minLevel: 5, minPercent: null }],
          }),
        ],
      });
    expect(attempt).toThrow(/NOT-A-REAL-CODE/);
  });

  it("rejects a bare array at the top level instead of the required {programmes: [...]} shape", () => {
    const attempt = () => programmeRequirementsExtractionSchema.parse([makeProgramme()]);
    expect(attempt).toThrow();
  });
});
