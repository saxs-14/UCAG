# UCAG AUTHENTICATION, ONBOARDING & UI REDESIGN AUDIT

**Date:** 2026-08-14  
**Repository:** https://github.com/saxs-14/UCAG  
**Branch:** `master`  
**Auditor:** Senior Full-Stack Architect & Security Engineer  

---

## 1. Current Authentication Flow
- Client authentication is lazily initialized via `lib/firebase/client.ts` using `indexedDBLocalPersistence` and `browserLocalPersistence`.
- Auth state is broadcast app-wide via `AuthProvider.tsx` (`useAuth()`), returning `{ user, loading, isAdmin, authUnavailable }`.
- Login supports Email/Password and Google OAuth popup (`signInWithPopup`).

---

## 2. Current User Registration Flow
- Handled inside `AccountPage.tsx` using `SignUpForm.tsx` and `SignInForm.tsx`.
- Collects email, password, and date of birth, automatically setting `isMinor: true` if under 18 and prompting for guardian consent.
- Creates/upserts the profile in Firestore via `createUserProfile()` in `lib/auth/profile.ts`.

---

## 3. Current Profile Visibility
- Currently, `components/NavBar.tsx` statically exposes `👤 Profile` (`/account`) to all users (both logged in and logged out).
- **Flaw**: Logged-out visitors see the profile link in navigation. Per system rules, **My Profile / Account must be hidden from logged-out users**, with navigation defaulting to `Home | Institutions | Programmes | Admissions | Funding | Career Guidance | AI Assistant` + `Sign In | Create Account`.

---

## 4. Current Calculator Behavior
- APS calculator allows public input of subject percentages and calculates scores dynamically.
- `SaveMarksButton.tsx` currently hides the save button entirely if `!user`.
- **Flaw**: Logged-out users cannot see the "Save My Results" action. Upon calculation, visitors should see a prominent "Save My Results" button that triggers a modal prompting them to Sign In / Create Account while stashing their subject marks in `sessionStorage`/`localStorage` so they are automatically persisted upon authentication.

---

## 5. Current Protected Routes
- Client-side layouts (`app/admin/layout.tsx`) verify custom claims (`role === "admin"`).
- `app/account/parent/page.tsx` and `app/account/mentor/page.tsx` currently lack explicit middleware/client-side auth gates, allowing unauthenticated navigation to the UI layout.
- Dedicated login routes (`/admin/login`, `/parent/login`, `/mentor/login`) exist, but `/register`, `/parent/register`, and `/mentor/register` entry points need full progressive onboarding flows.

---

## 6. Current Admin System
- Designated admin account `230157688@ump.ac.za` receives custom claims via `npm run admin:grant`.
- Admin console (`/admin`) covers sources, verification queue, ingestion runs, content editor, and link health checks.
- Server-side APIs enforce `requireAdmin()` via `lib/admin/auth.ts`.

---

## 7. Current Mentor System
- `/account/mentor` displays mentor profile info and student requests.
- `MentorProfile` schema in `lib/firestore/types.ts` supports `verificationStatus` (`pending`, `verified`, `suspended`, `rejected`).
- **Missing**: Public `/mentor/register` onboarding flow and public Mentor Directory filtered strictly by `verificationStatus == "verified"`.

---

## 8. Current Firestore User Structure
- Collection: `userProfiles/{uid}`
- Fields: `uid`, `role`, `institutionId`, `institutionDomain`, `marks`, `shortlist`, `checklistProgress`, `consentRecord`, `isMinor`, `guardianConsentAt`, `createdAt`.
- Additional collections: `mentorProfiles/{uid}` and `guardianLinks/{docId}`.

---

## 9. Current Firebase Auth Configuration
- Real Firebase credentials initialized lazily from `process.env.NEXT_PUBLIC_FIREBASE_*`.
- Gracefully handles domain errors via `formatAuthError.ts`.

---

## 10. Current UI Architecture
- Next.js 15 App Router with Tailwind CSS v4, custom utility classes, and glassmorphic cards.
- Layout wraps `AuthProvider`, `NavBar`, `MobileNavBar` (< 640px), `Footer`, `ServiceWorkerRegistration`, and `ChatWidgetLoader`.

---

## 11. Current Mobile Design
- Uses `MobileNavBar.tsx` for viewports < 640px.
- Grid and form controls shrink down to 320px screens.

---

## 12. Current Desktop Design
- Standard container (`max-w-5xl`) centered with top header bar and footer.

---

## 13. What Must Be Removed
- Exposure of `👤 Profile` / `/account` links in header navigation for logged-out visitors.
- Silent hiding of the "Save Marks" button on the APS calculator for guest users.

---

## 14. What Must Be Redesigned
- **Header & Mobile Navigation**: Dynamically alter links based on Auth state (`logged-out` vs `logged-in learner`, `parent`, `mentor`, `admin`).
- **Calculator Save Flow**: Allow visitors to click "Save My Results", pop an authentication prompt, preserve marks in session storage, and save to Firestore after login/signup.
- **Learner Onboarding**: On `/register`, collect basic account & high school level info cleanly; defer mark entry to progressive profile completion cards.
- **Dedicated Portals**: Create `/register`, `/parent/register`, and `/mentor/register` flows.
- **Unauthenticated Redirects**: Visiting `/profile` or `/account` while logged out redirects cleanly to `/login`.

---

## 15. What Must Be Preserved
- Verified Life Orientation ÷ 2 APS calculation engine (`lib/aps/`).
- Grounded Gemini AI chat architecture.
- POPIA minor guardian consent rules in `firestore.rules`.
- Production Firebase credentials and domain error formatting.

---

## 16. Security Risks
- Unprotected portal pages displaying client UI skeletons before verifying user role.
- Risk of client scripts attempting to self-elevate `role` or `verificationStatus` (prevented by server claims and Firestore rules).

---

## 17. Recommended Implementation Plan
1. **Navigation & Profile Visibility**: Hide Profile/Account links for unauthenticated visitors in `NavBar.tsx` and `MobileNavBar.tsx`. Render `Sign In` / `Create Account` buttons. Add redirect from `/account` to `/login` if `!user`.
2. **Calculator Save & Stash Flow**: Update `SaveMarksButton.tsx` to display for guests. If clicked when logged out, open `AuthModal` stashing the current marks in `sessionStorage`. On sign-in or sign-up completion, read stashed marks and persist to profile automatically.
3. **Progressive Learner Registration**: Redesign `SignUpForm.tsx` & `/register` for step-by-step account & education setup without dumping huge forms.
4. **Mentor & Parent Registration Portals**: Implement `/mentor/register` and `/parent/register`.
5. **UI & Mobile Overhaul**: Enhance visual typography, touch targets, and role dashboard cards.
6. **Quality Gate Verification**: Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` and present the 16-point audit report before requesting commit confirmation.
