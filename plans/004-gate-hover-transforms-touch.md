# 004 — Gate hover-triggered transforms so touch/tap can't false-trigger them

- **Status**: TODO
- **Commit**: 1522b53
- **Severity**: MEDIUM-HIGH
- **Category**: Accessibility
- **Estimated scope**: 8 files (`app/globals.css` + 7 component files)

## Problem

Nearly every hover-triggered `scale`/`translate` effect in the app is a plain Tailwind `hover:` utility with no gate for input type. On a touch device, tapping a link/button fires `:hover` (most mobile browsers apply `:hover` styles on tap and only clear them on a subsequent tap elsewhere), so these controls visibly jump/lift/scale on every tap and can stay in that "hovered" state until the user taps something else — never an intentional hover, since touch has no hover concept at all. AUDIT.md §6 requires gating these with `@media (hover: hover) and (pointer: fine)`.

This repo has no such gate anywhere. Confirmed occurrences (movement-triggering `hover:` utilities only — color-only hovers like `hover:bg-slate-soft` are unaffected by this plan and should NOT be touched, since a lingering color change on tap is harmless):

- `components/statistics/StatChart.tsx:129` — `hover:-translate-y-0.5` (CSV download button)
- `components/subject-form/SubjectCombobox.tsx:159` — `hover:scale-110` (clear "×" button)
- `components/subject-form/SubjectForm.tsx:302` — `hover:scale-[1.03]` ("+ Add a 4th elective")
- `components/bursaries/BursaryCard.tsx:55` — `hover:scale-[1.03]` (Apply link)
- `components/bursaries/InternshipCard.tsx:47` — `hover:scale-[1.03]` (Apply link)
- `components/results/ResultCard.tsx:119` — `hover:-translate-y-0.5` (whole-card lift)
- `components/results/ResultCard.tsx:222` — `hover:scale-[1.03]` (Apply CTA)
- `components/chat/ChatWidget.tsx:163` — `hover:scale-[1.03]` (send button)
- `components/chat/ChatWidget.tsx:176` — `hover:scale-105` (floating action button)

Example of the current pattern, `components/results/ResultCard.tsx:119`:

```tsx
<article className={`flex flex-col gap-3 rounded-xl bg-paper-raised p-4 transition-transform hover:-translate-y-0.5 ${BUCKET_SPINE[matchResult.bucket]}`}>
```

## Target

