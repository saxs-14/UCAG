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
const LANGUAGE_CODE_PATTERN = /^([A-Z]+)-(HL|FAL)$/;

/** Matches a forcedSubjects entry against a candidate's mark. An exact
 * subjectCode match always counts. A "<LANG>-HL"/"<LANG>-FAL" forced code
 * additionally matches that language in EITHER slot -- e.g. a forced
 * "ENG-HL" entry (real institutions phrase this as "English Home OR
 * First Additional Language") matches a candidate's real ENG-FAL mark
 * too. Reimplemented locally (not imported from config/subjects.ts or
 * lib/matching/engine.ts) so lib/aps/ stays free of every non-type
 * dependency outside this directory, per this directory's own portability
 * requirement (see file header of lib/aps/types.ts). */
function isForcedMatch(forcedCode: string, mark: CountedSubject): boolean {
  if (mark.subjectCode === forcedCode) return true;
  const forcedLang = LANGUAGE_CODE_PATTERN.exec(forcedCode);
  const markLang = LANGUAGE_CODE_PATTERN.exec(mark.subjectCode);
  return Boolean(forcedLang && markLang && forcedLang[1] === markLang[1]);
}

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

  // Forced subjects (e.g. UCT's FPS always counting English + Mathematics,
  // or Stellenbosch Science forcing Mathematics out of the "5 other
  // subjects" ranking pool so it doesn't occupy one of those slots) are
  // carved out of the ranking pool BEFORE best-N selection runs, one match
  // per forcedSubjects entry, so they never compete for -- or get double-
  // reserved into -- a best-N slot. Empty forcedSubjects (every rule
  // seeded before this field existed) leaves the pool untouched, so this
  // is a no-op for every existing institution.
  const forced: CountedSubject[] = [];
  const consumed = new Set<CountedSubject>();
  for (const code of rule.forcedSubjects) {
    const match = valued.find((v) => !consumed.has(v) && isForcedMatch(code, v));
    if (match) {
      forced.push(match);
      consumed.add(match);
    }
  }
  const remainingPool = valued.filter((v) => !consumed.has(v));

  const sorted = [...remainingPool].sort((a, b) => b.value - a.value);
  const bestOfRemaining = sorted.slice(0, rule.bestNSubjects);
  const droppedSubjects = sorted
    .slice(rule.bestNSubjects)
    .map((s) => s.subjectCode);

  const countedSubjects = [...forced, ...bestOfRemaining];
  const baseScore = countedSubjects.reduce((sum, s) => sum + s.value, 0);

  // Extra-counted subjects (e.g. "Mathematics% + Physical Sciences% + 6 x
  // Matric average" -- Mathematics/Physical Sciences are ordinary members
  // of that 6-subject average AND separately added again) look up their
  // value from the FULL valued pool, not just countedSubjects: the real
  // formula adds that subject's percentage regardless of whether it also
  // happened to be selected into the best-N average. Empty
  // extraCountedSubjects is a no-op.
  const extraValue = rule.extraCountedSubjects.reduce((sum, code) => {
    const match = valued.find((v) => v.subjectCode === code);
    return sum + (match?.value ?? 0);
  }, 0);

  const { total: bonusTotal, applied: appliedBonuses } = evaluateBonuses(
    rule,
    marks,
    context
  );

  const warnings: string[] = [];
  const totalConsidered = forced.length + remainingPool.length;
  if (totalConsidered < rule.forcedSubjects.length + rule.bestNSubjects) {
    warnings.push(
      `Only ${totalConsidered} eligible subject(s) provided; this institution's formula expects ${rule.forcedSubjects.length > 0 ? `${rule.forcedSubjects.length} specific subject(s) plus ` : ""}the best ${rule.bestNSubjects}. The score below is based on what was provided.`
    );
  }

  const rawTotal = baseScore + extraValue + bonusTotal;
  const score = rule.divisor ? rawTotal / rule.divisor : rawTotal;

  return {
    formulaType: rule.formulaType,
    score,
    maxScore: rule.maxScore,
    countedSubjects,
    droppedSubjects,
    excludedSubjects,
    loTreatmentMessage: loTreatmentMessage(rule),
    appliedBonuses,
    warnings,
  };
}
