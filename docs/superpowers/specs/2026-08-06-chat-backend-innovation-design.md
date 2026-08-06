# Chat backend innovation — design

**Date:** 2026-08-06
**Trigger:** Customer demo tomorrow (2026-08-07), presenter-driven live demo. Stated
complaint: the chat assistant "feels basic" next to the app's recent frontend polish.
**Owner:** Phathutshedzo "Saxs" Mamagau

## Context

Recent commit history (`git log`) is almost entirely frontend/animation work — the
chat backend (`app/api/chat/route.ts`, `lib/chat/geminiChatClient.ts`) hasn't changed
since it first shipped: one non-streaming Gemini call, the entire verified catalog
stuffed into the system prompt as text on every request, JSON in/out.

CLAUDE.md's overriding rule — "unverified is displayed as unverified, never as a
fact," every fact-bearing document needs `sourceUrl`/`verifiedOn`/`academicYear` — rules
out "add more verified data" as a today option. Rushing sourcing to hit a deadline is
exactly the failure mode that rule exists to prevent, so this design does not touch
data coverage. Everything here works with data that's already verified.

Given a one-day timeline and a live, presenter-driven demo (not unattended customer
access), depth on the chat path matters more than breadth across the whole app. Each
piece below is independently useful and independently demoable, so a partial finish
still leaves something to show.

## Goals

1. The chat assistant visibly feels real-time and modern (streaming, not a
   wait-then-dump).
2. The assistant demonstrates real grounded tool use, not just a static context dump —
   the clearest "this is genuinely engineered, not a wrapper" signal to a technical or
   semi-technical customer.
3. The app surfaces honest, live proof of its own data quality (a trust banner), for
   the "industry standard" impression.
4. None of the above may regress the app's core promise: the assistant must still
   refuse to state unverified facts, and a failure in any new code path must degrade
   to today's known-working behavior rather than breaking the live demo.

## Non-goals

- Adding new institutions, programmes, or any new fact-bearing data.
- Rebuilding the APS engine, admin dashboard, or ingestion pipeline.
- A general performance audit of the whole app — scope is the chat path, one banner,
  and security headers.
- ISR/caching on catalog data-fetch paths, and real error-monitoring/APM integration —
  both real gaps (see Follow-ups), deliberately deferred past tomorrow's demo because
  they touch data-fetch correctness or require new third-party infrastructure, neither
  of which should be rushed under deadline pressure.
- New Playwright e2e coverage (explicitly logged as a gap, not silently skipped — see
  Testing).

## Design

### 1. Streaming chat replies

- `GeminiChatClient` gains `streamReply(messages, systemPrompt): AsyncIterable<string>`,
  calling Gemini's `streamGenerateContent` endpoint (SSE from Gemini itself) instead of
  `generateContent`. The existing `reply()` pacing/backoff logic
  (`waitForPacing`, 429 retry-after parsing) wraps the *first* chunk of the stream the
  same way it wraps the current single call — the shared free-tier pacing budget is
  unchanged.
- `app/api/chat/route.ts` returns `Content-Type: text/event-stream`, writing each
  chunk as an SSE `data:` event as it arrives from Gemini, and a terminal `event: done`
  frame. Existing validation, rate limiting, and the 429/501 error responses are
  unchanged — they still short-circuit before any stream opens, returning today's plain
  JSON error bodies.
- `ChatWidget.tsx` replaces `await res.json()` with a manual `ReadableStream` reader
  (`res.body.getReader()`), decoding SSE frames and appending text to the last `model`
  message as chunks arrive, instead of pushing one complete message at the end.
  `isLoading` stays true until the `done` frame; the existing `LABELS.chat.*` error
  copy and 429/501 handling stay as they are today, applied before the stream starts.

### 2. One grounded tool call, with a fallback to today's behavior

- New `lib/chat/tools/lookupVerifiedFact.ts`: given an institution name and a
  programme name (both free text from the model), matches case-insensitively against
  `institution.name`/`institution.shortName` and `programme.name` (substring match,
  first hit wins — the catalog is small enough that this is unambiguous today), then
  reads the matched pair through the same `isFactVerified()`-gated Firestore reads
  `getRealProgrammeDetail.ts` already uses. Returns either the verified facts or an
  explicit "not verified"/"no match" result — never a guess. No new trust logic — it's
  a thin, reusable wrapper around lookups that already exist.
- `geminiChatClient.streamReply()` is called with one function declaration
  (`lookupVerifiedFact`) attached. If Gemini's response includes a `functionCall` part,
  the route executes the lookup server-side, sends the function result back as a second
  `generateContent`/stream call (the standard two-round-trip Gemini function-calling
  pattern), and continues streaming that as the reply.
