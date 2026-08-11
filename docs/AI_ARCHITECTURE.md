<!-- cSpell:words UCAG Firestore studymate -->
# AI System Architecture & Grounding

UCAG and StudyMate leverage Gemini 3.6 Flash for intelligent user assistance while maintaining absolute factual grounding and privacy safety.

---

## AI Assistant Modules

### 1. Grounded University Assistant (`lib/chat/geminiChatClient.ts`)
- **Tool Calling**: Invokes `lookupVerifiedFact` to fetch verified UMP programmes, APS rules, and application windows directly from Firestore.
- **Streaming SSE**: Returns server-sent events (`lib/chat/sse.ts`) for real-time text streaming.
- **Rate Limiting**: Protected by sliding window rate limiter (`lib/chat/rateLimiter.ts`).

### 2. StudyMate Academic Diagnosis (`lib/ai/studymate/studyDiagnosis.ts`)
- Evaluates subject mark gaps (current vs target).
- Generates priority topic recommendations.
- Mandates non-medical educational disclaimer.

### 3. Assessment Generator & Validator (`lib/ai/studymate/assessmentValidator.ts`)
- Enforces strict Zod schema validation on AI-generated quizzes and mock exams.
- Verifies option counts, mark totals, and explanation quality before rendering to learners.

### 4. Socratic AI Tutor (`lib/ai/studymate/tutor.ts`)
- Implements 5-step learning loop: *Explain → Example → Try → Feedback → Retry*.
- Guides learners to discover answers step by step without answer dumping.
