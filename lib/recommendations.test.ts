import { describe, expect, it } from "vitest";
import { recommendProgrammes } from "./recommendations";
import type { Programme } from "@/lib/firestore/types";
import type { MatchResult } from "@/lib/matching/types";

function makeProgramme(overrides: Partial<Programme>): Programme {
  return {
    id: "test-programme",
    institutionId: "test-institution",
    facultyId: "test-faculty",
    schoolId: "test-school",
    name: "Test Programme",
    qualificationType: "bachelorsDegree",
    nqfLevel: 7,
    saqaId: null,
    duration: "3 years",
    campuses: ["Main"],
    modeOfDelivery: "contact",
    minAps: 30,
    subjectRequirements: [],
    additionalRequirements: [],
    careerOutcomes: [],
    applyUrl: null,
    fieldTags: [],
    sourceUrl: "https://example.test/",
    verifiedOn: "2026-07-23",
    academicYear: 2027,
    ...overrides,
  };
}

function makeMatchResult(bucket: MatchResult["bucket"]): MatchResult {
  return {
    programmeId: "test-programme",
    bucket,
    apsResult: {
      formulaType: "pointBandSum",
      score: 30,
      countedSubjects: [],
      droppedSubjects: [],
      excludedSubjects: [],
      loTreatmentMessage: "",
      appliedBonuses: [],
      warnings: [],
    },
    reasons: [],
    unmetReasons: [],
    suggestedNextStep: null,
    passTypeEvaluated: false,
  };
}

describe("recommendProgrammes", () => {
  it("excludes programmes the learner doesn't qualify or almost-qualify for", () => {
    const entries = [
      { programme: makeProgramme({ id: "a", fieldTags: ["technology"] }), matchResult: makeMatchResult("notYet") },
    ];
    expect(recommendProgrammes(entries, ["technology"])).toHaveLength(0);
  });

  it("ranks a programme with more matching interest tags higher", () => {
    const entries = [
      { programme: makeProgramme({ id: "low-overlap", fieldTags: ["business"] }), matchResult: makeMatchResult("qualify") },
      {
        programme: makeProgramme({ id: "high-overlap", fieldTags: ["technology", "science"] }),
        matchResult: makeMatchResult("qualify"),
      },
    ];
    const ranked = recommendProgrammes(entries, ["technology", "science"]);
    expect(ranked[0]!.programme.id).toBe("high-overlap");
    expect(ranked[0]!.overlapScore).toBe(2);
    expect(ranked[1]!.overlapScore).toBe(0);
  });

  it("breaks a tied overlap score in favour of qualify over almostQualify", () => {
    const entries = [
      { programme: makeProgramme({ id: "almost", fieldTags: ["technology"] }), matchResult: makeMatchResult("almostQualify") },
      { programme: makeProgramme({ id: "qualify", fieldTags: ["technology"] }), matchResult: makeMatchResult("qualify") },
    ];
    const ranked = recommendProgrammes(entries, ["technology"]);
    expect(ranked[0]!.programme.id).toBe("qualify");
  });

  it("never crashes on an empty interest list -- just returns eligible programmes unranked by overlap", () => {
    const entries = [
      { programme: makeProgramme({ id: "a", fieldTags: ["technology"] }), matchResult: makeMatchResult("qualify") },
    ];
    expect(() => recommendProgrammes(entries, [])).not.toThrow();
    expect(recommendProgrammes(entries, [])[0]!.overlapScore).toBe(0);
  });
});