- **Fallback:** the tool round-trip is wrapped so that any error, timeout, or malformed
  function-call response falls back to today's path — a single `streamReply()` call
  with the full context-stuffed system prompt, tools omitted. The user never sees a
  broken tool call; worst case, they get today's already-working assistant. This is
  what makes the one genuinely risky piece of this design safe to ship same-day.
- Given the catalog is currently 8 institutions, context-stuffing remains the
  reasonable default for everything the tool doesn't need to handle — this is additive,
  not a replacement of `getRealChatContext`.

### 3. Security headers

- `next.config.ts` currently sets no headers at all. Add a `headers()` entry applying
  to all routes: `Content-Security-Policy` (scoped to the origins this app actually
  calls — self, Firebase, Google's generative-language API), `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` disabling
  unused browser features (camera, microphone, geolocation).
- Purely additive config — no application code changes, no data-fetch paths touched.
  Verified by loading the app and confirming no console CSP violations and no broken
  functionality (chat, auth, Firestore reads all still work).
- Low effort, zero correctness risk, and a visible "industry standard" signal to
  anyone who opens dev tools during the demo.

### 4. Live trust banner

- New `lib/catalog/getCatalogStats.ts`: counts of verified institutions, programmes,
  and bursaries, plus the most recent `verifiedOn` date across them — pure aggregation
  over data `fetchRealCatalog`/`getRealChatContext` already read, no new writes, no new
  collections.
- Cached in-memory with the same 5-minute TTL pattern as `getRealChatContext` — the
  underlying data changes on the order of admin approvals, not per page view.
- Rendered as a small strip (e.g. "8 institutions · N verified programmes · updated
  {date}") near the site header — exact placement is an implementation-time call, not
  a design constraint.

### Error handling

- Stream drops mid-response (network error, Gemini error mid-stream): client shows
  whatever partial text arrived, then the existing generic error banner
  (`LABELS.chat.genericError`) with the message still submittable again — same recovery
  UX as today's failure path, not a new one.
- Tool-call failure: silent fallback to non-tool streaming, per above — no user-visible
  error for this specific case, since the fallback succeeds.
- Trust banner: if `getCatalogStats()` throws (e.g. Firestore unavailable), the banner
  simply doesn't render — it's a non-critical enhancement, not a page-blocking
  dependency. Matches the existing "AuthProvider degrades gracefully" precedent in
  CLAUDE.md's deployment section.

### Testing

- Vitest: SSE frame formatting/parsing helper, `lookupVerifiedFact` (verified hit,
  not-verified programme, unknown institution), and the tool-call-error → fallback path
  (mock a failing tool call, assert the non-tool stream still completes).
- Manual pass before the demo, over a real multi-turn streamed conversation: one
  question the tool can answer, one specific fact it can't (confirms the "not verified
  yet" refusal still holds through the new path), and one general-knowledge question
  (confirms tier-2 behavior in `systemPrompt.ts` is unaffected).
- **Gap, logged not skipped:** no new Playwright e2e for streaming or tool-call
  behavior given the timeline. `tests/e2e/` keeps covering whatever it already covers
  for chat; streaming/tool-call correctness rests on the Vitest suite plus the manual
  pass above.
- Manual check for security headers: load the app, confirm no CSP violations in the
  console, and re-run the chat/auth/Firestore flows above to confirm nothing the CSP
  restricts (Google's generative-language API, Firebase) got accidentally blocked.

## Follow-ups (explicitly out of scope for tomorrow)

- **ISR/caching on catalog pages.** Catalog data is fetched fresh via the client SDK
  (`getDocs`) on every page load, with no `revalidate` anywhere in `app/`. Real
  performance win, but the pages involved enforce strict "never render an unverified
  fact" rules — this needs its own change and its own testing pass, not a rush job the
  night before a demo.
- **Real error monitoring/APM.** `lib/errorReporting.ts` is honestly-scoped structured
  console logging today (already documented in-file as intentional — no Sentry-or-
  equivalent account exists yet). Vercel captures those logs today; wiring in a real
  service is a deliberate, separate decision involving new third-party infrastructure,
  not something to stand up under deadline pressure.

## Definition of done

Same as CLAUDE.md's existing bar, plus this design's own additions:

1. `npm run typecheck` clean.
2. New Vitest suites (SSE helper, tool executor, fallback path) green, existing chat
   suites (`rateLimiter.test.ts`, `validateChatRequest.test.ts`,
   `getRealChatContext.test.ts`) still green and unmodified in behavior.
3. No secret-shaped file newly tracked by git.
4. Manual multi-turn streamed conversation pass (see Testing) completed before the
   demo, including the "ask about something unverified" case.
5. Trust banner numbers independently spot-checked against Firestore (no
   off-by-one/double-count from the aggregation).
