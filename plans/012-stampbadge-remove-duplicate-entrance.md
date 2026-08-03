# 012 — Stop StampBadge from doubling motion inside an already-animating card

- **Status**: TODO
- **Commit**: 1522b53
- **Severity**: LOW
- **Category**: Purpose & frequency
- **Estimated scope**: 1 file (`components/StampBadge.tsx`)

## Problem

Every card that renders a `StampBadge` already wraps itself in `.animate-rise-in` (e.g. `components/bursaries/BursaryCard.tsx:22`'s `<div className={`stagger-${stagger} animate-rise-in`}>`, `components/statistics/StatChart.tsx:74`'s `<div className={`stagger-${stagger} animate-rise-in`}>`). `StampBadge` itself independently plays its own `.animate-pop-in` bounce on mount (`components/StampBadge.tsx:25`), which fires at the same moment as the parent card's own entrance — two different keyframes, two different easings, animating in on top of each other on one mount event, adding motion without adding information (the badge doesn't need to announce itself separately from the card it's already part of).

Current code, `components/StampBadge.tsx:22-41`:

```tsx
export function StampBadge({ variant = "teal", label = "Verified" }: StampBadgeProps) {
  return (
    <span
      className={`animate-pop-in inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${VARIANT_BG[variant]}`}
      role="img"
      aria-label={label}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5">
        <path
          d="M4 13l4.5 5L20 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
```

## Target

Drop the badge's own `.animate-pop-in` — let the parent card's `.animate-rise-in` carry the whole card (badge included) in as one single, coherent motion instead of two competing ones.

```tsx
/* target */
export function StampBadge({ variant = "teal", label = "Verified" }: StampBadgeProps) {
  return (
    <span
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${VARIANT_BG[variant]}`}
      role="img"
      aria-label={label}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5">
        <path
          d="M4 13l4.5 5L20 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
```

## Repo conventions to follow

- Every card that uses `StampBadge` already provides its own entrance wrapper (`.animate-rise-in`, sometimes with a `.stagger-N` class) — confirm this holds for every call site before removing the badge's own animation (see Steps).

## Steps

1. In `components/StampBadge.tsx`, remove `animate-pop-in` from the template-literal className on the outer `<span>` (currently line 25):
   ```tsx
   className={`animate-pop-in inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${VARIANT_BG[variant]}`}
   ```
   becomes:
   ```tsx
   className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${VARIANT_BG[variant]}`}
   ```
2. Before finishing, grep the repo for every usage of `<StampBadge` (expected call sites: `components/bursaries/BursaryCard.tsx:27`, `components/bursaries/InternshipCard.tsx:24`, `components/statistics/StatChart.tsx:78`) and confirm each one's containing element already has `animate-rise-in` in its own className. If any call site renders a `StampBadge` with no animated parent at all, flag that specific call site in your report rather than silently leaving it un-animated — it would need its own entrance added, which is out of scope for this plan.

## Boundaries

- Do NOT touch any parent component's `animate-rise-in`/`.stagger-N` classes — this plan only removes the badge's own, separate entrance.
- Do NOT change the badge's checkmark icon, colors, or `VARIANT_BG` mapping — motion only.
- Do NOT touch `components/statistics/StatChart.tsx`'s gold "pending verification" clock icon badge (added in an earlier session, not a `StampBadge` instance) — this plan is scoped to the `StampBadge` component itself.
- If `components/StampBadge.tsx:22-41` doesn't match what's quoted above (drift since commit `1522b53`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck` (clean), `npm run lint` (clean), `npx vitest run` (full suite green).
- **Feel check**: run `npm run dev`, go to `/bursaries` or `/statistics` with verified data showing, and watch a card containing a `StampBadge` mount (e.g. by changing a filter that remounts the list, or on initial page load):
  - The badge should now appear as part of the card's single `rise-in` motion, not with its own separate bounce layered on top.
  - Confirm the badge's checkmark is still fully visible and correctly colored once the card has settled — this plan removes an entrance animation, not the badge's appearance.
- **Done when**: a card containing a `StampBadge` mounts with one coherent motion (the card's own `rise-in`), not two overlapping animations.
