# UCAG — University Course Application Guide

South African school-leavers enter their NSC subjects and marks and get, on one
screen: a correctly-calculated APS (per institution, not a generic number),
what they qualify for, what they almost qualify for and by exactly how much,
what they don't qualify for and the realistic alternative pathway, and
matched bursaries/internships — backed by a scheduled AI ingestion pipeline
with a human verification gate on anything a learner acts on.

**Status: Phase 1 (foundation + data model) complete, awaiting checkpoint.**
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
  server boots with no error. Done, awaiting checkpoint before Phase 2 (the
  APS engine).
- **Not yet connected**: no real Firebase project exists for v2 yet — see
  `.env.example`. The app runs, but nothing that touches Firebase (auth,
  Firestore reads) will work until real credentials are added.
