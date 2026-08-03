# 007 — Cap the infinite soft-glow pulse instead of letting it run forever

- **Status**: TODO
- **Commit**: 1522b53
- **Severity**: MEDIUM
- **Category**: Purpose & frequency
- **Estimated scope**: 2 files (`app/globals.css`, no component changes needed — see Steps)

## Problem

`.animate-soft-glow` (`app/globals.css:285-287`) runs `infinite` — forever, for as long as the element stays mounted. It's applied in two places, both of which can render several instances on one page at once, each starting its own independent 2.2s cycle out of phase with the others:

1. `components/CircledMark.tsx:46` — every `CircledMark` with `variant="qualify"` glows forever. A results page with multiple qualifying programmes renders one `CircledMark` per qualifying `ResultCard` (`components/results/ResultCard.tsx:125-132`), each mounting at a slightly different moment, so several score badges pulse concurrently, unsynchronized, indefinitely.
2. `components/bursaries/DeadlineBadge.tsx:9-14` — every "urgent" deadline badge glows forever. `BursariesPage` can render an arbitrary number of filtered bursary/internship cards, each with its own `DeadlineBadge`, so a filter that surfaces several urgent items produces that many concurrent infinite pulses on one page.

Per this app's own stated design philosophy (`app/globals.css:293-297`, on `.animate-confetti`): *"The one big celebration moment in the app... fires once."* An unbounded, multiplying, forever-running pulse sits awkwardly next to that stated restraint — it reads as busier and more insistent than a single deliberate celebration, not because the color or curve is wrong, but because it never stops and can stack.

Current code, `app/globals.css:256-259` (keyframe) and `:285-287` (utility class):

```css
@keyframes soft-glow {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--glow-color, var(--color-mark-green)) 35%, transparent); }
  50% { box-shadow: 0 0 0 8px color-mix(in srgb, var(--glow-color, var(--color-mark-green)) 0%, transparent); }
}
```

```css
.animate-soft-glow {
  animation: soft-glow 2.2s ease-in-out infinite;
}
```

## Target

Cap the pulse to 3 iterations, then let it settle at its resting (no-glow) state, instead of running forever. `iteration-count: 3` combined with `fill-mode: forwards` means the animation plays exactly 3 full cycles (about 6.6 seconds — enough to be noticed, not enough to become ambient wallpaper) and then holds at the keyframe's `100%` state (`box-shadow: 0 0 0 0 ...`, i.e. no visible glow) rather than snapping back to a mid-cycle look or restarting.

```css
/* target — app/globals.css, replacing the current .animate-soft-glow rule */
.animate-soft-glow {
  animation: soft-glow 2.2s ease-in-out 3;
  animation-fill-mode: forwards;
}
```

Note: unlike `.animate-rise-in`/`.animate-pop-in` (fixed earlier this session from `both` to `backwards` specifically because a lingering `transform` creates a stacking context), `soft-glow`'s keyframe only ever animates `box-shadow` — never `transform` — so `forwards`-filling its end state here carries none of that stacking-context risk. This is a deliberate, different fill-mode choice for a different property, not an inconsistency with the earlier fix.

## Repo conventions to follow

- The keyframe and its utility class already live together in `app/globals.css`'s "Motion" section (`app/globals.css:238` onward, specifically `:256-259` for the keyframe and `:285-287` for the class) — edit them in place, don't duplicate them.
- `--glow-color` stays exactly as-is (`CircledMark.tsx:48` and `DeadlineBadge.tsx:14` both already set this custom property inline per-instance) — this plan only changes the animation's iteration/fill behavior, not its color logic.
- The global `@media (prefers-reduced-motion: reduce)` override (`app/globals.css:323-330`) already forces `animation-iteration-count: 1 !important` — that override already caps this animation to a single pulse for reduced-motion users regardless of this plan's change, so no additional reduced-motion handling is needed here.

## Steps

1. In `app/globals.css`, replace the `.animate-soft-glow` rule (currently lines 285-287):
   ```css
   .animate-soft-glow {
     animation: soft-glow 2.2s ease-in-out infinite;
   }
   ```
   with:
   ```css
   .animate-soft-glow {
     animation: soft-glow 2.2s ease-in-out 3;
     animation-fill-mode: forwards;
   }
   ```
2. No changes are needed in `components/CircledMark.tsx` or `components/bursaries/DeadlineBadge.tsx` — both already just apply the `animate-soft-glow` class name, so this fix is fully contained to the shared CSS rule.

## Boundaries

- Do NOT change the `soft-glow` `@keyframes` definition itself (currently `app/globals.css:256-259`) — only the utility class's `animation` shorthand and fill-mode.
- Do NOT touch `CircledMark.tsx` or `DeadlineBadge.tsx` — this is a pure CSS-only fix, both components already just reference the class name.
- Do NOT change `.animate-draw-circle` or any other keyframe in this file — this plan is scoped to `.animate-soft-glow` only.
- If `app/globals.css:256-259`/`:285-287` don't match what's quoted above (drift since commit `1522b53`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck` (clean — no TS involved, but confirms nothing else broke), `npm run lint` (clean), `npx vitest run` (full suite green).
- **Feel check**: run `npm run dev`, get to a results page with at least one qualifying programme (renders a glowing `CircledMark`) and/or `/bursaries` with an urgent-deadline listing visible:
  - Watch a glowing badge for at least 10 seconds — confirm the pulse plays a few times (~3 cycles, ~6.6s) and then settles to a steady, non-pulsing state, rather than continuing indefinitely.
  - With multiple qualifying `ResultCard`s or multiple urgent `DeadlineBadge`s visible at once, confirm they don't read as a wall of perpetual, unsynchronized flashing after the first several seconds.
  - In Chrome DevTools' Animations panel, select the element while it's glowing and confirm the animation's iteration count is finite (3) and it ends in the keyframe's `100%` (no-glow) box-shadow state, not a snap-back to `0%`.
  - Toggle `prefers-reduced-motion` and confirm the badge still shows the semantic color (gold for urgent/qualify) even though the pulse itself is suppressed to a single near-instant iteration by the existing global override.
- **Done when**: any glowing badge pulses a handful of times and then holds steady, and a page with several glowing badges never looks like a continuously flashing wall.
