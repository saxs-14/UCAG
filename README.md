# UCAG — UMP Course Advisory Guide

An AI-powered educational ecosystem for University of Mpumalanga (UMP) applicants across Mpumalanga.

> **This is an independent student innovation project and is not affiliated with, endorsed by, or an official system of the University of Mpumalanga.**

---

## Features

| Feature | Status |
|---|---|
| NSC APS Calculator (correct 7-point scale) | ✅ Live |
| UMP Course Matching (10 qualifications) | ✅ Live |
| AI Career Guidance (Google Gemini 2.5 Flash) | ✅ Live |
| Mpumi AI Chat — 5 languages (en/zu/nso/ts/ss) | ✅ Live |
| Adopt-a-Learner Mentorship (Firebase Auth + MongoDB) | ✅ Live |
| School Performance Analytics (MongoDB aggregation) | ✅ Live |
| Bursary Recommender (NSFAS, Funza Lushaka, Mpumalanga Provincial, Sasol) | ✅ Live |
| Mentor Impact Score + Leaderboard | ✅ Live |
| PWA — installable, offline shell | ✅ Live |

---

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v3 with UMP brand palette
- **AI**: Google Gemini 2.5 Flash via `@google/genai` (server-side only)
- **Auth**: Firebase Authentication (client) + Firebase Admin SDK (server token verification)
- **Database**: MongoDB Atlas (server-side only via route handlers)
- **Storage**: Firebase Storage (for future PDF exports)

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd UCAG
npm install
```

### 2. Create `.env.local`

Copy `.env.example` and fill in all values:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|---|---|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) — free tier available |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → Your Apps → Web app |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same Firebase app config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Same Firebase app config |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Same Firebase app config |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Same Firebase app config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Same Firebase app config |
| `FIREBASE_PROJECT_ID` | Firebase Console → Project Settings → General → Project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase Console → Project Settings → Service Accounts → Generate new private key |
| `FIREBASE_PRIVATE_KEY` | Same JSON file — copy the `private_key` value |
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) → Cluster → Connect → Drivers → copy connection string |

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

## Security

- `GEMINI_API_KEY` and all Firebase Admin / MongoDB credentials **never reach the browser** — they are read exclusively in Next.js route handlers.
- Firebase ID tokens issued client-side are verified server-side with Firebase Admin SDK before any MongoDB read or write.
- SafeChat patterns block phone numbers and social handles in the mentorship chat.
- `.env.local` is in `.gitignore` and is never committed.

---

## Project Structure

```
src/
  app/                   # Next.js App Router pages + API routes
    api/
      ai/career/         # POST — Gemini career guidance
      ai/chat/           # POST — Mpumi AI chat
      analytics/schools/ # GET  — MongoDB school aggregation
      mentorship/        # adopt / learners / mentors / messages / profile
    analytics/           # School Analytics page
    career/              # Career Explorer page
    mentorship/          # Mentorship Portal page
    page.tsx             # Home + APS Calculator
  components/
    aps/                 # APSCalculatorShell
    analytics/           # SchoolDashboard
    career/              # CareerExplorer
    chat/                # MpumiChat (floating AI assistant)
    layout/              # Navigation, Footer
    mentorship/          # MentorshipPortal
  data/careers.ts        # 10 UMP qualifications, 6 bursaries, seed data
  lib/
    aps.ts               # NSC APS calculation logic
    firebase-admin.ts    # Server-side token verification
    firebase-client.ts   # Client-side Auth/Storage
    gemini.ts            # Gemini API calls (server-side only)
    mongodb.ts           # Singleton MongoClient
    utils.ts             # cn() utility
  types/index.ts         # Shared TypeScript types
```

---

*UCAG — built for Mpumalanga learners, with Mpumalanga in mind.*
