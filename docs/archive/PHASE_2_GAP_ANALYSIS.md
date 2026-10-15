# UCAG Phase 2 Gap Analysis Report

**Date:** August 11, 2026  
**Status:** Approved for Phase 2 Implementation  
**Project:** UCAG (University Course Application Guide) — UMP Platform & StudyMate  

---

## Executive Summary

Following a comprehensive audit of the UCAG repository (`saxs-14/UCAG`), the core UMP transformation (Phases 1–5) is verified as fully operational:
- **Data & Provenance**: 12 verified UMP programmes, faculties, schools, application windows, and `UMP_APS_RULE` seeded with 100% provenance compliance (`sourceUrl`, `verifiedOn`, `academicYear`).
- **Pages & Routes**: UMP Hub (`/ump`), Programme Explorer (`/ump/programmes`), Programme Detail (`/ump/programmes/[id]`), UMP Funding (`/ump/funding`), and Career Roadmaps (`/ump/careers`).
- **Quality Gates**: `typecheck` (0 errors), `lint` (0 errors), `vitest` (236/236 pass), Next.js Turbopack build (`23/23` static pages generated), and Playwright E2E suite (`tests/e2e/ump-platform.spec.ts`).

This Phase 2 analysis identifies remaining feature gaps, partial implementations, and the requirements for **StudyMate** — the major new AI-powered student academic support system.

---

## Gap Analysis Matrix

| Requirement | Status | Evidence in Repository | Phase 2 Action |
| :--- | :--- | :--- | :--- |
| **Document Assistant** | Partial | `useApplicationChecklist.ts` & `ApplicationChecklist.tsx` exist for static checklists; no POPIA document validation, completeness checker, or upload classifier. | Implement `lib/ai/documentAssistant.ts` & `/app/application/documents` assistant interface. |
| **Mentor System** | Missing | No mentor schema, seed data, or UI routes exist in `lib/` or `app/`. | Implement `lib/mentors/`, mentor profile schema, and `/ump/mentors` directory. |
| **Gamification System** | Missing | No `ProgressionBadge.tsx` or achievement tracking engine exists. | Implement `lib/gamification/achievements.ts` & `components/gamification/ProgressionBadge.tsx`. |
| **WhatsApp-Ready Architecture** | Missing | No `lib/whatsapp/` adapter or service boundaries exist. | Implement `lib/whatsapp/adapter.ts` for APS, recommendations, timetables, and alerts. |
| **Campus Guide** | Partial | UMP campus names (`Mbombela`, `Siyabuswa`) exist in seed data; dedicated campus guide page is missing. | Create `/ump/campus/page.tsx` with verified facilities, residences, transport, and contact information. |
| **Performance Testing** | Partial | Next.js build stats recorded; no structured performance audit suite or metrics report exists. | Run Lighthouse/Performance benchmark and publish `/docs/PERFORMANCE_AUDIT.md`. |
| **Security Review** | Partial | `firestore.rules`, server-only SDK checks, and rate limiters exist; no unified security audit document. | Conduct security review and publish `/docs/SECURITY_REVIEW.md`. |
| **StudyMate Dashboard & Profile** | Missing | No `/studymate` route, profile form, or subject tracker exists. | Build `/studymate` dashboard & student profile setup. |
| **AI Study Diagnosis** | Missing | No AI diagnosis service for mark evaluation exists. | Implement `lib/ai/studymate/studyDiagnosis.ts`. |
| **Personalised AI Study Timetable** | Missing | No study timetable generator exists. | Implement `lib/ai/studymate/studyTimetable.ts` & schedule viewer. |
| **Smart Study Plan** | Missing | No week-by-week goal-driven study plan generator exists. | Implement `lib/ai/studymate/studyPlan.ts`. |
| **Study Material Organiser** | Missing | No material management interface (`/studymate/materials`) exists. | Build `/studymate/materials` with subject/topic tagging. |
| **AI Material Summariser** | Missing | No material summary/flashcard extraction service exists. | Implement `lib/ai/studymate/materialSummariser.ts`. |
| **AI Assessment System** | Missing | No Quiz (`/studymate/quiz`), Test (`/studymate/test`), or Mock Exam (`/studymate/mock-exam`) generators exist. | Build assessment engines with strict JSON validation (`assessmentValidator.ts`). |
| **AI Study Tutor & Step-by-Step Learning** | Missing | No interactive Socratic study tutor exists. | Build `lib/ai/studymate/tutor.ts` and step-by-step problem solver. |
| **Performance Tracking & Weak Topics** | Missing | No topic-level progress tracking or weak topic detection exists. | Implement `lib/studymate/performanceTracking.ts`. |
| **Revision Mode & Past Paper Support** | Missing | No countdown revision builder or past paper tagger exists. | Build `/studymate/past-papers` & revision mode. |

---

## Architectural Principles for Phase 2

1. **Strict Non-Destructive Extension**: Zero existing code, routes, or tests will be replaced or broken. All new features will build cleanly on top of existing components, types, and data fetchers.
2. **Provenance & Safety**: AI-generated StudyMate content (quizzes, plans, summaries) will be strictly validated via structured JSON schemas and non-hallucination prompts. AI tutors will strictly maintain educational support boundaries without medical/psychological claims.
3. **Anonymous-First & Local Storage Persistence**: StudyMate and Document Assistant will support immediate anonymous usage via `localStorage`, seamlessly upgrading to authenticated user profiles when signed in.
4. **Performance & Lightweight UI**: StudyMate visualisations (progress bars, timetables, topic breakdown) will use pure CSS and Tailwind utility components without introducing heavy graph dependencies.
