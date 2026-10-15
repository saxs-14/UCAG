# UCAG v2 — Comprehensive System Audit & Architectural Map

**Document Version:** 6.0  
**Date:** 2026-08-08  
**Author:** Antigravity Autonomous Engineering Lead & Principal Engineer  
**Status:** Audit Complete — Baseline Established  

---

## 1. Current Architecture

UCAG v2 is a Next.js 15 App Router application built on TypeScript in strict mode, styled with Tailwind CSS, and backed by Google Cloud Firestore and Firebase Authentication.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Client Layer (Web / PWA)                           │
│  Next.js App Router (React 19) · PWA Service Worker · Tailwind CSS          │
└───────────────────────┬─────────────────────────────┬───────────────────────┘
                        │                             │
       Client Auth & Firestore Reads             Server-side Route Handlers
                        │                        (Cron, Ingestion, Admin API)
                        ▼                             ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────────┐
│     Firebase Client SDK (v12)         │ │    Firebase Admin SDK (v14)       │
│ Auth (Email/Google/Anonymous)         │ │ Firestore Admin (Bypasses Rules)  │
│ Firestore Client (Security Rules)     │ │ Gemini 3.6 Flash / LLM Engine     │
└───────────────────┬───────────────────┘ └─────────────────┬─────────────────┘
                    │                                       │
                    ▼                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Firestore Database (demo-ucag)                        │
│ Public Collections: institutions, faculties, schools, programmes, apsRules, │
│                      applicationWindows, subjects, bursaries, internships,   │
│                      statistics                                             │
│ Internal/Admin:     sources, ingestionRuns, verificationQueue, linkHealth   │
│ User Storage:       userProfiles (per-user ownership enforced by rules)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Architecture Rules & Invariants
1. **Pure APS Engine (`lib/aps/`)**: Zero external dependencies (no Firebase, React, or framework imports). Pure functions taking `SubjectMarkInput[]` and returning deterministic `ApsResult`.
2. **Secrets Boundary**: Zero third-party API keys or admin credentials prefixed with `NEXT_PUBLIC_`. All scraping, LLM calls, and admin actions execute inside Node.js Server Route Handlers (`app/api/`).
3. **Data Provenance Gate (`isFactVerified`)**: Every public fact-bearing record must contain `sourceUrl`, `verifiedOn`, and `academicYear`. Records missing any of these three fields are filtered out by `isFactVerified()` before rendering on public pages.
4. **Config over Hardcode**: Institution seeds, subject taxonomies, point scales, ingestion budgets, and user-facing labels reside in `config/` or Firestore.

---

## 2. Current Data Flow

```
[ NSC Learner Input ]
       │
       ├─► NSC Subjects & Percentage Marks
       │
       ▼
[ Pure APS Engine (lib/aps/engine.ts) ]
       │ Calculates per-institution APS score using strategy objects
       │ (Handles LO exclusion/capping/weighting & best-N selection)
       │
       ▼
[ Real Catalog Fetch (lib/catalog/getRealCatalog.ts) ]
       │ Queries Firestore collections (cached/client-side filtered)
       │ Requires `isFactVerified()` validation on every record
       │
       ▼
[ Matching Engine (lib/matching/engine.ts) ]
       │ Itemizes minimum APS, compulsory subject levels, pass types
       │
       ▼
[ Result Classification ]
       ├── QUALIFY (Meets all requirements + open/status-check apply link)
       ├── ALMOST QUALIFY (Itemizes exact numeric/subject shortfalls)
       └── NOT YET (Provides articulative foundation / TVET alternative)
```

---

## 3. Current Authentication Flow

- **Anonymous Sessions**: The primary calculator functionality requires **no account**. Learners can enter subjects and calculate APS without signing up.
- **Firebase Auth (Email/Password + Google)**: Optional accounts allow saving subject marks, shortlisting programmes, and tracking application checklists.
- **POPIA & Guardian Consent**:
  - Sign-up enforces an age gate (18+ vs under 18).
  - Learners under 18 must capture guardian details (`guardianName`, `guardianEmail`) and explicit consent before `userProfiles` document creation is allowed by `firestore.rules`.
- **Admin Authorization**: Role-gated via custom Firebase ID token claim `role: "admin"` set via `scripts/set-admin-claim.mjs`. Verified server-side in `lib/admin/auth.ts`.

---

## 4. Current Firestore Architecture

### Security Rules Summary (`firestore.rules`)
- **Public Catalogue Collections**: `institutions`, `faculties`, `schools`, `programmes`, `apsRules`, `applicationWindows`, `subjects`, `bursaries`, `internships`, `statistics`.
  - Read: `allow read: if true;`
  - Write: `allow write: if false;` (Client SDK writes denied; all writes require Firebase Admin SDK server-side).
- **Internal / Queue Collections**: `sources`, `ingestionRuns`, `verificationQueue`, `linkHealthChecks`.
  - Read: `allow read: if isAdmin();`
  - Write: `allow write: if false;`
- **User Storage**: `userProfiles/{uid}`.
  - Read/Delete: `allow read, delete: if isOwner(uid);`
  - Create/Update: `allow create, update: if isOwner(uid) && isValidProfileWrite(uid, request.resource.data)` (enforces minor/guardian consent invariants).

---

## 5. Current AI Architecture

