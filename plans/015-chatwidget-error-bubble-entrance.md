# 015 — Give the chat error bubble the same entrance every other bubble has

- **Status**: TODO
- **Commit**: 1522b53
- **Severity**: (missed opportunity — additive, not corrective)
- **Category**: Missed opportunities
- **Estimated scope**: 1 file (`components/chat/ChatWidget.tsx`)

## Problem

Every other item in the chat message list uses `.animate-pop-in`: the greeting bubble, every user/model message, and the "thinking" loading indicator. The error bubble is the one exception — it renders with no animation class at all, so it's the one moment something has actually gone wrong that gets *less* visual acknowledgment than a routine message, not more.

Current code, `components/chat/ChatWidget.tsx:111-136` (the greeting, messages, loading indicator, and error bubble together, showing the asymmetry):

```tsx
<div className="animate-pop-in max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-soft px-3 py-2 text-sm text-ink">
  {LABELS.chat.greeting}
</div>
{messages.map((message, i) => (
  <div
    key={i}
    className={`animate-pop-in max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
      message.role === "user"
        ? "self-end rounded-br-sm bg-brand-teal text-white"
        : "self-start rounded-bl-sm bg-slate-soft text-ink"
    }`}
  >
    {message.text}
  </div>
))}
{isLoading && (
  <div className="animate-pop-in self-start rounded-2xl rounded-bl-sm bg-slate-soft px-3 py-2 text-sm text-ink-faint">
    {LABELS.chat.thinkingIndicator}
  </div>
)}
{error && (
  <div role="alert" className="self-start rounded-2xl bg-mark-red-soft px-3 py-2 text-sm text-mark-red">
    {error}
  </div>
)}
```

## Target

Add the same `.animate-pop-in` class already used by every sibling in this list, and match the same `rounded-bl-sm` corner treatment the other "from the assistant" bubbles use, so the error bubble reads as a fully-fledged member of the same conversation, not an afterthought.

```tsx
/* target */
{error && (
  <div
    role="alert"
    className="animate-pop-in self-start rounded-2xl rounded-bl-sm bg-mark-red-soft px-3 py-2 text-sm text-mark-red"
  >
    {error}
  </div>
)}
```

## Repo conventions to follow

- `.animate-pop-in` is already imported implicitly via global CSS (`app/globals.css:281-283`) — no new import or class definition needed, this is a pure className addition.
- `rounded-bl-sm` is already the corner treatment for every other "assistant-side" bubble in this same list (the greeting at line 112, and model messages inside the `messages.map` at line 121) — the error bubble should match that, since it's also assistant-side (`self-start`), not user-side.

## Steps

1. In `components/chat/ChatWidget.tsx`, change the error bubble (currently lines 132-136):
   ```tsx
   {error && (
     <div role="alert" className="self-start rounded-2xl bg-mark-red-soft px-3 py-2 text-sm text-mark-red">
       {error}
     </div>
   )}
   ```
   to:
   ```tsx
   {error && (
     <div
       role="alert"
       className="animate-pop-in self-start rounded-2xl rounded-bl-sm bg-mark-red-soft px-3 py-2 text-sm text-mark-red"
     >
       {error}
     </div>
   )}
   ```

## Boundaries

- Do NOT change the `role="alert"` attribute — this is required for screen readers to announce the error, and is unrelated to this plan's visual-only change.
- Do NOT change the error message's color, background, or text — only add the entrance animation and matching corner radius.
- Do NOT touch the greeting, message-map, or loading-indicator bubbles — they already have the correct treatment; this plan only brings the error bubble in line with them.
- If `components/chat/ChatWidget.tsx:132-136` doesn't match what's quoted above (drift since commit `1522b53`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck` (clean), `npm run lint` (clean), `npx vitest run` (full suite green).
- **Feel check**: run `npm run dev`, open the chat widget, and trigger an error response (e.g. send a message while the backend is unreachable, or check `lib/chat` for a way to force a 429/501 response in dev) — confirm the error bubble now visibly pops in the same way every other bubble does, with the same rounded-bottom-left corner as an assistant message, rather than appearing with no animation at all.
- **Done when**: the chat error bubble animates in identically to every other bubble in the conversation.
