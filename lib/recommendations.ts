import type { FieldTag, Programme } from "@/lib/firestore/types";
import type { MatchBucket, MatchResult } from "@/lib/matching/types";

export interface RecommendationEntry {
  programme: Programme;
  matchResult: MatchResult;
  /** How many of the learner's interest tags this programme shares. */
  overlapScore: number;
}

const BUCKET_PRIORITY: Record<MatchBucket, number> = { qualify: 0, almostQualify: 1, notYet: 2 };

/**
 * Pure, same discipline as lib/aps and lib/matching. Ranks programmes the
 * learner already qualifies or almost-qualifies for by how well they
 * overlap the learner's interest-quiz answers -- it re-ranks real
 * eligibility (lib/matching/engine's own output), it never invents
 * eligibility. A "notYet" programme is never surfaced as a recommendation
 * here, no matter how well its tags match -- that would misrepresent
 * something the learner doesn't currently qualify for as an actionable
 * suggestion.
 */
export function recommendProgrammes(
  entries: { programme: Programme; matchResult: MatchResult }[],
  interestTags: FieldTag[]
): RecommendationEntry[] {
  const tagSet = new Set(interestTags);

  return entries
    .filter(
      (e) => e.matchResult.bucket === "qualify" || e.matchResult.bucket === "almostQualify"
    )
    .map((e) => ({
      ...e,
      overlapScore: e.programme.fieldTags.filter((t) => tagSet.has(t)).length,
    }))
    .sort((a, b) => {
      if (b.overlapScore !== a.overlapScore) return b.overlapScore - a.overlapScore;
      return BUCKET_PRIORITY[a.matchResult.bucket] - BUCKET_PRIORITY[b.matchResult.bucket];
    });
}
