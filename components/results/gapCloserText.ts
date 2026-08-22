import type { MatchReason } from "@/lib/matching/types";

/**
 * Turns an unmet MatchReason into a specific "how to close it" sentence,
 * for the gap-closer panel on Almost-Qualify cards. Sibling to
 * reasonText.ts (which states the shortfall) -- this states the action.
 * Every number here comes directly off the MatchReason the matching
 * engine already computed; this file adds no new calculation, only
 * phrasing. Returns null when a reason doesn't carry a specific
 * actionable target (met reasons, or shapes with no numeric gap) rather
 * than inventing one.
 */
export function gapCloserText(reason: MatchReason): string | null {
  switch (reason.type) {
    case "aps":
      if (reason.met) return null;
      return `Raise your total APS by ${reason.gap} point${reason.gap === 1 ? "" : "s"} across any of your subjects to close this gap.`;
    case "subjectPercent":
      if (reason.met) return null;
      return `Raise ${reason.label} from ${reason.achievedPercent}% to ${reason.requiredPercent}% to meet this requirement.`;
    case "subjectLevel":
      if (reason.met) return null;
      return `Raise ${reason.label} from level ${reason.achievedLevel} to level ${reason.requiredLevel} to meet this requirement.`;
    case "subjectMissing":
      return `Add ${reason.label} as one of your subjects to meet this requirement.`;
    case "subjectWrongVariant":
      return `This requires ${reason.requiredLabel} specifically -- ${reason.achievedLabel} doesn't count toward it.`;
  }
}
