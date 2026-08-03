# 014 — Give elective removal an exit to match its entrance

- **Status**: TODO
- **Commit**: 1522b53
- **Severity**: (missed opportunity — additive, not corrective)
- **Category**: Missed opportunities
- **Estimated scope**: 1 file (`components/subject-form/SubjectForm.tsx`)

## Problem

Adding a 4th elective plays a deliberate `.animate-pop-in` entrance (the elective slot's own `className`, currently `components/subject-form/SubjectForm.tsx:262`). Clicking "Remove" on any elective instantly filters it out of the `electives` array with zero exit transition — an asymmetric teleport in the app's core, very-high-frequency form: something the learner deliberately added with a visible flourish just disappears without one when removed.

Current code, `components/subject-form/SubjectForm.tsx:146-149` (the removal itself):

```tsx
function removeElective(index: number) {
  if (electives.length <= MIN_ELECTIVES) return;
  setElectives((prev) => prev.filter((_, i) => i !== index));
}
```

Current entrance it's asymmetric against, `components/subject-form/SubjectForm.tsx:260-264`:

```tsx
<div
  key={index}
  className="animate-pop-in flex flex-col gap-2 rounded-xl border border-line bg-paper p-3"
  style={{ animationDelay: `${Math.min(index, 5) * 40}ms` }}
>
```

## Target

Track a "removing" index, apply a brief exit animation to that specific slot, and only actually remove it from the `electives` array after the exit finishes — mirroring the entrance's own scale+fade, in reverse.

```css
/* target — app/globals.css, added right after .animate-pop-in (currently ends line 283) */
@keyframes pop-out {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.92); }
}

.animate-pop-out {
  animation: pop-out 200ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
```

```tsx
/* target — SubjectForm.tsx, shape of the change (see Steps for exact diff) */
const [removingIndex, setRemovingIndex] = useState<number | null>(null);

function removeElective(index: number) {
  if (electives.length <= MIN_ELECTIVES) return;
  setRemovingIndex(index);
  window.setTimeout(() => {
    setElectives((prev) => prev.filter((_, i) => i !== index));
    setRemovingIndex(null);
  }, 200);
}
```

```tsx
/* target — the elective slot's className gains a conditional exit class */
className={`${removingIndex === index ? "animate-pop-out" : "animate-pop-in"} flex flex-col gap-2 rounded-xl border border-line bg-paper p-3`}
```

## Repo conventions to follow

- `.animate-pop-in`'s existing keyframe/easing (`app/globals.css:251-254`, `cubic-bezier(0.34, 1.56, 0.64, 1)`) is the exact curve to mirror for the exit — same personality, reversed direction, not a new easing choice.
- This repo's existing precedent for "hold state during an exit, then commit the real removal" is `components/results/ConfettiBurst.tsx`'s parent-side `setTimeout` (see `components/results/ResultsSection.tsx`'s `celebrate` state) — follow that plain-`useState`-plus-`setTimeout` style, no new library.
- `both` fill-mode on the new `.animate-pop-out` class matches the existing (unfixed-because-safe) precedent of `.animate-draw-circle`/`.animate-confetti` still using `both` for animations that need their end-state held briefly before removal — this is fine here since the element unmounts immediately after, so there's no lingering-transform/stacking-context risk (nothing else needs to render on top of it during that ~200ms window).

## Steps

1. In `app/globals.css`, immediately after the `.animate-pop-in { ... }` rule (currently lines 281-283), add:
   ```css
   @keyframes pop-out {
     from { opacity: 1; transform: scale(1); }
     to { opacity: 0; transform: scale(0.92); }
   }

   .animate-pop-out {
     animation: pop-out 200ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
   }
   ```
2. In `components/subject-form/SubjectForm.tsx`, add a new state variable right after the existing `electives` state (currently ends at line 79):
   ```tsx
   const [removingIndex, setRemovingIndex] = useState<number | null>(null);
   ```
3. Replace `removeElective` (currently lines 146-149):
   ```tsx
   function removeElective(index: number) {
     if (electives.length <= MIN_ELECTIVES) return;
     setElectives((prev) => prev.filter((_, i) => i !== index));
   }
   ```
   with:
   ```tsx
   function removeElective(index: number) {
     if (electives.length <= MIN_ELECTIVES) return;
     setRemovingIndex(index);
     window.setTimeout(() => {
       setElectives((prev) => prev.filter((_, i) => i !== index));
       setRemovingIndex(null);
     }, 200);
   }
   ```
4. In the elective-slot render (currently lines 260-264, after plan 011's stagger-token change has already replaced the inline `style`/`animationDelay` — if plan 011 hasn't run yet, apply this step against whichever version of the className you find, keeping whatever stagger mechanism is currently present alongside the new conditional entrance/exit class), change the className to conditionally use `animate-pop-out` while `removingIndex === index`:
   ```tsx
   className={`${removingIndex === index ? "animate-pop-out" : "animate-pop-in"} flex flex-col gap-2 rounded-xl border border-line bg-paper p-3`}
   ```
   (If plan 011 already ran, prepend the existing `` stagger-${stagger} `` the same way it's already composed with `animate-pop-in`, e.g. `` `${removingIndex === index ? "animate-pop-out" : `stagger-${stagger} animate-pop-in`}` `` — the key requirement is that a removing slot gets `animate-pop-out` and nothing else, since it no longer needs a stagger delay on its way out.)
5. Also disable the "Remove" button itself while its own slot is mid-exit, so a rapid double-click can't re-trigger the timeout: in the "Remove" button (currently lines 279-286), add `disabled={removingIndex === index}` alongside its existing `onClick`.

## Boundaries

- Do NOT change `addElective`, `updateElective`, `MIN_ELECTIVES`/`MAX_ELECTIVES`, or anything about how electives are added or edited — this plan only adds an exit path to removal.
- Do NOT change the 200ms figure without also updating the `setTimeout` delay to match — they must stay equal so the element is never visibly removed before its exit animation finishes, and never lingers after.
- Do NOT touch `SubjectCombobox.tsx` inside the elective slot — the combobox's own open/close motion is a separate plan (001).
- If `components/subject-form/SubjectForm.tsx`'s current structure around lines 79, 146-149, 260-264, or 279-286 doesn't match what's described (accounting for plan 011 possibly having already run, per Step 4's note), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck` (clean), `npm run lint` (clean), `npx vitest run` (full suite green).
- **Feel check**: run `npm run dev`, go to the calculator, add a 4th elective, then click "Remove" on any elective slot:
  - Confirm the slot visibly shrinks/fades out over ~200ms instead of vanishing instantly.
  - Confirm clicking "Remove" a second time on the same slot mid-exit does nothing (the button should be disabled during its own removal).
  - Confirm the remaining elective slots reflow into place only after the removed one has actually left (React only removes it from the array once the timeout fires) — there should be no layout jump happening simultaneously with the fade.
  - In Chrome DevTools' Animations panel, set playback to 10% and confirm the exit is the `pop-in` keyframe played in reverse (shrink + fade), not a different motion.
  - Toggle `prefers-reduced-motion` and confirm removal still works correctly and near-instantly (the global override collapses the animation duration; the `setTimeout(..., 200)` in the JS is a separate, fixed real delay — confirm it doesn't feel newly sluggish relative to the now-instant visual).
- **Done when**: removing an elective visibly mirrors the entrance it got when added, instead of teleporting away.
