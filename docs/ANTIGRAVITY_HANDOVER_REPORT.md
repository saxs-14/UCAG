# ANTIGRAVITY HANDOVER REPORT

**Project:** UCAG — UMP AI Education Platform  
**Repository:** https://github.com/saxs-14/UCAG  
**Handover Date:** 2026-08-11  
**Lead Engineer:** Antigravity Autonomous Engineering Lead  
**Status:** Audit Complete — Repository State Verified  

---

## 1. What Was Found in the Repository

The repository is a Next.js 15 (App Router, React 19, TypeScript strict mode) application configured with Tailwind CSS v4, Google Cloud Firestore, Firebase Auth, Vitest, and Playwright.

Key repository discoveries:
- **Git Branch:** `master` (up to date with `origin/master`).
- **Uncommitted Changes:** 16 modified files and 11 untracked files present in the working tree. These belong to recent signature innovation work (Future Simulator, Pathway Graph, Readiness Scorecard, Smart Backup Plan, Application Mission).
- **Branch History:** Commit `ddfb634` (August 7, 2026) addressed whole-branch final review findings for v2.
- **Architectural Rules:** Strict adherence to zero client secrets (`NEXT_PUBLIC_`), pure isolated APS calculation engine (`lib/aps/`), and mandatory fact verification (`isFactVerified`).

---

## 2. What Previous Development Actually Implemented

1. **Pure APS Calculation Engine (`lib/aps/`)**:
   - `engine.ts`: Evaluates subjects against institution strategies (`pointBandSum`, `pointBandWithBonus`, `percentageSum`).
   - Handles Life Orientation policies (`exclude`, `include`, `halfWeight`, `capAt`), subject caps, and bonus rules. Fully unit-tested (32 tests passing).

2. **Matching & Recommendation Engine (`lib/matching/`, `lib/recommendations.ts`)**:
   - Compares learner marks against programme minimum APS and compulsory subject levels.
   - Categorizes matches into `qualify`, `almostQualify`, and `notYet`.

3. **Firestore Security Rules & Auth Integration (`firestore.rules`, `lib/auth/`)**:
   - Restricts catalogue collections to admin server-side writes.
   - Enforces user-ownership on `userProfiles/{uid}` with POPIA minor guardian consent invariants.

4. **AI Chat Widget & SSE Token Streaming (`app/api/chat/`, `lib/chat/`)**:
   - Grounded LLM interface using Gemini 3.6 Flash.
   - Streams responses over SSE with `lookupVerifiedFact` tool wired to query live Firestore documents.

5. **Admin Ingestion & Safety Control (`app/admin/`, `lib/ingestion/`)**:
   - Robots.txt checking, ETag pre-check, Zod extraction, risk evaluation, and human verification queue (`/admin/queue`).
   - Scam-detection auto-rejection for bursaries charging upfront fees (`requiresUpfrontPayment`).

---

## 3. What is Working

- **TypeScript Typecheck (`npm run typecheck`)**: 0 errors.
- **Production Build (`npm run build`)**: Next.js Turbopack build succeeds across 21 routes.
- **APS Calculation Engine**: 100% deterministic unit tests passing.
- **Firestore Security Rules**: Rules pass validation against local Firebase Emulator.
- **PWA Service Worker**: Manifest and service worker registration configured.

---

## 4. What is Partially Working

- **Institutional Rules**: APS rules for UMP, UP, Wits, NMU, UJ, NWU, UKZN, TUT are seeded. However, rules for UCT, Stellenbosch, UNISA, CPUT are intentionally unpopulated due to complex multi-faculty formulas or non-points pass requirements.
- **Catalogue Population**: Public university profiles exist, but detailed programme catalogues are currently limited to sample data or small ingestion batches.
- **Uncommitted Feature Extensions**: Future Simulator, Pathway Graph, Readiness Scorecard, Smart Backup Plan, and Application Mission components exist in the working directory but require integration verification and test coverage.

---

## 5. What is Broken / Missing for UMP Vision

