import type { UserProfile } from "@/lib/firestore/types";

/** POPIA data portability -- "a working download my data flow, not a
 * stub" (docs/MASTER_PROMPT_v2.md Phase 6). Exports exactly what's
 * stored (data minimisation means there's nothing else to export --
 * marks, shortlist, consent record, timestamps, no ID numbers or
 * addresses because none are ever collected). */
export function profileToExportJson(profile: UserProfile): string {
  return JSON.stringify(profile, null, 2);
}
