# 010 — Consolidate the three competing "press pop" scale magnitudes

- **Status**: TODO
- **Commit**: 1522b53
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 4 files
- **Depends on**: run this AFTER plan 004 (`004-gate-hover-transforms-touch.md`) and plan 008 (`008-add-press-feedback-buttons.md`) — both of those touch the same className strings this plan edits. If this plan is executed first, some of the "current code" snippets quoted below won't exist yet (008 hasn't added the missing `active:` states) or will use `hover:` instead of `hover-fine:` (004 hasn't renamed it yet) — if so, STOP and run 004/008 first rather than improvising a merge.

## Problem

The same "small interactive pop" gesture — a pill/round button growing slightly on hover and shrinking slightly on press — exists with three different, hand-typed magnitudes across the app, with no shared value:

- `scale-[1.03]` / `active:scale-[0.97]` — `components/results/ResultCard.tsx:222`, `components/bursaries/BursaryCard.tsx:55`, `components/bursaries/InternshipCard.tsx:47`, `components/subject-form/SubjectForm.tsx:302`, `components/chat/ChatWidget.tsx:163`.
- `scale-105` / `active:scale-95` — `components/chat/ChatWidget.tsx:176` (the floating action button — a few lines below the send button using the *other* variant, in the same file).
- `scale-110` (hover only, no matching `active:` before plan 008 adds one) — `components/subject-form/SubjectCombobox.tsx:159` (the clear-selection "×" button).

Three near-identical values doing the same job, with `ChatWidget.tsx` alone containing two of them a few lines apart, is exactly the "five hand-typed cubic-beziers that almost match" pattern AUDIT.md §7 calls a consolidation finding — just expressed as scale amounts instead of easing curves.

## Target

Standardize on `hover-fine:scale-[1.03] active:scale-[0.97]` (the majority convention already used in 5 of the 7 locations) for every pill/round *button-with-text* pop. The clear-"×" button (`SubjectCombobox.tsx:159`) and the chat FAB (`ChatWidget.tsx:176`) are visually distinct enough (a small icon-only circular button, not a text pill) that AUDIT.md's "keep it subtle (0.95–0.98)" range still permits a slightly larger hover-grow for those two specifically — but their `active:` press value should still land in the same family. This plan keeps those two at their existing, slightly larger hover magnitude (110/105) since that's a deliberate size distinction for icon-only circular controls, not an accidental drift, but aligns their `active:` press value to the same `0.97` family instead of `0.95`/`0.97` disagreeing with each other for no reason.

```tsx
/* target — ChatWidget.tsx:176, the one true inconsistency to fix */
className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-teal text-white shadow-lg transition-transform hover-fine:scale-105 active:scale-[0.97]"
```

## Repo conventions to follow

- `hover-fine:scale-[1.03] active:scale-[0.97]` is this repo's majority convention (5 of 7 sites already use it) — this plan does not invent a new value, it aligns the 2 outliers toward consistency where doing so doesn't erase a deliberate size distinction (icon-only circular buttons keeping a larger hover-grow is fine; the *press* value disagreeing for no reason is not).
- This plan assumes plan 004 has already renamed the relevant `hover:` utilities to `hover-fine:` — if you're applying this plan and find plain `hover:` still present at these locations, that means plan 004 hasn't run yet; STOP per the dependency note above rather than mixing gated and ungated hover on adjacent elements.

## Steps

1. In `components/chat/ChatWidget.tsx`, find the floating action button (currently line 176, assuming plan 004 already renamed its `hover:scale-105` to `hover-fine:scale-105`):
   ```tsx
   className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-teal text-white shadow-lg transition-transform hover-fine:scale-105 active:scale-95"
   ```
   Change only the `active:scale-95` to `active:scale-[0.97]`:
   ```tsx
   className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-teal text-white shadow-lg transition-transform hover-fine:scale-105 active:scale-[0.97]"
   ```
2. Confirm (no edit needed if already correct) that `components/subject-form/SubjectCombobox.tsx:159`'s clear button — after plans 004 and 008 have run — reads:
   ```tsx
   className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center text-lg text-ink-faint transition-transform duration-150 ease-out hover-fine:scale-110 hover-fine:text-brand-coral active:scale-95"
   ```
   Note: plan 008 deliberately set this one's `active:` to `scale-95` (not `scale-[0.97]`) specifically because a `hover-fine:scale-110` hover deserves a proportionately bigger press-down — leave this one alone, it is the one intentional exception in the whole app, not a bug to "fix" by matching it to `0.97`. Do not change it in this plan.
3. Verify the other 4 sites already at `hover-fine:scale-[1.03] active:scale-[0.97]` need no change: `components/results/ResultCard.tsx:222`, `components/bursaries/BursaryCard.tsx:55`, `components/bursaries/InternshipCard.tsx:47`, `components/subject-form/SubjectForm.tsx:302`, `components/chat/ChatWidget.tsx:163` — these are already the target convention, listed here only so the executor confirms them rather than assuming and skipping verification.

## Boundaries

- Do NOT change `SubjectCombobox.tsx:159`'s `active:scale-95` to `scale-[0.97]` — that is a deliberate, documented exception (see Step 2), not an inconsistency to fix.
- Do NOT change any `hover-fine:scale-*` hover magnitude — this plan only touches `active:` press values, and only where they disagree with the rest of their own button's sizing family.
- Do NOT touch any button not listed here.
- If any location doesn't match what's described (accounting for plans 004/008 having already run, per the dependency note), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck` (clean), `npm run lint` (clean), `npx vitest run` (full suite green).
- **Feel check**: run `npm run dev`, open the chat widget, press-and-hold the floating action button and the send button back to back — confirm both now press down by the same subtle amount (`0.97`), even though the FAB still grows slightly more on hover (`105` vs `1.03`) than the send button, which is the intended, deliberate size distinction for an icon-only circular control.
- **Done when**: every pill/round button's `active:` press value across the app is `scale-[0.97]`, except `SubjectCombobox.tsx`'s clear-"×" button, which deliberately keeps `scale-95` to match its larger `110` hover-grow.
