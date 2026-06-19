# UCAG — UMP Course Advisory Guide

> **An independent student innovation project — not affiliated with, endorsed by, or an official system of the University of Mpumalanga.**

An AI-powered educational ecosystem connecting Mpumalanga Grade 12 learners with UMP career guidance, peer mentors, bursary information, and personalised application support — in five local languages.

---

## Features

| Feature | Status | Notes |
|---|---|---|
| NSC APS Calculator (correct 7-point scale) | ✅ Live | Best-6 logic, LO reduced points, WhatsApp export |
| UMP Course Matching (10 qualifications) | ✅ Live | Per-course eligibility checks with subject requirements |
| AI Career Guidance | ✅ Live | Google Gemini 2.5 Flash, server-side only |
| Mpumi AI Chat — 5 languages | ✅ Live | English, isiZulu, Sepedi, Xitsonga, Siswati; TTS; offline detection |
| Bursary & Funding Finder | ✅ Live | NSFAS, Funza Lushaka, Sasol, Mpumalanga Provincial, ISFAP, Allan Gray |
| Personalised Readiness Roadmap | ✅ Live | Rule-based checklist + live Gemini guidance; progress saved locally |
| Adopt-a-Learner Mentorship | ✅ Live | Firebase Auth + MongoDB; XP/badges; SafeChat guardrails |
| Mentor & Learner Registration | ✅ Live | Self-registration forms persisted to MongoDB |
| School Performance Analytics | ✅ Live | MongoDB aggregation; KPIs, subject struggles, readiness rates |
| Mentor Impact Score + Leaderboard | ✅ Live | XP earned through adoptions and messages; badge system |
| Dark mode | ✅ Live | localStorage persistence |
| PWA — installable, offline shell | ✅ Live | manifest.json, service worker, offline state messaging |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v3 — UMP brand design system |
| AI | Google Gemini 2.5 Flash via `@google/genai` — server-side only |
| Auth | Firebase Authentication (client) + Firebase Admin SDK (server) |
| Database | MongoDB Atlas — all structured app data, server-side only |
| Deployment | Vercel / Netlify ready |

**Security model:** Firebase ID tokens are verified server-side (Firebase Admin) before any MongoDB read/write. The Gemini API key and MongoDB URI never reach the browser.

---

## Local Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd UCAG
npm install
```

### 2. Create `.env.local`

```bash
cp .env.example .env.local
```

Fill in all values (see table below):

| Variable | Where to get it |
|---|---|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) — free tier |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → Your Apps → Web app |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Same Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Same Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Same Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Same Firebase web app config |
| `FIREBASE_PROJECT_ID` | Firebase Console → Project Settings → General → Project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase Console → Project Settings → Service Accounts → Generate new private key → `client_email` |
| `FIREBASE_PRIVATE_KEY` | Same JSON → `private_key` (include the `-----BEGIN PRIVATE KEY-----` wrapper, in double quotes) |
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) → Cluster → Connect → Drivers |

### 3. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Production build

```bash
npm run build
npm start
```

---

## MongoDB Collections

Data auto-seeds on first connection from seed arrays in `src/data/careers.ts`.

| Collection | Contents |
|---|---|
| `learners` | Learner profiles (keyed by Firebase UID) |
| `mentors` | Mentor profiles (keyed by Firebase UID) |
| `messages` | Mentorship messages (SafeChat filtered) |
| `mentorship_matches` | Mentor–learner assignment records |
| `schools` | Mpumalanga school performance data |

---

## Project Structure

```
src/
  app/
    api/
      ai/career/          POST — Gemini career guidance
      ai/chat/            POST — Mpumi multilingual chat
      ai/roadmap/         POST — Gemini readiness guidance
      analytics/schools/  GET  — MongoDB school aggregation
      mentorship/         adopt, learners, mentors, messages, profile, register
    analytics/            School Analytics page
    bursary/              Bursary Finder page (NEW)
    career/               Career Explorer page
    mentorship/           Mentorship Portal page
    roadmap/              Readiness Roadmap page (NEW)
    page.tsx              Home + APS Calculator
  components/
    aps/                  APSCalculatorShell (WhatsApp export)
    analytics/            SchoolDashboard
    bursary/              BursaryExplorer (NEW)
    career/               CareerExplorer + DemandMap
    chat/                 MpumiChat (offline detection)
    layout/               Navigation (6 tabs), Footer
    mentorship/           MentorshipPortal + Registration forms
    roadmap/              ReadinessRoadmap (NEW)
  data/careers.ts         10 UMP courses, bursaries, seed data
  lib/
    aps.ts                NSC APS calculation (deterministic)
    firebase-admin.ts     Server-side token verification
    firebase-client.ts    Client-side Auth/Storage
    gemini.ts             Gemini API calls (server-side)
    mongodb.ts            Singleton MongoClient
    utils.ts              cn() utility
  types/index.ts          Shared TypeScript types
```

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Set all env vars from `.env.local` in Vercel → Project → Settings → Environment Variables.

> MongoDB Atlas: make sure your cluster's IP Access List allows `0.0.0.0/0` or Vercel's IP ranges.

---

## Data Notes

- Course APS requirements are based on publicly available UMP information and may vary by year. Always verify at [apply.ump.ac.za](https://apply.ump.ac.za).
- Bursary information is sourced from official provider websites as of 2025. Eligibility criteria change — check the provider directly.
- School performance data is seeded as representative sample data for demonstration purposes.

---

*UCAG — built for Mpumalanga learners, with Mpumalanga in mind.*
