import { describe, expect, it } from "vitest";
import { calculateAps } from "./engine";
import { percentageToPoints } from "./bands";
import { STANDARD_NSC_SCALE, WITS_8_POINT_SCALE } from "@/config/aps-scales";
import type { ApsRule } from "@/lib/firestore/types";
import type { SubjectMarkInput } from "./types";

/**
 * All ApsRule fixtures below are test fixtures exercising the engine's
 * logic branches -- they are NOT claims about any real institution's
 * verified rule (see CLAUDE.md: unverified is never displayed as a fact;
 * that applies to production data, not unit test scaffolding, but the
 * distinction matters enough to say explicitly).
 */

const baseRule: ApsRule = {
  id: "test-rule",
  institutionId: "test-institution",
  facultyId: null,
  scaleName: "Test 7-point scale",
  formulaType: "pointBandSum",
  bands: STANDARD_NSC_SCALE,
  usesRawPercentage: false,
  loPolicy: "halfWeight",
  bestNSubjects: 7,
  excludedSubjects: [],
  forcedSubjects: [],
  extraCountedSubjects: [],
  mathLitPolicy: "equal",
  nbtPolicy: "none",
  bonusRules: [],
  maxScore: 49,
  notes: "",
  sourceUrl: "https://example.test/aps-rule",
  verifiedOn: "2026-07-23",
  academicYear: 2027,
};

const sevenSubjectMarks: SubjectMarkInput[] = [
  { subjectCode: "ENG-HL", percentage: 85 }, // 7
  { subjectCode: "AFR-FAL", percentage: 72 }, // 6
  { subjectCode: "MATH", percentage: 68 }, // 5
  { subjectCode: "LO", percentage: 80 }, // 7 -> halved to 3.5
  { subjectCode: "PHS", percentage: 61 }, // 5
  { subjectCode: "LFS", percentage: 55 }, // 4
  { subjectCode: "GEO", percentage: 45 }, // 3
];

describe("percentageToPoints boundaries", () => {
  const cases: [number, number][] = [
    [29, 1],
    [30, 2],
    [39, 2],
    [40, 3],
    [49, 3],
    [50, 4],
    [79, 6],
    [80, 7],
    [89, 7],
  ];

  it.each(cases)("%d%% -> %d points on the standard scale", (percentage, expected) => {
    expect(percentageToPoints(percentage, STANDARD_NSC_SCALE)).toBe(expected);
  });

  it("90% -> 8 points on the Wits 8-point scale (top band split)", () => {
    expect(percentageToPoints(90, WITS_8_POINT_SCALE)).toBe(8);
  });

  it("89% -> 7 points on the Wits 8-point scale", () => {
    expect(percentageToPoints(89, WITS_8_POINT_SCALE)).toBe(7);
  });

  it("throws when no band covers the percentage (config error)", () => {
    expect(() => percentageToPoints(50, [{ minPercent: 0, maxPercent: 29, points: 1 }])).toThrow(
      /No point band covers/
    );
  });
});

