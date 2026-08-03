# 009 — Shorten the logomark's stroke-draw so it doesn't dominate every page load

- **Status**: TODO
- **Commit**: 1522b53
- **Severity**: LOW-MEDIUM
- **Category**: Easing & duration
- **Estimated scope**: 1 file (`components/Logo.tsx`) — no shared CSS change

## Problem

`.animate-draw-circle` (`app/globals.css:289-291`) runs for `700ms` with a `150ms` delay — about 850ms total. `components/CircledMark.tsx` uses this class legitimately for the actual APS score reveal, a rare, explanatory, once-per-results-render moment that's allowed a longer, more deliberate duration. But `components/Logo.tsx:44-53` uses the *same* class for the logomark's arc, rendered by `components/NavBar.tsx:31` — decorative header chrome present on literally every single page load and every client-side navigation. AUDIT.md's duration budget has no bucket for "chrome seen on every page" that runs anywhere near 850ms; this is squarely a "keep it fast" case, not a "can be longer" one (that exemption is explicitly for "marketing / explanatory" content, which a logomark isn't).

Current code, `components/Logo.tsx:44-53`:

```tsx
<path
  className="animate-draw-circle"
  style={{ "--circle-length": 70 } as React.CSSProperties}
  d="M 10.1,29.9 A 14,14 0 1 1 29.9,29.9"
  fill="none"
  stroke={`url(#${GRADIENT_ID})`}
  strokeWidth="4.5"
  strokeLinecap="round"
  strokeDasharray={70}
/>
```

Shared class it currently uses, `app/globals.css:289-291`:

```css
.animate-draw-circle {
  animation: draw-circle 700ms cubic-bezier(0.65, 0, 0.35, 1) 150ms both;
}
```

## Target

Give the logomark its own, much shorter draw — reusing the existing `draw-circle` `@keyframes` (same visual mechanic, just faster), not the shared `.animate-draw-circle` class, so `CircledMark`'s legitimate longer duration is completely unaffected.

```css
/* target — app/globals.css, added right after .animate-draw-circle (currently ends at line 291) */
.animate-draw-circle-fast {
  animation: draw-circle 350ms cubic-bezier(0.65, 0, 0.35, 1) both;
}
```

```tsx
/* target — components/Logo.tsx:44-53 */
<path
  className="animate-draw-circle-fast"
  style={{ "--circle-length": 70 } as React.CSSProperties}
  d="M 10.1,29.9 A 14,14 0 1 1 29.9,29.9"
  fill="none"
  stroke={`url(#${GRADIENT_ID})`}
  strokeWidth="4.5"
  strokeLinecap="round"
  strokeDasharray={70}
/>
```

350ms (half the original 700ms, no start delay) keeps the same easing curve and mechanic but reads as a quick flourish on load rather than a multi-beat reveal — appropriate for chrome seen on every navigation.

## Repo conventions to follow

- The `draw-circle` `@keyframes` itself (`app/globals.css:261-264`) is shared and correct for both use cases — this plan adds a second, faster utility class that reuses it, it does not duplicate or fork the keyframe.
- Keep the new class right next to `.animate-draw-circle` in `app/globals.css`'s existing "Motion" section, same as every other utility class in that block.
- `both` fill-mode is correct here, unchanged from the original — `stroke-dashoffset` (not `transform`) is what's animated, so this carries none of the stacking-context risk that motivated switching `.animate-rise-in`/`.animate-pop-in` away from `both` earlier this session.

## Steps

1. In `app/globals.css`, immediately after the `.animate-draw-circle { ... }` rule (currently lines 289-291), add:
   ```css
   .animate-draw-circle-fast {
     animation: draw-circle 350ms cubic-bezier(0.65, 0, 0.35, 1) both;
   }
   ```
2. In `components/Logo.tsx`, change the `className="animate-draw-circle"` on the `<path>` element (currently line 45) to `className="animate-draw-circle-fast"`. Leave every other prop on that element (the `style`, `d`, `stroke`, `strokeWidth`, `strokeLinecap`, `strokeDasharray`) exactly as they are.

## Boundaries

- Do NOT change `.animate-draw-circle` itself, or anything in `components/CircledMark.tsx` — `CircledMark`'s use of the original 700ms class is correct and explicitly out of scope (it's the "rare, explanatory" exception AUDIT.md allows a longer duration for).
- Do NOT change the `draw-circle` `@keyframes` definition — both classes should share it, just with different `animation` shorthand values.
- Do NOT touch the logomark's gradient, marker dot, or any other part of `Logo.tsx` — this plan changes one `className` value and adds one new CSS rule.
- If `components/Logo.tsx:44-53` or `app/globals.css:289-291` don't match what's quoted above (drift since commit `1522b53`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck` (clean), `npm run lint` (clean), `npx vitest run` (full suite green).
- **Feel check**: run `npm run dev`, reload any page (or click between nav links to trigger a fresh mount of `NavBar`'s `Logo`):
  - The logomark's arc should draw in noticeably faster than before — a quick flourish, not a multi-beat reveal you have to wait out.
  - Navigate to a results page with a qualifying programme and confirm `CircledMark`'s own stroke-draw (the actual APS score) is completely unaffected — still its original, slower, more deliberate pace.
  - In Chrome DevTools' Animations panel, select the logomark's animated path and confirm its duration reads ~350ms, while a `CircledMark` on the same page reads ~700ms.
  - Toggle `prefers-reduced-motion` and confirm the logomark still renders its full arc (just collapsed to near-instant by the global override), not a partially-drawn stub.
- **Done when**: the header logomark's draw noticeably finishes faster on every page load, while `CircledMark`'s score reveal elsewhere in the app is unchanged.
