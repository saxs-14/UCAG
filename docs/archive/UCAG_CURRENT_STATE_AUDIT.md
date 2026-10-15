# UCAG CURRENT STATE AUDIT

**Date:** 2026-08-14  
**Repository:** https://github.com/saxs-14/UCAG  
**Branch:** `master`  
**Commit:** `65adf0d`  
**Auditor:** Lead Software Architect & Full-Stack Security Engineer  

---

## 1. What Currently Works
- **Pure APS Engine (`lib/aps/`)**: Pure TypeScript calculation engine supporting UMP's verified Life Orientation ÷ 2 rule (`loPolicy: "halfWeight"`), UP/UJ/TUT (`exclude`), Wits (`include` + bonus points), NWU/UKZN (8-level scale), and NMU (`percentageSum`).
- **Eligibility Matching (`lib/matching/`)**: Matches learner marks against compulsory subject levels and minimum APS scores, bucketing into *Qualify*, *Almost Qualify* (shortfall resolution + alternative pathways), and *Not Yet*.
- **Scam-Free Bursary Radar (`lib/bursaries/`)**: Automatically flags and rejects listings requiring upfront payment (`requiresUpfrontPayment`).
- **Grounded AI Advisory Chat (`app/api/chat/`)**: Powered by Gemini 3.6 Flash streaming over SSE with `lookupVerifiedFact` tool grounding.
- **Firebase Auth Setup (`lib/firebase/client.ts`)**: Lazy client Auth SDK initialization supporting Email/Password, Google Auth, and Anonymous guest sessions. Handles domain error formatting cleanly (`lib/auth/formatAuthError.ts`).
- **Profile Management (`lib/auth/profile.ts`)**: Safely creates and upserts user profiles in Firestore, enforcing per-user ownership and POPIA minor guardian consent.

---

## 2. What Partially Works
- **Role Gating & Authentication Portals**: `/account/parent`, `/account/mentor`, and `/admin` routes exist, but `/admin/login`, `/parent/login`, and `/mentor/login` dedicated login portals with strict role enforcement do not yet exist as distinct entry points.
- **Institutional Branding System**: Institutions have `shortName` and basic metadata in `lib/firestore/types.ts`, but dynamic institutional theme tokens (logo, primaryColor, secondaryColor, accentColor, favicon) are not yet bound to CSS theme variables on `/institutions/[id]`.
- **Multi-Role User Schema**: User profiles support custom claim roles (`admin`) and POPIA minor fields, but lack first-class `institutionId`, `institutionDomain`, and explicit `institutionMembershipStatus` attributes.

---

## 3. What Is Broken
- **Direct Access to Protected Portals**: Currently, visiting `/account/parent` or `/account/mentor` allows UI rendering without checking if the authenticated user possesses the corresponding verified role or guardian linkage.
- **Domain Authorization Guidance**: When deploying to new custom domains or staging environments, users who haven't added the host to Firebase Console receive OAuth domain errors unless guided by explicit UI notices.

---

## 4. What Is Missing
- **Dedicated Role Login Portals**: `/admin/login`, `/parent/login`, and `/mentor/login` with custom UX tailored to each role.
- **Parent/Guardian Learner Account Linking**: Real database relationships linking a parent's UID to their minor learner's UID (`guardianIds` / `linkedLearnerIds`) with consent audit trails.
- **Peer Mentor Verification Workflow**: Mentor verification states (`pending`, `verified`, `suspended`, `rejected`) and campus assignment in Firestore.
- **App-Like Mobile Navigation Shell**: Mobile-first bottom navigation bar for quick access across Home, Institutions, Programmes, Bursaries, and Profile on viewports < 768px.
- **UCAG Reusable Design System Tokens**: Unified CSS variable design tokens for institution branding overlays vs core UCAG shell identity.

---

## 5. Authentication Architecture
- **Client SDK**: `lib/firebase/client.ts` initializes Firebase Auth lazily (`initializeAuth`) with `indexedDBLocalPersistence` and `browserLocalPersistence`.
- **Providers**: Email/Password and Google OAuth (`signInWithPopup` with `browserPopupRedirectResolver`).
- **Anonymous Sessions**: Supported for guest calculator users without forcing immediate sign-in.

---

## 6. Authorization Architecture
- **Server-Side Admin Gate**: `lib/admin/auth.ts` (`requireAdmin`) verifies ID token custom claims (`role === "admin"`).
- **Client-Side Admin Layout**: `app/admin/layout.tsx` checks `isAdmin` custom claim from `AuthProvider`.
- **Firestore Security Rules**: `firestore.rules` enforces `isOwner(uid)` for `userProfiles` and `isAdmin()` for admin collections (`sources`, `verificationQueue`, `ingestionRuns`, `linkHealthChecks`).

