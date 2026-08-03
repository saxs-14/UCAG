# 005 — Stop the simulator's CircledMark from thrashing on every keystroke

- **Status**: TODO
- **Commit**: 1522b53
- **Severity**: MEDIUM
- **Category**: Interruptibility
- **Estimated scope**: 1 file (`components/results/ApsImprovementSimulator.tsx`)

## Problem

`ApsImprovementSimulator`'s "what if" delta preview conditionally renders a `CircledMark` only when `delta !== 0`. `delta` recomputes on every keystroke in the "New mark" number input (no debounce anywhere in this file), so as a learner types past the value that exactly cancels out the current score (or edits digit-by-digit, e.g. typing "8" then "0" to reach "80" and passing through intermediate states), `delta` can cross zero repeatedly within a few hundred milliseconds. Each crossing unmounts/remounts `CircledMark`, which restarts its `@keyframes`-based entrance (`animate-draw-circle`, and `animate-soft-glow` when `variant="qualify"`) from zero every single time — a visibly flickering, restarting badge on a control the learner is actively interacting with.

Current code, `components/results/ApsImprovementSimulator.tsx:213-220`:

```tsx
{delta !== 0 && (
  <CircledMark
    value={`${delta > 0 ? "+" : ""}${delta}`}
    variant={delta > 0 ? "qualify" : "almost"}
    size="sm"
    label={`${delta > 0 ? "Gains" : "Loses"} ${Math.abs(delta)} APS points`}
  />
)}
```

## Target

Debounce only the *hiding* transition (`delta` going to exactly `0`), not the number itself — the "Current"/"Simulated" score numbers just above this (lines 199-212) must stay perfectly live and undebounced, since they're plain text with no animation cost. Only the decision of whether `CircledMark` is mounted at all should have a short grace period before it unmounts, so a momentary zero-crossing mid-keystroke doesn't tear it down and immediately rebuild it.

```tsx
/* target */
const [showDeltaMark, setShowDeltaMark] = useState(delta !== 0);

useEffect(() => {
  if (delta !== 0) {
    setShowDeltaMark(true);
    return;
  }
  const timeout = window.setTimeout(() => setShowDeltaMark(false), 250);
  return () => window.clearTimeout(timeout);
}, [delta]);

// ...later, in the JSX, replace the existing conditional:
{showDeltaMark && delta !== 0 && (
  <CircledMark
    value={`${delta > 0 ? "+" : ""}${delta}`}
    variant={delta > 0 ? "qualify" : "almost"}
    size="sm"
    label={`${delta > 0 ? "Gains" : "Loses"} ${Math.abs(delta)} APS points`}
  />
)}
```

Reasoning for the `showDeltaMark && delta !== 0` (not just `showDeltaMark`) double condition: if `delta` goes from `+5` straight to `-3` (crossing zero within one keystroke, never actually resting at exactly `0`), `showDeltaMark` never flips false, `CircledMark` never unmounts, and its `value`/`variant` props just update in place — no keyframe replay, which is correct (this isn't the "rapid toggle" case AUDIT.md is about, it's a normal prop update). The `delta !== 0` guard in the render only ever matters for the brief window while the 250ms hide-timeout is pending after `delta` genuinely settles at `0`.

## Repo conventions to follow

- This file already imports `useEffect`, `useMemo`, `useState` from React (`components/results/ApsImprovementSimulator.tsx:3`) — no new import needed for the `useState`/`useEffect` used here.
- This file already has one precedent for "track a value across renders with a grace/override condition" — the existing `userEditedTarget` state and its effect (currently lines 78, 82-93) — follow the same plain-`useState`-plus-`useEffect` style, not a new abstraction (no custom debounce hook).
- No motion library exists in this repo — this is a state-timing fix, not an animation-library fix.

## Steps

1. In `components/results/ApsImprovementSimulator.tsx`, immediately after the line `const delta = simulatedApsResult.score - currentApsResult.score;` (currently line 124), add:
   ```tsx
   const [showDeltaMark, setShowDeltaMark] = useState(delta !== 0);
   ```
   Note: this line must come after the early-return guard at lines 120-122 (`if (marks.length === 0 || !apsRule || ...) return null;`), same as `delta` itself already does — do not move it above that guard.
2. Immediately after that, add the debounce effect:
   ```tsx
   useEffect(() => {
     if (delta !== 0) {
       setShowDeltaMark(true);
       return;
     }
     const timeout = window.setTimeout(() => setShowDeltaMark(false), 250);
     return () => window.clearTimeout(timeout);
   }, [delta]);
   ```
3. Change the conditional render (currently lines 213-220) from `{delta !== 0 && (` to `{showDeltaMark && delta !== 0 && (` — keep everything else in that block (the `CircledMark` props) exactly as it is.

## Boundaries

- Do NOT add debouncing to `targetMark`, `handleTargetMarkChange`, or any of the score-number displays (lines 199-212) — those must stay instantly responsive to every keystroke. This plan only delays `CircledMark`'s unmount, nothing else.
- Do NOT touch `CircledMark.tsx` itself (that component's own `animate-soft-glow` overuse is a separate finding/plan) — this plan only changes when the simulator mounts/unmounts it.
- Do NOT change the 250ms figure to something else without re-checking AUDIT.md — 250ms is chosen here as "long enough to survive a fast keystroke, short enough that a genuine settle-at-zero doesn't feel laggy," not copied from a specific AUDIT.md value (there is no exact rubric number for this specific case — flag this in your verification pass rather than treating it as gospel).
- If the code around lines 120-124 or 213-220 doesn't match what's quoted above (drift since commit `1522b53`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck` (clean), `npm run lint` (clean), `npx vitest run` (full suite green — no existing test covers this component directly).
- **Feel check**: run `npm run dev`, get to a results page with at least one scored programme, open "What if I improve a subject?", and:
  - Slowly drag/type the "New mark" value through the point where the current and simulated scores are equal — confirm the delta `CircledMark` disappears smoothly (not mid-flicker) and doesn't reappear-then-vanish repeatedly as you hover near that exact value.
  - Type a value that changes the mark by a large amount in one edit (e.g. clear the field and type a new two-digit number) — confirm the `CircledMark` appears once, cleanly, with its normal entrance animation, not a stutter.
  - In Chrome DevTools' Animations panel, set playback to 10% while triggering a genuine appearance and confirm the `draw-circle` entrance plays once, smoothly, start to finish.
  - Toggle `prefers-reduced-motion` and confirm the mark still appears/disappears correctly (the global CSS override collapses the animation itself; this plan's 250ms `setTimeout` is a real JS delay independent of that override — confirm it doesn't feel newly "stuck" with reduced motion on).
- **Done when**: rapidly editing the "what if" mark near the delta's zero-crossing point never visibly restarts the `CircledMark`'s entrance animation mid-flicker.
