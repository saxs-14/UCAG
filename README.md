# UCAG — University Course Application Guide

South African school-leavers enter their NSC subjects and marks and get, on one
screen: a correctly-calculated APS (per institution, not a generic number),
what they qualify for, what they almost qualify for and by exactly how much,
what they don't qualify for and the realistic alternative pathway, and
matched bursaries/internships — backed by a scheduled AI ingestion pipeline
with a human verification gate on anything a learner acts on.

**Status: Phase 6 (accounts, saved profiles, POPIA) complete, awaiting checkpoint.**
v1 (UMP-only, simulated backend) is archived at git tag
[`v1-archive`](../../releases/tag/v1-archive) and branch `archive/v1` —
nothing from it was carried forward; v2 is a from-scratch, national-capable
rebuild.

Owner: Phathutshedzo "Saxs" Mamagau — SaxsProjects.

## Read this first

- [`CLAUDE.md`](CLAUDE.md) — the live, condensed source of truth for how this
  repo is built: the non-negotiable rules, the stack, the workflow.
- [`docs/MASTER_PROMPT_v2.md`](docs/MASTER_PROMPT_v2.md) — the full governing
  brief this rebuild follows, phase by phase.

## The one rule that matters most

> **Unverified is displayed as unverified. Never as a fact.**

This is a fact-delivery product for a decision a learner only gets to make
once a year. A wrong closing date or a hallucinated APS rule costs someone a
year of their life. Every fact-bearing record carries `sourceUrl`,
`verifiedOn`, and `academicYear`; anything missing one of those three does
not render.

## Stack

Next.js 15 (App Router, TypeScript strict) · Tailwind CSS · Firestore ·
Firebase Auth · Vercel Cron · Zod · Recharts · Vitest/Playwright. Full
rationale in `docs/MASTER_PROMPT_v2.md` §3.

## Status

- **Phase 0** — v1 archived (`v1-archive` tag / `archive/v1` branch, pushed
  and verified), repo reset, first-response checkpoint delivered. Done.
- **Phase 1** — Next.js 15 + TypeScript strict + Tailwind scaffolded;
  Firestore data model defined (`lib/firestore/types.ts`) with the
  `sourceUrl`/`verifiedOn`/`academicYear` provenance guard enforced by
  `isFactVerified()`, not by convention; env var handling split into
  client-safe/server-only modules (`lib/env/`); Firebase client + Admin SDK
  wired (no live project connected yet — needs real Firebase credentials);
  starter Firestore security rules; Tier 1/2 institution seed data with
  verified URLs (`config/institutions.seed.ts`); NSC subject taxonomy and
  point-band config, both flagged `needsVerification` pending a DBE/Umalusi
  check; ingestion cadence config. Typecheck, lint, and tests green; dev
  server boots with no error. Done.
- **Phase 2** — `lib/aps/engine.ts`: pure TypeScript APS calculation
  (verified no Firebase/React imports, even transitively), one
  implementation covering all five `ApsFormulaType`s via
  `usesRawPercentage`/`bands` rather than five near-duplicate formulas;
  handles every `loPolicy` branch, best-N subject selection, a
  `mathLitPolicy` hook that's a documented no-op until a real verified
  penalty factor exists, and bonus rules gated on applicant context (so
  equity-bonus-style rules never silently fire on a guess). 41/41 tests
  passing, including every boundary mark the brief called for. Subject
  taxonomy extended with Mathematics options and a language subject-code
  scheme (`config/subjects.ts`). `components/subject-form/` — the full
  NSC subject-selection form (searchable/grouped elective picker, live
  NSC-level display) — mounted on the homepage as a working demo, not the
  final landing page. Done.
