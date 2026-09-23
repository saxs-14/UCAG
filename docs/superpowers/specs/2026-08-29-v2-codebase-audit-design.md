# UCAG v2 — Codebase & Security Audit: Design

**Status:** Approved by owner 2026-08-29. First sub-project of a larger
"audit-and-refine v2" engagement (not a rebuild-from-scratch).

## Why this exists

An external "UCAG rebuild prompt" was received proposing a full rebuild:
new Python scraping pipeline, flattened Firestore schema, removal of the
mentor feature, generic page list, etc. Cross-checking it against the real
repo and `docs/MASTER_PROMPT_v2.md` found the prompt does not describe this
codebase — wrong product name ("University Career and Admission Guide" vs.
the real "University Course Application Guide"), and several of its
"remove/replace" targets are actually recent, deliberate, owner-approved
work (e.g. `MentorSnippet`, approved 2026-08-21, verified working
2026-08-29) or duplicate existing, working systems (the TS ingestion
pipeline in `lib/ingestion/` vs. a proposed new Python one). This matches
a failure pattern already seen on this project: pasted, AI-generated
template documents that describe a generic/different system and conflict
with confirmed decisions once checked against the real repo.

Owner decision: apply the brief's legitimate goals (simplicity, security,
HCI quality, cutting real bloat) to the **existing** v2 codebase rather
than discarding it. This document scopes the first step of that: a
ground-truth audit, evaluated against `master` (not the in-flight
`redesign/phase-1a-tokens-icons` branch, which already has its own
approved plans and shouldn't be re-litigated here).

## Scope

One KEEP / REMOVE / IMPROVE / REBUILD verdict per finding, each with
file:line evidence, across:

1. **Auth** — Firebase Auth flows, protected routes, session handling,
   error handling, anonymous-session support for the calculator.
2. **Database & security rules** — every Firestore collection's real
   shape (read directly from the repo, not assumed), `firestore.rules`,
   and whether the existing rules tests can actually catch a broken rule
   (per CLAUDE.md's own bar: "a rules test that can't demonstrably fail
   isn't verifying anything").
3. **Ingestion pipeline** (`lib/ingestion/`) — architecture, existing
   safety mechanisms (robots.txt checks, diffing, budget tracking,
   verification gate), real gaps. Explicitly not "should this be Python
   instead" — that's settled.
4. **AI / chat assistant** (`lib/chat/`, `lib/ai/`) — RAG-grounding
   robustness, prompt-injection resistance, source-citation handling,
   graceful degradation on failure.
5. **APS / matching engine** (`lib/aps/`, `lib/matching/`) — correctness,
   compliance with the "pure, dependency-free TS" constraint.
6. **UI components** (`components/`) — unused components, duplicated
   logic, and an explicit per-component check for anything resembling a
   real social/community/gamification feature (messaging, moderation
   surface, user-to-user contact) beyond the already-cleared
   `MentorSnippet`. Specifically inspect `ConfettiBurst.tsx`,
   `ShareBar.tsx`, and any others that read as "extra" before judging
   them — no removal recommendation without reading what a component
   actually does first.
7. **Dependencies** (`package.json`) — unused packages, `npm audit`
   findings.
8. **Routes/pages** (`app/`) — which of the external brief's desired
   pages already exist vs. are genuinely missing.
9. **Documentation drift** — where CLAUDE.md, `MASTER_PROMPT_v2.md`, and
   the actual code disagree.

## Method

- Read-only. No code changes in this sub-project.
- Real diagnostics get run, not just read: `npm audit`, `npm run lint`,
  `tsc --noEmit`, the existing test suite (including
  `firestore-rules.test.ts` / `auth-integration.test.ts` against the
  local emulator), and a grep sweep for hardcoded secrets / leaked keys /
  any `NEXT_PUBLIC_`-prefixed sensitive value.
- Every REMOVE candidate is cross-checked against CLAUDE.md,
  `MASTER_PROMPT_v2.md`, and recent commit history/messages before being
  recommended — this step exists specifically because of the
  near-miss on the mentor feature earlier in this engagement.
- Each subsystem above is investigated independently (parallelizable —
  the subsystems don't share state), then findings are merged into one
  report.

## Deliverable

`docs/superpowers/specs/2026-08-29-v2-audit-report.md`:

- Executive summary
- Per-subsystem KEEP/REMOVE/IMPROVE/REBUILD table, each row with
  file:line evidence and a one-line rationale
- Security findings, ranked by severity
- Dependency findings
- Explicit "already being handled by the in-flight redesign branch,
  not re-litigated here" callouts
- Open-questions section for anything that's a genuine judgment call
  rather than a clear verdict

## After this

Owner reviews and adjusts the report. The approved version becomes the
input to the next sub-project (execute approved removals + security
fixes), which gets its own plan once this one lands.
