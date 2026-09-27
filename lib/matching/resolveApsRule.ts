import type { ApsRule } from "@/lib/firestore/types";

/**
 * Resolves the correct ApsRule for a given institution + faculty, now
 * that an institution can have more than one rule (see ApsRule.facultyId
 * in lib/firestore/types.ts): a faculty-specific override (e.g.
 * Stellenbosch's Engineering/Science/Law each layering a weighted
 * formula on top of the general aggregate gate) wins over the
 * institution-wide default (facultyId: null). Returns undefined only
 * when neither exists -- the same honest "formula not yet verified"
 * fallback every call site already handles (renders an
 * UnscoredProgrammeCard instead of a faked score).
 *
 * Single shared implementation for every place that used to do its own
 * institutionId-only lookup (ResultsSection, ApsImprovementSimulator) --
 * those all silently picked whichever rule for that institution happened
 * to be first/last in the array once an institution could have more than
 * one, which would have been a real, silent correctness bug.
 */
export function resolveApsRule(
  apsRules: ApsRule[],
  institutionId: string,
  facultyId: string
): ApsRule | undefined {
  const facultySpecific = apsRules.find(
    (r) => r.institutionId === institutionId && r.facultyId === facultyId
  );
  if (facultySpecific) return facultySpecific;

  return apsRules.find((r) => r.institutionId === institutionId && r.facultyId === null);
}
