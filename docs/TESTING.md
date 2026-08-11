# Quality Assurance & Testing Suite

UCAG enforces automated testing across unit, integration, validation, and end-to-end suites.

---

## Test Execution Commands

```bash
# 1. TypeScript Static Type Check
npm run typecheck

# 2. ESLint Static Analysis
npm run lint

# 3. Vitest Unit & Integration Test Suite (289+ tests)
npx vitest run

# 4. Playwright End-to-End Suite
npx playwright test

# 5. Production Turbopack Build Verification
npm run build
```

---

## Suite Breakdown

1. **APS Engine Tests (`lib/aps/engine.test.ts`)**: 32 tests verifying point bands, raw percentage formulas, LO policies, MathLit penalties, best-N selection, and bonus rules.
2. **Eligibility Matcher Tests (`lib/matching/engine.test.ts`)**: Verifies itemised unmet requirement breakdowns into `qualify`, `almostQualify`, and `notYet`.
3. **StudyMate & AI Tests**:
   - `lib/studymate/storage.test.ts`: Local storage persistence.
   - `lib/ai/studymate/studyDiagnosis.test.ts`: Diagnostic evaluations.
   - `lib/ai/studymate/assessmentValidator.test.ts`: Zod schema quality gates.
   - `lib/ai/studymate/tutor.test.ts`: Socratic step-by-step tutoring.
   - `lib/ai/documentAssistant.test.ts`: File size & mime-type validation.
   - `lib/whatsapp/adapter.test.ts`: WhatsApp payload formatting.
4. **Playwright E2E (`tests/e2e/ump-platform.spec.ts`)**: Tests UMP Hub navigation, faculty filters, funding provenance, career roadmaps, StudyMate tools, campus guide, and document privacy shield.