This repo is Tailwind CSS v4 (CSS-first config, no `tailwind.config.js` — see `app/globals.css:1`'s `@import "tailwindcss"` and the `@theme { }` block). Tailwind v4 supports defining a custom variant directly in CSS via `@custom-variant`. Add one that only applies its styles when the device actually supports true hover:

```css
/* target — app/globals.css, placed right after the @theme block closes (currently line 121) */
@custom-variant hover-fine {
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      @slot;
    }
  }
}
```

Then every flagged `hover:scale-*`/`hover:-translate-*` utility becomes `hover-fine:scale-*`/`hover-fine:-translate-*` instead — same value, gated variant:

```tsx
/* target — ResultCard.tsx:119 */
<article className={`flex flex-col gap-3 rounded-xl bg-paper-raised p-4 transition-transform hover-fine:-translate-y-0.5 ${BUCKET_SPINE[matchResult.bucket]}`}>
```

## Repo conventions to follow

- All Tailwind config lives in `app/globals.css` (CSS-first v4 style) — the new `@custom-variant` block goes there, not in a new config file. This repo has no `tailwind.config.js`/`.ts` at all; don't create one.
- Only rename the *movement* half of a combined hover rule. Where a `hover:` utility exists purely for color (e.g. `StatChart.tsx:129`'s `hover:bg-slate-soft`, `ChatWidget.tsx:101`'s `hover:bg-slate-soft hover:text-ink`), leave it as plain `hover:` — this plan is scoped to transform/translate/scale only, per AUDIT.md's actual concern (false-triggered *movement*, not a color change).
- `active:` utilities (e.g. `active:scale-[0.97]`) are untouched by this plan — `:active` already only fires on genuine press/tap on every input type, it's not the problem.

## Steps

1. In `app/globals.css`, immediately after the closing `}` of the `@theme { ... }` block (currently line 121, right before the `@media (prefers-color-scheme: dark)` block), add:
   ```css
   @custom-variant hover-fine {
     @media (hover: hover) and (pointer: fine) {
       &:hover {
         @slot;
       }
     }
   }
   ```
2. In `components/statistics/StatChart.tsx:129`, change `hover:-translate-y-0.5` to `hover-fine:-translate-y-0.5` (leave `hover:bg-slate-soft` on the same line as plain `hover:`).
3. In `components/subject-form/SubjectCombobox.tsx:159`, change `hover:scale-110` to `hover-fine:scale-110` (leave `hover:text-brand-coral` as plain `hover:`).
4. In `components/subject-form/SubjectForm.tsx:302`, change `hover:scale-[1.03]` to `hover-fine:scale-[1.03]` (leave `active:scale-[0.97]` unchanged).
5. In `components/bursaries/BursaryCard.tsx:55`, change `hover:scale-[1.03]` to `hover-fine:scale-[1.03]` (leave `active:scale-[0.97]` unchanged).
6. In `components/bursaries/InternshipCard.tsx:47`, change `hover:scale-[1.03]` to `hover-fine:scale-[1.03]` (leave `active:scale-[0.97]` unchanged).
7. In `components/results/ResultCard.tsx:119`, change `hover:-translate-y-0.5` to `hover-fine:-translate-y-0.5`.
8. In `components/results/ResultCard.tsx:222`, change `hover:scale-[1.03]` to `hover-fine:scale-[1.03]` (leave `active:scale-[0.97]` unchanged).
9. In `components/chat/ChatWidget.tsx:163`, change `hover:scale-[1.03]` to `hover-fine:scale-[1.03]` (leave `active:scale-[0.97]` unchanged).
10. In `components/chat/ChatWidget.tsx:176`, change `hover:scale-105` to `hover-fine:scale-105` (leave `active:scale-95` unchanged).

## Boundaries

- Do NOT touch any plain color/background/text `hover:` utility anywhere in the repo — only the 9 specific movement utilities listed above.
- Do NOT create a `tailwind.config.js`/`.ts` file — the variant must be defined in `app/globals.css` per this repo's CSS-first Tailwind v4 setup.
- Do NOT touch `active:` utilities anywhere.
- If `npm run dev`/`npm run build` fails to compile after step 1 with an error referencing `@custom-variant` or `@slot`, STOP and report the exact build error rather than guessing at alternate syntax — do not silently fall back to removing the media-query gate (that would defeat the purpose of this plan).
- If any of the 9 file:line locations above don't match what's quoted (drift since commit `1522b53`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run build` (must complete with no CSS/PostCSS errors — this is the real test for a new `@custom-variant`, more reliable here than `typecheck`/`lint` alone since a Tailwind syntax mistake won't be caught by either), `npx vitest run` (full suite green).
- **Feel check**: 
  - In Chrome DevTools, toggle device toolbar to a touch-emulated phone (e.g. "iPhone 12 Pro"), reload any page with an affected element (e.g. `/` for the elective's clear-× and add-elective button, `/bursaries` for Apply links and the download... actually the CSV button is on `/statistics`), and tap one — confirm it does NOT visibly scale/lift on tap the way it does with a real mouse hover on desktop.
  - On a real desktop browser (mouse input), hover over the same elements and confirm the scale/lift effect still plays exactly as before — this plan must not remove the effect for genuine mouse users, only gate it from touch.
  - Inspect one of the changed elements in DevTools' Elements panel, confirm the computed style shows the `:hover` rule nested inside a `(hover: hover) and (pointer: fine)` media condition.
- **Done when**: every one of the 9 listed elements still animates on real mouse hover, and none of them visibly animates from a touch tap alone.
