# 006 — Respect prefers-reduced-motion for ChatWidget's auto-scroll

- **Status**: TODO
- **Commit**: 1522b53
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 file (`components/chat/ChatWidget.tsx`)

## Problem

`app/globals.css`'s global reduced-motion override (`app/globals.css:323-330`) forces `scroll-behavior: auto !important` on every element — but that CSS property only takes effect when a scroll is triggered *without* an explicit `behavior` argument. `ChatWidget.tsx` calls `Element.scrollTo()` with `behavior: "smooth"` passed explicitly in JavaScript, which per spec overrides the element's computed `scroll-behavior` entirely. This is exactly the gap AUDIT.md §6 calls out: "anything driven by inline JS style writes rather than a CSS class/transition" can't be caught by the blanket CSS rule. A learner with `prefers-reduced-motion: reduce` set still gets an animated scroll every single time a new chat message arrives, because the global override is never consulted for this call site at all.

Current code, `components/chat/ChatWidget.tsx:39-41`:

```tsx
useEffect(() => {
  scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
}, [messages, isLoading]);
```

## Target

Check `prefers-reduced-motion` at scroll time and branch the `behavior` value accordingly:

```tsx
/* target */
useEffect(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  scrollRef.current?.scrollTo({
    top: scrollRef.current.scrollHeight,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}, [messages, isLoading]);
```

## Repo conventions to follow

- This exact `window.matchMedia("(prefers-reduced-motion: reduce)").matches` check is already used correctly elsewhere in this repo for the same reason (a JS-driven effect the blanket CSS rule can't reach) — see `components/TiltCard.tsx:37`, `handlePointerEnter`'s `reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;`. Copy that exact media query string, don't paraphrase it.
- No new import is needed — `window.matchMedia` is a browser global, and this file is already a `"use client"` component (line 1) that runs in the browser.

## Steps

1. In `components/chat/ChatWidget.tsx`, replace the `useEffect` currently at lines 39-41:
   ```tsx
   useEffect(() => {
     scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
   }, [messages, isLoading]);
   ```
   with:
   ```tsx
   useEffect(() => {
     const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
     scrollRef.current?.scrollTo({
       top: scrollRef.current.scrollHeight,
       behavior: prefersReducedMotion ? "auto" : "smooth",
     });
   }, [messages, isLoading]);
   ```

## Boundaries

- Do NOT touch the dependency array (`[messages, isLoading]`) or anything else about when this effect fires — only the `behavior` value it computes.
- Do NOT add a `matchMedia` listener/subscription for live changes to the preference — a fresh check on each scroll (matching `TiltCard.tsx`'s own one-shot-per-interaction pattern, not a persistent listener) is sufficient and consistent with this repo's existing precedent.
- Do NOT touch any other part of `ChatWidget.tsx` (message rendering, the `.animate-pop-in` bubbles, the dialog's own entrance) — this plan is scoped to the scroll behavior only.
- If lines 39-41 don't match what's quoted above (drift since commit `1522b53`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck` (clean), `npm run lint` (clean), `npx vitest run` (full suite green — no existing test covers this file directly).
- **Feel check**: run `npm run dev`, open the chat widget:
  - With no reduced-motion preference set, send a message — confirm the message list still scrolls smoothly to the bottom as before (no regression for the default case).
  - In Chrome DevTools, open the Rendering panel, set "Emulate CSS media feature `prefers-reduced-motion`" to "reduce", reload, open the chat widget, and send a message with enough prior messages that scrolling is actually needed — confirm the scroll jumps instantly to the bottom with no smooth animation.
  - Confirm the message bubbles' own `.animate-pop-in` entrance is still visually present but instant (already covered by the global CSS override, not by this plan) — this plan changes scroll behavior only, not the bubble animations themselves.
- **Done when**: with `prefers-reduced-motion: reduce` active, sending or receiving a chat message scrolls the conversation into view instantly, with no smooth-scroll animation.
