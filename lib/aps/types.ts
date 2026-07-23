/**
 * lib/aps/ is pure, dependency-free TypeScript -- no Firebase or React
 * imports anywhere in this directory (a hard requirement per
 * docs/MASTER_PROMPT_v2.md sect. 3, so it stays unit-testable in
 * isolation and portable to a Flutter/Dart port or a standalone
 * serverless function later). Type-only imports from lib/firestore/types
 * are fine -- that file itself has zero runtime imports, so nothing
 * framework-specific crosses the boundary even transitively.
 */

import type {
  ApsBonusRule,
  ApsFormulaType,
  ApsRule,
} from "@/lib/firestore/types";

export interface SubjectMarkInput {
  subjectCode: string;
  percentage: number;
}

/** Attributes about the applicant beyond their marks, needed by some
 * institutions' bonus rules (e.g. NMU's quintile 1-3 equity bonus). Only
 * collected/applied when the UI actually asks for it -- until then, bonus
 * rules requiring context simply don't apply, rather than guessing. */
export interface ApplicantContext {
  schoolQuintile?: 1 | 2 | 3 | 4 | 5;
}

export interface CountedSubject {
  subjectCode: string;
  percentage: number;
  /** Points (band-based formulas) or the raw percentage itself
   * (percentage-based formulas) -- whichever this rule's `value` means. */
  value: number;
  isLifeOrientation: boolean;
}

export interface ApsResult {
  formulaType: ApsFormulaType;
  score: number;
  maxScore?: number;
  countedSubjects: CountedSubject[];
  /** Candidate subjects that existed but weren't selected because they
   * fell outside bestNSubjects. */
  droppedSubjects: string[];
  /** Subjects removed before selection even began: rule.excludedSubjects
   * matches, or Life Orientation when loPolicy is "exclude". */
  excludedSubjects: string[];
  loTreatmentMessage: string;
  appliedBonuses: ApsBonusRule[];
  /** e.g. "Only 6 subjects provided; this institution's formula expects 7." */
  warnings: string[];
}

export type { ApsRule, ApsBonusRule, ApsFormulaType };
