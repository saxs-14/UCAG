# UCAG — Project Status & Completion Checklist

**Repository:** `saxs-14/UCAG`  
**Last reviewed:** 23 September 2026  
**Status:** Core application and engineering hardening complete; production activation remains.

This document is the handover checklist for UCAG. It separates work that is already implemented from work that still requires real external services, operational setup, or future product decisions.

---

## 1. Executive status

### Application code

**DONE**

The core UCAG application has been implemented, reviewed, and hardened on the `master` branch.

The implemented journey is:

**Grade 12 learner → enter marks → calculate APS → view programme eligibility → compare programmes → prepare for application → find funding → apply through official channels → save and track a learner journey**

The repository also contains the administration and verified-content infrastructure required to maintain factual admissions information safely.

### Production activation

**NOT YET COMPLETE**

The remaining production activation items depend on external accounts/configuration:

- Real Firebase project and production Firebase configuration
- Production Firestore deployment/rules/data seeding
- Production Firebase Authentication configuration
- Production LLM API key if AI ingestion is required
- Production verification of environment variables
- Final live smoke test after the above configuration
- Resolve/upgrade the current Vercel Hobby build/rate-limit limitation if it continues to block deployments

The application is designed to fail safely when these dependencies are missing; it should not pretend that authentication, saved data, or AI ingestion succeeded.

---

# 2. What is DONE

## 2.1 Core learner experience

- [x] Learner-first home/calculator experience
- [x] Guided subject-entry flow
- [x] NSC subject validation
- [x] APS calculation architecture
- [x] Institution-specific APS handling
- [x] Programme eligibility buckets:
  - Qualify
  - Almost qualify
  - Not yet
- [x] APS gap explanations
- [x] Programme result cards
- [x] Programme detail pages
- [x] Programme search/filtering
- [x] Institution browsing
- [x] Programme comparison
- [x] APS improvement simulator
- [x] Interest-based programme recommendations
- [x] Admission-readiness planning aid
- [x] Generic application-document checklist
- [x] Funding/bursary discovery
- [x] UMP application preparation
- [x] Official application links where verified
- [x] Saved programmes
- [x] Learner application journey/status tracking
- [x] Mobile navigation
- [x] Responsive layouts
- [x] Accessibility-focused keyboard/focus behaviour
- [x] Reduced-motion support
- [x] Skip-to-content support
- [x] Save-data behaviour for statistics

## 2.2 Authentication and learner profiles

- [x] Firebase Authentication integration
- [x] Sign-in/sign-up flow
- [x] Institution required during signup
- [x] Minor/guardian-consent handling
- [x] Account page
- [x] Saved marks
- [x] Saved programme shortlist
- [x] Checklist progress
- [x] Profile ownership enforcement
- [x] Institution validation in Firestore rules
- [x] Learner-editable profile field restrictions
- [x] Client-side admin role self-escalation prevented

**Important:** the code is implemented, but production use still requires a real Firebase project/configuration.

## 2.3 Verified-information architecture

- [x] Source register
- [x] Source URL validation
- [x] Institution/source binding validation
- [x] Source enable/disable state
- [x] Source fetch cadence
- [x] Robots-policy flag
- [x] ETag support
- [x] Last-Modified support
- [x] HTTP status tracking
- [x] Fetch error tracking
- [x] Content hashing
- [x] Retry tracking
- [x] Source health indicators
- [x] Next-fetch-due calculation
- [x] Ingestion-run history
- [x] Running/completed/failed run states
- [x] Stale-run recovery
- [x] Transactional ingestion locks
- [x] Duplicate pending-proposal protection
- [x] Canonical JSON diffing
- [x] Verification queue
- [x] Stale verification race protection
- [x] Admin approval/edit/rejection flow
- [x] Server-side verification metadata stamping
- [x] Protected verified-data fields
- [x] Human verification gate before learner-facing publication

The core principle is:

> **Unverified information must never be presented as a verified fact.**

## 2.4 AI ingestion

- [x] Provider-agnostic LLM interface
- [x] Gemini provider
- [x] Application-window extraction pipeline
- [x] Programme-requirement extraction pipeline
- [x] HTML-to-text reduction before extraction
- [x] Zod extraction validation
- [x] Canonical subject-code validation
- [x] Budget checking before extraction
- [x] Content diffing
- [x] Verification-queue persistence
- [x] No automatic publication of extracted admissions changes
- [x] Token accounting
- [x] Retry/failure handling
- [x] Run/source monitoring

