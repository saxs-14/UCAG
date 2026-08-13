import { describe, expect, it } from "vitest";
import { normalizeSubjectCode, resolveSubjectLabel, subjectMarksToFormState } from "./subjects";
import type { SubjectMarkInput } from "@/lib/aps/types";

describe("subjectMarksToFormState", () => {
  it("restores a home language mark", () => {
    const marks: SubjectMarkInput[] = [{ subjectCode: "ENG-HL", percentage: 72 }];
    expect(subjectMarksToFormState(marks)).toMatchObject({
      homeLanguage: "English",
      homeLanguageMark: 72,
    });
  });

  it("restores a first additional language mark", () => {
    const marks: SubjectMarkInput[] = [{ subjectCode: "AFR-FAL", percentage: 65 }];
    expect(subjectMarksToFormState(marks)).toMatchObject({
      firstAdditionalLanguage: "Afrikaans",
      firstAdditionalLanguageMark: 65,
    });
  });

  it.each([
    ["MATH", "Mathematics"],
    ["MATHLIT", "Mathematical Literacy"],
    ["TECHMATH", "Technical Mathematics"],
  ] as const)("restores %s as %s", (code, option) => {
    const marks: SubjectMarkInput[] = [{ subjectCode: code, percentage: 80 }];
    expect(subjectMarksToFormState(marks)).toMatchObject({
      mathematics: option,
      mathematicsMark: 80,
    });
  });

  it("restores Life Orientation", () => {
    const marks: SubjectMarkInput[] = [{ subjectCode: "LO", percentage: 90 }];
    expect(subjectMarksToFormState(marks).lifeOrientationMark).toBe(90);
  });

  it("restores electives", () => {
    const marks: SubjectMarkInput[] = [
      { subjectCode: "PHS", percentage: 75 },
      { subjectCode: "LFS", percentage: 68 },
    ];
    expect(subjectMarksToFormState(marks).electives).toEqual([
      { code: "PHS", percentage: 75 },
      { code: "LFS", percentage: 68 },
    ]);
  });

  it("silently drops an unrecognised subject code instead of throwing", () => {
    const marks: SubjectMarkInput[] = [{ subjectCode: "NOT-A-REAL-CODE", percentage: 50 }];
    expect(() => subjectMarksToFormState(marks)).not.toThrow();
    expect(subjectMarksToFormState(marks).electives).toEqual([]);
  });

  it("round-trips a full realistic subject set", () => {
    const marks: SubjectMarkInput[] = [
      { subjectCode: "ENG-HL", percentage: 72 },
      { subjectCode: "AFR-FAL", percentage: 60 },
      { subjectCode: "MATH", percentage: 85 },
      { subjectCode: "LO", percentage: 90 },
      { subjectCode: "PHS", percentage: 75 },
      { subjectCode: "LFS", percentage: 68 },
      { subjectCode: "GEO", percentage: 70 },
    ];
    const state = subjectMarksToFormState(marks);
    expect(state).toMatchObject({
      homeLanguage: "English",
      homeLanguageMark: 72,
      firstAdditionalLanguage: "Afrikaans",
      firstAdditionalLanguageMark: 60,
      mathematics: "Mathematics",
      mathematicsMark: 85,
      lifeOrientationMark: 90,
    });
    expect(state.electives).toEqual([
      { code: "PHS", percentage: 75 },
      { code: "LFS", percentage: 68 },
      { code: "GEO", percentage: 70 },
    ]);
  });

  it("returns an empty/blank state for no saved marks", () => {
    expect(subjectMarksToFormState([])).toEqual({
      homeLanguage: "",
      homeLanguageMark: null,
      firstAdditionalLanguage: "",
      firstAdditionalLanguageMark: null,
      mathematics: "",
      mathematicsMark: null,
      lifeOrientationMark: null,
      electives: [],
    });
  });
});

describe("normalizeSubjectCode & resolveSubjectLabel", () => {
  it("normalizes shorthand codes like MAT, ENG, PHY to canonical system codes", () => {
    expect(normalizeSubjectCode("MAT")).toBe("MATH");
    expect(normalizeSubjectCode("ENG")).toBe("ENG-HL");
    expect(normalizeSubjectCode("PHY")).toBe("PHS");
    expect(normalizeSubjectCode("BIO")).toBe("LFS");
  });

  it("resolves shorthand subject codes to user-friendly labels", () => {
    expect(resolveSubjectLabel("MAT")).toBe("Mathematics");
    expect(resolveSubjectLabel("ENG")).toBe("English (Home Language)");
    expect(resolveSubjectLabel("PHY")).toBe("Physical Sciences");
    expect(resolveSubjectLabel("MATH")).toBe("Mathematics");
    expect(resolveSubjectLabel("LO")).toBe("Life Orientation");
  });
});
