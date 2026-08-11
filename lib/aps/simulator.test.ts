import { describe, expect, it } from "vitest";
import { analyzeBestImprovements } from "./simulator";
import type { SubjectMarkInput } from "./types";
import type { ApsRule, Programme } from "../firestore/types";
import { STANDARD_NSC_SCALE } from "@/config/aps-scales";

const testRule: ApsRule = {
  id: "rule-ump",
  institutionId: "ump",
  scaleName: "UMP Scale",
  formulaType: "pointBandSum",
  bands: STANDARD_NSC_SCALE,
  usesRawPercentage: false,
  loPolicy: "exclude",
  bestNSubjects: 6,
  excludedSubjects: [],
  mathLitPolicy: "equal",
  nbtPolicy: "none",
  bonusRules: [],
  notes: "Test rule",
  sourceUrl: "https://example.test",
  verifiedOn: "2026-08-01",
  academicYear: 2027,
};

const testProgrammes: Programme[] = [
  {
    id: "prog-cs",
    institutionId: "ump",
    facultyId: "fac-1",
    schoolId: "sch-1",
    name: "BSc Computer Science",
    qualificationType: "bachelorsDegree",
    nqfLevel: 7,
    saqaId: null,
    duration: "3 years",
    campuses: ["Main"],
    modeOfDelivery: "contact",
    minAps: 30,
    subjectRequirements: [{ subjectCode: "MATH", minLevel: 5 }],
    additionalRequirements: [],
    careerOutcomes: ["Developer"],
    applyUrl: "https://example.test/apply",
    fieldTags: ["technology"],
    sourceUrl: "https://example.test",
    verifiedOn: "2026-08-01",
    academicYear: 2027,
  },
  {
    id: "prog-it",
    institutionId: "ump",
    facultyId: "fac-1",
    schoolId: "sch-1",
    name: "Diploma in IT",
    qualificationType: "diploma",
    nqfLevel: 6,
    saqaId: null,
    duration: "3 years",
    campuses: ["Main"],
    modeOfDelivery: "contact",
    minAps: 24,
    subjectRequirements: [{ subjectCode: "MATH", minLevel: 3 }],
    additionalRequirements: [],
    careerOutcomes: ["Support"],
    applyUrl: "https://example.test/apply-it",
    fieldTags: ["technology"],
    sourceUrl: "https://example.test",
    verifiedOn: "2026-08-01",
    academicYear: 2027,
  },
];

describe("analyzeBestImprovements", () => {
  it("identifies mark improvements that unlock new qualifying programmes", () => {
    // Current marks give APS 28:
    // ENG: 65 (level 5 = 5 pts)
    // AFR: 65 (level 5 = 5 pts)
    // MATH: 55 (level 4 = 4 pts) -> needs level 5 (60%+) and APS 30 for BSc CS
    // LO: 60 (level 5 = excluded)
    // PHS: 65 (level 5 = 5 pts)
    // LSC: 65 (level 5 = 5 pts)
    // GEO: 65 (level 5 = 4 pts -> 28 total)
    const marks: SubjectMarkInput[] = [
      { subjectCode: "ENG", percentage: 65 },
      { subjectCode: "AFR", percentage: 65 },
      { subjectCode: "MATH", percentage: 55 },
      { subjectCode: "LO", percentage: 60 },
      { subjectCode: "PHS", percentage: 65 },
      { subjectCode: "LSC", percentage: 65 },
      { subjectCode: "GEO", percentage: 60 },
    ];

    const analysis = analyzeBestImprovements(marks, testRule, testProgrammes);

    expect(analysis.institutionId).toBe("ump");
    expect(analysis.recommendations.length).toBeGreaterThan(0);

    const topRec = analysis.topRecommendation;
    expect(topRec).not.toBeNull();
    // Improving MATH from 55 to 65 gives Level 5 and +2 APS points (total 30), unlocking BSc CS!
    expect(topRec?.subjectCode).toBe("MATH");
    expect(topRec?.unlockedProgrammes.some((p) => p.id === "prog-cs")).toBe(true);
  });
});
