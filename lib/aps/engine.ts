import { percentageToPoints } from "./bands";
import type {
  ApplicantContext,
  ApsResult,
  CountedSubject,
  SubjectMarkInput,
} from "./types";
import type { ApsBonusRule, ApsRule } from "@/lib/firestore/types";

const LIFE_ORIENTATION_CODE = "LO";
const MATH_LIT_CODE = "MATHLIT";

function loTreatmentMessage(rule: ApsRule): string {
  switch (rule.loPolicy) {
    case "exclude":
      return "Life Orientation is excluded from this institution's APS total.";
    case "halfWeight":
      return "Life Orientation counts at half weight for this institution.";
    case "capAt":
      return `Life Orientation is capped at ${rule.loCap ?? "a reduced"} point(s) for this institution.`;
    case "include":
      return "Life Orientation counts at full weight for this institution.";
  }
}

function rawValueFor(rule: ApsRule, mark: SubjectMarkInput): number {
  const base = rule.usesRawPercentage
    ? mark.percentage
    : percentageToPoints(mark.percentage, rule.bands);

  if (
    rule.mathLitPolicy === "penalised" &&
    mark.subjectCode === MATH_LIT_CODE &&
    rule.mathLitPenaltyFactor !== undefined
  ) {
    return base * rule.mathLitPenaltyFactor;
  }

  return base;
}

function applyLoAdjustment(rule: ApsRule, value: number): number {
  if (rule.loPolicy === "halfWeight") return value / 2;
  if (rule.loPolicy === "capAt" && rule.loCap !== undefined) {
    return Math.min(value, rule.loCap);
  }
  return value;
}

function evaluateBonuses(
  rule: ApsRule,
  allMarks: SubjectMarkInput[],
  context: ApplicantContext | undefined
): { total: number; applied: ApsBonusRule[] } {
  let total = 0;
  const applied: ApsBonusRule[] = [];

  for (const bonus of rule.bonusRules) {
    if (bonus.subjectCode !== "*") {
      const mark = allMarks.find((m) => m.subjectCode === bonus.subjectCode);
      if (!mark) continue;
      if (
        bonus.minMarkPercent !== undefined &&
        mark.percentage < bonus.minMarkPercent
      ) {
        continue;
      }
    }

    if (bonus.condition === "quintile1to3") {
      const quintile = context?.schoolQuintile;
      if (quintile === undefined || quintile > 3) continue;
    }

    total += bonus.bonusPoints;
    applied.push(bonus);
  }

  return { total, applied };
}

/**
 * Calculates a learner's APS under a single institution's rule. Never
 * assumes a national formula -- every institution-specific behaviour
 * (point bands vs raw percentage, Life Orientation treatment, best-N
 * selection, per-subject bonuses) is driven entirely by `rule`. See
 * lib/firestore/types.ts ApsRule for the field-by-field rationale.
 */
export function calculateAps(
  rule: ApsRule,
  marks: SubjectMarkInput[],
  context?: ApplicantContext
): ApsResult {
  const excludedSubjects: string[] = [];

  const candidates = marks.filter((mark) => {
    if (rule.excludedSubjects.includes(mark.subjectCode)) {
      excludedSubjects.push(mark.subjectCode);
      return false;
    }
    if (mark.subjectCode === LIFE_ORIENTATION_CODE && rule.loPolicy === "exclude") {
      excludedSubjects.push(mark.subjectCode);
      return false;
    }
    return true;
  });

  const valued: CountedSubject[] = candidates.map((mark) => {
    const isLifeOrientation = mark.subjectCode === LIFE_ORIENTATION_CODE;
    let value = rawValueFor(rule, mark);
    if (isLifeOrientation) value = applyLoAdjustment(rule, value);

    return {
      subjectCode: mark.subjectCode,
      percentage: mark.percentage,
      value,
      isLifeOrientation,
    };
  });

  const sorted = [...valued].sort((a, b) => b.value - a.value);
  const countedSubjects = sorted.slice(0, rule.bestNSubjects);
  const droppedSubjects = sorted
    .slice(rule.bestNSubjects)
    .map((s) => s.subjectCode);

  const baseScore = countedSubjects.reduce((sum, s) => sum + s.value, 0);
  const { total: bonusTotal, applied: appliedBonuses } = evaluateBonuses(
    rule,
    marks,
    context
  );

  const warnings: string[] = [];
  if (candidates.length < rule.bestNSubjects) {
    warnings.push(
      `Only ${candidates.length} eligible subject(s) provided; this institution's formula expects the best ${rule.bestNSubjects}. The score below is based on what was provided.`
    );
  }

  return {
    formulaType: rule.formulaType,
    score: baseScore + bonusTotal,
    maxScore: rule.maxScore,
    countedSubjects,
    droppedSubjects,
    excludedSubjects,
    loTreatmentMessage: loTreatmentMessage(rule),
    appliedBonuses,
    warnings,
  };
}
