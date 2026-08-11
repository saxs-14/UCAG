<!-- cSpell:words UCAG Firestore Mpumalanga bict edbs firestore -->
# Database & Data Model Architecture

UCAG utilizes a dual data model:
1. **Cloud Firestore**: Server-isolated authoritative data for institutions, faculties, programmes, APS rules, application windows, and registered user profiles.
2. **Client `localStorage`**: Anonymous-first storage for APS calculator drafts, StudyMate profiles, materials, quiz attempts, and mock exam results.

---

## Firestore Collections Schema

### `institutions/{institutionId}`
- `id`: string (e.g. `"ump"`)
- `name`: string ("University of Mpumalanga")
- `type`: InstitutionType ("comprehensiveUniversity")
- `tier`: 1 | 2 | 3
- `sourceUrl`, `verifiedOn`, `academicYear`: FactProvenance metadata

### `programmes/{programmeId}`
- `id`: string (e.g. `"ump-bict"`)
- `institutionId`: string ("ump")
- `facultyId`: string ("ump-faculty-edbs")
- `name`: string ("Bachelor of Information and Communication Technology")
- `minAps`: number (26)
- `rules`: ProgrammeRequirementRule[]
- `sourceUrl`, `verifiedOn`, `academicYear`: FactProvenance metadata

### `userProfiles/{uid}`
- `id`: string
- `displayName`: string
- `email`: string
- `nscSubjects`: SavedSubject[]
- `guardianConsentAttached`: boolean

---

## Provenance Enforcement

All Firestore read operations on factual collections are gated at runtime by `isFactVerified()` in `lib/firestore/types.ts`:
```ts
if (!isFactVerified(doc)) {
  // Mark as unverified in UI; never claim unverified data as fact.
}
```
