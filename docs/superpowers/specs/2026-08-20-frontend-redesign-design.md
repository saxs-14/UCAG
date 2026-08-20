# Frontend redesign & learner-assistance features — design

**Date:** 2026-08-20
**Trigger:** Owner request to make the UI/frontend "more realistic and professional,"
keep the product anchored on APS calculation + varsity-application assistance, add new
learner-assistance ideas, then integrate/upgrade the backend to match.
**Owner:** Phathutshedzo "Saxs" Mamagau

## Context

UCAG v2 has already been through three redesign passes (hand-drawn/ruled-paper →
CSIR-institutional-navy, per `app/globals.css` history) plus several feature pushes
(role portals, UMP microsite, public discovery). The current `docs/UCAG_CURRENT_STATE_AUDIT.md`
(2026-08-14) documents real, concrete gaps: role-gating on `/account/parent` and
`/account/mentor` doesn't actually check role/guardian linkage, there are no dedicated
`/admin/login` `/parent/login` `/mentor/login` entry points, institution branding tokens
(logo/color) aren't bound to `/institutions/[id]`, and there's no mobile bottom nav.

Asked what "more realistic and professional" means concretely, the owner selected all
of: generic/template-y look, fake-feeling data/content, thin product depth, and weak
mobile experience. A concrete, verifiable example of the "template-y" complaint:
`components/NavBar.tsx` uses raw emoji (🎓🏛️💰📊✨👤) as structural nav icons and in a
stats pill — a well-documented AI-generated-app tell, not a deliberate design choice.

`ui-ux-pro-max` domain searches for "government/institutional/trust" product types
returned reference palettes (navy `#0F172A` primary, slate secondary, blue/teal accent,
red/green/gold semantic marks) that are already very close to UCAG's existing palette —
confirming the palette itself is a sound choice for this product category. The gap is
execution (emoji icons, ad-hoc shadows, no unified component system), not color choice.

This spec covers **Phase 1 (frontend/design) only**. Backend integration/upgrade is a
separate macro-phase, deliberately sequenced after, per the owner's approved Approach A.

## Goals

1. Replace every emoji-as-icon with a real SVG icon set; establish one consistent
   icon/shadow/spacing/type system used everywhere (not per-component one-offs like the
   current `TiltCard`/`StampBadge`/`CircledMark` mix).
2. Add a heading font (Lexend) distinct from body (Inter) to give the product visual
   identity beyond "default Inter everywhere."
3. Add the mobile bottom navigation the app's own audit already flags as missing.
4. Redesign each page's content/layout so it reads as a real, finished product — not
   reskin surface polish over thin flows.
5. Design (UI only, this phase — wiring is Phase 2) a small set of new
   learner-assistance features that build on scaffolding already in the repo
   (`lib/readiness.ts`, `lib/mentors/getMentors.ts`, `lib/whatsapp/adapter.ts`,
   `app/application/documents`) rather than inventing unrelated new subsystems.
6. Preserve every deliberate, previously-fought-for decision: the calculator's
   no-scroll-to-subject-dropdowns requirement, the green/gold/red semantic marking
   system, the "unverified is never displayed as fact" rule extending into how new UI
   surfaces show live-vs-placeholder data.

## Non-goals (this phase)

- Any Firestore schema change, security rule change, or real data wiring — Phase 2.
- Fixing the broken role-gating on `/account/parent` / `/account/mentor` — that's a
  backend/auth-logic fix, Phase 2, even though the *dashboards themselves* get
  redesigned visually in this phase.
- Building the WhatsApp reminder send path, mentor-verification workflow, or guardian
  linkage records — Phase 2. This phase designs the UI surfaces that will consume them.
- A full rewrite of the information architecture (Approach C, explicitly rejected).
- New institutions/programmes/facts of any kind (unrelated to this spec, and CLAUDE.md's
  verification rule rules out rushing that in as a side effect of a UI pass anyway).

## Design

### 1. Design tokens (`app/globals.css`)

- Keep the existing `--color-*` token structure and hex values — they already match
  verified "government/institutional-trust" reference palettes. No palette rewrite.
