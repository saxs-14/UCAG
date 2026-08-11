# UCAG Architecture Documentation

UCAG (University Companion & Application Guidance) is built on Next.js 15 App Router with Turbopack, TailwindCSS, Firebase Admin SDK, and Gemini 3.6 Flash.

---

## Core System Architecture

```
                                    +-----------------------+
                                    |     Client Browser    |
                                    +-----------+-----------+
                                                |
                                                v
                                    +-----------+-----------+
                                    |  Next.js 15 App Router|
                                    +-----------+-----------+
                                                |
                   +----------------------------+----------------------------+
                   |                            |                            |
                   v                            v                            v
        +----------+----------+      +----------+----------+      +----------+----------+
        |   Server Components |      |    API Routes       |      |   Client Storage    |
        | (lib/catalog, Admin)|      | (/api/studymate/*)  |      | (localStorage)      |
        +----------+----------+      +----------+----------+      +----------+----------+
                   |                            |
                   v                            v
        +----------+----------+      +----------+----------+
        |  Firebase Firestore |      |   Gemini 3.6 Flash  |
        +---------------------+      +---------------------+
```

---

## Service Boundaries

1. **`lib/aps/`**: Pure TypeScript engine for APS calculation (`engine.ts`) and simulation (`simulator.ts`). Zero external dependencies.
2. **`lib/matching/`**: Pure TypeScript programme eligibility matcher (`engine.ts`). Itemises met and unmet requirements into `qualify`, `almostQualify`, and `notYet` buckets.
3. **`lib/studymate/`**: Pure TypeScript interfaces and storage engine (`storage.ts`) supporting anonymous-first local persistence.
4. **`lib/ai/studymate/`**: Structured AI diagnostic engines, timetable generators, quiz/exam simulators, and Socratic tutor services.
5. **`lib/whatsapp/`**: Formats calculated APS scores, recommendations, and study reminders into WhatsApp-ready text payloads.
