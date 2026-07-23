import { calculateAps } from "@/lib/aps/engine";
import { percentageToPoints } from "@/lib/aps/bands";
import { STANDARD_NSC_SCALE } from "@/config/aps-scales";
import { resolveSubjectLabel } from "@/config/subjects";
import {
  ALMOST_QUALIFY_APS_GAP_FALLBACK,
  ALMOST_QUALIFY_APS_GAP_RATIO,
  ALMOST_QUALIFY_SUBJECT_LEVEL_GAP_MAX,
  ALMOST_QUALIFY_SUBJECT_PERCENT_GAP_MAX,
} from "@/config/matching";
import type { ApplicantContext, SubjectMarkInput } from "@/lib/aps/types";
import type { ApsRule, Programme } from "@/lib/firestore/types";
import type { MatchBucket, MatchReason, MatchResult } from "./types";

/** Subjects that are mutually-exclusive alternatives for the same NSC
 * "slot" -- if a programme requires one and the learner took another from
 * the same group, that's a wrong-variant mismatch, not a missing subject. */
const VARIANT_GROUPS: string[][] = [["MATH", "MATHLIT", "TECHMATH"]];

function findVariantGroup(subjectCode: string): string[] | undefined {
  return VARIANT_GROUPS.find((group) => group.includes(subjectCode));
}

function isReasonMet(reason: MatchReason): boolean {
  switch (reason.type) {
    case "aps":
      return reason.met;
    case "subjectMissing":
      return false;
    case "subjectWrongVariant":
      return false;
    case "subjectLevel":
      return reason.met;
    case "subjectPercent":
      return reason.met;
  }
}

function apsAlmostThreshold(maxScore: number | undefined): number {
  if (!maxScore) return ALMOST_QUALIFY_APS_GAP_FALLBACK;
  return maxScore * ALMOST_QUALIFY_APS_GAP_RATIO;
}

function isReasonWithinAlmostMargin(reason: MatchReason, apsMaxScore: number | undefined): boolean {
  switch (reason.type) {
    case "aps":
      return reason.gap <= apsAlmostThreshold(apsMaxScore);
    case "subjectMissing":
      return false;
    case "subjectWrongVariant":
      // The brief's own example ("requires Mathematics, you have
      // Mathematical Literacy") is listed under "almost qualify" -- a
      // wrong variant is a nameable, fixable gap (rewrite/upgrade the
      // subject), not a dead end.
      return true;
    case "subjectLevel":
      return reason.gap <= ALMOST_QUALIFY_SUBJECT_LEVEL_GAP_MAX;
    case "subjectPercent":
      return reason.gap <= ALMOST_QUALIFY_SUBJECT_PERCENT_GAP_MAX;
  }
}

function buildSubjectReasons(
  programme: Programme,
  marks: SubjectMarkInput[]
): MatchReason[] {
  const marksByCode = new Map(marks.map((m) => [m.subjectCode, m]));
  const reasons: MatchReason[] = [];

  for (const requirement of programme.subjectRequirements) {
    const directMark = marksByCode.get(requirement.subjectCode);
    const mark = directMark;

    if (!mark) {
      const variantGroup = findVariantGroup(requirement.subjectCode);
      const takenVariant = variantGroup
        ?.map((code) => marksByCode.get(code))
        .find((m): m is SubjectMarkInput => m !== undefined && m.subjectCode !== requirement.subjectCode);

      if (takenVariant) {
        reasons.push({
          type: "subjectWrongVariant",
          requiredSubjectCode: requirement.subjectCode,
          requiredLabel: resolveSubjectLabel(requirement.subjectCode),
          achievedSubjectCode: takenVariant.subjectCode,
          achievedLabel: resolveSubjectLabel(takenVariant.subjectCode),
        });
        continue;
      }

      reasons.push({
        type: "subjectMissing",
        subjectCode: requirement.subjectCode,
        label: resolveSubjectLabel(requirement.subjectCode),
      });
      continue;
    }

    if (requirement.minLevel !== undefined) {
      const achievedLevel = percentageToPoints(mark.percentage, STANDARD_NSC_SCALE);
      reasons.push({
        type: "subjectLevel",
        subjectCode: requirement.subjectCode,
        label: resolveSubjectLabel(requirement.subjectCode),
        met: achievedLevel >= requirement.minLevel,
        requiredLevel: requirement.minLevel,
        achievedLevel,
        gap: Math.max(0, requirement.minLevel - achievedLevel),
      });
    }

    if (requirement.minPercent !== undefined) {
      reasons.push({
        type: "subjectPercent",
        subjectCode: requirement.subjectCode,
        label: resolveSubjectLabel(requirement.subjectCode),
        met: mark.percentage >= requirement.minPercent,
        requiredPercent: requirement.minPercent,
        achievedPercent: mark.percentage,
        gap: Math.max(0, requirement.minPercent - mark.percentage),
      });
    }
  }

  return reasons;
}

