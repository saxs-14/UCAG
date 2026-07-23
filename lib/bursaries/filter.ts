import { isPastClosingDate, isSafeToPublish } from "@/lib/ingestion/bursarySafety";
import type { Bursary, BursaryLevelRequired, Internship } from "@/lib/firestore/types";

/**
 * Pure filtering logic for the bursaries/internships page. Safety checks
 * run here too, not just at ingestion time -- defence in depth: a
 * listing that somehow got a risk flag after publish (e.g. a provider
 * site later found to be fake) must never render, and this is the last
 * gate before the UI sees it.
 */

export interface BursaryFilterOptions {
  fieldsOfStudy: string[];
  levelFilter: BursaryLevelRequired | "all";
  now: Date;
}

export function filterBursaries(bursaries: Bursary[], options: BursaryFilterOptions): Bursary[] {
  return bursaries.filter((b) => {
    if (!isSafeToPublish(b.riskFlags)) return false;
    if (isPastClosingDate(b.closesOn, options.now)) return false;
    if (options.levelFilter !== "all" && b.levelRequired !== options.levelFilter) return false;
    if (
      options.fieldsOfStudy.length > 0 &&
      !b.fieldsOfStudy.some((f) => options.fieldsOfStudy.includes(f))
    ) {
      return false;
    }
    return true;
  });
}

export interface InternshipFilterOptions {
  fieldsOfStudy: string[];
  /** The brief calls this out as a first-class filter, not a buried
   * checkbox -- "all" | true (matric-only) | false (post-qualification). */
  matricOnly: boolean | "all";
  now: Date;
}

export function filterInternships(
  internships: Internship[],
  options: InternshipFilterOptions
): Internship[] {
  return internships.filter((i) => {
    if (isPastClosingDate(i.closesOn, options.now)) return false;
    if (options.matricOnly !== "all" && i.matricOnly !== options.matricOnly) return false;
    if (
      options.fieldsOfStudy.length > 0 &&
      !i.fieldsOfStudy.some((f) => options.fieldsOfStudy.includes(f))
    ) {
      return false;
    }
    return true;
  });
}
