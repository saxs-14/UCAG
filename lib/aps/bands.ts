import type { PointBand } from "@/lib/firestore/types";

/**
 * Maps a raw NSC percentage to a point-band value. Bands are inclusive on
 * both ends (minPercent-maxPercent); if a percentage doesn't fall in any
 * band, that's a config error worth surfacing loudly rather than silently
 * defaulting to 0 -- a wrong APS is a production incident, not a nit
 * (docs/MASTER_PROMPT_v2.md sect. 2.3).
 */
export function percentageToPoints(percentage: number, bands: PointBand[]): number {
  const band = bands.find(
    (b) => percentage >= b.minPercent && percentage <= b.maxPercent
  );
  if (!band) {
    throw new Error(
      `No point band covers ${percentage}% -- check this institution's apsRules.bands for gaps.`
    );
  }
  return band.points;
}
