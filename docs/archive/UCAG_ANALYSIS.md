# UCAG — Complete System & Architecture Audit (UCAG_ANALYSIS.md)

**Document Version:** 1.0  
**Date:** 2026-08-11  
**Lead Engineer:** Senior Full-Stack, Architecture & AI Lead (Antigravity AI)  
**Status:** Deep System Audit Completed  

---

## 1. Current Architecture Overview

UCAG v2 is built as a national-capable university & career guidance web platform using modern Next.js 15 App Router (TypeScript strict mode), React 19, Tailwind CSS v4, Google Cloud Firestore, and Firebase Authentication.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Client Layer (Web / PWA)                           │
│  Next.js 15 App Router (React 19) · Tailwind CSS v4 · Service Worker        │
└───────────────────────┬─────────────────────────────┬───────────────────────┘
                        │                             │
       Client Auth & Firestore Reads             Server-side Route Handlers
                        │                        (Cron, Ingestion, Admin API)
                        ▼                             ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────────┐
│     Firebase Client SDK (v12)         │ │    Firebase Admin SDK (v14)       │
│ Auth (Email/Google/Anonymous)         │ │ Firestore Admin (Bypasses Rules)  │
│ Firestore Client (Security Rules)     │ │ Gemini 3.6 Flash LLM Engine       │
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

### Architectural Subsystems

1. **Pure APS Engine (`lib/aps/`)**:
   - Zero external/framework dependencies (pure TypeScript).
   - Calculates per-institution APS scores based on institutional strategy objects (`pointBandSum`, `pointBandWithBonus`, `percentageSum`, etc.).
   - Explicitly handles Life Orientation policies (`exclude`, `include`, `halfWeight`, `capAt`), subject caps, and bonus rules.

2. **Provenance & Verification Gate (`isFactVerified`)**:
   - Non-negotiable trust invariant: Every fact-bearing Firestore document must contain `sourceUrl`, `verifiedOn`, and `academicYear`.
   - Records failing `isFactVerified()` are filtered out before rendering on public pages.

3. **Catalogue & Matching Engine (`lib/matching/`)**:
   - Itemizes minimum APS score, compulsory subject achievement levels, and pass types.
   - Categorizes results into `qualify`, `almostQualify`, and `notYet`.

4. **AI Assistant & SSE Streaming (`lib/chat/`, `app/api/chat/`)**:
   - Provider-agnostic LLM interface supporting Gemini 3.6 Flash with SSE token-by-token streaming.
   - Grounded tool (`lookupVerifiedFact`) that queries Firestore so the AI cannot hallucinate non-existent admission rules or closing dates.

5. **Authentication & POPIA Privacy (`lib/auth/`, `firestore.rules`)**:
   - Anonymous calculator access (no login required for APS calculation).
   - Optional Firebase Auth with age-gating (18+ vs minor) and mandatory guardian consent capture (`consentRecord`) enforced at the Firestore Security Rules level.

6. **Ingestion & Admin Pipeline (`lib/ingestion/`, `app/admin/`)**:
   - Scheduled/manual ingestion with `robots.txt` compliance, ETag checking, LLM Zod extraction, risk evaluation, and human admin verification queue (`/admin/queue`).

---

## 2. Existing Features Analysis

### Fully Implemented (Real & Tested)
- **APS Calculation Engine**: Multi-formula support (`pointBandSum`, `pointBandWithBonus`, `percentageSum`) with 32 unit tests.
- **National Subject Taxonomy**: Standard NSC subjects, designated status, and language categorization.
- **Firestore Security Rules**: Public read-only catalog, owner-only user profiles, guardian consent validation.
- **AI Chat SSE Streaming**: Grounded tool-augmented AI advisor streaming via `app/api/chat`.
- **Bursaries & Internships Filter**: Filter by field of study, level required, and scam risk flags (`requiresUpfrontPayment`).
- **Statistics Dashboard**: DHET/DBE national enrolment and pass rate metrics display.
- **POPIA Invariants**: Minor guardian consent, account data export/deletion.

### Recently Built (Uncommitted Work in Progress)
- **ApsImprovementSimulator**: Subject mark delta simulator to calculate ROI of mark improvements (`lib/aps/simulator.ts`).
- **AdmissionPathwayGraph**: Visual node graph (`YOU` -> `Institutions` -> `Qualified` -> `Near-Miss` -> `TVET/Cert`).
- **ApplicationReadiness Scorecard**: 6-dimension readiness breakdown (`lib/readiness.ts`).
- **SmartBackupPlan**: Alternative articulation pathways (Foundation -> Degree).
- **ApplicationMission**: 5-step milestone progress checklist.

