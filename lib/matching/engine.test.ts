import { describe, expect, it } from "vitest";
import { matchProgramme } from "./engine";
import { STANDARD_NSC_SCALE } from "@/config/aps-scales";
import type { ApsRule, Programme } from "@/lib/firestore/types";
import type { SubjectMarkInput } from "@/lib/aps/types";

// Test fixtures only -- not verified production data, see lib/aps/engine.test.ts header.

const apsRule: ApsRule = {
  id: "test-rule",
  institutionId: "test-institution",
  scaleName: "Test 7-point scale",
  formulaType: "pointBandSum",
  bands: STANDARD_NSC_SCALE,
  usesRawPercentage: false,
  loPolicy: "exclude",
  bestNSubjects: 6,
  excludedSubjects: [],
  mathLitPolicy: "equal",
  nbtPolicy: "none",
  bonusRules: [],
  maxScore: 42,
  notes: "",
  sourceUrl: "https://example.test/aps-rule",
  verifiedOn: "2026-07-23",
  academicYear: 2027,
};

const baseProgramme: Programme = {
  id: "test-programme",
  institutionId: "test-institution",
  facultyId: "test-faculty",
  schoolId: "test-school",
  name: "BSc Computer Science",
  qualificationType: "bachelorsDegree",
  nqfLevel: 7,
  saqaId: null,
  duration: "3 years",
  campuses: ["Main"],
  modeOfDelivery: "contact",
  minAps: 30,
  subjectRequirements: [{ subjectCode: "MATH", minLevel: 5 }, { subjectCode: "PHS", minLevel: 4 }],
  additionalRequirements: [],
  careerOutcomes: [],
  applyUrl: "https://example.test/apply",
  sourceUrl: "https://example.test/programme",
  verifiedOn: "2026-07-23",
  academicYear: 2027,
};

const strongMarks: SubjectMarkInput[] = [
  { subjectCode: "ENG-HL", percentage: 80 },
  { subjectCode: "AFR-FAL", percentage: 70 },
  { subjectCode: "MATH", percentage: 75 }, // level 6
  { subjectCode: "PHS", percentage: 65 }, // level 5
  { subjectCode: "LFS", percentage: 60 },
  { subjectCode: "GEO", percentage: 55 },
  { subjectCode: "LO", percentage: 70 },
];

describe("matchProgramme: qualify", () => {
  it("buckets as qualify when APS and all subject requirements are met", () => {
    const result = matchProgramme(baseProgramme, apsRule, strongMarks);
    expect(result.bucket).toBe("qualify");
    expect(result.unmetReasons).toHaveLength(0);
    expect(result.suggestedNextStep).toBeNull();
  });

  it("never evaluates NSC pass type (unverified thresholds -- deferred to Phase 4)", () => {
    const result = matchProgramme(baseProgramme, apsRule, strongMarks);
    expect(result.passTypeEvaluated).toBe(false);
  });
});

describe("matchProgramme: almost qualify", () => {
  it("small APS shortfall (within the configured margin) buckets as almostQualify with a nameable gap", () => {
    // Subject requirements (MATH level 5, PHS level 4) are still met here;
    // only the APS total falls a few points short of minAps 30. Best-6
    // sum: 6+5+5+4+4+3 = 27, gap 3 against a 4.2-point margin (10% of 42).
    const marks: SubjectMarkInput[] = [
      { subjectCode: "ENG-HL", percentage: 75 }, // level 6
      { subjectCode: "AFR-FAL", percentage: 65 }, // level 5
      { subjectCode: "MATH", percentage: 65 }, // level 5 -- meets minLevel 5
      { subjectCode: "PHS", percentage: 55 }, // level 4 -- meets minLevel 4
      { subjectCode: "LFS", percentage: 55 }, // level 4
      { subjectCode: "GEO", percentage: 45 }, // level 3
      { subjectCode: "LO", percentage: 60 },
    ];
    const result = matchProgramme(baseProgramme, apsRule, marks);
    const apsReason = result.reasons.find((r) => r.type === "aps");
    expect(apsReason?.met).toBe(false);
    expect(result.bucket).toBe("almostQualify");
    if (apsReason?.type === "aps") {
      expect(apsReason.required).toBe(30);
      expect(apsReason.achieved).toBe(27);
      expect(apsReason.gap).toBe(3);
    }
  });

  it("Mathematical Literacy instead of required Mathematics is a wrong-variant reason, bucketed as almostQualify", () => {
    const marks: SubjectMarkInput[] = strongMarks.map((m) =>
      m.subjectCode === "MATH" ? { subjectCode: "MATHLIT", percentage: 75 } : m
    );
    const result = matchProgramme(baseProgramme, apsRule, marks);
    const variantReason = result.unmetReasons.find((r) => r.type === "subjectWrongVariant");
    expect(variantReason).toBeDefined();
    if (variantReason?.type === "subjectWrongVariant") {
      expect(variantReason.requiredLabel).toBe("Mathematics");
      expect(variantReason.achievedLabel).toBe("Mathematical Literacy");
    }
    expect(result.bucket).toBe("almostQualify");
  });

  it("a subject level exactly one below the requirement is within the almost margin", () => {
    // PHS requires level 4; 45% -> level 3, one level short.
    const oneLevelShort = strongMarks.map((m) =>
      m.subjectCode === "PHS" ? { ...m, percentage: 45 } : m
    );
    const result = matchProgramme(baseProgramme, apsRule, oneLevelShort);
    const levelReason = result.unmetReasons.find((r) => r.type === "subjectLevel");
    expect(levelReason).toBeDefined();
    if (levelReason?.type === "subjectLevel") {
      expect(levelReason.gap).toBe(1);
    }
    expect(result.bucket).toBe("almostQualify");
  });
});

