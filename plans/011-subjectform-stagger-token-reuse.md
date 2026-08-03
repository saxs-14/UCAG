# 011 — Reuse the .stagger-N tokens instead of reimplementing them inline

- **Status**: TODO
- **Commit**: 1522b53
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 file (`components/subject-form/SubjectForm.tsx`)

## Problem

`SubjectForm.tsx`'s elective slots hand-compute the same `40ms * index` stagger rhythm that `app/globals.css:309-314` already encodes as reusable `.stagger-1`..`.stagger-6` classes — the exact rhythm every other staggered list in the app consumes via class name (`components/bursaries/BursaryCard.tsx:15,22`, `components/bursaries/InternshipCard.tsx:15,19`, `components/statistics/StatChart.tsx:53,64/101`). This is a second, parallel implementation of the same value that can silently drift from the token if either is ever changed independently (e.g. if a future pass changes the stagger rhythm from 40ms to 50ms in `app/globals.css`, this one call site would keep using the old hardcoded 40ms without anyone noticing).

Current code, `components/subject-form/SubjectForm.tsx:260-264`:

```tsx
{electives.map((elective, index) => {
  const availableOptions = ELECTIVE_SUBJECTS.filter(
    (s) => s.code === elective.code || !selectedElectiveCodes.includes(s.code)
  );
  return (
    <div
      key={index}
      className="animate-pop-in flex flex-col gap-2 rounded-xl border border-line bg-paper p-3"
      style={{ animationDelay: `${Math.min(index, 5) * 40}ms` }}
    >
```

Existing tokens this should reuse instead, `app/globals.css:309-314`:

```css
.stagger-1 { animation-delay: 40ms; }
.stagger-2 { animation-delay: 80ms; }
.stagger-3 { animation-delay: 120ms; }
.stagger-4 { animation-delay: 160ms; }
.stagger-5 { animation-delay: 200ms; }
.stagger-6 { animation-delay: 240ms; }
```

## Target

Replace the inline `style={{ animationDelay: ... }}` with the same `Math.min(staggerIndex + 1, 6)` capping pattern and `` stagger-${n} `` class name every other list component already uses.

```tsx
/* target */
{electives.map((elective, index) => {
  const availableOptions = ELECTIVE_SUBJECTS.filter(
    (s) => s.code === elective.code || !selectedElectiveCodes.includes(s.code)
  );
  const stagger = Math.min(index + 1, 6);
  return (
    <div
      key={index}
      className={`stagger-${stagger} animate-pop-in flex flex-col gap-2 rounded-xl border border-line bg-paper p-3`}
    >
```

## Repo conventions to follow

- The `Math.min(n + 1, 6)` capping formula is the exact convention used everywhere else — copy it from `components/bursaries/BursaryCard.tsx:15` (`const stagger = Math.min(staggerIndex + 1, 6);`), not a new formula.
- Note the existing code here uses `Math.min(index, 5) * 40` (0-indexed, capped at 5, multiplied by 40 to get milliseconds) while the token-based convention elsewhere is `Math.min(index + 1, 6)` (1-indexed, capped at 6, used as a class suffix). Both produce the same maximum delay (200ms under the old formula vs 240ms under `stagger-6` — see the note in Steps about this small behavior change) — this is expected and fine, not a bug to preserve exactly.

## Steps

1. In `components/subject-form/SubjectForm.tsx`, inside the `electives.map((elective, index) => { ... })` callback (currently starting at line 255), add a `const stagger = Math.min(index + 1, 6);` line immediately after the existing `const availableOptions = ...` block (currently ends at line 258).
2. Change the `<div>` currently at lines 260-264 from:
   ```tsx
   <div
     key={index}
     className="animate-pop-in flex flex-col gap-2 rounded-xl border border-line bg-paper p-3"
     style={{ animationDelay: `${Math.min(index, 5) * 40}ms` }}
   >
   ```
   to:
   ```tsx
   <div
     key={index}
     className={`stagger-${stagger} animate-pop-in flex flex-col gap-2 rounded-xl border border-line bg-paper p-3`}
   >
   ```
   Note the small, intentional behavior change: the old formula produced delays of 0/40/80/120/160/200ms for electives 1-6 (`Math.min(index, 5) * 40`, 0-indexed); the new one produces 40/80/120/160/200/240ms (`stagger-1` through `stagger-6`, since `index` starts at 0 and `stagger = Math.min(index + 1, 6)`). The first elective now has a 40ms delay instead of 0ms — a negligible, unnoticeable difference, and the correct tradeoff for actually reusing the shared token instead of a parallel hand-typed formula.

## Boundaries

- Do NOT change `.stagger-1`..`.stagger-6` in `app/globals.css` — this plan only changes how `SubjectForm.tsx` consumes them, not the tokens themselves.
- Do NOT change anything else about the elective slot's rendering, the combobox, mark input, or add/remove logic in this file — motion-only.
- Do NOT touch any other `.map()` loop in this file (Home Language/First Additional Language/Mathematics have no stagger and aren't in scope here).
- If lines 255-264 don't match what's quoted above (drift since commit `1522b53`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck` (clean), `npm run lint` (clean), `npx vitest run` (full suite green).
- **Feel check**: run `npm run dev`, go to the calculator, and add a 4th elective (or reload with several already selected) — confirm the elective slots still visibly cascade in with a stagger, indistinguishable in feel from before (the ~40ms shift on the first item is not perceptible).
- **Done when**: `SubjectForm.tsx` no longer contains a hand-typed `animationDelay` style, and elective slots use the same `.stagger-N` class-based mechanism as every other staggered list in the app.
