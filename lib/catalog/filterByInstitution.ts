import type { Programme } from "@/lib/firestore/types";

/**
 * A learner who picks one specific institution in the calculator's
 * "Preferred Institution Rule" selector should see only that institution's
 * programmes -- "all" is the only value that means "show everything".
 */
export function filterProgrammesByInstitution<T extends Pick<Programme, "institutionId">>(
  programmes: T[],
  institutionFilter: string
): T[] {
  return institutionFilter === "all"
    ? programmes
    : programmes.filter((p) => p.institutionId === institutionFilter);
}