describe("loPolicy branches", () => {
  it("exclude: LO is not counted and does not occupy a best-N slot", () => {
    const rule: ApsRule = { ...baseRule, loPolicy: "exclude", bestNSubjects: 6 };
    const result = calculateAps(rule, sevenSubjectMarks);
    expect(result.excludedSubjects).toContain("LO");
    expect(result.countedSubjects.find((s) => s.subjectCode === "LO")).toBeUndefined();
    // best 6 of the remaining 6 non-LO subjects, all counted
    expect(result.countedSubjects).toHaveLength(6);
  });

  it("include: LO counts at full value like any other subject", () => {
    const rule: ApsRule = { ...baseRule, loPolicy: "include" };
    const result = calculateAps(rule, sevenSubjectMarks);
    const lo = result.countedSubjects.find((s) => s.subjectCode === "LO");
    expect(lo?.value).toBe(7); // 80% -> band 7, no halving
  });

  it("halfWeight: LO's value is halved before entering best-N selection", () => {
    const rule: ApsRule = { ...baseRule, loPolicy: "halfWeight" };
    const result = calculateAps(rule, sevenSubjectMarks);
    const lo = result.countedSubjects.find((s) => s.subjectCode === "LO");
    expect(lo?.value).toBe(3.5); // 80% -> band 7, halved
  });

  it("capAt: LO's value is capped at loCap regardless of its raw points", () => {
    const rule: ApsRule = { ...baseRule, loPolicy: "capAt", loCap: 4 };
    const result = calculateAps(rule, sevenSubjectMarks);
    const lo = result.countedSubjects.find((s) => s.subjectCode === "LO");
    expect(lo?.value).toBe(4); // 80% -> band 7, capped down to 4
  });

  it("capAt does not raise a subject below the cap", () => {
    const rule: ApsRule = { ...baseRule, loPolicy: "capAt", loCap: 6 };
    const marksWithLowLo: SubjectMarkInput[] = [
      ...sevenSubjectMarks.filter((m) => m.subjectCode !== "LO"),
      { subjectCode: "LO", percentage: 35 }, // band 2
    ];
    const result = calculateAps(rule, marksWithLowLo);
    const lo = result.countedSubjects.find((s) => s.subjectCode === "LO");
    expect(lo?.value).toBe(2);
  });

  it("loTreatmentMessage reflects the active policy so the UI can show it", () => {
    expect(calculateAps({ ...baseRule, loPolicy: "exclude" }, sevenSubjectMarks).loTreatmentMessage).toMatch(
      /excluded/
    );
    expect(calculateAps({ ...baseRule, loPolicy: "include" }, sevenSubjectMarks).loTreatmentMessage).toMatch(
      /full weight/
    );
    expect(calculateAps({ ...baseRule, loPolicy: "halfWeight" }, sevenSubjectMarks).loTreatmentMessage).toMatch(
      /half weight/
    );
    expect(
      calculateAps({ ...baseRule, loPolicy: "capAt", loCap: 4 }, sevenSubjectMarks).loTreatmentMessage
    ).toMatch(/capped/);
  });
});

describe("best-N selection", () => {
  const eightSubjectMarks: SubjectMarkInput[] = [
    ...sevenSubjectMarks,
    { subjectCode: "BUS", percentage: 39 }, // band 2 -- should be dropped
  ];

  it("drops the lowest-value subject beyond bestNSubjects", () => {
    const result = calculateAps({ ...baseRule, bestNSubjects: 7 }, eightSubjectMarks);
    expect(result.countedSubjects).toHaveLength(7);
    expect(result.droppedSubjects).toEqual(["BUS"]);
  });

  it("with LO excluded, best-N is drawn only from the remaining subjects", () => {
    const rule: ApsRule = { ...baseRule, loPolicy: "exclude", bestNSubjects: 6 };
    const result = calculateAps(rule, eightSubjectMarks);
    expect(result.countedSubjects).toHaveLength(6);
    expect(result.countedSubjects.map((s) => s.subjectCode)).not.toContain("LO");
    expect(result.droppedSubjects).toContain("BUS");
  });

  it("with LO included, LO competes for a best-N slot like any subject", () => {
    const rule: ApsRule = { ...baseRule, loPolicy: "include", bestNSubjects: 4 };
    // Only the top 4 values should be counted; a low LO mark should drop out.
    const marks: SubjectMarkInput[] = [
      { subjectCode: "ENG-HL", percentage: 85 }, // 7
      { subjectCode: "MATH", percentage: 82 }, // 7
      { subjectCode: "PHS", percentage: 75 }, // 6
      { subjectCode: "LFS", percentage: 65 }, // 5
      { subjectCode: "LO", percentage: 32 }, // 2 -- lowest, should be dropped
    ];
    const result = calculateAps(rule, marks);
    expect(result.countedSubjects).toHaveLength(4);
    expect(result.droppedSubjects).toEqual(["LO"]);
  });
});

describe("Mathematics vs Mathematical Literacy", () => {
  it("mathLitPolicy 'equal': MATHLIT is valued the same as MATH would be at that percentage", () => {
    const rule: ApsRule = { ...baseRule, mathLitPolicy: "equal" };
    const marks: SubjectMarkInput[] = [{ subjectCode: "MATHLIT", percentage: 68 }];
    const result = calculateAps({ ...rule, bestNSubjects: 1 }, marks);
    expect(result.countedSubjects[0]?.value).toBe(5); // 68% -> band 5, unpenalised
  });

  it("mathLitPolicy 'penalised' with a configured factor reduces MATHLIT's counted value", () => {
    const rule: ApsRule = {
      ...baseRule,
      mathLitPolicy: "penalised",
      mathLitPenaltyFactor: 0.5,
      bestNSubjects: 1,
    };
    const marks: SubjectMarkInput[] = [{ subjectCode: "MATHLIT", percentage: 68 }];
    const result = calculateAps(rule, marks);
    expect(result.countedSubjects[0]?.value).toBe(2.5); // band 5 * 0.5
  });

  it("mathLitPolicy 'penalised' with no factor configured is a no-op (never fabricate an unverified number)", () => {
    const rule: ApsRule = {
      ...baseRule,
      mathLitPolicy: "penalised",
      mathLitPenaltyFactor: undefined,
      bestNSubjects: 1,
    };
    const marks: SubjectMarkInput[] = [{ subjectCode: "MATHLIT", percentage: 68 }];
    const result = calculateAps(rule, marks);
    expect(result.countedSubjects[0]?.value).toBe(5);
  });

  it("MATH itself is never penalised regardless of mathLitPolicy", () => {
    const rule: ApsRule = {
      ...baseRule,
      mathLitPolicy: "penalised",
      mathLitPenaltyFactor: 0.5,
      bestNSubjects: 1,
    };
    const marks: SubjectMarkInput[] = [{ subjectCode: "MATH", percentage: 68 }];
    const result = calculateAps(rule, marks);
    expect(result.countedSubjects[0]?.value).toBe(5);
  });
});

