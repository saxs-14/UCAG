/**
 * Thresholds that decide "almost qualify" vs "not yet". The brief
 * (docs/MASTER_PROMPT_v2.md sect. 3) specifies the three buckets and says
 * "almost qualify" must fail on "a small, nameable margin" but doesn't
 * give exact numbers -- these are my judgment call, config over hardcode
 * so they're easy to revisit rather than buried in matching logic.
 */

/** APS gap counts as "almost" when it's within this fraction of the
 * formula's maxScore (e.g. 10% of a 42-point scale ~= 4 points; 10% of a
 * 600-point scale = 60). Falls back to ALMOST_QUALIFY_APS_GAP_FALLBACK
 * when the rule has no maxScore on record. */
export const ALMOST_QUALIFY_APS_GAP_RATIO = 0.1;
export const ALMOST_QUALIFY_APS_GAP_FALLBACK = 3;

/** A subject-level shortfall of this many NSC levels or fewer counts as "almost". */
export const ALMOST_QUALIFY_SUBJECT_LEVEL_GAP_MAX = 1;

/** A subject-percentage shortfall of this many points or fewer counts as "almost". */
export const ALMOST_QUALIFY_SUBJECT_PERCENT_GAP_MAX = 10;
