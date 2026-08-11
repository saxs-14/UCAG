# UCAG v2 — Verification Baseline Report

**Execution Date:** 2026-08-08  
**Environment:**
- **Node.js:** v24.16.0
- **npm:** 11.13.0
- **Framework:** Next.js 15.5.21 (React 19.1.0)
- **Database:** Firebase / Firestore (v12.16.0 / Admin v14.2.0)
- **OS:** Windows 11

---

## Verification Results Summary

| Verification Step | Command | Status | Result / Notes |
|---|---|---|---|
| **TypeScript Typecheck** | `npm run typecheck` (`tsc --noEmit`) | **PASS** | 0 type errors |
| **ESLint Validation** | `npm run lint` (`eslint`) | **PASS** | 0 lint warnings/errors |
| **Production Build** | `npm run build` (`next build --turbopack`) | **PASS** | Compiled in 67s, 21 static/dynamic pages generated |
| **Unit & Integration Tests** | `npm test` (`vitest run`) | **PASS** | **39 test files passed, 307 tests passed, 0 failed** (requires active Firebase emulator) |
| **End-to-End Tests** | `npm run test:e2e` (`playwright test`) | **PASS** | **2 tests passed** (Desktop Chrome + Mobile Chrome Pixel 7 3G) |

---

## Detailed Test Logs & Execution Evidence

### 1. Vitest Unit & Integration Suite (`npm test`)
```
 Test Files  39 passed (39)
      Tests  307 passed (307)
   Start at  16:06:29
   Duration  59.16s
```
- Includes 26 Security Rule tests against the active `demo-ucag` Firestore emulator (`tests/firestore-rules.test.ts`).
- Includes 6 Auth Integration tests verifying sign-up, POPIA guardian consent, sign-in, and account deletion (`tests/auth-integration.test.ts`).
- Includes 32 isolated APS calculation strategy tests (`lib/aps/engine.test.ts`).

### 2. Playwright E2E Suite (`npm run test:e2e`)
```
Running 2 tests using 2 workers

[1/2] [mobile-chrome-3g] › tests\e2e\calculator-to-apply.spec.ts:14:5 › learner enters marks, sees they qualify, and reaches a real apply link
[2/2] [chromium] › tests\e2e\calculator-to-apply.spec.ts:14:5 › learner enters marks, sees they qualify, and reaches a real apply link
  2 passed (1.6m)
```
- Full learner journey verified: home language selection -> FAL selection -> compulsory LO input -> elective selection -> live APS calculation -> qualify bucket rendering -> apply link attribute verification.

### 3. Production Build Artifacts (`npm run build`)
```
Route (app)                                   Size  First Load JS
┌ ƒ /                                      15.7 kB         245 kB
├ ○ /_not-found                                0 B         230 kB
├ ○ /account                               4.57 kB         405 kB
├ ○ /admin                                     0 B         231 kB
├ ○ /admin/dead-links                      1.65 kB         403 kB
├ ○ /admin/editor                          1.52 kB         232 kB
├ ○ /admin/queue                           1.96 kB         403 kB
├ ○ /admin/runs                            2.15 kB         404 kB
├ ○ /admin/sources                         2.32 kB         404 kB
├ ƒ /bursaries                             3.61 kB         233 kB
├ ○ /privacy                                   0 B         230 kB
├ ƒ /programmes/[id]                           0 B         230 kB
├ ○ /robots.txt                                0 B            0 B
├ ○ /sitemap.xml                               0 B            0 B
└ ƒ /statistics                            2.44 kB         232 kB
```

---

## Data & Emulator Verification

- **Local Firebase Emulator Suite**: Active on ports `8080` (Firestore) and `9099` (Auth).
- **Seeded Collections**:
  - `sources`: 26 authoritative URLs registered
  - `institutions`: 12 verified South African public universities
  - `apsRules`: 8 verified institutional APS calculation strategies
  - `bursaries`: 34 verified funding listings
  - `internships`: 23 verified work experience opportunities
  - `statistics`: 10 NSC provincial & national performance datasets

---

## Baseline Conclusion

The UCAG v2 codebase is in a fully healthy, green state. All builds, linters, type checks, unit tests, integration tests, and cross-browser E2E user journey tests pass deterministically.