- Add `--font-heading: "Lexend", var(--font-sans)` alongside the existing
  `--font-sans: "Inter", ...` body font. Lexend is a readability-optimized typeface and
  the top domain-search match for "government/enterprise/accessibility-focused" —
  a real, defensible reason for a school-leaver-facing product, not decoration.
- Add a documented elevation scale (`--shadow-1` low, `--shadow-2` card-hover,
  `--shadow-3` modal/sheet) replacing the ad-hoc `rgba(0,0,0,0.04)`-style one-off shadow
  values currently duplicated across `.card-learner`, `TiltCard`, etc.
- Add a documented radius scale (`--radius-sm/md/lg/pill`) for the same reason.
- Formalize the existing implicit 8px spacing rhythm as the only spacing scale used in
  new/touched components (Tailwind's default scale already aligns; the change is
  discipline, not new tokens).

### 2. Icon system

- Adopt `lucide-react` (SVG, tree-shakeable, MIT-licensed, no new backend surface) as
  the single icon set for the whole app.
- Replace every emoji currently used structurally: `NavBar.tsx` nav items and stats
  pill, `MobileNavBar.tsx` (new, see below), and any other emoji-as-icon usage found in
  a repo-wide sweep during implementation (not enumerated exhaustively here — the
  implementation plan will grep for the emoji ranges across `components/` and `app/`).
- Emoji remain allowed only as genuine *content* (e.g. inside a chat message, or a
  celebratory one-off in a success toast) — never as a structural/navigational icon.

### 3. Mobile bottom navigation

- `components/MobileNavBar.tsx` already exists as a file, but the current state audit
  (`UCAG_CURRENT_STATE_AUDIT.md` §4, "What Is Missing") lists an app-like mobile bottom
  nav as absent — implementation must first read that file to establish whether it's an
  unused stub, a partial component not wired into the layout, or already functioning
  and the audit is stale, then extend or rebuild accordingly rather than assuming either
  state.
- Persistent bottom tab bar, `<768px` viewports only, replacing reliance on the desktop
  header nav on mobile.
- Max 4 items per the `bottom-nav-limit` UX rule: Calculator, Institutions, Bursaries,
  Account (Bursaries chosen over Statistics as the 4th — it's the more action-oriented,
  learner-relevant surface; Statistics stays header/desktop-only).
- Icon + label per item (not icon-only), current-page state visually highlighted,
  safe-area-aware bottom inset, `position: sticky` content padding added to `<main>` so
  page content isn't hidden behind it.

### 4. Page-by-page redesign scope

| Page | Redesign scope this phase |
|---|---|
| Calculator (`app/page.tsx`, `CalculatorPage.tsx`) | Refresh hero band and subject-entry layout on the new token system; **preserve** the documented "learner from a WhatsApp link sees subject dropdowns with no scroll" requirement — verify after, don't just assume |
| Results (`components/results/`) | Institution-branded programme cards (visual only — real per-institution color binding is Phase 2 data wiring; this phase builds the component to accept a theme prop), live countdown *component* (Phase 2 wires real dates), new "gap-closer" panel for Almost-Qualify, "Explain my APS" expandable breakdown, mentor snippet slot |
| Institutions (`app/institutions/`) | Card/list redesign on new tokens; branding-token *slots* added to `/institutions/[id]` (Phase 2 binds real values) |
| Bursaries (`app/bursaries/`) | Scam-radar badge kept prominent (trust signal — do not soften it), add match-to-my-programme filter UI |
| Statistics (`app/statistics/`) | Keep Recharts; tighten legends/tooltips/axis contrast per accessible-chart practice; no chart type changes |
| Account/Parent/Mentor (`app/account/`) | Visually redesign as three distinct role-colored dashboards; the *actual* role-check enforcement fix is Phase 2 — this phase must not accidentally make the visual redesign look like the security gap is fixed when it isn't |
| **New: Comparison view** | Side-by-side 2-3 shortlisted programme comparison (APS required, faculty, deadline, bursary matches) — pure client-side UI over already-loaded data, no new backend needed even in Phase 2 beyond exposing shortlist state |
| **New: Application Readiness screen** | Checklist UI over `lib/readiness.ts`'s existing types; Phase 2 persists checklist state to Firestore |

