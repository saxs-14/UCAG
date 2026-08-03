# 016 — Animate the destructive delete-account confirmation panel

- **Status**: TODO
- **Commit**: 1522b53
- **Severity**: (missed opportunity — additive, not corrective)
- **Category**: Missed opportunities
- **Estimated scope**: 1 file (`components/auth/AccountPage.tsx`)

## Problem

The delete-account confirmation panel — the one truly irreversible, high-stakes action in the app, POPIA-relevant per this project's own `CLAUDE.md` — appears and disappears via a bare `{!confirmingDelete ? (...) : (...)}` conditional with no transition at all. It's a rare, high-emotion moment (the exact kind AUDIT.md §8 says deserves some of the app's "delight/care budget"), currently rendered with none of it — just an abrupt swap between the trigger button and the confirmation box.

Current code, `components/auth/AccountPage.tsx:161-189`:

```tsx
{!confirmingDelete ? (
  <button
    type="button"
    onClick={() => setConfirmingDelete(true)}
    className="min-h-11 cursor-pointer rounded-xl border border-mark-red px-3 text-sm font-medium text-mark-red transition-colors hover:bg-mark-red-soft"
  >
    {LABELS.account.deleteAccountButton}
  </button>
) : (
  <div className="flex w-full flex-col gap-2 rounded-xl border border-mark-red bg-mark-red-soft p-3">
    <p className="text-sm text-ink">{LABELS.account.deleteAccountConfirm}</p>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleDeleteAccount}
        className="min-h-11 cursor-pointer rounded-xl bg-mark-red px-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        {LABELS.account.deleteAccountConfirmButton}
      </button>
      <button
        type="button"
        onClick={() => setConfirmingDelete(false)}
        className="min-h-11 cursor-pointer rounded-xl border border-line px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-slate-soft"
      >
        {LABELS.account.deleteAccountCancelButton}
      </button>
    </div>
  </div>
)}
```

## Target

Give the confirmation panel itself an entrance when it appears — `.animate-pop-in` is the right choice here: it's a compact, card-like panel appearing in response to a direct click (the same category of moment `.animate-pop-in` is already used for elsewhere, e.g. `SubjectForm.tsx`'s elective slots). The trigger button swap itself doesn't need its own exit (it's replaced by the panel, not removed from an otherwise-static layout), so only the appearing side needs a class added.

```tsx
/* target */
{!confirmingDelete ? (
  <button
    type="button"
    onClick={() => setConfirmingDelete(true)}
    className="min-h-11 cursor-pointer rounded-xl border border-mark-red px-3 text-sm font-medium text-mark-red transition-colors hover:bg-mark-red-soft"
  >
    {LABELS.account.deleteAccountButton}
  </button>
) : (
  <div className="animate-pop-in flex w-full flex-col gap-2 rounded-xl border border-mark-red bg-mark-red-soft p-3">
    <p className="text-sm text-ink">{LABELS.account.deleteAccountConfirm}</p>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleDeleteAccount}
        className="min-h-11 cursor-pointer rounded-xl bg-mark-red px-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        {LABELS.account.deleteAccountConfirmButton}
      </button>
      <button
        type="button"
        onClick={() => setConfirmingDelete(false)}
        className="min-h-11 cursor-pointer rounded-xl border border-line px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-slate-soft"
      >
        {LABELS.account.deleteAccountCancelButton}
      </button>
    </div>
  </div>
)}
```

Note: if plan 008 (add press feedback to buttons) has already run against this file, the two `<button>` elements' `className` values inside this block will additionally include `active:scale-[0.97]` and slightly different `transition-*` property lists — that's expected and fine; this plan only adds `animate-pop-in` to the outer confirmation `<div>`, it doesn't touch the buttons' own classes at all.

## Repo conventions to follow

- `.animate-pop-in` is this repo's existing convention for a compact panel/card appearing in direct response to a click — no new keyframe needed.
- This plan does not need an exit animation for the confirmation panel on cancel, since clicking "Cancel" swaps it back to the trigger button (a different element entirely, not the same one shrinking away) — an instant swap back to the neutral, non-destructive state is an acceptable (arguably correct) asymmetry: entering a dangerous confirmation deserves a deliberate appearance; leaving it should feel immediate/safe, not slowed down. Do not add an exit transition here — that would be a case of the "asymmetric timing" AUDIT.md §4 actually wants (destructive-confirm phases animate in slower/more deliberately; backing out of danger should snap).

## Steps

1. In `components/auth/AccountPage.tsx`, change the confirmation panel's outer `<div>` (currently line 170):
   ```tsx
   <div className="flex w-full flex-col gap-2 rounded-xl border border-mark-red bg-mark-red-soft p-3">
   ```
   to:
   ```tsx
   <div className="animate-pop-in flex w-full flex-col gap-2 rounded-xl border border-mark-red bg-mark-red-soft p-3">
   ```

## Boundaries

- Do NOT add an exit animation for the "Cancel" path — see the reasoning in "Repo conventions to follow" above; this is a deliberate asymmetry, not an oversight to fix later.
- Do NOT touch the trigger button, the two inner buttons' `onClick` handlers, or `handleDeleteAccount`/`setConfirmingDelete` logic — purely a className addition on the outer confirmation panel.
- Do NOT touch any other section of `AccountPage.tsx` (saved marks, shortlist, sign-out/download buttons) — this plan is scoped to the delete-confirmation panel only.
- If `components/auth/AccountPage.tsx:161-189` doesn't match what's quoted above (accounting for plan 008 possibly having already changed the buttons' own classNames, per the note above), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck` (clean), `npm run lint` (clean), `npx vitest run` (full suite green).
- **Feel check**: run `npm run dev`, sign in, go to `/account`, and click "Delete my account" — confirm the confirmation panel now visibly pops in (scale+fade) instead of appearing instantly. Click "Cancel" and confirm it swaps back to the trigger button immediately, with no exit animation (that's the intended, deliberate asymmetry). Toggle `prefers-reduced-motion` and confirm the panel still appears correctly, just without the eased pop (global override).
- **Done when**: opening the delete-account confirmation visibly animates in; canceling out of it is instant.
