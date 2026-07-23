# UCAG — University Course Application Guide

South African school-leavers enter their NSC subjects and marks and get, on one
screen: a correctly-calculated APS (per institution, not a generic number),
what they qualify for, what they almost qualify for and by exactly how much,
what they don't qualify for and the realistic alternative pathway, and
matched bursaries/internships — backed by a scheduled AI ingestion pipeline
with a human verification gate on anything a learner acts on.

**Status: reset for v2, pre-Phase-1.** v1 (UMP-only, simulated backend) is
archived at git tag [`v1-archive`](../../releases/tag/v1-archive) and branch
`archive/v1` — nothing from it was carried forward; v2 is a from-scratch,
national-capable rebuild.

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

Nothing is built yet — this reset (git history archive + fresh
README/CLAUDE) is Phase 0 of `docs/MASTER_PROMPT_v2.md` §4. Phase 0's
"first response" (read of the brief, Tier 1 institution recommendation,
verified source register, cost estimate, any stack disagreement) is the next
deliverable, followed by a checkpoint before Phase 1 (foundation + data
model) begins.
