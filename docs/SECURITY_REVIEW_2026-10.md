# UCAG — Security Review (16 October 2026)

**Scope:** authorized, first-pass code-level security review of the UCAG v2
codebase as it exists in this repository and as deployed at
[ucag-nine.vercel.app](https://ucag-nine.vercel.app) — authorized by the
project owner as Phase 3 of the governing master prompt
(`docs/MASTER_PROMPT_v2.md`). Not a third-party penetration test, not
exhaustive — a focused read of the real attack surface (API routes,
Firestore rules, auth, secret handling, HTTP headers) with live production
verification of each finding, not static analysis alone.

**Status:** PASS overall, with one critical infrastructure finding
(finding 7, added 17 October) now fixed: production Firestore's security
rules were never actually deployed — the live project was running
Firebase's own default placeholder rule, expired since 23 May 2026,
silently denying every client-side read for nearly five months. Four
low/medium code-level findings identified and fixed, plus 3 of 4
dependency-vulnerability groups fixed (`sharp`, `source-map-js`, and
`next`/`postcss`'s moderate cache-poisoning CVE) — the remaining group
(`eslint-config-next`'s dev-only `glob` CVE) needs a real major-version
decision and is left for later, documented in finding 5. None of the fixes
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

**Update — fixed, by hand rather than `--force`:** `npm audit fix --force`
was tried and immediately reverted — in this run it resolved to installing
`next@16.4.2` (a major version, not the `15.5.28` patch its own dry-run had
promised moments earlier) and, far more alarmingly, **downgraded `firebase`
from `^12.16.0` to `^9.14.0`** — a 3-major-version downgrade of the client
SDK while "fixing" an unrelated transitive `protobufjs` CVE in
`@firebase/rules-unit-testing`'s test-only dependency chain. That would
almost certainly have broken the app. Caught before it was committed (the
`firebase` version jump was visible in `git diff package.json` before
anything was staged), reverted with `git checkout -- package.json
package-lock.json`, and node_modules fully reinstalled from the reverted
lockfile to confirm a clean baseline.

The actual fix was applied by hand instead: `next` and `eslint-config-next`
(which this project pins to match `next`'s version) bumped from exact
`15.5.26` to exact `15.5.28` directly in `package.json`, then `npm install`
(not `audit fix`) to resolve just those two entries — `firebase` untouched
at `12.19.0`. Confirmed via `git diff package.json`: a clean 2-line diff,
nothing else touched. Verified: typecheck, lint, full 384-test suite,
production build, and a live dev-server route sweep (`/`, `/ump`,
`/programmes`, `/bursaries`, all 200) — all clean. This resolves the
moderate SSG/ISR cache-poisoning CVE and the 4 bundled-postcss CVEs that
rode along with it.

**Still left, deliberately not forced:** the `eslint-config-next`
dependency chain's own separate `glob` CVE (command injection in its CLI,
dev-tooling-only, never shipped to users) needs `eslint-config-next@16.4.2`
— a real major-version jump this time, not a patch. Lower priority given
it's dev-only with no production exposure; worth a deliberate look later
rather than folding into this pass.

### 6. `requireAdmin` — the single enforcement mechanism for all 10 admin
routes — had zero test coverage

`lib/admin/auth.ts`'s `requireAdmin` is the actual security boundary every
`/api/admin/*` route depends on (confirmed earlier in this review: all 10
routes call it). `firestore.rules` deliberately denies all client writes
and relies on this function, not the rules themselves, as the real gate.
It had no dedicated test file at all before this session, despite
`lib/admin/allowlist.ts` (a secondary defense-in-depth layer) already
having one.

**Fix:** added `lib/admin/auth.test.ts` — 8 tests against a mocked Admin
SDK (no real Firebase project touched): a valid admin token succeeds;
case/whitespace-tolerant Bearer-prefix parsing; missing header, empty
token, and a rejected/expired token all throw 401; a valid token for a
signed-in-but-non-admin user, and a valid token with no role claim at all,
both throw 403; and an explicit test documenting that `requireAdmin` has
no client-suppliable input path to a role claim at all — the only route
to "admin" is a real token Firebase itself signed.

### 7. Production Firestore security rules were never actually deployed — CRITICAL, FIXED

Discovered 17 October 2026 while investigating why `/programmes` only showed
UMP's programmes despite all 9 institutions having just been seeded. The
live Vercel function logs showed every client-side Firestore read failing
with `FirebaseError: Missing or insufficient permissions` and silently
falling back to local hardcoded data (`lib/catalog/getRealCatalog.ts`'s own
seed fallback) — not a data problem, a rules problem.

Checked the real project's active ruleset directly via the Firebase Rules
REST API (`firebaserules.googleapis.com`), bypassing the repo entirely:
the deployed rule, dated **23 April 2026**, was Firebase's own default
"getting started" placeholder —

```
allow read, write: if request.time < timestamp.date(2026, 5, 23);
```

— which **expired on 23 May 2026**. From that date until this fix (nearly
five months), production Firestore denied **every client-side read and
write**, full stop, regardless of what `firestore.rules` in this repo
said. The real rules file — the one this project's own 35+ emulator tests
(`tests/firestore-rules.test.ts`) exercise and pass against — had
apparently never once been run through `firebase deploy --only
firestore:rules` against the real `ucag-11adc` project.

**Impact, now understood precisely:** everything that reads Firestore via
the Admin SDK (bursaries, internships, statistics, `/ump`'s fallback-safe
path) was unaffected and worked throughout. Everything using the **client**
SDK (`lib/firebase/firestoreClient.ts`'s `getFirebaseDb()`) was silently
broken: `/programmes` (fell back to UMP-only local seed data),
`/institutions/[id]`, the **entire admin console** (`/admin/sources`,
`/admin/runs`, `/admin/dead-links`, `/admin/queue`, `/admin/activity`),
and every signed-in account feature that depends on `userProfiles` rules
(saving marks, shortlist, consent records) — confirmed via
`lib/auth/profile.ts`, which also calls `getFirebaseDb()` (the client
SDK) for every profile read and write, so it was bound by the same
expired, deny-everything rule.

Not exercised with a real sign-up on the live production site — creating
an account on a real, non-local deployment isn't something to do without
the project owner directly, even to verify a fix. Instead, verified the
safer way: refetched the live project's active ruleset directly via the
Firebase Rules REST API after the deploy and diffed it character-for-
-character against the committed `firestore.rules` (the same file
`tests/firestore-rules.test.ts`'s 35+ cases, including the full
`userProfiles` suite, already exercise against the real rules engine via
the emulator). The two are identical but for one trailing newline. Given
the rules' *logic* is already proven correct by the existing emulator
tests, and the rules *deployed to production* are now proven identical to
that tested file, the `userProfiles` fix is verified by construction
without needing a live account.

**Fix:** `firebase deploy --only firestore:rules --project ucag-11adc`.
Confirmed via the same Rules REST API that the live ruleset now matches
this repo's `firestore.rules`, and via live Vercel logs that a fresh
`/programmes` request after the deploy produces no permission error
(`"logs":[]`, clean). The rendered page size for `/programmes` went from
73KB (fallback data) to 361KB (real 9-institution data) on the same URL,
same request shape, only the rules having changed in between.

**Why this had gone undetected:** every earlier verification this
session of `/programmes` and `/institutions` checked that pages *rendered
without errors* and *showed plausible-looking data* — which they always
did, because the fallback paths are specifically designed to make a rules
or data failure invisible to a user (and, it turns out, to an agent
checking page output rather than server logs). The lesson matches finding
in the Category B writeup this session: a page rendering correctly is
evidence the fallback works, never evidence the primary path does.

## Not yet covered by this pass

This was a code-level review, not a dynamic/active penetration test. Not
attempted this session: fuzzing each individual admin route's own Zod body
schema for edge cases beyond the shared `requireAdmin` gate now tested
above, testing actual rate-limit behavior under concurrent load against
the live deployment, or reviewing the Firebase project's own IAM/
service-account scopes (needs Firebase Console access this session doesn't
have). Worth a follow-up if a deeper pass is wanted.