describe("incomplete input (fewer than bestNSubjects provided)", () => {
  it("computes a score from the 6 subjects available and warns instead of erroring", () => {
    const sixSubjects = sevenSubjectMarks.filter((m) => m.subjectCode !== "GEO");
    const result = calculateAps({ ...baseRule, bestNSubjects: 7 }, sixSubjects);
    expect(result.countedSubjects).toHaveLength(6);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toMatch(/Only 6 eligible subject/);
  });

  it("does not throw on an empty mark list", () => {
    const result = calculateAps(baseRule, []);
    expect(result.score).toBe(0);
    expect(result.countedSubjects).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe("percentage-based institutions (no point bands)", () => {
  const percentageRule: ApsRule = {
    ...baseRule,
    formulaType: "percentageSum",
    usesRawPercentage: true,
    bands: [],
    loPolicy: "exclude",
    bestNSubjects: 6,
    maxScore: 600,
  };

  it("sums raw percentages directly, not point-band values", () => {
    const marks: SubjectMarkInput[] = [
      { subjectCode: "ENG-HL", percentage: 85 },
      { subjectCode: "AFR-FAL", percentage: 72 },
      { subjectCode: "MATH", percentage: 68 },
      { subjectCode: "PHS", percentage: 61 },
      { subjectCode: "LFS", percentage: 55 },
      { subjectCode: "GEO", percentage: 45 },
    ];
    const result = calculateAps(percentageRule, marks);
    expect(result.score).toBe(85 + 72 + 68 + 61 + 55 + 45);
    expect(result.countedSubjects.every((s) => s.value === s.percentage)).toBe(true);
  });

  it("LO is excluded from a percentage-based total when loPolicy is exclude", () => {
    const marks: SubjectMarkInput[] = [
      { subjectCode: "ENG-HL", percentage: 85 },
      { subjectCode: "AFR-FAL", percentage: 72 },
      { subjectCode: "MATH", percentage: 68 },
      { subjectCode: "PHS", percentage: 61 },
      { subjectCode: "LFS", percentage: 55 },
      { subjectCode: "GEO", percentage: 45 },
      { subjectCode: "LO", percentage: 90 },
    ];
    const result = calculateAps(percentageRule, marks);
    expect(result.score).toBe(85 + 72 + 68 + 61 + 55 + 45);
    expect(result.excludedSubjects).toContain("LO");
  });
});

describe("bonus rules", () => {
  it("applies a flat per-subject bonus (Wits-style English/Maths bonus pattern)", () => {
    const rule: ApsRule = {
      ...baseRule,
      formulaType: "pointBandWithBonus",
      bands: WITS_8_POINT_SCALE,
      loPolicy: "include",
      bestNSubjects: 7,
      bonusRules: [
        { subjectCode: "ENG-HL", bonusPoints: 2, description: "English bonus" },
        { subjectCode: "MATH", bonusPoints: 2, description: "Maths bonus" },
      ],
    };
    const result = calculateAps(rule, sevenSubjectMarks);
    expect(result.appliedBonuses).toHaveLength(2);
    expect(result.score).toBe(
      result.countedSubjects.reduce((sum, s) => sum + s.value, 0) + 4
    );
  });

  it("applies an equity bonus only when the applicant context satisfies the condition", () => {
    const rule: ApsRule = {
      ...baseRule,
      formulaType: "applicantScoreWeighted",
      usesRawPercentage: true,
      bands: [],
      loPolicy: "exclude",
      bestNSubjects: 6,
      bonusRules: [
        {
          subjectCode: "LO",
          condition: "quintile1to3",
          minMarkPercent: 50,
          bonusPoints: 7,
          description: "Quintile 1-3 equity bonus",
        },
      ],
    };

    const withoutContext = calculateAps(rule, sevenSubjectMarks);
    expect(withoutContext.appliedBonuses).toHaveLength(0);

    const withQualifyingContext = calculateAps(rule, sevenSubjectMarks, {
      schoolQuintile: 2,
    });
    expect(withQualifyingContext.appliedBonuses).toHaveLength(1);
    expect(withQualifyingContext.score - withoutContext.score).toBe(7);

    const withNonQualifyingQuintile = calculateAps(rule, sevenSubjectMarks, {
      schoolQuintile: 5,
    });
    expect(withNonQualifyingQuintile.appliedBonuses).toHaveLength(0);
  });

  it("does not apply a bonus when the required subject's mark is below minMarkPercent", () => {
    const rule: ApsRule = {
      ...baseRule,
      bonusRules: [
        {
          subjectCode: "LO",
          minMarkPercent: 90,
          bonusPoints: 7,
          description: "High LO bonus",
        },
      ],
    };
    const result = calculateAps(rule, sevenSubjectMarks); // LO is 80%
    expect(result.appliedBonuses).toHaveLength(0);
  });
});

/**
 * Weighted faculty-score formulas (formulaType "facultyPointScore" /
 * "applicantScoreWeighted") -- added to represent real institutions like
 * Stellenbosch's Engineering/Science faculties and UCT's FPS/WPS, whose
 * real formulas force specific subjects into the count and/or count one
 * subject's value more than once, rather than a plain best-N sum. Every
 * fixture below hand-computes its expected score from the real formula
 * text so these tests double as a worked-example proof, not just a
 * regression snapshot.
 */
describe("forcedSubjects, extraCountedSubjects, and divisor (weighted faculty-score formulas)", () => {
  const rawPercentRule: ApsRule = {
    ...baseRule,
    formulaType: "facultyPointScore",
    usesRawPercentage: true,
    bands: [],
    loPolicy: "exclude",
  };

  const engineeringMarks: SubjectMarkInput[] = [
    { subjectCode: "ENG-HL", percentage: 75 },
    { subjectCode: "AFR-FAL", percentage: 68 },
    { subjectCode: "MATH", percentage: 82 },
    { subjectCode: "LO", percentage: 70 },
    { subjectCode: "PHS", percentage: 78 },
    { subjectCode: "LFS", percentage: 60 },
    { subjectCode: "GEO", percentage: 55 },
  ];

  it("extraCountedSubjects adds that subject's value again on top of the normal best-N sum (Stellenbosch Engineering: Maths% + PhysSci% + 6 x Matric average)", () => {
    // "6 x Matric average" of the best 6 non-LO subjects is mathematically
    // the SAME as the sum of those 6 subjects' raw percentages -- already
    // exactly what bestNSubjects=6/usesRawPercentage=true computes.
    const rule: ApsRule = {
      ...rawPercentRule,
      bestNSubjects: 6,
      extraCountedSubjects: ["MATH", "PHS"],
      maxScore: 800,
    };
    const result = calculateAps(rule, engineeringMarks);
    const best6Sum = 75 + 68 + 82 + 78 + 60 + 55; // all 6 non-LO subjects (only 6 exist)
    expect(result.score).toBe(best6Sum + 82 + 78); // + Maths% + PhysSci% again
  });

  it("extraCountedSubjects still adds the subject's value even if it wasn't one of the naturally-selected best-N", () => {
    // Enough OTHER high-scoring subjects that Mathematics (68%) would drop
    // out of a natural best-3 selection -- the real formula still adds it.
    const marks: SubjectMarkInput[] = [
      { subjectCode: "ENG-HL", percentage: 90 },
      { subjectCode: "AFR-FAL", percentage: 88 },
      { subjectCode: "PHS", percentage: 85 },
      { subjectCode: "MATH", percentage: 68 }, // lowest -- excluded from best-3
    ];
    const rule: ApsRule = { ...rawPercentRule, bestNSubjects: 3, extraCountedSubjects: ["MATH"] };
    const result = calculateAps(rule, marks);
    expect(result.countedSubjects.map((s) => s.subjectCode)).not.toContain("MATH");
    expect(result.score).toBe(90 + 88 + 85 + 68); // best-3 sum, plus Maths% added separately
  });

  it("forcedSubjects removes a subject from the best-N ranking pool and counts it once, unconditionally", () => {
    // Stellenbosch Science: "(Maths% x 2 + 5 other subjects%) / 7" -- Maths
    // is forced OUT of the "5 other subjects" ranking pool (so it doesn't
    // occupy one of those 5 slots) and counted via extraCountedSubjects.
    const marks: SubjectMarkInput[] = [
      { subjectCode: "ENG-HL", percentage: 80 },
      { subjectCode: "AFR-FAL", percentage: 75 },
      { subjectCode: "MATH", percentage: 70 },
      { subjectCode: "PHS", percentage: 65 },
      { subjectCode: "LFS", percentage: 60 },
      { subjectCode: "HIS", percentage: 58 },
      { subjectCode: "GEO", percentage: 55 }, // lowest of the "other" candidates (6 available, only 5 slots) -- dropped
    ];
    const rule: ApsRule = {
      ...rawPercentRule,
      bestNSubjects: 5,
      forcedSubjects: ["MATH"],
      extraCountedSubjects: ["MATH"],
      divisor: 7,
    };
    const result = calculateAps(rule, marks);
    expect(result.countedSubjects.map((s) => s.subjectCode)).toContain("MATH");
    expect(result.droppedSubjects).toEqual(["GEO"]);
    const fiveOthersSum = 80 + 75 + 65 + 60 + 58; // best 5 of the remaining (non-Math) pool
    expect(result.score).toBeCloseTo((70 * 2 + fiveOthersSum) / 7, 10);
  });

  it("a language-family forcedSubjects entry (ENG-HL) matches the candidate's real English subject in either slot", () => {
    // UCT's FPS/WPS always counts "English Home OR First Additional
    // Language" -- the candidate below took English as a First Additional
    // Language, not Home Language, and it must still be forced in.
    const marks: SubjectMarkInput[] = [
      { subjectCode: "AFR-HL", percentage: 90 },
      { subjectCode: "ENG-FAL", percentage: 55 }, // lowest -- would drop out of a natural best-3
      { subjectCode: "MATH", percentage: 85 },
      { subjectCode: "PHS", percentage: 80 },
      { subjectCode: "LFS", percentage: 78 },
    ];
    const rule: ApsRule = {
      ...rawPercentRule,
      bestNSubjects: 3,
      forcedSubjects: ["ENG-HL", "MATH"],
      maxScore: 600,
    };
    const result = calculateAps(rule, marks);
    expect(result.countedSubjects.map((s) => s.subjectCode)).toEqual(
      expect.arrayContaining(["ENG-FAL", "MATH"])
    );
    expect(result.droppedSubjects).not.toContain("ENG-FAL");
    // forced: English (55) + Maths (85); best 3 of the remaining pool (Afr 90, PhysSci 80, LifeSci 78)
    expect(result.score).toBe(55 + 85 + 90 + 80 + 78);
  });

  it("matches UCT Science's own published worked example exactly (real-world validation, not just a synthetic fixture)", () => {
    // UCT's own Admission Guidelines PDF worked example: English 85 +
    // Afrikaans/isiXhosa FAL 89 + Maths 84x2 + Life Sciences 86 +
    // Geography 79 + Physical Science 81x2 = FPS 669.
    const marks: SubjectMarkInput[] = [
      { subjectCode: "ENG-HL", percentage: 85 },
      { subjectCode: "AFR-FAL", percentage: 89 },
      { subjectCode: "MATH", percentage: 84 },
      { subjectCode: "LFS", percentage: 86 },
      { subjectCode: "GEO", percentage: 79 },
      { subjectCode: "PHS", percentage: 81 },
      { subjectCode: "LO", percentage: 80 },
    ];
    const rule: ApsRule = {
      ...rawPercentRule,
      bestNSubjects: 6,
      extraCountedSubjects: ["MATH", "PHS"],
      maxScore: 800,
    };
    const result = calculateAps(rule, marks);
    expect(result.score).toBe(669);
  });

  it("forcedSubjects, extraCountedSubjects, and divisor are all no-ops when unset, matching every institution seeded before these fields existed", () => {
    const legacyStyleRule: ApsRule = {
      ...rawPercentRule,
      bestNSubjects: 6,
      forcedSubjects: [],
      extraCountedSubjects: [],
      divisor: undefined,
    };
    const result = calculateAps(legacyStyleRule, engineeringMarks);
    expect(result.score).toBe(75 + 68 + 82 + 78 + 60 + 55);
  });
});
