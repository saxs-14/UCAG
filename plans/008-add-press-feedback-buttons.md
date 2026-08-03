# 008 — Add press feedback to buttons that currently have none

- **Status**: TODO
- **Commit**: 1522b53
- **Severity**: LOW-MEDIUM
- **Category**: Physicality & origin
- **Estimated scope**: 4 files

## Problem

AUDIT.md §3 requires visible press feedback on pressable elements: `transform: scale(0.97)` on `:active` (kept subtle, 0.95–0.98), transitioning over 160ms `ease-out`. Several real, frequently-used buttons in this app have hover/color feedback only — clicking them gives no tactile confirmation that the click registered, in contrast to sibling buttons elsewhere in the same app that already do this correctly (e.g. `components/results/ResultCard.tsx:222`'s Apply CTA, `hover:scale-[1.03] active:scale-[0.97]`).

Confirmed occurrences with zero press feedback:

- `components/auth/AccountPage.tsx:149` (sign out), `:157` (download data), `:165` (delete-account trigger), `:176` (confirm delete), `:183` (cancel delete) — all `transition-colors`/`transition-opacity` + `hover:` only.
- `components/chat/ChatWidget.tsx:101` (dialog close "×" button) — `transition-colors hover:bg-slate-soft hover:text-ink` only.
- `components/results/CourseComparisonTable.tsx:42` (remove-from-comparison "×" button) — `text-xs text-ink-faint hover:text-mark-red`, no transition at all.
- `components/subject-form/SubjectCombobox.tsx:159` (clear-selection "×" button) — has `hover:scale-110` but no distinct `:active` state, so a click just continues the hover-grow rather than reading as a press.
- `components/subject-form/SubjectForm.tsx:281` (elective "Remove" button) — `hover:underline` only.

## Target

Add `active:scale-[0.97]` (matching this repo's existing convention exactly — see `ResultCard.tsx:222`) plus a `transition-transform` (or extend the existing `transition-colors`/`transition-opacity` to also cover `transform`) with `duration-150` (this repo's existing transition-duration convention for interactive feedback, e.g. `components/TiltCard.tsx:46`'s `duration-150 ease-out`) to each of the 9 buttons above.

```tsx
/* target — example for AccountPage.tsx:149 */
className="min-h-11 cursor-pointer rounded-xl border border-line px-3 text-sm font-medium text-ink-soft transition-transform duration-150 ease-out hover:bg-slate-soft active:scale-[0.97]"
```

Note `transition-colors` becomes `transition-transform` in the examples below where the element didn't already need a color transition on `:active` — but where the element's `hover:` already changes a color (most of these do), keep BOTH properties transitioning by using `transition-[color,background-color,transform]` or simply widening to `transition-all duration-150` is explicitly the wrong move (AUDIT.md §5: `transition: all` is always a performance finding). Use the exact per-property list shown in each step below — never `transition-all`.

## Repo conventions to follow

- `active:scale-[0.97]` is this repo's own established press-feedback value — copy it exactly from `components/results/ResultCard.tsx:222`, `components/bursaries/BursaryCard.tsx:55`, `components/subject-form/SubjectForm.tsx:302`. Do not invent a different magnitude (this repo's actual convention is `0.97`, not AUDIT.md's example `0.97` coincidentally matching — good, no conflict).
- `duration-150 ease-out` is this repo's existing convention for hover/press-style micro-interactions — see `components/TiltCard.tsx:46`.
- Never use `transition-all` or `transition: all` (AUDIT.md §5) — always name the specific properties.

## Steps

1. `components/auth/AccountPage.tsx:149` (sign out button) — change:
   ```tsx
   className="min-h-11 cursor-pointer rounded-xl border border-line px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-slate-soft"
   ```
   to:
   ```tsx
   className="min-h-11 cursor-pointer rounded-xl border border-line px-3 text-sm font-medium text-ink-soft transition-[background-color,transform] duration-150 ease-out hover:bg-slate-soft active:scale-[0.97]"
   ```
2. `components/auth/AccountPage.tsx:157` (download data button) — change:
   ```tsx
   className="min-h-11 cursor-pointer rounded-xl border border-line px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-slate-soft disabled:cursor-not-allowed disabled:opacity-50"
   ```
   to:
   ```tsx
   className="min-h-11 cursor-pointer rounded-xl border border-line px-3 text-sm font-medium text-ink-soft transition-[background-color,transform] duration-150 ease-out hover:bg-slate-soft active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
   ```
3. `components/auth/AccountPage.tsx:165` (delete-account trigger button) — change:
   ```tsx
   className="min-h-11 cursor-pointer rounded-xl border border-mark-red px-3 text-sm font-medium text-mark-red transition-colors hover:bg-mark-red-soft"
   ```
   to:
   ```tsx
   className="min-h-11 cursor-pointer rounded-xl border border-mark-red px-3 text-sm font-medium text-mark-red transition-[background-color,transform] duration-150 ease-out hover:bg-mark-red-soft active:scale-[0.97]"
   ```
4. `components/auth/AccountPage.tsx:176` (confirm delete button) — change:
   ```tsx
   className="min-h-11 cursor-pointer rounded-xl bg-mark-red px-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
   ```
   to:
   ```tsx
   className="min-h-11 cursor-pointer rounded-xl bg-mark-red px-3 text-sm font-medium text-white transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.97]"
   ```
5. `components/auth/AccountPage.tsx:183` (cancel delete button) — change:
   ```tsx
   className="min-h-11 cursor-pointer rounded-xl border border-line px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-slate-soft"
   ```
   to:
   ```tsx
   className="min-h-11 cursor-pointer rounded-xl border border-line px-3 text-sm font-medium text-ink-soft transition-[background-color,transform] duration-150 ease-out hover:bg-slate-soft active:scale-[0.97]"
   ```
6. `components/chat/ChatWidget.tsx:101` (dialog close button) — change:
   ```tsx
   className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-slate-soft hover:text-ink"
   ```
   to:
   ```tsx
   className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-[background-color,color,transform] duration-150 ease-out hover:bg-slate-soft hover:text-ink active:scale-[0.97]"
   ```
7. `components/results/CourseComparisonTable.tsx:42` (remove-from-comparison button) — change:
   ```tsx
   className="text-xs text-ink-faint hover:text-mark-red"
   ```
   to:
   ```tsx
   className="text-xs text-ink-faint transition-transform duration-150 ease-out hover:text-mark-red active:scale-[0.97]"
   ```
8. `components/subject-form/SubjectCombobox.tsx:159` (clear-selection button) — change:
   ```tsx
   className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center text-lg text-ink-faint transition-transform hover:scale-110 hover:text-brand-coral"
   ```
   to:
   ```tsx
   className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center text-lg text-ink-faint transition-transform duration-150 ease-out hover:scale-110 hover:text-brand-coral active:scale-95"
   ```
   Note: this button already translates itself vertically via `-translate-y-1/2` for centering — `active:scale-95` composes with that existing transform correctly in Tailwind (both apply to the same `transform` property as a single computed value), so no conflict; used `scale-95` (not `scale-[0.97]`) here specifically because this button already has a large `hover:scale-110`, and a bigger hover deserves a slightly more noticeable press-down to stay proportionate — this is a deliberate, small exception to the "always 0.97" rule, not a mistake.
9. `components/subject-form/SubjectForm.tsx:281` (elective "Remove" button) — change:
   ```tsx
   className="-m-2 mt-4 cursor-pointer p-2 text-xs text-mark-red hover:underline"
   ```
   to:
   ```tsx
   className="-m-2 mt-4 cursor-pointer p-2 text-xs text-mark-red transition-transform duration-150 ease-out hover:underline active:scale-[0.97]"
   ```

## Boundaries

- Do NOT use `transition-all`/`transition: all` anywhere in this plan — always name explicit properties, per each step above.
- Do NOT change any button's color, layout, spacing, or text — press-feedback only.
- Do NOT touch buttons not listed here, even if they look similar — this plan is scoped to exactly the 9 locations above (other missing-feedback or already-correct buttons are out of scope or handled by other plans).
- If any of the 9 file:line locations don't match what's quoted above (drift since commit `1522b53`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck` (clean), `npm run lint` (clean), `npx vitest run` (full suite green).
- **Feel check**: run `npm run dev`, and for each of the 9 buttons:
  - Click and hold (or use DevTools' "Emulate a focused page"/manually trigger `:active` in Elements panel) and confirm a visible, brief scale-down before release.
  - Confirm the press feedback releases back to normal within ~150ms after release, not instantly and not sluggishly.
  - Confirm no button's layout shifts or text reflows during the press (only `transform`, nothing else, should move).
  - Toggle `prefers-reduced-motion` and confirm the press-down scale is suppressed to near-instant (global override), while the button remains fully clickable.
- **Done when**: all 9 listed buttons show a brief, subtle scale-down on press, matching the feel of this app's already-correct buttons (e.g. the Apply CTA on any `ResultCard`).