**Production dependency:** a valid `LLM_API_KEY` must be configured before AI ingestion can actually operate against production data.

## 2.5 Security

- [x] Admin custom-claim model
- [x] Server-side `requireAdmin` enforcement
- [x] Admin API protection
- [x] Firestore ownership rules
- [x] Profile role protection
- [x] Institution validation
- [x] Public catalogue client-read-only boundary
- [x] Internal collection client writes blocked
- [x] Verification queue protected
- [x] Source register protected
- [x] Ingestion runs protected
- [x] Ingestion locks protected
- [x] Link-health data protected
- [x] Protected verification metadata
- [x] Source identity immutability on source updates
- [x] Queue stale-value/race protection

## 2.6 Admin console

- [x] Admin dashboard
- [x] Verification queue
- [x] Source register
- [x] Source health information
- [x] Ingestion run history
- [x] Retry/error monitoring
- [x] Stale-run recovery
- [x] Content editor
- [x] Dead-link report
- [x] Application-window ingestion trigger
- [x] Programme-requirement ingestion infrastructure
- [x] Admin API authentication

## 2.7 Testing and quality

- [x] Vitest infrastructure
- [x] APS tests
- [x] Matching tests
- [x] Environment/schema tests
- [x] Application-window extraction schema tests
- [x] Canonical diff tests
- [x] Source-fetch tests
- [x] Firestore rules tests
- [x] Playwright E2E calculator-to-apply flow
- [x] Desktop E2E coverage
- [x] Mobile E2E coverage
- [x] CI Firestore emulator startup
- [x] CI Java 17 setup
- [x] Production build step in CI
- [x] Lint/typecheck workflow configuration
- [x] Error boundaries
- [x] Structured runtime error logging
- [x] Cron uptime-check workflow

### Testing limitation

Do **not** interpret the checkboxes above as proof that every test has passed on every current commit.

The repository contains the test infrastructure and the relevant test suites. A fresh local/CI execution should still be performed after production configuration and dependency changes.

## 2.8 UX, accessibility and performance

- [x] Learner-first information hierarchy
- [x] Progressive disclosure
- [x] Mobile-first interaction patterns
- [x] Accessible focus states
- [x] Reduced motion
- [x] Skip link
- [x] Responsive navigation
- [x] PWA manifest
- [x] Service worker
- [x] Offline app-shell fallback
- [x] Firestore persistence architecture for signed-in saved data
- [x] Save-data handling
- [x] Structured programme metadata/JSON-LD
- [x] Sitemap
- [x] Robots metadata
- [x] Lighthouse accessibility audit
- [x] Lighthouse SEO audit
- [x] Lighthouse best-practices audit
- [x] Core Web Vitals measurement
- [x] Calculator bundle reduction

Known limitation:

- [ ] Independent screen-reader/axe accessibility audit
- [ ] Dedicated PNG PWA/iOS icon set
- [ ] CI enforcement of the calculator bundle-size budget

## 2.9 Deployment

- [x] Vercel deployment exists
- [x] Production application is reachable
- [x] Production error fallback behaviour exists
- [x] Cron configuration respects the current Vercel Hobby-plan frequency limitation
- [x] Honest handling of missing Firebase configuration

Current deployment caveat:

- [ ] Resolve the current Vercel Hobby build/rate-limit issue if it prevents future deployments.

---

# 3. What is NOT DONE

These are not hidden defects. They are known remaining items.

## 3.1 Real Firebase production environment

**NOT DONE**

The repository contains the Firebase integration, but a real production Firebase project has not been connected.

Needed:

- Create/select the production Firebase project.
- Enable Firebase Authentication.
- Configure the required sign-in providers.
- Create the production Firestore database.
- Deploy the repository's Firestore security rules.
- Deploy/create the required indexes if the application requires them.
- Seed verified institutions, programmes, subjects, APS rules, bursaries and other required catalog data.
- Configure production Firebase environment variables.
- Create the required admin custom claim for the trusted operator.
- Test signup, login, logout, profile creation, saved marks and shortlist persistence against production.