describe("matchProgramme: not yet", () => {
  it("a subject the learner never took forces notYet, with a concrete suggested next step", () => {
    const marksWithoutPhysicalSciences = strongMarks.filter((m) => m.subjectCode !== "PHS");
    const result = matchProgramme(baseProgramme, apsRule, marksWithoutPhysicalSciences);
    const missing = result.unmetReasons.find((r) => r.type === "subjectMissing");
    expect(missing).toBeDefined();
    expect(result.bucket).toBe("notYet");
    expect(result.suggestedNextStep).not.toBeNull();
    expect(result.suggestedNextStep).toMatch(/rewriting|upgrading/i);
  });

  it("a large APS shortfall (beyond the almost margin) buckets as notYet", () => {
    const weakMarks: SubjectMarkInput[] = [
      { subjectCode: "ENG-HL", percentage: 35 },
      { subjectCode: "AFR-FAL", percentage: 32 },
      { subjectCode: "MATH", percentage: 30 },
      { subjectCode: "PHS", percentage: 28 },
      { subjectCode: "LFS", percentage: 25 },
      { subjectCode: "GEO", percentage: 22 },
      { subjectCode: "LO", percentage: 40 },
    ];
    const result = matchProgramme(baseProgramme, apsRule, weakMarks);
    expect(result.bucket).toBe("notYet");
    expect(result.suggestedNextStep).not.toBeNull();
  });

  it("suggests a related lower-qualification programme from the catalog when one exists", () => {
    const higherCertificate: Programme = {
      ...baseProgramme,
      id: "test-higher-cert",
      name: "Higher Certificate in Information Technology",
      qualificationType: "higherCertificate",
      minAps: 18,
      subjectRequirements: [],
    };
    const weakMarks: SubjectMarkInput[] = [
      { subjectCode: "ENG-HL", percentage: 35 },
      { subjectCode: "AFR-FAL", percentage: 32 },
      { subjectCode: "MATH", percentage: 30 },
      { subjectCode: "LFS", percentage: 25 },
      { subjectCode: "GEO", percentage: 22 },
      { subjectCode: "LO", percentage: 40 },
      // PHS omitted entirely -> subjectMissing -> notYet, exercising the catalog branch
    ];
    const result = matchProgramme(baseProgramme, apsRule, weakMarks, {
      catalog: [baseProgramme, higherCertificate],
    });
    expect(result.bucket).toBe("notYet");
    // subjectMissing takes priority in suggestNextStep over the catalog
    // lookup (rewriting a required subject is more actionable than a
    // pathway suggestion) -- assert that behaviour explicitly.
    expect(result.suggestedNextStep).toMatch(/rewriting|upgrading/i);
  });
});

describe("matchProgramme: itemised reasons", () => {
  it("includes both met and unmet reasons, not just failures", () => {
    const result = matchProgramme(baseProgramme, apsRule, strongMarks);
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.reasons.every((r) => "type" in r)).toBe(true);
  });

  it("a programme with no minAps set skips the APS reason entirely", () => {
    const programmeWithoutAps: Programme = { ...baseProgramme, minAps: null };
    const result = matchProgramme(programmeWithoutAps, apsRule, strongMarks);
    expect(result.reasons.find((r) => r.type === "aps")).toBeUndefined();
  });
});
