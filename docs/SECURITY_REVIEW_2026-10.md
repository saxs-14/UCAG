# UCAG — Security Review (16 October 2026)

**Scope:** authorized, first-pass code-level security review of the UCAG v2
codebase as it exists in this repository and as deployed at
[ucag-nine.vercel.app](https://ucag-nine.vercel.app) — authorized by the
project owner as Phase 3 of the governing master prompt
(`docs/MASTER_PROMPT_v2.md`). Not a third-party penetration test, not
exhaustive — a focused read of the real attack surface (API routes,
Firestore rules, auth, secret handling, HTTP headers) with live production
verification of each finding, not static analysis alone.

**Status:** PASS overall. No critical code-level issues found. Four
low/medium code-level findings identified and fixed this session, plus 2
of 4 dependency-vulnerability groups fixed (the other 2 need an explicit
version-bump decision from you — see finding 5). None of the code fixes
required a design change or new infrastructure.

---

## What was reviewed

- All 12 `app/api/**/route.ts` handlers (10 admin routes, 1 cron route, 1
  public chat route) — auth enforcement, input validation, error handling.
- `lib/admin/auth.ts` (`requireAdmin`) — the single gate every admin route
  must call before touching Firestore.
- `lib/admin/allowlist.ts` — the collection/field allowlist that bounds what
  the verification-queue approve/edit action and admin content editor can
  write, as defense in depth against a compromised ingestion proposal.
- `firestore.rules` — full read, cross-referenced against the 31 passing
  emulator tests in `tests/firestore-rules.test.ts` (per-user ownership,
  minor-consent invariants, role-escalation prevention, immutable
  `createdAt`, consent-record-cannot-be-nulled).
- `app/api/chat/route.ts`, `lib/chat/rateLimiter.ts`,
  `lib/chat/validateChatRequest.ts` — the one public, unauthenticated,
  cost-bearing endpoint (talks to the shared Gemini quota).
- `lib/env/server.ts` — secret/credential handling, `assertCronSecret`.
- `next.config.ts` and live production response headers (`curl -I` against
  the real deployment, not just the config file).

## Findings

### 1. Cron secret comparison was not constant-time (MEDIUM-LOW) — FIXED

`lib/env/server.ts`'s `assertCronSecret` compared the provided secret to
`CRON_SECRET` with a plain `!==`. String equality in JS/V8 short-circuits
on the first differing byte, which makes the comparison's timing a
(theoretically) measurable side channel an attacker could use to recover
the secret byte-by-byte (CWE-208). In practice, network jitter on a
Vercel serverless deployment makes this a low-probability real-world
attack, but it's a textbook-recognized anti-pattern with a free fix.

**Fix:** replaced the comparison with `crypto.timingSafeEqual`, guarding
the length check first (a length mismatch is rejected before the
constant-time compare runs, since `timingSafeEqual` throws rather than
compares on differing-length buffers — the length itself leaking is an
accepted, standard trade-off). Added `lib/env/server.test.ts` coverage for
the different-length and null-secret cases alongside the 4 existing tests.

### 2. Chat rate limiter trusted a client-spoofable header first (LOW) — FIXED

`app/api/chat/route.ts` built its per-client rate-limit key from
`x-forwarded-for`'s first entry before falling back to `x-real-ip`. Per
the `X-Forwarded-For` header's append-only convention, the *first* entry
is the client's own self-reported value — a client can set it to anything,
including a fresh value on every request, to dodge `checkChatRateLimit`
entirely. `x-real-ip` is set by Vercel's edge from the actual TCP
connection and isn't client-overridable.

**Impact was already bounded** — `lib/chat/rateLimiter.ts`'s own docs
already describe it as a best-effort, in-memory limiter whose job is
protecting the shared Gemini free-tier quota from one abusive session, not
a hard security boundary — but the header-preference order was backwards
from what it should be even for that goal.

**Fix:** flipped the preference order to check `x-real-ip` first, falling
back to `x-forwarded-for` only if that's absent.

### 3. Missing `X-Content-Type-Options: nosniff` (LOW) — FIXED

`next.config.ts`'s `headers()` set CSP, `X-Frame-Options`,
`Referrer-Policy`, and `Permissions-Policy`, but not
`X-Content-Type-Options`. Without it, some older browsers will MIME-sniff
a response body and execute it as a different content type than declared
— a defense-in-depth header against content-type confusion attacks, cheap
to add.

**Fix:** added `{ key: "X-Content-Type-Options", value: "nosniff" }`
alongside the existing headers.

(`Strict-Transport-Security` was checked live against production and is
already present — `max-age=63072000; includeSubDomains; preload` — Vercel
sets it automatically for the deployment; no fix needed there.)

### 4. `X-Powered-By: Next.js` leaked framework fingerprint (INFO) — FIXED

Minor information disclosure: the default Next.js response header tells
an attacker the exact framework in use for free, with zero functional
benefit to the app.

**Fix:** `poweredByHeader: false` in `next.config.ts`.

## What was checked and found already correct (no change needed)

- **`requireAdmin`** verifies a real Firebase ID token via the Admin SDK
  and checks the `role` *custom claim* (never a client-writable field) —
  correctly implemented, and every one of the 10 `/api/admin/*` routes
  calls it before touching Firestore (confirmed by grep across all 10,
  not assumed).
- **`firestore.rules`** — per-user ownership, minor-consent enforcement,
  role-immutability, and the default-deny catch-all are all correctly
  structured and already covered by 31 passing emulator tests.
- **The verification-queue approve/edit route** (`app/api/admin/queue/[id]/route.ts`)
  — auth-first, Zod-validated body, collection/field allowlist checked
  against `lib/admin/allowlist.ts` before any write, source-URL scheme
  validated, and the actual Firestore write is wrapped in a transaction
  with an optimistic-concurrency check (`QUEUE_STALE`) that prevents a
  stale proposal from silently overwriting a newer verified value.
- **The chat endpoint's input bounds** (`lib/chat/validateChatRequest.ts`)
  — message count and length are both capped (`MAX_MESSAGES=20`,
  `MAX_MESSAGE_LENGTH=1000`), bounding the cost of any single request
  regardless of the rate-limiter fix above.
- **Secrets never reach the browser** — spot-checked: no `NEXT_PUBLIC_`
  prefix on any Admin SDK or LLM credential; `lib/env/server.ts` is
  `import "server-only"`-guarded, which fails the build if anything tries
  to bundle it client-side.

## Known, accepted limitations (not fixed — deliberate trade-offs, not bugs)

- **`lib/chat/rateLimiter.ts` is in-memory, per-process**, not
  Firestore/Redis-backed — already documented in the file's own header as
  an accepted trade-off (no added latency/cost per chat message) rather
  than an oversight. Resets on redeploy/cold-start and isn't shared across
  serverless instances. Upgrade path (a durable store) would need a paid
  service (Upstash Redis or Vercel KV) and isn't justified by current
  traffic — not added under the project's free-first policy without an
  explicit decision to pay for it.

### 5. Dependency vulnerabilities (`npm audit`) — partially fixed, 2 remain for your decision

`npm audit` found 9 vulnerabilities in production dependencies (1 moderate,
8 high):

| Package | Severity | Fixable without `--force`? |
|---|---|---|
| `sharp` (next's own image-optimization dependency) | high (librsvg CVE) | **Yes — fixed** |
| `source-map-js` (transitive, via `@tailwindcss/postcss`/next's bundled postcss) | high (event-loop DoS) | **Yes — fixed** |
| `next` itself | moderate (SSG/ISR cache poisoning, cross-user content substitution) | No — needs `next@15.5.28`, outside the exact-pinned `15.5.26` in `package.json` |
| `postcss` (bundled inside `next`'s own `node_modules`) | high ×4 (XSS, 3× arbitrary `.map` file read via `sourceMappingURL`) | No — same `next` upgrade fixes it, since it's bundled |

**Fixed this session:** ran `npm audit fix` (no `--force`). This resolved
`sharp` and `source-map-js` entirely by re-resolving transitive versions
*within* the ranges `package.json` already declares — confirmed via
`git diff package.json` showing **zero changes to `package.json` itself**,
only `package-lock.json`'s resolved versions. Re-ran typecheck, lint, the
full 384-test suite, and a production build afterward — all clean.

**Left for your decision, not applied:** the `next`/`postcss` fix needs
`next@15.5.28`, which `npm audit fix --force` would install. This project
pins exact dependency versions deliberately (not `^`/`~` ranges), so *any*
different version is "outside the stated range" by that project convention
— in this case it's actually just a patch-version bump (`15.5.26` →
`15.5.28`), not a major/breaking jump, but it's still a live production
framework version change I didn't want to force without you seeing it
first. Recommend taking it — it's a real, name-and-shame-worthy CVE
(cache poisoning across users on a self-hosted Next.js deployment) and a
patch bump is low-risk — but it needs a rebuild + redeploy + smoke-test
cycle, which is your call to schedule. (A second group of vulnerabilities,
in `eslint-config-next`'s own dependency chain, surfaced only when
devDependencies are included in the audit — that one's dev-tooling-only,
never shipped to users, and `npm audit fix --force` would downgrade
`eslint-config-next` to `14.2.35` to fix it. Lower priority, same "ask
first before forcing a version change" reasoning applies.)

## Not yet covered by this pass

This was a code-level review, not a dynamic/active penetration test. Not
attempted this session: fuzzing the admin routes' Zod schemas for edge
cases, testing actual rate-limit behavior under concurrent load against
the live deployment, a dependency vulnerability scan (`npm audit`), or
reviewing the Firebase project's own IAM/service-account scopes (which
need Firebase Console access this session doesn't have). Worth a follow-up
if a deeper pass is wanted.