---

## 7. Existing User Roles
- `learner`: Default role for applicants and matriculants.
- `admin`: Platform and university administrator (verified via custom claim `role: "admin"`).
- `parent`: Parent/Guardian (partially represented in `AccountPage.tsx` and `/account/parent`).
- `mentor`: Peer Mentor (partially represented in `/account/mentor`).

---

## 8. Existing Dashboards
- `/account`: Learner profile, saved marks, shortlist, and portal navigation links.
- `/account/parent`: Parent consent toggle and deadline overview.
- `/account/mentor`: Peer mentor profile overview and sample requests.
- `/admin`: Admin console overview, verification queue, source register, ingestion runs, content editor, and dead-link report.

---

## 9. Existing Firebase Integration
- **Client App**: `getFirebaseApp()` & `getFirebaseAuth()`.
- **Firestore Client**: `getFirebaseDb()` lazy initializer.
- **Server Admin App**: `lib/firebase/admin.ts` initializing `firebase-admin/app` & `firebase-admin/firestore`.

---

## 10. Existing Firestore Collections
- `institutions`, `faculties`, `schools`, `programmes`
- `apsRules`, `applicationWindows`, `subjects`
- `bursaries`, `internships`, `statistics`
- `sources`, `ingestionRuns`, `verificationQueue`, `linkHealthChecks`
- `userProfiles`

---

## 11. Existing Firestore Rules
- Public read access for catalogue collections (`institutions`, `programmes`, `apsRules`, `bursaries`, etc.).
- Admin-only read access for `sources`, `ingestionRuns`, `verificationQueue`, `linkHealthChecks`.
- Owner-only read/write access for `userProfiles/{uid}` with strict POPIA guardian consent invariants.

---

## 12. Existing Navigation
- Header bar (`components/NavBar.tsx`) containing:
  - 🎓 APS Calculator (`/`)
  - 🏛️ Institutions (`/institutions`)
  - 💰 Bursaries (`/bursaries`)
  - 📊 Statistics (`/statistics`)
  - 👤 Profile (`/account`)

---

## 13. Existing UI Architecture
- Next.js 15 App Router with Tailwind CSS v4.
- Modern typography (`Inter`), responsive container layouts, glassmorphic header cards, and brand colors (`brand-teal`, `brand-navy`, `brand-coral`).

---

## 14. Existing Mobile Experience
- Responsive grid and flex layouts adapting down to 320px.
- Compact form controls for subject mark entry.

---

## 15. Existing Responsive Issues
- Lack of a dedicated mobile bottom navigation bar on small viewports (< 640px).
- Complex tables in admin views require horizontal scrolling on mobile screens.

---

## 16. Existing Technical Debt
- Static hardcoded mentor requests on `/account/mentor`.
- Static hardcoded consent toggle on `/account/parent` without real Firestore persistence to linked learner accounts.

---

## 17. Existing Errors / Warnings
- **0 TypeScript errors**, **0 ESLint errors/warnings**.
- Firebase `auth/unauthorized-domain` handled gracefully with setup instructions via `formatAuthError`.

---

## 18. Existing Placeholder / Mock Data
- Sample mentor request state in `app/account/mentor/page.tsx`.

---

## 19. Existing Unused Features
- None. StudyMate and Gamification were completely removed in previous cleanup.

---

## 20. Existing Features That Do Not Belong in UCAG
- All out-of-scope non-admission features have been purged.

---

## 21. What Must Be Preserved
- Pure APS calculation engine (`lib/aps/`).
- Provenance tracking (`sourceUrl`, `verifiedOn`, `academicYear`).
- Scam-free bursary detection algorithm.
- Grounded Gemini AI chat architecture.
- POPIA guardian consent security invariants in `firestore.rules`.

---

## 22. What Must Be Redesigned
- **Dedicated Login Portals**: Create `/admin/login`, `/parent/login`, and `/mentor/login`.
- **Role Authorization Enforcement**: Enforce strict server-side and client-side role checks on all portal routes.
- **Mobile Bottom Navigation**: Implement a mobile navigation bar (`components/MobileNavBar.tsx`).
- **Institutional Theme Engine**: Bind institution primary/secondary branding tokens dynamically to CSS properties.
- **Parent-Learner Linking & Mentor Verification**: Implement real Firestore schema for guardian links and mentor verification states.

---

## 23. What Must Be Removed
- Hardcoded static states in parent/mentor demo pages.