- **Provider Abstraction**: Provider-agnostic LLM interface (`lib/ingestion/llm/`) supporting Gemini (Google AI Studio) with `LLM_PROVIDER=gemini` and Anthropic as secondary fallback.
- **Default Model**: `gemini-flash-lite-latest` selected to maximize free tier token efficiency and avoid mandatory reasoning token overhead.
- **AI Advisor / Chat Widget**:
  - Route: `app/api/chat/route.ts` with Server-Sent Events (SSE) token streaming.
  - System Prompt (`lib/chat/systemPrompt.ts`): Strictly grounded in verified UCAG data. Instructed never to invent closing dates or admission criteria.
  - Fact Lookup Tool (`lib/chat/tools/lookupVerifiedFact.ts`): Grounded tool called during streaming to pull verified facts from Firestore.

---

## 6. Current Ingestion Architecture

```
[ Scheduled Trigger / Admin Manual Call ]
                   │
                   ▼
       [ Link & Robots Pre-Check ]
   (Respects robots.txt, ETag, Last-Modified)
                   │
                   ▼
     [ Text Extraction & HTML Cleaner ]
                   │
                   ▼
  [ LLM Extraction (Zod Schema Enforced) ]
                   │
                   ▼
           [ Diff & Risk Evaluator ]
                   │
  ┌────────────────┴────────────────┐
  ▼                                 ▼
[ Low-Risk Auto-Publish ]   [ High-Risk / Ambiguous ]
(Fact Provenance Attached)           │
                                     ▼
                          [ Verification Queue ]
                                     │
                                     ▼
                            [ Admin Human Approval ]
```

---

## 7. Current Admin Console Architecture

- **Protected Routes (`/admin/*`)**:
  - `/admin/queue`: Verification queue for reviewing LLM-proposed catalogue edits.
  - `/admin/sources`: Source register health, cadence, and robots status.
  - `/admin/runs`: Ingestion run execution history, token spend, and error logs.
  - `/admin/editor`: Content editor for manual fact overrides with mandatory `sourceUrl`.
  - `/admin/dead-links`: Dead apply-link report generated by the 6-hourly link health checker.

---

## 8. Current Testing Architecture

- **Unit & Integration Suite (Vitest 4.1.10)**:
  - 39 test files, 307 tests covering APS calculation strategies, subject taxonomy, matching logic, bursary safety, chat SSE streaming, rate limiting, and Zod schemas.
  - Real Firestore Security Rules & Auth Integration tests run against the local Firebase Emulator Suite (`demo-ucag`).
- **End-to-End Suite (Playwright 1.61.1)**:
  - Cross-browser (Desktop Chrome & Pixel 7 Mobile 3G) test covering full user journey: subject entry -> APS calculation -> matching -> result card verification -> apply link interaction.

---

## 9. Current Deployment Architecture

- **Hosting**: Vercel Hobby Tier (`ucag-nine.vercel.app`).
- **Cron Jobs**: Vercel Cron (`vercel.json`) executing daily at 01:00 UTC (`0 1 * * *`) calling `/api/cron/link-health` protected by `CRON_SECRET`.
- **Build Pipeline**: Next.js 15 Turbopack production build (`next build --turbopack`).

---

## 10. Current Security Model

- **Data Privacy (POPIA)**: Strict data minimization (no ID numbers, home addresses, or financial credentials collected). Age-gated sign-up with server-validated guardian consent.
- **HTTP Security Headers**: Configured in `next.config.ts` including Content Security Policy (CSP), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`.
- **API Protection**: Admin and Cron route handlers validate `x-cron-secret` and custom admin claims before processing requests.

---

## 11. Current PWA & Offline Architecture

- **PWA Capabilities**: Service worker registration (`components/ServiceWorkerRegistration.tsx`), web manifest (`public/manifest.json`), and offline asset caching.
- **Low-Data Mode**: Detects `navigator.connection.saveData` to defer non-essential assets and suppress heavy imagery.

---

## 12. Current UI Architecture

- **Design Tokens**: Standardized color palette in `app/globals.css` with semantic CSS variables (`--color-paper`, `--color-ink`, `--color-mark-green`, `--color-mark-red`).
- **Component Hierarchy**: Modular React 19 client components with dynamic imports for heavy Firebase SDK modules to maintain low initial bundle sizes.

---

## 13. Current Known Limitations & Gaps

1. **Institutions Coverage**: Currently seeded with Tier 1 institutions (UMP, UP, Wits, Stellenbosch, UCT, NMU, UJ, NWU, UNISA, UKZN, TUT, CPUT). Faculty & programme catalogues for Tier 2 and Tier 3 institutions remain in "coming soon" or partially populated states.
2. **Career Pathways Integration**: Basic career outcomes exist on programme documents, but an interactive visual Career Discovery & Pathway Graph is not yet rendered as an interactive node graph.
3. **Advanced Simulator**: `ApsImprovementSimulator` provides mark improvement suggestions, but does not yet rank shortfalls by "smallest mark delta for maximum unlocked options".

---

## 14. Summary Assessment

UCAG v2 has a robust, clean, and highly disciplined engineering foundation. It complies strictly with non-negotiable rules (zero unverified facts as real, secrets isolated server-side, pure isolated APS engine, strict POPIA compliance, 100% test pass rate across unit, integration, and E2E suites).

Next engineering focus will center on expanding innovation features (Pathway Graph, Opportunity Radar, Advanced Readiness Score) and scaling primary source catalogue verification.
