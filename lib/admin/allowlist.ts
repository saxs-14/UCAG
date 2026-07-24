/**
 * Collections the admin console's verification-queue approve/edit action
 * and content editor are allowed to touch. Deliberately excludes
 * userProfiles (owner-only, see firestore.rules), and sources/
 * ingestionRuns/verificationQueue/linkHealthChecks (internal pipeline
 * bookkeeping, edited through their own dedicated routes, not the generic
 * fact editor). Both admin write paths check against this list so a
 * malformed or (if the ingestion pipeline is ever compromised) malicious
 * queue item can't be approved into an arbitrary collection.
 */

export const EDITABLE_FACT_COLLECTIONS = [
  "institutions",
  "faculties",
  "schools",
  "programmes",
  "apsRules",
  "applicationWindows",
  "subjects",
  "bursaries",
  "internships",
  "statistics",
] as const;

export type EditableFactCollection = (typeof EDITABLE_FACT_COLLECTIONS)[number];

export function isEditableFactCollection(value: string): value is EditableFactCollection {
  return (EDITABLE_FACT_COLLECTIONS as readonly string[]).includes(value);
}