- **Phase 3** — `lib/matching/engine.ts`: pure TypeScript, buckets a
  learner into qualify/almostQualify/notYet against a programme's APS +
  subject requirements, itemising every reason (met and unmet), and
  suggesting a concrete next step when not yet qualifying. Deliberately
  does **not** gate on NSC pass type (Bachelor's/Diploma/Higher
  Certificate) despite the brief's example copy implying it should — no
  verified Umalusi thresholds exist yet, so `passTypeEvaluated: false` on
  every result makes that omission visible rather than fabricating
  numbers. `lib/applicationStatus.ts` decides the apply-vs-status-check
  CTA and is the one place that can never return an apply link for a
  closed window, even if `applyUrl` is set. The homepage is now the full
  calculator + live results flow (`components/CalculatorPage.tsx`),
  matched against explicitly-labelled **sample/fictional** programme data
  (`config/sampleData.ts`) since no real, verified programme catalogue
  exists yet (that's Phase 4). Share-by-link (`lib/shareLink.ts`) and
  PDF export (browser print-to-PDF) included. 65/65 tests passing.
  **Two real bugs found and fixed while live-testing in a browser** (not
  just from unit tests): (1) `getBaseUrl()` transitively required every
  `NEXT_PUBLIC_FIREBASE_*` var to exist just to read a base URL, 500ing
  the whole results page with no Firebase project connected — fixed by
  splitting client env validation so Firebase config is only validated
  lazily, on first actual use; (2) `SubjectForm` called its `onMarksChange`
  callback directly during render instead of in a `useEffect`, which
  React rejects and which was corrupting keystrokes in practice (typing
  "80" landed as "8"). Done.
- **Phase 4** — the AI ingestion pipeline, scoped honestly against two
  hard constraints: no real Firebase project and no LLM API key are
  configured for v2 yet, so nothing that needs either could be
  live-tested this phase. What's real:
  - `config/sources.seed.ts` — 20 sources (DHET, DBE, Umalusi, SAQA,
    NSFAS, Stats SA, CHE, and all 12 researched institution admissions
    pages), every URL confirmed live during Phase 0 research, each with
    `robotsAllowed` and honest `notes` caveats (e.g. UCT's AI-crawler
    robots.txt block flagged as a judgment call, not silently routed
    around; CPUT and SAQA flagged as never independently verified).
  - `lib/ingestion/` pure/testable stages: `robotsCheck` (parses and
    respects robots.txt), `budget` (token budget + kill switch,
    enforced, not just configured), `diff`, `route` (auto-publish vs
    verification-queue decision -- high-risk fields never auto-publish
    regardless of confidence), `bursarySafety` (the brief's scam
    auto-reject rules: upfront-payment keywords, no verifiable provider
    site, social-media-only sourcing).
  - `lib/ingestion/llm/` -- a provider-agnostic `LlmClient` interface
    plus a concrete Anthropic Messages API implementation, and
    `lib/ingestion/extract.ts` (rejects and logs schema-invalid output
    rather than coercing it). Unit-tested against a fake client -- the
    real HTTP path to Anthropic has never been called, since no
    `LLM_API_KEY` exists. One concrete Zod extraction schema
    (`applicationWindow`) built as the pattern to replicate for the
    other six ingestion tasks.
  - **The one thing genuinely run live, end to end, with real data**:
    `lib/ingestion/linkHealth.ts` + `lib/ingestion/pipeline.ts` +
    `app/api/cron/link-health/route.ts`, protected by `CRON_SECRET`
    (checks the real `Authorization: Bearer` header Vercel Cron sends,
    not a made-up convention). Actually executed against all 24 live
    Tier 1/2 institution URLs via `curl` against a running dev server --
    real results, zero Firestore writes (`dryRun: true` is the only
    implemented mode; `dryRun: false` fails fast with a clear "not
    implemented, no live Firestore" error rather than silently no-op-ing
    or crashing confusingly). Two separate live runs found 8-10 dead/
    blocked links out of 24 (mostly 403s and a few timeouts) --
    demonstrates the check works, and surfaces that retry/backoff logic
    (a brief-mandated guardrail) isn't built yet, since transient
    timeouts currently count as "dead."
  - `vercel.json` -- one real cron entry (link-health, every 6 hours;
    confirms the Phase 0 cost estimate's Vercel Pro requirement, since
    Hobby caps cron at once/day). No entries for the other six
    `CADENCE_RULES` tasks yet -- their route handlers don't exist.
  - **Found and fixed the same env-coupling bug pattern again, server-side
    this time**: `assertCronSecret` would have required real Firebase
    Admin credentials to exist just to check a cron secret, the same
    class of bug fixed client-side in Phase 3. Caught before it caused a
    live failure, not after.
  - Not built: real Firestore writes (`sources`, `ingestionRuns`,
    `verificationQueue` collections are typed but never written to),
    corroboration logic, the admin verification console (Phase 7), and
    pipelines for the other six cadence tasks (bursaries, internships,
    programme requirements, faculty/school structure, national
    statistics). These need a live Firebase project and, for anything
    beyond link-health, a real LLM key -- both genuine blockers, not
    scope I chose to skip.
- **Phase 5** — bursaries, internships, and a statistics dashboard, same
  honest-scoping discipline as Phase 4 (no real listings or extracted
  statistics exist yet -- only Phase 4's link-health task is actually
  live).
  - `/bursaries`: filters by field of study, level
    (matricOnly/currentlyEnrolled/completedQualification), and a
    first-class matric-only-internships toggle (not a buried checkbox,
    per the brief) -- live-verified in a browser: selecting "Engineering"
    correctly narrowed 3 bursaries to 2 and correctly emptied the
    internships section (neither sample internship is Engineering-
    tagged). Every card shows a deadline countdown, its real provider,
    and a source link. The brief-mandated "how to spot a bursary scam"
    explainer renders on the page, not hidden behind a link.
    `lib/ingestion/bursarySafety.ts` (Phase 4) is reused as a render-time
    gate too, not just an ingestion-time check -- a listing that somehow
    carries a risk flag never reaches the UI, defence in depth.
  - `/statistics`: two sections (Higher Education, Schools), 8 chart
    slots total. **7 of 8 correctly render "Data pending verification"**
    -- this is the honest, correct state, not a placeholder I forgot to
    fill in: extracting real numbers out of DHET/DBE's PDF-only
    publications is unbuilt Phase 4 ingestion work. The 8th
    (enrolments) is explicitly labelled `[Sample]`/fictional and
    proves the render-when-verified path actually works (real Recharts
    bar chart, source line, working CSV download) -- live-verified in a
    browser, all 8 slots checked individually.
  - **Real bug caught by a test, not a live check this time**: the
    deadline-countdown function used `Math.ceil(diffMs / dayMs)` on a
    raw millisecond difference, which bumped anything later *today* into
    "tomorrow" (e.g. checking at 00:00 against a 12:00 same-day
    deadline). Rewritten to compare calendar days (UTC midnight to UTC
    midnight) instead.
  - Added a minimal nav bar (Calculator/Bursaries/Statistics) to
    `app/layout.tsx` so the new routes are reachable at all -- flagged
    inline, not resolved: the brief requires the calculator's subject
    dropdowns to be visible with no scrolling for a learner arriving from
    a WhatsApp link (sect. 3), and a persistent nav row above the
    calculator was never checked against that requirement. Phase 8
    (design) should revisit whether it belongs there.
  - Field-of-study filtering on `/bursaries` is self-service (a dropdown
    the learner picks manually), not auto-derived from the calculator's
    qualify-bucket results on `/` -- carrying that state across routes
    needs Phase 6's saved-profile/shortlist persistence, which doesn't
    exist yet.
- **Phase 6** — accounts, saved profiles, POPIA. Different constraint than
  Phases 4/5: accounts genuinely need Firebase Auth to exist at all, so
  instead of building against sample data, this phase set up the
  **Firebase Local Emulator Suite** (`.firebaserc`, a `demo-ucag` project
  ID needing zero real credentials) and live-tested against it for real --
  the strongest verification of any phase so far.
  - `firestore.rules`: hardened `userProfiles` rules are the actual POPIA
    enforcement, not a UI convention -- a minor's profile write is
    **rejected by the real rules engine** unless it carries a
    guardian-consent record (`consentedBy: "guardian"`), regardless of
    what the client sends. `tests/firestore-rules.test.ts`: 19 tests run
    against the live emulator (not mocked). Sanity-checked the tests
    themselves are real, not vacuous: deliberately broke the consent rule,
    confirmed exactly the 2 dependent tests failed and nothing else,
    restored it, confirmed all 19 pass again.
  - `tests/auth-integration.test.ts`: 6 more tests against the real Auth
    emulator -- real account creation, real sign-in (and real wrong-
    password rejection), real account deletion (both the Firestore
    profile AND the actual Firebase Auth user, confirmed by trying to
    sign in again afterward and having it fail).
  - `components/auth/`: age gate → guardian-consent capture (name, email,
    confirmation checkbox) → email/Google sign-up, and a separate sign-in
    form. The age gate isn't just UX -- even if it had a bug, the rules
    above would still reject an unconsented minor profile.
  - `/account`: signed-in dashboard with saved marks, shortlist, **working
    download-my-data** (exports exactly what's stored, nothing more --
    data minimisation means there's nothing else to export) and
    **working delete-my-account** (deletes the Firestore profile and the
    real Auth account, not a stub), both live-verified against the
    emulator.
  - `/privacy`: a privacy notice written in plain language for a
    teenager, not a lawyer -- covers what's collected and why, the
    under-18 guardian-consent requirement, and how to exercise the
    download/delete rights.
  - Saved marks (`SaveMarksButton`) and shortlist (toggle on each
    `ResultCard`) are wired into the actual calculator/results flow for
    signed-in users -- both write via partial `updateDoc` calls, a
    pattern separately confirmed against the real rules (2 more tests:
    a user can update just their own shortlist, and cannot touch anyone
    else's). **Not built**: reloading saved marks back into the subject-
    selection form's dropdowns on a later visit -- that needs
    reconstructing granular UI state (which language/Math option/electives
    were picked) from raw subject codes, a distinct feature this phase
    didn't reach; saved marks are visible on `/account` but not yet
    auto-restored into the calculator.
  - **Real infrastructure incident mid-phase**: the machine ran out of
    memory (ESLint OOM'd) from ~30 stray `node`/`java` processes
    accumulated across this session's many `next dev`/emulator restarts --
    `TaskStop` doesn't reliably kill Turbopack's full process tree on
    Windows. Diagnosed via `Get-Process`, force-killed everything, confirmed
    it was a resource issue (not a code bug) by re-running the exact same
    lint/test commands clean immediately after.
  - **chrome-devtools MCP disconnected** partway through this phase (tied
    to a browser process killed during the cleanup above) and did not
    reconnect for the rest of the session -- the auth UI's actual React
    rendering/interaction was **not** browser-verified this phase, unlike
    every previous phase. What substitutes: the emulator integration tests
    above verify the real Auth/Firestore behavior every UI action depends
    on, and an HTTP-level check confirmed `/account` and `/privacy` render
    without a server error. The gap: nobody has watched the age-gate →
    guardian-consent → sign-up flow actually click through in a browser.
- **Firebase**: no real cloud project exists for v2 yet, but the app **is**
  genuinely tested against a real Firebase backend now -- the local
  emulator suite (see "Local development" in `CLAUDE.md`). Deploying to a
  real project is still just a matter of filling in `.env.example`'s
  `NEXT_PUBLIC_FIREBASE_*` values and setting
  `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false`.
