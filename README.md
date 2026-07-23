# UCAG — University Course Application Guide

South African school-leavers enter their NSC subjects and marks and get, on one
screen: a correctly-calculated APS (per institution, not a generic number),
what they qualify for, what they almost qualify for and by exactly how much,
what they don't qualify for and the realistic alternative pathway, and
matched bursaries/internships — backed by a scheduled AI ingestion pipeline
with a human verification gate on anything a learner acts on.

**Status: Phase 4 (AI ingestion pipeline -- partial) complete, awaiting checkpoint.**
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
- **Not yet connected**: no real Firebase project exists for v2 yet — see
  `.env.example`. The app runs, but nothing that touches Firebase (auth,
  Firestore reads) will work until real credentials are added.
