<!-- cSpell:words UCAG Firestore Mpumalanga firestore -->
# Database & Data Model Architecture

**Rewritten 15 October 2026** against the real code in `lib/firestore/types.ts`,
`lib/firebase/`, and `firestore.rules`, after the previous version of this
document was found to describe a different, non-existent product ("StudyMate"
profiles, quiz attempts, mock exam results — none of which exist anywhere in
this codebase; see `docs/RUBRIC_COMPLIANCE_MATRIX.md` for the full
documentation-trust finding). Every claim below was checked against the
actual source file named next to it, not carried over from the old version.

---

## 1. Technology

**Cloud Firestore** (Google Cloud project `ucag-11adc`) is the single
authoritative data store. There is no second/local database — `localStorage`
is used only for a handful of genuinely ephemeral, non-authoritative UI
conveniences (e.g. `lib/useApplicationChecklist.ts`'s anonymous-visitor
fallback before sign-in), never as a parallel source of truth.

Two separate SDKs are used, deliberately kept apart:

| SDK | Package | Where it runs | Purpose |
|---|---|---|---|
| Firebase **client** SDK | `firebase` (`^12.16.0`) | Browser | Auth state, reading verified public catalogue data, a signed-in learner's own profile |
| Firebase **Admin** SDK | `firebase-admin` (`^14.2.0`) | Server only (`import "server-only"` enforced) | Every privileged write — ingestion, admin console, cron jobs |

## 2. Client vs. server access — file-level split

- **`lib/firebase/client.ts`** — Auth only. Lazy-initialized (`getFirebaseApp()`/`getFirebaseAuth()` do nothing until first called), because eagerly initializing on import would crash any page that merely imports the module before real credentials exist. Uses `initializeAuth()` rather than `getAuth()` specifically to avoid eagerly loading Google's popup-redirect helper script on routes with no sign-in UI (a real Lighthouse Best Practices fix, not a style choice).
- **`lib/firebase/firestoreClient.ts`** — Firestore client access, split into its *own* module from `client.ts` on purpose: Firestore's SDK (especially its offline persistence layer) is the single heaviest piece of the Firebase client bundle, and `AuthProvider` (mounted on every route via the root layout) only needs `client.ts`. Importing Firestore here means only routes that actually touch Firestore pay its bundle cost. This split already fixed one real ~170KB bundle-size bug once (documented in `README.md`'s Phase 8 section).
- **`lib/firebase/admin.ts`** — Admin SDK. `getAdminAuth()` dynamically `import()`s `firebase-admin/auth` rather than a static import, because that module transitively pulls in `jose`, whose ESM entry point crashes Vercel's serverless bundle (`ERR_REQUIRE_ESM`) if loaded eagerly — including on pages that only ever call `getAdminDb()` and never touch auth.

## 3. Configuration — where it's loaded from, and where the project identifier lives

All configuration is environment-variable-driven and validated through Zod schemas in `lib/env/` — nothing is hardcoded into a UI component.

**Client-safe variables** (`lib/env/client.ts`, validated via `getFirebaseClientConfig()`):
`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`.

A Firebase **Web API key** (the `NEXT_PUBLIC_FIREBASE_API_KEY` value) is not a secret — it identifies the project to Firebase's client SDK and is expected to be visible in the browser bundle; real access control comes entirely from Firestore security rules (§6), never from hiding this key.

**Server-only variables** (`lib/env/server.ts`, never reaches the browser):
`FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` (a real service-account credential — this one genuinely is a secret, must never be logged or committed, and is the actual, current blocker on seeding production data — see `docs/PROJECT_HANDOVER_2026-10.md` §5).

**Production project identifier**: `ucag-11adc`, set via `NEXT_PUBLIC_FIREBASE_PROJECT_ID` / `FIREBASE_ADMIN_PROJECT_ID`. Confirmed directly from the deployed production bundle, not assumed.

## 4. Local emulator vs. production

A single flag, `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`, switches every Firebase touchpoint (client Auth, client Firestore, and every `scripts/seed-*.mts` script) to the local Firebase Emulator Suite, using the `demo-ucag` project ID (`.firebaserc`) — a Firebase convention that requires **zero real credentials**:

```bash
firebase emulators:start --only firestore,auth --project demo-ucag
```

When that flag is unset/false, the exact same code paths connect to the real `ucag-11adc` project using the real credentials in §3. This is the *only* branch point between local and production — there is no separate "staging" data layer, and no code path silently decides which environment to use other than this one flag.

**A genuine current gap** (see `docs/RUBRIC_COMPLIANCE_MATRIX.md` Category B): production Firestore's `institutions` collection is seeded, but the `programmes` and `bursaries` collections are not — 8 of 9 institutions' real programme data and nearly all real bursaries exist only in `config/*.seed.ts` source files and have never actually been written via their `npm run seed:*-data` scripts against production. This is an operational gap (nobody has run the scripts with real credentials yet), not a code or schema defect.