1. **Missing Dedicated UMP University Hub**: No comprehensive UMP portal (`/ump`) showcasing faculties, campuses (Mbombela, Siyabuswa), fees, residences, and student services.
2. **Missing Verified UMP Programme Catalogue**: UMP's full 30+ degree, diploma, and certificate programmes are not fully populated with verified 2027 requirements.
3. **Missing Interactive UMP Career Roadmaps Engine**: Step-by-step career path trajectory (Grade 12 -> UMP Programme -> Technical Skills -> Internships -> Industry Roles) is not built as an interactive visual node map.
4. **Missing UMP Admission Readiness Predictor**: Needs explicit itemized compatibility scoring (Qualified vs Almost Qualified vs Not Qualified) grounded in UMP's exact APS formula.
5. **Missing UMP Application & Document Assistant**: UMP-specific application checklist, deadline warnings, and POPIA-compliant document completeness validator.
6. **Missing UMP Funding Intelligence**: Specialized UMP bursaries, NSFAS integration guide, and provincial Mpumalanga bursary tracking.
7. **Missing UMP Campus Life Guide**: Residence information, transport details, and campus facilities for Mbombela and Siyabuswa campuses.
8. **Missing Student Mentor Foundation & Gamification**: Level progression badges (Level 1 Explorer to Level 5 Student) and safe mentor profile architecture.

---

## 6. Implementation Order Recommendation

1. **Phase 1: Architecture & Data Verification Foundation**: Preserve uncommitted work, establish `feature/ump-ai-transformation` branch, seed complete verified UMP programme catalogue.
2. **Phase 2: UMP University Profile Hub**: Build dedicated UMP ecosystem portal.
3. **Phase 3: UMP Programme Explorer**: Mobile-first filterable explorer with UMP programme comparison.
4. **Phase 4: AI UMP Course Advisor**: Grounded Gemini 3.6 Flash course recommendation engine.
5. **Phase 5: Interactive Career Roadmaps**: Step-by-step career roadmap builder.
6. **Phase 6: Admission Readiness Predictor**: Granular eligibility matching & shortfall resolution.
7. **Phase 7: UMP Application Assistant**: Learner application checklist & deadline tracking.
8. **Phase 8: AI Document Assistant**: Document completeness check & POPIA-compliant guidance.
9. **Phase 9: UMP Funding Intelligence**: NSFAS & UMP bursary matching radar.
10. **Phase 10: UMP Campus Life Guide**: Mbombela & Siyabuswa campus guides.
11. **Phase 11: Mentor System Foundation**: Safe mentor profile models and moderation controls.
12. **Phase 12: Gamification System**: Professional student progression system.
13. **Phase 13: WhatsApp-Ready Architecture**: Service boundary adapters for WhatsApp integration.
14. **Phase 14: Security, Accessibility & Performance Optimization**: WCAG 2.1 AA audit, CSP hardening, bundle optimization.
15. **Phase 15: Full Regression Testing & Production Readiness**: Vitest, Playwright, typecheck, lint, build.

---

## 7. Testing & Verification Strategy

- **APS Engine**: Unit testing of edge cases (boundary marks, subject substitutions, LO half-weighting).
- **Matching Engine**: Qualification bucket assertions across UMP admission rules.
- **AI Safety & Grounding**: Automated testing of AI responses to prevent hallucination of unverified admission criteria.
- **Firestore Rules**: Emulator-backed integration tests for student & admin role isolation.
- **Playwright E2E**: Desktop and Mobile 3G browser automation for complete learner journeys.

---

## 8. Identified Risks & Mitigation

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| **Unverified Admission Rules** | High (Student acts on false requirements) | Enforce `isFactVerified` gate on all public renders; label unverified facts clearly. |
| **LLM Hallucination** | High (AI invents closing dates or fees) | Use strict tool-grounding (`lookupVerifiedFact`) and system prompt constraints. |
| **POPIA Non-Compliance** | High (Legal liability on minor data) | Mandatory age gate, guardian consent capture, zero ID/sensitive document storage. |
| **Low-End Mobile Latency** | Medium (Poor UX on rural 3G networks) | Keep initial JS bundle < 200KB; PWA offline asset caching. |
