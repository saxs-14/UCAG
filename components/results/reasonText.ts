import type { MatchReason } from "@/lib/matching/types";

/**
 * Turns a MatchReason into the exact, numbered copy the brief calls for
 * (docs/MASTER_PROMPT_v2.md sect. 3: "Never a vague 'you nearly made it'.
 * Always the number, the subject, and the shortfall."). Kept separate
 * from lib/matching/engine.ts (data/logic) since this is presentation
 * copy, but it's still pure and independently testable.
 */
export function reasonText(reason: MatchReason): string {
  switch (reason.type) {
    case "aps":
      return reason.met
        ? `APS: ${reason.achieved} (meets the required ${reason.required})`
        : `You have ${reason.achieved} APS. This programme needs ${reason.required}. You are ${reason.gap} point${reason.gap === 1 ? "" : "s"} short.`;
    case "subjectMissing":
      return `This programme requires ${reason.label}, which isn't in your subjects yet.`;
    case "subjectWrongVariant":
      return `This programme requires ${reason.requiredLabel}. You have ${reason.achievedLabel}.`;
    case "subjectLevel":
      return reason.met
        ? `${reason.label}: level ${reason.achievedLevel} (meets the required level ${reason.requiredLevel})`
        : `This programme requires ${reason.label} at level ${reason.requiredLevel}. You have level ${reason.achievedLevel}.`;
    case "subjectPercent":
      return reason.met
        ? `${reason.label}: ${reason.achievedPercent}% (meets the required ${reason.requiredPercent}%)`
        : `This programme requires ${reason.label} at ${reason.requiredPercent}%. You have ${reason.achievedPercent}%.`;
  }
}
