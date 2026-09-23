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

/**
 * Fields that the generic admin fact editor and verification queue may
 * change. Provenance/control fields are intentionally excluded: the route
 * stamps sourceUrl/verifiedOn/academicYear (or year for statistics)
 * server-side so an operator cannot forge verification metadata.
 */
const EDITABLE_FACT_FIELDS: Record<EditableFactCollection, readonly string[]> = {
  institutions: [
    "name","shortName","type","province","tier","campuses","websiteUrl",
    "applicationPortalUrl","appliesThroughThirdParty","statusCheckUrl","nbtRequired","logoUrl",
  ],
  faculties: ["institutionId","name","code"],
  schools: ["facultyId","name","code"],
  programmes: [
    "institutionId","facultyId","schoolId","name","qualificationType","nqfLevel",
    "saqaId","duration","campuses","modeOfDelivery","minAps","subjectRequirements",
    "additionalRequirements","careerOutcomes","applyUrl","fieldTags",
  ],
  apsRules: [
    "institutionId","scaleName","formulaType","bands","usesRawPercentage","loPolicy",
    "loCap","bestNSubjects","excludedSubjects","mathLitPolicy","mathLitPenaltyFactor",
    "nbtPolicy","bonusRules","maxScore","notes",
  ],
  applicationWindows: [
    "institutionId","programmeId","opensOn","closesOn","lateClosesOn","status",
  ],
  subjects: [
    "code","name","category","isDesignated","isCompulsory","languageType","groupLabel",
  ],
  bursaries: [
    "name","provider","fieldsOfStudy","levelRequired","opensOn","closesOn","value",
    "criteria","applyUrl","riskFlags",
  ],
  internships: [
    "title","provider","fieldsOfStudy","minQualification","matricOnly","province",
    "opensOn","closesOn","applyUrl",
  ],
  statistics: [
    "dataset","dimension","metric","value","unit",
  ],
};

const PROTECTED_FACT_FIELDS = new Set([
  "id",
  "sourceUrl",
  "verifiedOn",
  "academicYear",
  "year",
  "publisher",
]);

export function isEditableFactField(
  collection: string,
  field: string,
): boolean {
  return isEditableFactCollection(collection)
    && !PROTECTED_FACT_FIELDS.has(field)
    && EDITABLE_FACT_FIELDS[collection].includes(field);
}

export function getEditableFactFields(collection: EditableFactCollection): readonly string[] {
  return EDITABLE_FACT_FIELDS[collection];
}
