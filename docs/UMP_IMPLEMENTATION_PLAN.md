# UMP AI Education Platform — Master Implementation Plan (UMP_IMPLEMENTATION_PLAN.md)

**Project:** UCAG UMP Education Platform  
**Target Institution:** University of Mpumalanga (UMP)  
**Architecture Paradigm:** Institution-Agnostic Core with Dedicated UMP Ecosystem  

---

## Phase Breakdown & Scope Definition

### PHASE 1: Architecture & Data Verification Foundation
- Verify and preserve all uncommitted working directory changes.
- Establish clean development branch (`feature/ump-ai-transformation`).
- Create verified UMP seed datasets (`config/umpProgrammes.seed.ts`) covering all 3 faculties (Agriculture & Natural Sciences; Economics, Development & Business Sciences; Education) with 2027 academic year entry requirements, SAQA IDs, NQF levels, and source URLs.
- Seed UMP faculties, schools, programmes, and application windows into Firestore.

### PHASE 2: UMP University Profile Hub
- Build dedicated `/ump` landing and profile experience (`app/ump/page.tsx`).
- Include Overview, Campuses (Mbombela & Siyabuswa), Faculties, Admission Rules, Application Dates, Accommodation Summary, and Official Links.
- Design responsive mobile-first UI with smooth micro-interactions and dark-mode compatible design tokens.

### PHASE 3: UMP Programme Explorer
- Create UMP Programme Explorer (`app/ump/programmes/page.tsx` and `app/ump/programmes/[id]/page.tsx`).
- Detailed programme cards showing Duration, Qualification Type, APS, Subject Requirements, Modules (where verified), Developed Skills, Career Outcomes, and Apply Links.
- Interactive Search, Faculty Filter, Qualification Filter, Sorting, and Programme Comparison drawer.

### PHASE 4: AI UMP Course Advisor
- Build grounded AI Course Advisor (`lib/ai/courseAdvisor.ts` and `components/ai/UmpCourseAdvisor.tsx`).
- Learner inputs subject marks, APS, interests, and career goals.
- AI executes Firestore retrieval tool (`lookupVerifiedFact`) to evaluate compatibility (`QUALIFIED`, `ALMOST QUALIFIED`, `NOT QUALIFIED`, `NEEDS VERIFICATION`).
- Returns match score, detailed rationale, alternative UMP degree options, and shortfall breakdown without hallucinating requirements.

### PHASE 5: Interactive UMP Career Roadmaps
- Create Career Roadmap Engine (`lib/ai/careerRoadmap.ts` and `components/career/CareerRoadmap.tsx`).
- Interactive step-by-step visual trajectory mapping: Grade 12 -> UMP Degree -> Technical Skills & Certifications -> Practical Projects -> Internships -> Industry Career Roles.

### PHASE 6: Admission Readiness & Predictor
- Enhance APS matching with Admission Readiness Scorecard (`components/readiness/ReadinessScorecard.tsx`).
- Itemized compatibility scoring across Academic, Application, Documentation, Funding, and Deadline readiness dimensions.
- Displays exact mark deltas needed for near-miss programmes.

### PHASE 7: UMP Application Assistant
- Create learner Application Preparation Dashboard (`components/application/UmpApplicationChecklist.tsx`).
- Application checklist, UMP closing dates tracker, missing document alerts, and clear distinction between UCAG preparation and actual UMP portal submission.

### PHASE 8: AI Document Assistant
- Build document validation assistant (`lib/ai/documentAssistant.ts` and `components/documents/DocumentAssistant.tsx`).
- Completeness validator for ID, Academic Results, Proof of Address.
- Zero unnecessary storage of sensitive personal documents; strict POPIA data minimisation.

### PHASE 9: UMP Funding Intelligence
- Build UMP Funding Radar (`app/ump/funding/page.tsx`).
- Integrated NSFAS guide, UMP institutional bursaries, and Mpumalanga provincial funding opportunities with scam-prevention risk flags.

### PHASE 10: UMP Campus Life Guide
- Create UMP Campus Life Hub (`app/ump/campus/page.tsx`).
- Verified information for Mbombela and Siyabuswa campuses: Residences, Student Services, Facilities, Libraries, Labs, and Transport options.

### PHASE 11: Student Mentor System Foundation
- Establish data models for UMP Student Mentors (`lib/mentor/types.ts`).
- Verification badge system and privacy-safe, moderated interaction framework.

### PHASE 12: Professional Gamification Progression
- Implement student journey milestones (`components/gamification/ProgressionBadge.tsx`).
- Levels: Level 1 Explorer -> Level 2 Programme Finder -> Level 3 Applicant -> Level 4 Future Student -> Level 5 UMP Student.

### PHASE 13: WhatsApp-Ready Backend Architecture
- Build modular service boundaries (`app/api/whatsapp/adapter.ts`).
- Allows external WhatsApp provider webhooks to query APS calculations, UMP recommendations, and application deadline reminders.

### PHASE 14: Security, Accessibility & Performance Hardening
- WCAG 2.1 AA accessibility audit (keyboard navigation, ARIA labels, contrast ratio).
- Content Security Policy (CSP) refinement, bundle size optimization (< 200KB initial load), and client secret isolation.

### PHASE 15: Full Regression Testing & Validation
- Execute Vitest unit/integration suite, Playwright E2E suite, TypeScript typecheck, ESLint, and Next.js production build.
- Review git status/diff and prepare final summary for user confirmation.
