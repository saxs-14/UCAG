# FINAL PROJECT AUDIT — UCAG v2

**Date:** 2026-08-14  
**Repository:** https://github.com/saxs-14/UCAG  
**Branch:** `master`  
**Commit:** `f84231e`  
**Auditor:** Lead Senior Full-Stack, Software Architect, Security, QA, UX & DevOps Engineer  

---

## Executive Summary of Audit

A complete, unvarnished inspection of the actual source code, database structures, configurations, and test suites was conducted. 

### Critical Findings:
1. **StudyMate / VarsityPath Remnants**: `app/studymate`, `lib/studymate`, `lib/ai/studymate`, `components/studymate`, and `app/api/studymate` exist and are linked directly in `components/NavBar.tsx` ("VarsityPath AI"). Must be completely purged per Phase 3.
2. **Gamification Remnants**: `lib/gamification/achievements.ts` and `components/gamification/ProgressionBadge.tsx` exist in the codebase. Must be completely purged per Phase 4.
3. **Firebase Production Authentication Config**: The client config environment variables (`NEXT_PUBLIC_FIREBASE_*`) and server config (`FIREBASE_ADMIN_*`) were unpopulated in `.env.local` and defaulting to emulator mode (`NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`). Production real Firebase auth requires explicit environment variable validation and runtime degradation handling.
4. **APS Calculator UI & Engine**: The pure APS engine in `lib/aps/engine.ts` correctly handles UMP's `loPolicy: "halfWeight"` (LO divided by 2). However, the UI needs an explicit **CALCULATE APS** form submit button and institution-first selection flow per Phase 5.
5. **Multi-Institution Navigation**: Nav bar currently contains VarsityPath AI instead of a clean, dedicated `Institutions` portal where UMP lives as a top-tier launch university alongside future universities.

---

## Detailed Audit Table

| Feature / Area | Current Implementation | Working? / Status | Required Action |
|---|---|---|---|
| **Repository & Git State** | Clean working tree on `master` branch. Commit `f84231e`. | Working | Ready for scoped modifications and clean commit. |
| **Next.js & Build Pipeline** | Next.js 15 App Router (Turbopack, TypeScript strict). `npm run typecheck` passes with 0 errors. | Working | Maintain strict typechecking and build integrity. |
| **APS Engine (`lib/aps/`)** | Pure TypeScript engine supporting `pointBandSum`, `loPolicy: "halfWeight"` (LO / 2 for UMP), `exclude`, `include`, `capAt`. 32 unit tests passing. | Working | Preserve pure TS engine; ensure UI binds to explicit "CALCULATE APS" submit. |
| **Eligibility Matching Engine** | Categorizes results into `qualify`, `almostQualify` (showing shortfall & alternative pathways), and `notYet`. | Working | Ensure alternatives are grounded and non-hallucinated. |
| **StudyMate / VarsityPath AI** | Found in `app/studymate`, `lib/studymate`, `lib/ai/studymate`, `components/studymate`, `app/api/studymate`, `NavBar.tsx`. | **To Be Removed** | Delete all files, APIs, components, routes, and docs per Phase 3. |
| **Gamification** | Found in `lib/gamification/` and `components/gamification/`. | **To Be Removed** | Delete all gamification achievements, XP, and badge logic per Phase 4. |
| **Firebase Client Auth** | Configured in `lib/firebase/client.ts`. Lazy initialization gracefully degrades when credentials aren't present. | Partially Working | Provide clean production environment validation & fallbacks for real Firebase Auth. |
| **Firebase Admin SDK** | Server-side init in `lib/firebase/admin.ts`. Protects custom claims and Firestore admin operations. | Working | Ensure `server-only` guards prevent client bundle leakage. |
| **Firestore Security Rules** | `firestore.rules` enforces user-ownership on `userProfiles/{uid}` and POPIA minor guardian consent invariants. | Working | Verify against rules unit tests. |
| **Multi-Institution Architecture** | Institutional data models (`Institution`, `Faculty`, `School`, `Programme`) support tiering and branding tokens. | Partially Working | Update primary navigation to `Institutions` (`/institutions`) containing UMP and future universities. |
| **UMP Data & Seed Scripts** | Seed scripts `seed-ump-data.mts` and `seed-real-aps-rules.mts` contain verified UMP faculties, programmes, and APS rules. | Working | Ensure no fake placeholder data is displayed. |
| **Bursary & Funding Radar** | `lib/bursaries/` and `bursarySafety.ts` filter out upfront fee scams (`requiresUpfrontPayment`). | Working | Retain verified bursaries and NSFAS guidance. |
| **AI Assistant (Gemini 3.6 Flash)** | `app/api/chat/` uses streaming SSE with `lookupVerifiedFact` tool grounding to prevent hallucination. | Working | Restrict AI prompt focus purely to university guidance and funding (no tutoring/quizzes). |
| **User Roles & Dashboards** | Role custom claims supported in auth system (`learner`, `applicant`, `student`, `guardian`, `mentor`, `staff`, `admin`). | Partially Working | Wire role-specific dashboard view options and security constraints. |
| **Mobile-First UX / UI** | Tailwind CSS v4 styling across 320px+ viewports with PWA service worker registration. | Working | Ensure responsive touch targets and clean contrast across viewports. |

---

## Conclusion & Verification Plan

The codebase foundation is solid with zero TypeScript errors and a robust, pure APS calculation engine. Execution will focus on:
1. Complete removal of all StudyMate and Gamification remnants.
2. Restructuring navigation to prioritize multi-institution discovery (`/institutions`).
3. Enforcing explicit user-driven "CALCULATE APS" behavior in the calculator UI.
4. Ensuring production Firebase Auth fallback and custom claim handling.
5. Verifying clean build (`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`).
