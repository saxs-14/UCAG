# UCAG Project Audit
_Generated 2026-06-19 before restructure_

---

## What Exists

**Stack:** React 18 + TypeScript + Vite (no Next.js, no Tailwind, no real Firebase SDK, no MongoDB driver)

**Source files (14):**
| File | Status |
|---|---|
| `src/App.tsx` | Works: tab routing, dark mode, low-data mode, hero |
| `src/components/Navigation.tsx` | Works: sticky nav, 5 tabs, toggles |
| `src/components/APSCalculator.tsx` | Works: correct NSC APS logic, stream presets, save to mock DB |
| `src/components/CareerSimulator.tsx` | Works: 10 career paths, eligibility checklist, SVG demand map |
| `src/components/SuccessAnalytics.tsx` | Partially works: heuristic success probability, bursary table |
| `src/components/MentorshipPortal.tsx` | Partially works: adopt logic is correct, but uses mock DB/Firebase |
| `src/components/AIChatbot.tsx` | FAKE: pattern-matching only, no real AI. Labelled "Mpumi-v2.5" (deceptive) |
| `src/components/SchoolAnalytics.tsx` | Works: seeded data only, SVG bar charts |
| `src/components/ImpactDashboard.tsx` | Gimmick: hardcoded counters, no real data |
| `src/config/mongodb.ts` | FAKE: `LocalMongoDatabase` wraps localStorage. Not MongoDB |
| `src/config/firebase.ts` | FAKE: `MockFirebaseDB` wraps localStorage. Not Firebase |
| `src/index.css` | Works: CSS variables, animations, utility classes |
| `src/main.tsx` | Works: React entry point, service worker registration |
| `public/sw.js` | Exists but minimal |

**Assets:**
- `public/University-of-Mpumalanga-UMP-logo.png` — **KEEP** ✓

---

## What Works
- APS calculation is correct NSC logic (best 6 subjects, LO capped, level mapping)
- Career matching rules (APS thresholds, subject requirements per course) are accurate
- UI structure, tabs, dark mode, low-data mode switch
- Stream presets (Science, Commerce, Humanities)
- Seed data for learners (6), mentors (6), schools (5)
- Mentorship adopt/limit logic (max 3 per mentor)
- Auto-matchmaking algorithm

## What is Broken / Deceptive
- **Chatbot is rule-based pattern matching, not AI.** Branded as "Mpumi-v2.5" — dishonest.
- **Both "MongoDB" and "Firebase" are localStorage wrappers.** Data does not persist across browsers/devices.
- **No real Firebase Auth** — no identity, no security.
- **Voice input** replaces text with a hardcoded string (fake).
- **SMS/USSD simulator** — sends nothing, just shows a copy button.
- **Navigation strip says "Official Student Advisory Platform"** — could imply official endorsement.
- **No server-side code** — no API routes, so Gemini key would have been exposed in the browser.
- **Wrong color palette** — used #006633 / #C8961C; mission requires UMP Navy #0C246C / Red #E43C24 / Gold #FCCC24.

## What to Keep (ported to new codebase)
- APS calculation algorithm (pure functions → `src/lib/aps.ts`)
- Career database (10 paths, thresholds, job lists, salaries → data file)
- Seed data for learners/mentors/schools (→ MongoDB seed script)
- Mentorship adopt/limit logic (→ server-side route handler)
- UMP district demand map concept (SVG, refactored)

## What to Cut / Replace
| Item | Decision | Reason |
|---|---|---|
| Fake MongoDB class | **DELETE** → real MongoDB Atlas | Mission: no fake data |
| Fake Firebase class | **DELETE** → real Firebase SDK | Mission: no mock auth |
| Pattern-matching chatbot | **REPLACE** → Gemini API | Mission: real AI only |
| "Mpumi-v2.5" model badge | **CUT** | Deceptive branding |
| Voice input simulation | **CUT** | Fake input, misleads user |
| SMS/USSD simulator | **CUT** | Hollow shell, not functional |
| ImpactDashboard (hardcoded counters) | **RESCOPE** → Impact leaderboard derived from real data | "Cut" never means replace with mock |
| Vite build system | **REPLACE** → Next.js 16 | Need App Router for server-side API routes |
| Inline CSS + CSS variables | **REPLACE** → Tailwind CSS | Mission: design system tokens |

---

## New Architecture

**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS + Firebase Auth + MongoDB Atlas + Gemini API (`@google/genai`)

**Security pattern:** Firebase ID token verified server-side by Firebase Admin SDK before any MongoDB read/write. Gemini API key and MongoDB URI are server-side only — never in the browser.

**Features (in priority order):**
1. APS Calculator + Course Matching — deterministic, rule-based, no external deps
2. Career Explorer — deterministic rules + live Gemini narrative
3. Mpumi AI Chat — live Gemini (`gemini-2.5-flash`), multilingual, server-side
4. Mentorship Portal — Firebase Auth + MongoDB persistence
5. School Analytics — MongoDB aggregation pipeline over real data
6. Impact Leaderboard — derived from real mentorship data

**Env vars required (see `.env.example`):**
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- `MONGODB_URI`

---

## Update — 2026-06-19 (Post-rebuild status)

All features listed under "New Architecture" above are now built. The rebuild from Vite to Next.js 16 is complete.

### Current Bugs
1. `rounded-btn` class used in `src/app/page.tsx:36` hero CTA (CSS class doesn't exist → unstyled)
2. `ThreadMessage.timestamp` typed as `string` but API stores as `number`
3. `useEffect` missing `onResult` in dependency array in APSCalculatorShell

### Missing Features (to be added this session)
1. **Mentor self-registration form** — users cannot currently create mentor profiles
2. **Learner self-registration form** — only seed data learners exist
3. **`/roadmap` — Personalized Readiness Roadmap** — rule-based + live Gemini guidance
4. **`/bursary` — Bursary Recommender page** — standalone, filterable
5. **Application Tracker** — saved courses, step tracking, MongoDB-persisted per UID
6. **WhatsApp/text export** — from APS Calculator
7. **Offline detection** in Mpumi chat
8. **High-contrast mode** accessibility toggle
9. Navigation expansion (add Bursaries, Roadmap tabs)
