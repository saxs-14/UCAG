# 013 — Animate the requirement checkmark/cross color change

- **Status**: TODO
- **Commit**: 1522b53
- **Severity**: (missed opportunity — additive, not corrective)
- **Category**: Missed opportunities
- **Estimated scope**: 1 file (`components/results/ResultCard.tsx`)

## Problem

`ResultCard`'s requirement list is the app's core feedback loop: a learner edits a subject mark in the calculator, `ResultsSection` recomputes `matchResult`, and each requirement's glyph/color should reflect whether it's now met. Right now that glyph teleports — no transition at all — from `✗`/gold to `✓`/green (or back) the instant the underlying data changes. This is exactly the "state change that teleports" AUDIT.md §8 asks to look for: a brief color transition here would make cause-and-effect ("I fixed my Maths mark, and now this requirement shows met") visibly connected instead of an instant, easy-to-miss flip.

Current code, `components/results/ResultCard.tsx:192-207`:

```tsx
<ul className="flex flex-col gap-1 text-sm">
  {matchResult.reasons.map((reason, i) => {
    const met = "met" in reason ? reason.met : false;
    return (
      <li key={i} className="flex items-start gap-2">
        <span aria-hidden className={met ? "text-mark-green" : "text-mark-gold"}>
          {met ? "✓" : "✗"}
        </span>
        <span className="text-ink">{reasonText(reason)}</span>
      </li>
    );
  })}
  {matchResult.reasons.length === 0 && (
    <li className="text-ink-faint">No specific requirements on record for this programme.</li>
  )}
</ul>
```

## Target

Add a color transition to the glyph span, using this repo's existing `--ease-out`-equivalent duration convention for small state changes (100–160ms per AUDIT.md's "button press feedback" bucket — this is the same class of small, frequent, purely-color feedback, not an entrance/exit).

```tsx
/* target */
<span aria-hidden className={`transition-colors duration-150 ${met ? "text-mark-green" : "text-mark-gold"}`}>
  {met ? "✓" : "✗"}
</span>
```

## Repo conventions to follow

- `duration-150` is already this repo's convention for small interactive-feedback transitions (`components/TiltCard.tsx:46`, and the `duration-150 ease-out` pattern plans 003/008 introduce elsewhere in this same audit series) — reuse it rather than picking a new number.
- Plain `transition-colors` (Tailwind's built-in color-properties shorthand, not `transition-all`) is already used throughout this codebase for exactly this kind of small feedback (e.g. `components/subject-form/SubjectForm.tsx:168`'s `transition-colors` on the Home Language select) — follow that, don't introduce `transition-all`.

## Steps

1. In `components/results/ResultCard.tsx`, change the glyph `<span>` (currently line 197):
   ```tsx
   <span aria-hidden className={met ? "text-mark-green" : "text-mark-gold"}>
   ```
   to:
   ```tsx
   <span aria-hidden className={`transition-colors duration-150 ${met ? "text-mark-green" : "text-mark-gold"}`}>
   ```

## Boundaries

- Do NOT change the `✓`/`✗` glyphs themselves, the `reasonText(reason)` call, or anything about how `met` is computed — purely a transition addition on the existing color classes.
- Do NOT add `transition-all` — only `transition-colors`.
- Do NOT touch the sibling `<span className="text-ink">{reasonText(reason)}</span>` — only the glyph span needs this.
- If `components/results/ResultCard.tsx:192-207` doesn't match what's quoted above (drift since commit `1522b53`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck` (clean), `npm run lint` (clean), `npx vitest run` (full suite green).
- **Feel check**: run `npm run dev`, get to the calculator with a programme showing at least one unmet requirement, then edit the relevant subject's mark so that requirement becomes met — confirm the glyph now visibly, briefly transitions color (green fading in) instead of instantly flipping. Toggle `prefers-reduced-motion` and confirm the color still changes, just without an eased transition (the global override collapses the duration, it doesn't remove the color feedback — this is exactly the "keep opacity/color, drop movement" case AUDIT.md §6 describes, and there's no movement here to drop in the first place).
- **Done when**: a requirement's checkmark/cross visibly eases between its met/unmet colors instead of snapping instantly.
