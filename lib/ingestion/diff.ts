import type { DiffOutcome } from "./types";

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, canonicalize(entry)])
    );
  }
  return value;
}

/**
 * Compares the plain JSON-like values used by ingestion. Object keys are
 * sorted recursively so semantically identical objects do not appear
 * changed merely because a source/extractor returned keys in a different
 * order. Array order remains meaningful because some catalogue fields are
 * ordered lists.
 */
export function diffValue<T>(currentValue: T | undefined, proposedValue: T): DiffOutcome<T> {
  const changed =
    JSON.stringify(canonicalize(currentValue)) !== JSON.stringify(canonicalize(proposedValue));
  return { changed, currentValue, proposedValue };
}