## 3.2 Real production AI ingestion credentials

**NOT DONE**

The Gemini integration is implemented, but production ingestion requires a real provider key.

Needed:

- Obtain a Gemini API key.
- Set `LLM_PROVIDER=gemini`.
- Set `LLM_API_KEY`.
- Confirm the selected Gemini model remains available and appropriate for the account's current quota.
- Run a controlled application-window ingestion.
- Review the generated verification proposals.
- Approve only verified information.
- Monitor token usage and failures.

Never place the API key in GitHub source files.

## 3.3 Production catalogue data

**NOT DONE**

The application architecture supports real verified catalogue data, but a production deployment needs a maintained dataset.

Needed:

- Verified institutions
- Faculties
- Schools
- Programmes
- APS rules
- Subject requirements
- Application windows
- Bursaries
- Internships
- Official application URLs
- Source records
- Academic-year metadata

Every learner-facing fact should have:

- `sourceUrl`
- `verifiedOn`
- `academicYear`

## 3.4 Final production QA

**NOT DONE**

After Firebase and production environment configuration:

- [ ] Run the complete test suite.
- [ ] Run the production build.
- [ ] Run Playwright against the production deployment.
- [ ] Test desktop.
- [ ] Test mobile.
- [ ] Test authentication.
- [ ] Test profile creation.
- [ ] Test saved marks.
- [ ] Test shortlist.
- [ ] Test Firestore offline persistence.
- [ ] Test admin authentication.
- [ ] Test verification queue.
- [ ] Test source ingestion.
- [ ] Test failed-source handling.
- [ ] Test stale-run recovery.
- [ ] Test application-window ingestion.
- [ ] Test programme-requirement ingestion.
- [ ] Test official application links.
- [ ] Check browser console for unexpected errors.
- [ ] Check Vercel runtime logs.
- [ ] Check Firestore rules using production-safe test accounts.

## 3.5 Accessibility follow-up

**NOT DONE**

The application has accessibility work and Lighthouse coverage, but a dedicated manual accessibility pass remains.

Needed:

- Keyboard-only journey
- Screen-reader journey
- Form-label review
- Error announcement review
- Focus-order review
- Focus-trap review for mobile navigation/dialogs
- Zoom/text-resize test up to 200%
- Touch-target verification
- Automated axe scan
- Fix any findings that affect WCAG 2.2 AA

## 3.6 PWA polish

**NOT DONE**

- [ ] Add dedicated PNG icons.
- [ ] Add Apple touch icon.
- [ ] Add maskable icon where appropriate.
- [ ] Verify installability on supported mobile browsers.
- [ ] Verify offline shell after a clean install.

## 3.7 Bundle-budget CI gate

**NOT DONE**

The calculator bundle was reduced substantially, but the target budget is not yet enforced automatically.

Needed:

- Define the exact route budget.
- Produce a repeatable build-size measurement.
- Add a CI assertion.
- Fail CI if the agreed budget is exceeded.
- Document intentional exceptions.

## 3.8 Historical ingestion rerun

**NOT DONE BY DESIGN**

The endpoint for rerunning a historical ingestion run by ID intentionally returns a clear `501` because exact historical replay has not been implemented.

Current safe alternatives:

- Run a fresh application-window ingestion.
- Use source/link-health “Run now” functionality where applicable.
- Review the resulting verification proposals.

Do not change this to return a false success.

---

# 4. What needs to be done next

## Priority 1 — Production Firebase

**Required before real learner accounts can be used.**

1. Create production Firebase project.
2. Enable Authentication.
3. Configure sign-in providers.
4. Create Firestore.
5. Deploy rules.
6. Configure indexes.
7. Seed verified data.
8. Configure Vercel Firebase environment variables.
9. Create trusted admin claim.
10. Test account/profile/saved-data flows.

## Priority 2 — Production verified data

**Required before treating admissions information as live authoritative data.**

1. Establish the initial source register.
2. Verify official UMP and other institution sources.
3. Load the current academic-year catalogue.
4. Verify APS rules.
5. Verify application windows.
6. Verify programme requirements.
7. Verify funding opportunities.
8. Run link health checks.
9. Review all ingestion proposals manually.

## Priority 3 — AI ingestion activation

