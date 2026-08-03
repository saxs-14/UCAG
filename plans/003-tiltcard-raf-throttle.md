# 003 — Throttle TiltCard's pointermove handler with requestAnimationFrame

- **Status**: TODO
- **Commit**: 1522b53
- **Severity**: MEDIUM-HIGH
- **Category**: Performance
- **Estimated scope**: 1 file (`components/TiltCard.tsx`)

## Problem

`TiltCard` drives a mouse-tracked 3D tilt by writing `el.style.transform` directly inside a `pointermove` handler, once per native event, with no batching. `pointermove` can fire far more often than the display's refresh rate on a fast mouse, so every fire schedules a style write that may never actually make it to a composited frame — wasted work, and a real risk of jank on lower-end devices under load. This component is used by every result card, bursary card, internship card, and stat chart card in the app (via `TiltCard` wrapping in `BursaryCard.tsx:23`, `InternshipCard.tsx:20`, `StatChart.tsx:75`), so the cost is paid on nearly every hover-capable surface in the product.

Current code, `components/TiltCard.tsx:21-29`:

```tsx
function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
  if (reduceMotionRef.current || e.pointerType !== "mouse") return;
  const el = ref.current;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const px = (e.clientX - rect.left) / rect.width - 0.5;
  const py = (e.clientY - rect.top) / rect.height - 0.5;
  el.style.transform = `perspective(800px) rotateX(${(-py * MAX_TILT_DEG).toFixed(2)}deg) rotateY(${(px * MAX_TILT_DEG).toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
}
```

## Target

Batch the style write into a `requestAnimationFrame` callback, keyed by a ref so at most one write is scheduled per frame regardless of how many `pointermove` events fire in between — the last known pointer position wins, older ones are simply overwritten before they're ever applied.

```tsx
/* target */
const rafRef = useRef<number | null>(null);
const pendingRef = useRef<{ px: number; py: number } | null>(null);

function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
  if (reduceMotionRef.current || e.pointerType !== "mouse") return;
  const el = ref.current;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const px = (e.clientX - rect.left) / rect.width - 0.5;
  const py = (e.clientY - rect.top) / rect.height - 0.5;
  pendingRef.current = { px, py };
  if (rafRef.current !== null) return;
  rafRef.current = requestAnimationFrame(() => {
    rafRef.current = null;
    const pending = pendingRef.current;
    if (!pending || !el) return;
    el.style.transform = `perspective(800px) rotateX(${(-pending.py * MAX_TILT_DEG).toFixed(2)}deg) rotateY(${(pending.px * MAX_TILT_DEG).toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
  });
}
```

`handlePointerLeave` must also cancel any pending frame so a stale tilt can never apply after the pointer has already left:

```tsx
/* target */
function handlePointerLeave() {
  if (rafRef.current !== null) {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }
  pendingRef.current = null;
  const el = ref.current;
  if (el) el.style.transform = "";
}
```

## Repo conventions to follow

- This file already uses `useRef` for `ref` and `reduceMotionRef` (`components/TiltCard.tsx:18-19`) — add the two new refs (`rafRef`, `pendingRef`) right next to them, same style, no new import needed (`useRef` is already imported at `TiltCard.tsx:3`).
- The component's existing gating logic (`reduceMotionRef.current || e.pointerType !== "mouse"`) must stay exactly where it is, at the top of `handlePointerMove`, before any of the new rAF scheduling — a reduced-motion or touch pointer should bail out before scheduling anything, not after.
- No other component in this repo currently uses `requestAnimationFrame` — this is a new pattern for the codebase, but it's the correct primitive per AUDIT.md §5 ("CSS (and WAAPI) beat rAF-based JS under load — use CSS for predetermined motion, JS/springs for dynamic and gesture-driven motion"); a continuously pointer-tracked tilt is exactly the "dynamic, gesture-driven" case rAF is for for.

## Steps

1. In `components/TiltCard.tsx`, add two new refs immediately after the existing `const reduceMotionRef = useRef(false);` (currently line 19):
   ```tsx
   const rafRef = useRef<number | null>(null);
   const pendingRef = useRef<{ px: number; py: number } | null>(null);
   ```
2. Replace the body of `handlePointerMove` (currently lines 21-29) with the target version above — keep the existing early-return guard (`if (reduceMotionRef.current || e.pointerType !== "mouse") return;`) as the very first line, unchanged.
3. Replace the body of `handlePointerLeave` (currently lines 31-34) with the target version above, which cancels any pending rAF and clears `pendingRef` before resetting `el.style.transform`.
4. Leave `handlePointerEnter` (currently lines 36-38) and the returned JSX (currently lines 40-50) completely unchanged.

## Boundaries

- Do NOT change `MAX_TILT_DEG`, the perspective/rotate/scale math itself, or the `transition-transform duration-150 ease-out` className on the wrapping `<div>` (currently line 46) — this plan only changes *how often* the transform gets written, not what it computes or how it eases back on leave.
- Do NOT add a throttle/debounce library — plain `requestAnimationFrame` is sufficient and matches AUDIT.md's own guidance.
- Do NOT touch any of `TiltCard`'s callers (`BursaryCard.tsx`, `InternshipCard.tsx`, `StatChart.tsx`) — this is fully internal to `TiltCard.tsx`.
- If `components/TiltCard.tsx`'s current structure doesn't match the code quoted above (drift since commit `1522b53`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck` (clean), `npm run lint` (clean), `npx vitest run` (full suite green — no existing test covers `TiltCard` directly, so this just confirms nothing else broke).
- **Feel check**: run `npm run dev`, open a page with several `TiltCard`-wrapped cards visible at once (e.g. `/bursaries` with results showing), then:
  - Move the mouse quickly across a card — the tilt should still track smoothly, with no visible stutter or lag introduced by the change (it should feel identical to before, since real displays only paint once per frame anyway — the fix removes wasted work, not visible fidelity).
  - Open Chrome DevTools' Performance panel, record a few seconds of fast mouse movement over a tilt card, and confirm there's no more than one style recalculation per animation frame (look for `Recalculate Style`/`Layout` entries clustering at the frame rate, not firing far more often than that).
  - Move the mouse onto a card and immediately off it in one fast motion — confirm the card's tilt resets to flat (`transform: ""`) and doesn't briefly "stick" at an angle from a stale queued frame.
  - Toggle `prefers-reduced-motion` in DevTools' Rendering panel, re-enter the card, and confirm no tilt applies at all (the existing `reduceMotionRef` gate should still fully suppress it, unaffected by this change).
- **Done when**: rapid mouse movement over any tilt card produces at most one `el.style.transform` write per animation frame, and leaving a card always cleanly resets it with no stale in-flight frame able to apply afterward.
