# 001 — Fix SubjectCombobox dropdown's duration, origin, and missing exit

- **Status**: TODO
- **Commit**: 1522b53
- **Severity**: HIGH
- **Category**: Easing & duration / Physicality & origin / Cohesion & tokens
- **Estimated scope**: 2 files (`app/globals.css`, `components/subject-form/SubjectCombobox.tsx`)

## Problem

`components/subject-form/SubjectCombobox.tsx` renders the subject-picker dropdown used for Home Language, First Additional Language, and each elective slot in the APS calculator — the core, most-repeated UI in the entire app (a learner opens this up to ~7 times filling in one form). Three real problems compound on the same element:

1. **Wrong easing/duration for a dropdown.** It uses `.animate-pop-in`, a 360ms *bouncy overshoot* curve meant for compact delight moments (badges, chat bubbles) — not the workhorse control of the app's core task. AUDIT.md's duration budget for "Dropdowns, selects" is 150–250ms.
2. **Wrong transform origin.** The list is anchored directly below its trigger input, but scales from `center` (the keyframe's default) because no `transform-origin` is set anywhere.
3. **No exit animation at all.** Closing is an instant unmount (`{isOpen && (...)}`), so re-opening/closing rapidly (e.g. tabbing between elective slots) has no interruptibility story.

Current code, `components/subject-form/SubjectCombobox.tsx:165-170`:

```tsx
{isOpen && (
  <ul
    id={`combobox-listbox-${label}`}
    role="listbox"
    className="animate-pop-in absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-line bg-paper-raised shadow-lg"
  >
```

Current keyframe it uses, `app/globals.css:281-283`:

```css
.animate-pop-in {
  animation: pop-in 360ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}
```

## Target

A dedicated, restrained entrance for this dropdown — no bounce, 200ms, scaling from the top edge (where the trigger is) instead of center — plus a real exit that fades/shrinks out instead of vanishing.

This plan introduces two shared easing tokens this repo doesn't have yet (the raw cubic-beziers are currently hand-typed per keyframe). Add them once; later plans in this series reuse them instead of hand-typing again.

```css
/* target — app/globals.css, inside the existing @theme block (after --font-display) */
@theme {
  /* ...existing tokens... */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
}
```

```css
/* target — app/globals.css, new keyframe + class, placed right after .animate-pop-in (currently ending app/globals.css:283) */
@keyframes dropdown-in {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.animate-dropdown {
  transform-origin: top;
  animation: dropdown-in 200ms var(--ease-out) both;
}
```

```tsx
/* target — components/subject-form/SubjectCombobox.tsx:165-170 */
{isOpen && (
  <ul
    id={`combobox-listbox-${label}`}
    role="listbox"
    className="animate-dropdown absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-line bg-paper-raised shadow-lg"
  >
```

Note this uses `both`, not `backwards` — unlike `.animate-rise-in`/`.animate-pop-in` (which were switched away from `both` earlier this session to fix a stacking-context bug), `scale(1)` persisting after this animation is fine here: the dropdown fully unmounts on close (see the exit step below), so there's no sibling-trapping risk, and `both`'s forward-fill avoids a one-frame flash back to `scale(0.96)` if this ever re-renders while still open.

For the exit: since this is a plain conditional (`{isOpen && (...)}`) with no unmount-transition library, the minimal correct fix is a `data-closing` state held for one animation-duration before the element actually unmounts. Target:

```tsx
/* target shape — see Steps for the exact diff */
const [isOpen, setIsOpen] = useState(false);
const [isClosing, setIsClosing] = useState(false);

function closeList() {
  setIsClosing(true);
  window.setTimeout(() => {
    setIsOpen(false);
    setIsClosing(false);
  }, 150);
}
```

```css
/* target — app/globals.css, sits next to .animate-dropdown */
@keyframes dropdown-out {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.96); }
}

.animate-dropdown-out {
  transform-origin: top;
  animation: dropdown-out 150ms var(--ease-out) both;
}
```

## Repo conventions to follow

- Keyframes + their utility class live together in `app/globals.css`'s "Motion" section (`app/globals.css:238` onward) — add `dropdown-in`/`dropdown-out`/`.animate-dropdown`/`.animate-dropdown-out` there, immediately after the existing `.animate-pop-in` block, not in a new file.
- `--ease-out`/`--ease-in-out` go in the existing `@theme { }` block at the top of `app/globals.css` (currently ends at line 121 with `--font-display: var(--font-sans);`) — add them as the last two entries, not a new `:root` block.
- This repo has no motion library — everything is plain CSS classes toggled by React state, exactly like the rest of `SubjectCombobox.tsx` already does with `isOpen`. Don't introduce a transition library for the exit animation; the `isClosing` + `setTimeout` pattern matches the codebase's existing style (see `components/results/ConfettiBurst.tsx`'s own `setTimeout`-based cleanup for the closest precedent in this repo).
- The global `@media (prefers-reduced-motion: reduce)` override in `app/globals.css:323-330` already collapses any `animation-duration` to near-zero — no additional reduced-motion handling needed in this component; the `setTimeout(..., 150)` in the exit logic should be read from a constant so it can't silently drift from the CSS duration (see Steps).

## Steps

1. In `app/globals.css`, inside the existing `@theme { ... }` block, immediately after the line `--font-display: var(--font-sans);` (currently line 120), add:
   ```css
   --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
   --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
   ```

2. In `app/globals.css`, immediately after the `.animate-pop-in { ... }` block (currently `app/globals.css:281-283`), add:
   ```css
   @keyframes dropdown-in {
     from { opacity: 0; transform: scale(0.96); }
     to { opacity: 1; transform: scale(1); }
   }

   @keyframes dropdown-out {
     from { opacity: 1; transform: scale(1); }
     to { opacity: 0; transform: scale(0.96); }
   }

   .animate-dropdown {
     transform-origin: top;
     animation: dropdown-in 200ms var(--ease-out) both;
   }

   .animate-dropdown-out {
     transform-origin: top;
     animation: dropdown-out 150ms var(--ease-out) both;
   }
   ```

3. In `components/subject-form/SubjectCombobox.tsx`, add a constant near the top of the file (after the existing `optionDomId` helper, currently lines 22-24):
   ```tsx
   const DROPDOWN_EXIT_MS = 150;
   ```

4. In the same file, change `const [isOpen, setIsOpen] = useState(false);` (currently line 30) to also track a closing flag:
   ```tsx
   const [isOpen, setIsOpen] = useState(false);
   const [isClosing, setIsClosing] = useState(false);
   ```

5. Add a `closeList` helper near `handleBlur` (currently `app/components/subject-form/SubjectCombobox.tsx:123-126`):
   ```tsx
   function closeList() {
     setIsClosing(true);
     window.setTimeout(() => {
       setIsOpen(false);
       setIsClosing(false);
     }, DROPDOWN_EXIT_MS);
   }
   ```

6. Replace every direct `setIsOpen(false)` call that closes the list (in `handleBlur`, in `handleSelect`, and in the `Escape` case of `handleKeyDown`) with `closeList()` instead. Do NOT change the `setIsOpen(true)` calls that open it (in `onFocus` and in the not-open branch of `handleKeyDown`) — only closes route through the new helper.

7. Change the conditional render (currently lines 165-170) to stay mounted while closing, and swap the class:
   ```tsx
   {(isOpen || isClosing) && (
     <ul
       id={`combobox-listbox-${label}`}
       role="listbox"
       className={`absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-line bg-paper-raised shadow-lg ${
         isClosing ? "animate-dropdown-out" : "animate-dropdown"
       }`}
     >
   ```

## Boundaries

- Do NOT touch `.animate-pop-in`/`.animate-rise-in` or any other existing keyframe — this plan adds new ones, it doesn't repurpose old ones.
- Do NOT change the combobox's keyboard navigation, filtering, or selection logic (`handleKeyDown`, `moveHighlight`, `handleSelect`, the `grouped`/`flatOptions` memos) — motion only.
- Do NOT touch `SubjectCombobox.tsx`'s parent (`components/subject-form/SubjectForm.tsx`) — the combobox's own open/close state is fully internal.
- Do NOT add a new dependency (no Framer Motion, no `@radix-ui/react-*`) — the `isClosing` + `setTimeout` pattern is sufficient and matches the repo's existing style.
- If `SubjectCombobox.tsx`'s current structure around lines 30, 123-126, or 165-170 doesn't match what's quoted above (drift since commit `1522b53`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck` (clean), `npm run lint` (clean), `npx vitest run` (full suite still green — this component has no dedicated unit test today, so this just confirms nothing else broke).
- **Feel check**: run `npm run dev`, open the calculator, click into any elective's search box:
  - The list should visibly grow downward from the input (top edge), not expand outward from its own center.
  - No bounce/overshoot on open — it should ease in cleanly within ~200ms.
  - Click an option (or click elsewhere to blur): the list should fade/shrink out over ~150ms, not vanish instantly.
  - Open and immediately click elsewhere several times in a row (rapid open/close) — the exit should never look like it "restarts" mid-fade or leaves a stuck half-visible list.
  - In Chrome DevTools' Animations panel, set playback to 10% and confirm the origin point is the top edge, not the center.
  - Toggle `prefers-reduced-motion` in DevTools' Rendering panel and confirm the list still opens/closes correctly (no lingering half-open state), just without the eased scale/opacity motion.
- **Done when**: opening/closing any subject combobox in the app shows a top-anchored, ~200ms-in/~150ms-out fade+scale with no bounce, and rapid re-triggering never breaks or restarts oddly.