1. Configure Gemini.
2. Run a small controlled ingestion.
3. Inspect extraction quality.
4. Verify queue proposals.
5. Approve only supported facts.
6. Monitor quota/cost/token usage.
7. Establish a regular human review routine.

## Priority 4 — Final QA

1. Full automated test run.
2. Production build.
3. Production E2E.
4. Mobile/desktop smoke test.
5. Authentication test.
6. Admin test.
7. Accessibility test.
8. Firestore security test.
9. Runtime-log review.

## Priority 5 — Deployment reliability

1. Resolve Vercel Hobby build/rate-limit restrictions if encountered.
2. Confirm required Vercel environment variables.
3. Confirm cron secret configuration.
4. Confirm cron uptime-check secrets.
5. Perform a final production deployment.
6. Record the deployment commit and date.

---

# 5. Things that should NOT be added unless the product scope changes

These were deliberately excluded because they would make UCAG unnecessarily complex or turn it into a different product:

- StudyMate
- Mentor marketplace/system
- Campus shuttle management
- Residence booking
- Counselling booking
- General social/community features
- Payment processing
- Unverified AI admissions advice presented as fact
- Automatic publication of AI-extracted admissions information
- Client-side admin role assignment
- Fake application submission
- Fake application deadlines
- Invented university requirements

If any of these are considered later, they should be treated as a new product scope and reviewed separately.

---

# 6. Production launch checklist

Before calling the **live production system** fully operational:

### Infrastructure

- [ ] Firebase production project connected
- [ ] Firestore production database active
- [ ] Authentication active
- [ ] Vercel environment variables configured
- [ ] Gemini key configured if ingestion is required
- [ ] Admin claim configured
- [ ] Cron secrets configured

### Data

- [ ] Institutions verified
- [ ] Programmes verified
- [ ] APS rules verified
- [ ] Subject requirements verified
- [ ] Application windows verified
- [ ] Funding records verified
- [ ] Official links checked
- [ ] Academic year correct
- [ ] Source metadata complete

### Security

- [ ] Firestore rules deployed
- [ ] Admin API tested
- [ ] Learner ownership tested
- [ ] Client internal writes blocked
- [ ] Admin role cannot be self-assigned
- [ ] Secrets absent from source control
- [ ] Production authentication tested

### Quality

- [ ] Tests pass
- [ ] Build passes
- [ ] E2E passes
- [ ] Mobile tested
- [ ] Desktop tested
- [ ] Accessibility checked
- [ ] Runtime logs reviewed
- [ ] Source ingestion tested
- [ ] Verification queue tested

### Operations

- [ ] Source health monitored
- [ ] Failed ingestion runs monitored
- [ ] Stale-run recovery understood
- [ ] Human verification owner identified
- [ ] Academic-year refresh process documented
- [ ] Link health checks scheduled/verified
- [ ] Backup/recovery process documented

---

# 7. Definition of “fully operational”

UCAG should only be described as **fully operational in production** when:

1. Learners can create real accounts.
2. Learner profiles persist in production Firestore.
3. Saved marks and programmes persist correctly.
4. Verified catalogue data is populated.
5. APS calculations use the intended institution rules.
6. Application windows are verified.
7. Official application links work.
8. Funding information has current verification metadata.
9. Admin verification works against production data.
10. AI ingestion can run when intentionally enabled.
11. AI-generated changes remain behind human verification.
12. Security rules have been tested against the production configuration.
13. Automated tests and production build pass on the release commit.
14. The production deployment has passed final smoke testing.

Until those conditions are met, the correct status is:

> **UCAG application code: COMPLETE**  
> **UCAG production activation: PENDING EXTERNAL CONFIGURATION**

---

## 8. Handover summary

The repository is no longer waiting for another major application-development phase. The remaining work is primarily **production activation, verified-data population, operational testing, and deployment configuration**.

The most important rule for future contributors is:

> **Do not weaken the verification boundary to make missing data look complete.**

If a source cannot be verified, show that it is unverified or do not publish it.

If a service is not configured, show the real configuration state.

If an ingestion run fails, record the failure.

If an exact historical rerun is not implemented, keep the explicit 501 rather than pretending it worked.

This keeps UCAG trustworthy for learners making time-sensitive education decisions.