## 5. How authentication affects data access

- **Anonymous visitors** can read every `isFactVerified()`-passing public document (institutions, programmes, APS rules, application windows, bursaries, internships, statistics) and use the calculator with zero sign-in.
- **Signed-in learners** additionally get a `userProfiles/{uid}` document (their own only — see §6), containing saved marks, shortlist, and checklist progress.
- **Admins** carry a `role: "admin"` **Firebase Auth custom claim** — never a Firestore field a client could set on itself. Granted only via a trusted-operator script (`npm run admin:grant -- <email>`, `scripts/set-admin-claim.mjs`); there is deliberately no self-service admin invite flow. Every admin API route independently re-verifies this claim server-side against a real Firebase ID token (`lib/admin/auth.ts`'s `requireAdmin`) — the client-side layout gate is a UX nicety on top of that, not the actual enforcement.

## 6. How writes are validated

Every public Firestore collection denies client writes outright in `firestore.rules` (`allow write: if false` — confirmed present on all 14 public-collection rule blocks this session). **All writes go through server-side Admin-SDK-backed API routes** (`app/api/admin/*`), each independently checking the admin custom claim before touching Firestore. There is no code path where a browser writes directly to a fact-bearing collection.

Within those API routes and the ingestion pipeline:
- Every AI-extracted value is validated against a Zod schema (`lib/ingestion/schemas/`) before it's even allowed into the verification queue — malformed model output is rejected and logged, never coerced into something that merely looks valid.
- A fact only reaches a public page once it independently satisfies `isFactVerified()` (`sourceUrl`, `verifiedOn`, `academicYear` all present) — this is checked at the data-fetch layer (`lib/catalog/getRealCatalog.ts` and siblings), not left to each component to remember.
- Nothing from the AI ingestion pipeline is ever auto-published; every extraction lands in `verificationQueue` for a human admin decision.

## 7. How errors are handled

The established pattern (confirmed, and once found *missing* and fixed as a real bug this session — the `/bursaries` 500 crash) is: every data-fetch function wraps its Firestore call in try/catch and degrades to an honest empty state (`{ institutions: [], programmes: [] }` etc.) rather than crashing the page or fabricating data. A genuinely empty result (verified-but-no-matches) and a failed query are kept visually distinct in the UI copy — "no verified programmes match yet" vs. a dedicated error state — so a connection failure is never mistaken for "we checked and there's nothing."

`AuthProvider` (mounted on every route) catches Firebase initialization failure and sets an `authUnavailable` flag rather than throwing — this exact scenario (no real Firebase credentials configured) was deliberately dress-rehearsed locally before the first production deploy (README Phase 9).

## 8. How data integrity is preserved

- **Provenance is structurally required**, not optional: every fact-bearing interface in `lib/firestore/types.ts` extends `FactProvenance` (`sourceUrl`, `verifiedOn`, `academicYear`), and `isFactVerified()` is the single shared guard every render path must pass.
- **Duplicate-write protection**: `VerificationQueueItem.proposalKey` is a deterministic identity so repeated ingestion runs can't create duplicate pending reviews for the same source/value change.
- **Faculty-specific APS rule resolution is explicit, not ambiguous**: `lib/matching/resolveApsRule.ts` defines a clear precedence (institution+faculty match wins over institution-wide default) rather than leaving multiple matching `ApsRule` documents to an undefined "first one found" behavior.
- **`linkHealthChecks` upserts per URL** rather than appending an ever-growing history, so a report always reflects current status.

## 9. Full collection reference

All interfaces below are the real, current shape in `lib/firestore/types.ts` — field-for-field, not paraphrased.

| Collection | Key fields | Provenance |
|---|---|---|
| `institutions` | `id`, `name`, `shortName`, `type`, `province`, `tier` (1-3), `campuses[]`, `websiteUrl`, `applicationPortalUrl`, `statusCheckUrl`, `nbtRequired` | `FactProvenance` |
| `faculties` | `id`, `institutionId`, `name`, `code` | `FactProvenance` |
| `schools` | `id`, `facultyId`, `name`, `code` | `FactProvenance` |
| `programmes` | `id`, `institutionId`, `facultyId`, `schoolId`, `name`, `qualificationType`, `nqfLevel`, `duration`, `minAps`, `subjectRequirements[]` (`subjectCode`/`minLevel`/`minPercent`), `additionalRequirements[]`, `applyUrl`, `fieldTags[]` | `FactProvenance` |
| `apsRules` | `id`, `institutionId`, `facultyId` (nullable — see §9 resolution order above), `formulaType`, `bands[]`, `loPolicy`, `bestNSubjects`, `forcedSubjects[]`, `extraCountedSubjects[]`, `divisor?`, `bonusRules[]`, `maxScore?` | `FactProvenance` |
| `applicationWindows` | `id`, `institutionId`, `programmeId` (nullable), `opensOn`, `closesOn`, `lateClosesOn`, `status` | `FactProvenance` |
| `bursaries` | `id`, `name`, `provider`, `fieldsOfStudy[]`, `levelRequired`, `opensOn`, `closesOn`, `value`, `applyUrl`, `riskFlags[]` (scam-pattern auto-flags) | `FactProvenance` |
| `internships` | `id`, `title`, `provider`, `fieldsOfStudy[]`, `matricOnly`, `applyUrl` | `FactProvenance` |
| `statistics` | `id`, `dataset`, `dimension`, `metric`, `value`, `unit` | `StatProvenance` (uses `publisher`+`year`, not `academicYear` — a historical dataset year and a forward-looking application cycle are different concepts) |
| `sources` | `id`, `url`, `publisher`, `type`, `institutionId` (nullable), `robotsAllowed`, `fetchIntervalHours`, `reliabilityScore`, `enabled` | — (pipeline-internal) |
| `ingestionRuns` | `id`, `startedAt`, `finishedAt`, `status`, `sourceIds[]`, `tokensUsed`, `costEstimate`, `itemsProposed`/`itemsAutoPublished`/`itemsQueued`, `errors[]` | — (pipeline-internal) |
| `verificationQueue` | `id`, `proposalKey`, `collection`, `docId`, `field`, `currentValue`, `proposedValue`, `confidence`, `status` | — (pipeline-internal) |
| `linkHealthChecks` | `id`, `url`, `alive`, `statusCode`, `error`, `checkedAt` | — (pipeline-internal) |
| `usageStats` | `date` (doc ID, `YYYY-MM-DD`), `calculatorCompletions?`, `programmeSearches?`, `fundingDiscoveryViews?` (each a running count, field absent until first incremented that day) | — (aggregate-only analytics, see §10) |
| `userProfiles` | `uid`, `role?`, `institutionId?`, `marks[]` (`subjectCode`/`percentage`), `shortlist[]`, `checklistProgress[]?`, `consentRecord` (`consentedBy: "self"\|"guardian"`), `isMinor`, `guardianConsentAt` | per-user-owned, not a fact-bearing public collection |

## 10. Learner-activity reporting (`usageStats`)

Added to close a confirmed rubric gap (Category E: "Generate useful
reports to support business case" named activity logs/analytics
explicitly; a codebase-wide search had found zero matches for
`analytics`/`trackEvent`/`activityLog` anywhere). The design is
deliberately the narrowest thing that satisfies it:

- **One document per calendar day**, holding nothing but running integer
  counts (`calculatorCompletions`, `programmeSearches`,
  `fundingDiscoveryViews`) — not an event log, not a session tracker, no
  per-user or per-session identifier anywhere in the schema. This is
  POPIA data-minimisation by construction, not an access rule layered on
  top of identifiable data.
- **Written only via the Admin SDK** (`lib/activity/trackUsage.ts`'s
  `incrementUsageStat`, an atomic `FieldValue.increment` behind a
  `{ merge: true }` set) — `firestore.rules`' `usageStats` match block
  denies all client writes, same shape as `ingestionRuns`/
  `verificationQueue`. The field list itself lives in a separate,
  non-`server-only` module (`lib/activity/usageStatFields.ts`) so the
  admin report page — a Client Component — can import just the field
  names/types without pulling the Admin SDK into the browser bundle.
- **Two of the three events are recorded server-side directly**, with no
  public endpoint involved at all: `app/programmes/page.tsx` and
  `app/bursaries/page.tsx` are both Server Components already fetching
  real data per-request, so they call `incrementUsageStat` directly,
  scheduled via Next.js's `after()` so the write runs post-response
  without risking being killed mid-write when the serverless function
  freezes. The third (`calculator_completed`) has no server round-trip to
  hook into — the calculator is fully client-side by design (no account
  needed) — so it goes through a small public, rate-limited endpoint
  (`app/api/activity/track/route.ts`), Zod-validated against exactly
  three literal event names, nothing free-form.
- **Read by admins only**, at `/admin/activity` — a realtime `onSnapshot`
  table in the same style as `/admin/runs`, showing per-day rows and
  all-time totals.

Admin-only read access to `sources`/`ingestionRuns`/`verificationQueue`/`linkHealthChecks` is enforced in `firestore.rules` via an `isAdmin()` helper that checks the custom claim — write access stays `if false` for every role, including admins; all writes genuinely go through the Admin SDK behind the API routes in §6.
