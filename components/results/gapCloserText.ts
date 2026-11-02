import type { MatchReason } from "@/lib/matching/types";

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