# CLAUDE.md — UCAG v2

> UCAG (University Course Application Guide) — South Africa. Owner: Phathutshedzo
> "Saxs" Mamagau / SaxsProjects. This file is the source of truth for how this
> repository is built. Read it before touching code.

## The rule that overrides everything else

**Unverified is displayed as unverified. Never as a fact.**

This product tells school-leavers what they qualify for and when applications
close. If a learner acts on a wrong date or a hallucinated rule, real harm
follows. Every fact-bearing document in Firestore carries `sourceUrl`,
`verifiedOn`, and `academicYear`. A document missing any of those three fields
must not render on a public page — enforce this with a type guard, not a code
review comment. When unsure whether something belongs in the verification
queue or can auto-publish: it goes in the queue. When unsure whether a source
is authoritative: it does not get registered. When the pipeline cannot
determine a date: the UI says "dates being verified" and links to the
institution — it never guesses.

## What this project is

A South African school-leaver enters their NSC subjects and marks and learns,
on one screen: their APS (calculated per-institution, not one generic
number), what they qualify for, what they almost qualify for and by exactly
how much, what they don't qualify for and the realistic alternative pathway,
the faculty/school each programme sits under, whether applications are open
with a direct apply link (or, if closed, a status-check link instead — never
a dead apply link), and bursaries/internships matched to their choices.

v1 (UMP-only, simulated backend) is archived at git tag `v1-archive` and
branch `archive/v1`. v2 is a full rebuild: national-capable from day one,
seeded in tiers (Tier 1 = fully verified launch institutions, Tier 2 =
schema-present/partially-populated/labelled "coming soon", Tier 3 =
TVET/private, schema only). Adding an institution is a data operation, never
a code change.

The full governing brief is preserved at `docs/MASTER_PROMPT_v2.md`. This
file is the condensed, living version — if they ever disagree, treat that as
a bug and reconcile them, not as license to pick whichever is convenient.

## Stack

Next.js 15 (App Router, TypeScript strict) · Tailwind CSS · Firestore ·
Firebase Auth (email + Google, plus anonymous sessions for the calculator) ·
Vercel Cron for scheduled ingestion · Zod on every AI output and every form ·
Recharts · Vitest + Playwright.

**Hard requirement:** `lib/aps/` (the APS engine) is pure, dependency-free
TypeScript — no Firebase or React imports — so it stays unit-testable in
isolation and portable to a Flutter/Dart port or a standalone serverless
function later.

## Non-negotiables

1. **Secrets never reach the browser.** Every LLM call, scrape, and
   third-party API call happens server-side. No `NEXT_PUBLIC_` prefix on any
   key, ever.
2. **Config over hardcode.** Anything that differs between institutions,
   provinces, subjects, or academic years lives in `config/` or Firestore —
   never in a component.
3. **No fixed institution count assumed anywhere in the code.**
4. Cron/admin routes are protected by a secret header. A public cron endpoint
   is a free way to run up the token bill.
5. Bursary/internship listings that ask for an upfront "registration" or
   "admin" fee are auto-rejected and flagged — this is an active scam vector
   targeting SA school-leavers.
6. POPIA is a build requirement, not a footnote: age gate at signup,
   guardian-consent capture and recording for under-18s, data minimisation
   (no ID numbers, no addresses unless a result genuinely needs them),
   working "download my data" / "delete my account" flows, and Firestore
   rules that actually enforce per-user ownership (with rule tests).

## Workflow

Work is phase-based per `docs/MASTER_PROMPT_v2.md` §4. **Stop at every phase
checkpoint** — summarize what was built, what wasn't, what's broken, and
wait for confirmation before starting the next phase. Show whole files, not
truncated excerpts. If something in the brief is technically infeasible or a
bad idea, say so at the checkpoint instead of quietly building a worse
version of it.

## Local development

`firebase emulators:start --only firestore,auth --project demo-ucag` runs
the full Firestore + Auth backend locally with **zero real Firebase
credentials** — `demo-*` project IDs are Firebase's own convention for
emulator-only, no-real-project testing (see `.firebaserc`). Set
`NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true` in `.env.local` so `next dev`
connects to it instead of trying (and failing) to reach a real project.

`tests/firestore-rules.test.ts` and `tests/auth-integration.test.ts` need
the emulators running — without them, `npm test` fails those two files with
a clear `auth/network-request-failed` / connection error, not a silent
false-pass, and the rest of the suite still runs and passes independently.

## Definition of done for any change

1. `npm run typecheck` / `tsc --noEmit` clean.
2. Relevant Vitest suite green (the APS engine especially — a failing test
   there is a production incident, not a nit). For anything touching
   `firestore.rules` or auth, that means green **against the real emulator**
   (see above), not just typechecking the rules file.
3. No secret-shaped file (`.env`, service account JSON, private keys) newly
   tracked by git — check `git status` before committing.
4. Any fact-bearing Firestore write includes `sourceUrl`, `verifiedOn`,
   `academicYear`.
5. Firestore/Storage security rules changes validated in the emulator before
   deploy — not just written and assumed correct. A rules test that can't
   demonstrably fail (try breaking the rule and confirming the test catches
   it) isn't verifying anything.