### 5. New learner-assistance features — detail

- **Explain my APS**: expandable per-subject row showing raw mark → level → weighted
  contribution → running total, for the institution currently selected. Pure function
  of data already computed by `lib/aps/` — no new calculation logic, just UI exposing
  the engine's existing intermediate values (may require `lib/aps/` to return
  a breakdown structure instead of just the final number — flag for the implementation
  plan to check).
- **Gap-closer panel**: for each Almost-Qualify programme, show the specific shortfall
  already computed by `lib/matching/` in human terms ("Raise Mathematics from 62% to
  66%" rather than just a numeric delta).
- **Mentor snippet on results**: surface 1-2 verified mentors from `lib/mentors/getMentors.ts`
  filtered by institution/programme, with a link to the full `/account/mentor` request
  flow — this phase is the UI slot + real data fetch (the fetch function already
  exists), not a new backend feature.
- **Deadline countdown**: UI component taking an `applicationWindow` prop; Phase 1 can
  wire it to real Firestore `applicationWindows` data since that collection and read
  path already exist (per `UCAG_CURRENT_STATE_AUDIT.md` §10) — this is a read of
  existing verified data, not new backend work, so it's in-scope now.
- **Parent/guardian read-only view**: this phase redesigns the existing
  `/account/parent` UI shell only. Real guardian-to-learner linkage records are
  explicitly Phase 2 (non-goal above) — until then this screen continues showing
  whatever placeholder/self state it shows today, just restyled, with no claim of
  working linkage.

### 6. Component consolidation

- Audit `TiltCard.tsx`, `StampBadge.tsx`, `CircledMark.tsx`, `MarkedHeading.tsx`,
  `CountUp.tsx` during implementation: keep the ones that still serve the redesigned
  visual language, fold near-duplicates into the new shared card/badge primitives built
  for this phase, remove ones that don't fit and aren't used post-redesign. This is a
  targeted cleanup of code the redesign directly touches, not a general refactor pass.

## Error handling / trust-rule interaction

Every new surface that displays a "live" value (application countdown, institution
branding, mentor count) must handle the **not-yet-available** case explicitly and
visibly (e.g. "dates being verified," a neutral placeholder state) rather than a blank
space or a fabricated-looking default — consistent with CLAUDE.md's overriding rule.
Since this phase is UI-only for most of these (Phase 2 does the real wiring), the
default/loading/empty state design matters as much as the "happy path" visual, and each
new component in this phase needs an explicit empty-state design, not just a filled
mock.

## Testing

- No new business logic this phase (APS engine, matching, readiness logic unchanged) —
  existing Vitest suites should stay green with no changes required; run them anyway
  after each sub-phase checkpoint as a regression check.
- Any new pure UI component (countdown formatter, gap-closer text generator) that
  contains non-trivial logic gets a Vitest unit test, matching the existing pattern
  (`applicationStatus.test.ts`, `readiness.test.ts`, etc.).
- Visual/manual verification at each checkpoint: run `npm run dev`, check the touched
  pages at 375px/768px/1024px, both light and dark (the token system already supports
  dark mode via `prefers-color-scheme`), and confirm no emoji-as-icon remains on touched
  pages.
- `npm run typecheck` and `npm run lint` clean before each checkpoint, per CLAUDE.md's
  definition of done.

## Follow-ups (explicitly deferred, not silently dropped)

- Backend integration/upgrade macro-phase (role-gating fix, institution branding data
  binding, readiness/WhatsApp/mentor-verification backend, guardian linkage) — separate
  spec, after this phase's checkpoints are done.
- A full repo-wide emoji sweep is scoped to pages touched by this redesign; any emoji
  found in untouched admin/ingestion internals during implementation should be logged,
  not silently left as a partial cleanup passed off as complete.
