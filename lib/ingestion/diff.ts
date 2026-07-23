import type { DiffOutcome } from "./types";

/**
 * "No change, no proposal" (docs/MASTER_PROMPT_v2.md Phase 4 pipeline
 * stage 4). Deep-equality via JSON serialization is sufficient for the
 * plain-data fields this pipeline diffs (dates, strings, numbers, small
 * arrays) -- no need for a deep-equal library dependency for that.
 */
export function diffValue<T>(currentValue: T | undefined, proposedValue: T): DiffOutcome<T> {
  const changed = JSON.stringify(currentValue) !== JSON.stringify(proposedValue);
  return { changed, currentValue, proposedValue };
}
