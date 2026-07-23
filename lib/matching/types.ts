/**
 * lib/matching/ is pure TypeScript, same discipline as lib/aps/ (no
 * Firebase/React imports, type-only imports from lib/firestore/types are
 * fine since that file has zero runtime deps).
 */

import type { ApsResult } from "@/lib/aps/types";

export type MatchBucket = "qualify" | "almostQualify" | "notYet";

export interface ApsGapReason {
  type: "aps";
  met: boolean;
  required: number;
  achieved: number;
  gap: number;
}

/** The learner didn't take this subject at all. */
export interface SubjectMissingReason {
  type: "subjectMissing";
  subjectCode: string;
  label: string;
}

/** The learner took a different variant of a required subject -- e.g. the
 * programme requires Mathematics and the learner has Mathematical
 * Literacy. This is a hard mismatch, not a gap, but the brief explicitly
 * treats it as an "almost qualify" case with a nameable reason. */
export interface SubjectWrongVariantReason {
  type: "subjectWrongVariant";
  requiredSubjectCode: string;
  requiredLabel: string;
  achievedSubjectCode: string;
  achievedLabel: string;
}

export interface SubjectLevelReason {
  type: "subjectLevel";
  subjectCode: string;
  label: string;
  met: boolean;
  requiredLevel: number;
  achievedLevel: number;
  gap: number;
}

export interface SubjectPercentReason {
  type: "subjectPercent";
  subjectCode: string;
  label: string;
  met: boolean;
  requiredPercent: number;
  achievedPercent: number;
  gap: number;
}

export type MatchReason =
  | ApsGapReason
  | SubjectMissingReason
  | SubjectWrongVariantReason
  | SubjectLevelReason
  | SubjectPercentReason;

export interface MatchResult {
  programmeId: string;
  bucket: MatchBucket;
  apsResult: ApsResult;
  /** Every reason evaluated, met or not -- the UI itemises all of them
   * ("Requirements met / not met, itemised" per the brief). */
  reasons: MatchReason[];
  /** Only the unmet reasons, for building "here's the gap" / "here's why" copy. */
  unmetReasons: MatchReason[];
  /** One concrete forward step when bucket is "notYet". Null otherwise --
   * "qualify" and "almostQualify" don't need a pathway suggestion. */
  suggestedNextStep: string | null;
  /** NSC pass-type (Bachelor's/Diploma/Higher Certificate) gating is
   * deliberately NOT evaluated here -- see lib/matching/engine.ts header
   * for why. This is always true so pass-type never silently blocks a
   * result; Phase 4 revisits this once real Umalusi thresholds are on
   * record with a source. */
  passTypeEvaluated: false;
}
