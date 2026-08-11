import { calculateAps } from "./engine";
import { matchProgramme } from "../matching/engine";
import type { SubjectMarkInput } from "./types";
import type { ApsRule, Programme } from "../firestore/types";

export interface SubjectImprovementRecommendation {
  subjectCode: string;
  currentMark: number;
  suggestedMark: number;
  markIncrease: number;
  apsGain: number;
  unlockedProgrammes: Programme[];
  unlocksCount: number;
  roiScore: number; // unlocked count per percentage point gained
}

export interface OptimizationAnalysis {
  institutionId: string;
  currentAps: number;
  recommendations: SubjectImprovementRecommendation[];
  topRecommendation: SubjectImprovementRecommendation | null;
}

/**
 * Pure, framework-agnostic optimizer that evaluates potential subject mark improvements
 * and finds the smallest mark delta that unlocks the highest number of new qualifying programmes.
 */
export function analyzeBestImprovements(
  marks: SubjectMarkInput[],
  apsRule: ApsRule,
  programmes: Programme[],
  options: { maxTargetIncrease?: number; minStep?: number } = {}
): OptimizationAnalysis {
  const maxIncrease = options.maxTargetIncrease ?? 15; // default test up to +15%
  const currentAps = calculateAps(apsRule, marks).score;
  const currentMatches = new Map<string, string>();

  for (const prog of programmes) {
    if (prog.institutionId !== apsRule.institutionId) continue;
    const match = matchProgramme(prog, apsRule, marks, { catalog: programmes });
    currentMatches.set(prog.id, match.bucket);
  }

  const recommendations: SubjectImprovementRecommendation[] = [];

  for (const markInput of marks) {
    const currentMark = markInput.percentage;
    if (currentMark >= 100) continue; // cannot improve 100%

    // Test increments of 5% up to maxIncrease (capped at 100%)
    for (let inc = 5; inc <= maxIncrease; inc += 5) {
      const targetMark = Math.min(100, currentMark + inc);
      if (targetMark === currentMark) continue;

      const testMarks = marks.map((m) =>
        m.subjectCode === markInput.subjectCode ? { ...m, percentage: targetMark } : m
      );

      const testAps = calculateAps(apsRule, testMarks).score;
      const apsGain = testAps - currentAps;
      const unlocked: Programme[] = [];

      for (const prog of programmes) {
        if (prog.institutionId !== apsRule.institutionId) continue;
        const previousBucket = currentMatches.get(prog.id);
        if (previousBucket === "qualify") continue; // already qualified

        const newMatch = matchProgramme(prog, apsRule, testMarks, { catalog: programmes });
        if (newMatch.bucket === "qualify") {
          unlocked.push(prog);
        }
      }

      if (unlocked.length > 0) {
        const markIncrease = targetMark - currentMark;
        recommendations.push({
          subjectCode: markInput.subjectCode,
          currentMark,
          suggestedMark: targetMark,
          markIncrease,
          apsGain,
          unlockedProgrammes: unlocked,
          unlocksCount: unlocked.length,
          roiScore: unlocked.length / markIncrease,
        });
      }
    }
  }

  // Sort by highest unlocksCount, then highest ROI (unlocks per mark point)
  recommendations.sort((a, b) => {
    if (b.unlocksCount !== a.unlocksCount) return b.unlocksCount - a.unlocksCount;
    return b.roiScore - a.roiScore;
  });

  return {
    institutionId: apsRule.institutionId,
    currentAps,
    recommendations,
    topRecommendation: recommendations[0] ?? null,
  };
}