### Missing / Incomplete for UMP Platform Vision
- **UMP University Profile Hub**: No dedicated `/ump` or `/institutions/ump` profile page detailing UMP's campuses (Mbombela, Siyabuswa), faculties, fees, residences, and student services.
- **Full UMP Programme Catalogue**: Only 5 UMP source links exist in `config/sources.seed.ts`. UMP's full 30+ undergraduate programmes (ICT, Law, Education, Agriculture, Hospitality, Science, Nursing) are not fully populated in Firestore.
- **UMP Career Roadmaps Engine**: Basic `careerOutcomes` string array exists, but no step-by-step interactive career trajectory engine (Grade 12 -> Degree -> Skills -> Internship -> Career Role).
- **UMP Application Preparation Assistant**: Application checklist exists in generic form, but no UMP-specific deadline tracker, application fee calculator, or campus-specific checklist.
- **Document OCR/Assistant**: No document upload validation, OCR analysis, or POPIA-compliant document completeness checking.
- **UMP Campus Life Guide**: No structured information for Mbombela and Siyabuswa campuses, residences, transport, or facilities.
- **Student Mentor System Foundation**: No mentor profile models, verification system, or privacy-safe communication structure.
- **Gamification**: No formal XP, level badge system (Level 1 Explorer -> Level 5 UMP Student) integrated into the user profile.
- **WhatsApp API Boundary**: Backend routes exist for REST/SSE, but no WhatsApp webhook/adapter payload contracts for messaging integration.

---

## 3. Existing UMP Functionality

1. **Institution Record**:
   - `id: "ump"`, `name: "University of Mpumalanga"`, `shortName: "UMP"`, `type: "traditionalUniversity"`, `province: "Mpumalanga"`, `campuses: ["Mbombela"]`.
   - `websiteUrl`: `https://www.ump.ac.za/`
   - `applicationPortalUrl`: `https://www.ump.ac.za/Study-with-us/Application-Process/Online-Applications`

2. **APS Rule Record**:
   - `institutionId: "ump"`, `formulaType: "pointBandSum"`, `loPolicy: "halfWeight"`, `bestNSubjects: 7`, `mathLitPolicy: "excludedForSomeProgrammes"`.
   - Verified sourceUrl pointing to UMP's Undergraduate Programmes brochure.

3. **Programme Data**:
   - Only 5 UMP programme source URLs registered in `config/sources.seed.ts`.
   - Missing complete structured programme records in Firestore for UMP's full faculty list:
     - Faculty of Agriculture and Natural Sciences
     - Faculty of Economics, Development and Business Sciences
     - Faculty of Education

---

## 4. Technical Debt & Code Quality Assessment

1. **Uncommitted Working Directory**:
   - 16 modified files and 11 untracked files from a previous feature sprint. Must be audited and preserved safely.
2. **Catalogue Hydration Dependency**:
   - `getRealCatalog()` fetches all collections via `Promise.all` on client side. For UMP scaling, caching and targeted institution queries are recommended.
3. **Vitest Worker Parallelism on Windows**:
   - Without the local Firebase emulator running, tests touching `firestore.rules` or `auth-integration` cause Vitest worker pool timeouts.
4. **Hardcoded Sample Data Fallback**:
   - Legacy `config/sampleData.ts` exists for demo purposes with `[Sample]` prefixes, but UI components should smoothly degrade when verified records are missing.

---

## 5. Recommended Architecture Progression

1. **Multi-Tenant / Multi-Institution Core**:
   - Retain `Institution` -> `Faculty` -> `School` -> `Programme` relational model in Firestore.
   - Create a specialized UMP Ecosystem layer (`/ump` portal) while maintaining institution-agnostic API and database contracts.
2. **Verified Grounding Pipeline for UMP**:
   - Seed verified UMP faculties, departments, and 30+ undergraduate programmes with explicit `sourceUrl`, `verifiedOn`, and `academicYear: 2027`.
3. **Modular AI Service Layer (`lib/ai/`)**:
   - Extract AI modules into dedicated sub-services:
     - `lib/ai/courseAdvisor.ts`
     - `lib/ai/careerRoadmap.ts`
     - `lib/ai/documentAssistant.ts`
     - `lib/ai/fundingMatcher.ts`
4. **Offline & Low-Data Mobile Strategy**:
   - PWA support with local caching of APS calculations, UMP programme search, and application checklist for students on 3G prepaid data.