function suggestNextStep(
  unmetReasons: MatchReason[],
  programme: Programme,
  catalog: Programme[] | undefined
): string {
  const subjectIssue = unmetReasons.find(
    (r) => r.type === "subjectWrongVariant" || r.type === "subjectLevel" || r.type === "subjectMissing"
  );

  if (subjectIssue) {
    const label =
      subjectIssue.type === "subjectWrongVariant"
        ? subjectIssue.requiredLabel
        : subjectIssue.type === "subjectMissing"
          ? subjectIssue.label
          : subjectIssue.label;
    return `Consider rewriting or upgrading ${label} through a supplementary/second-chance NSC exam -- this is the most direct route to meeting this specific requirement.`;
  }

  const lowerTierProgramme = catalog?.find(
    (p) =>
      p.institutionId === programme.institutionId &&
      p.facultyId === programme.facultyId &&
      p.id !== programme.id &&
      (p.qualificationType === "higherCertificate" || p.qualificationType === "diploma")
  );

  if (lowerTierProgramme) {
    return `"${lowerTierProgramme.name}" (${lowerTierProgramme.qualificationType}) is in the same faculty and may accept your current results, with a path to articulate up to this programme later.`;
  }

  return "Check this institution's extended/foundation programme options for this field, or consider a TVET college pathway while you work on the gap above.";
}

/**
 * Matches a learner's marks against one programme under one institution's
 * verified APS rule. Pure function, no I/O -- pass in whatever catalog of
 * other programmes you have (for the notYet-bucket pathway suggestion);
 * pass nothing and it degrades to a generic suggestion instead of
 * guessing at programmes it hasn't been shown.
 *
 * Deliberately does NOT gate on NSC pass type (Bachelor's/Diploma/Higher
 * Certificate) even though the brief's example copy ("You have a Diploma
 * pass, this needs a Bachelor's pass") implies it should. I don't have a
 * verified, sourced set of Umalusi pass-type thresholds -- config/aps-
 * scales.ts NSC_PASS_TYPES is descriptive text only, flagged
 * needsVerification, with no computable numeric criteria. Fabricating
 * thresholds here would mean this function could tell a learner they
 * don't qualify based on a made-up rule, which is exactly what CLAUDE.md
 * forbids. `passTypeEvaluated: false` on the result makes this omission
 * visible to callers rather than silent.
 */
export function matchProgramme(
  programme: Programme,
  apsRule: ApsRule,
  marks: SubjectMarkInput[],
  options?: { context?: ApplicantContext; catalog?: Programme[] }
): MatchResult {
  const apsResult = calculateAps(apsRule, marks, options?.context);
  const reasons: MatchReason[] = [];

  if (programme.minAps !== null) {
    const gap = Math.max(0, programme.minAps - apsResult.score);
    reasons.push({
      type: "aps",
      met: apsResult.score >= programme.minAps,
      required: programme.minAps,
      achieved: apsResult.score,
      gap,
    });
  }

  reasons.push(...buildSubjectReasons(programme, marks));

  const unmetReasons = reasons.filter((r) => !isReasonMet(r));

  let bucket: MatchBucket;
  if (unmetReasons.length === 0) {
    bucket = "qualify";
  } else if (unmetReasons.every((r) => isReasonWithinAlmostMargin(r, apsResult.maxScore))) {
    bucket = "almostQualify";
  } else {
    bucket = "notYet";
  }

  return {
    programmeId: programme.id,
    bucket,
    apsResult,
    reasons,
    unmetReasons,
    suggestedNextStep:
      bucket === "notYet" ? suggestNextStep(unmetReasons, programme, options?.catalog) : null,
    passTypeEvaluated: false,
  };
}

