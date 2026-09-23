# UCAG — Master Handover, Work Completed, Remaining Work & Known Issues

**Repository:** `saxs-14/UCAG`  
**Branch:** `master`  
**Review date:** 23 September 2026  
**Purpose:** This document records what has been implemented, what was consolidated into `master`, what still needs to be completed for a real production system, how the remaining work should be done, and the known issues/limitations that must not be hidden.

---

## 1. Current overall status

### Application development: COMPLETE

The main UCAG application and its engineering hardening have been consolidated into `master`.

The implemented learner journey is:

**Grade 12 → enter marks → calculate APS → check programme eligibility → compare programmes → prepare application → find funding → use official application channels → save and track the learner journey**

The repository also contains administration, verified-content, ingestion, security, testing, accessibility, and deployment infrastructure.

### Production activation: NOT COMPLETE

UCAG should **not** yet be described as a fully operational production system.

The remaining work is mainly:

- real Firebase production configuration
- production Firestore data and rules deployment
- real Firebase Authentication configuration
- verified current catalogue data
- production LLM credentials if AI ingestion is enabled
- final production QA
- accessibility follow-up
- deployment/rate-limit resolution
- operational monitoring and ownership

---

# 2. Repository consolidation

All actual development work has been consolidated into `master`.

### Pull requests already merged

PRs **#1–#37** were already merged into `master`.

The remaining branch containing work not already represented in `master` was:

- `audit/v2-architecture-review`
- merged as **PR #38**
- merge commit: `0cf8be6b907f8448ab383d088ac772834d69a5c8`

This added the architecture audit document:

`docs/superpowers/specs/2026-08-29-v2-codebase-audit-design.md`

### Important branch note

Some old branch references may still appear in GitHub as diverged branches. This does **not** mean their application work is missing from `master`. Many were based on earlier commits and were later incorporated through merged PRs/squash merges.

Do not blindly merge historical branches again just because GitHub reports that they are ahead/behind. That can reintroduce old history or duplicate already-integrated changes.

The intended long-term repository state is:

- `master` = single source of truth
- historical development branches = removable after confirming no new work remains

---

# 3. What has been completed

## 3.1 Learner experience

Implemented:

- learner-first home/calculator experience
- guided subject entry
- NSC subject validation
- APS calculation architecture
- institution-specific APS handling
- Qualify / Almost qualify / Not yet results
- APS-gap explanations
- programme result cards
- programme detail pages
- programme search/filtering
- institution browsing
- programme comparison
- APS improvement simulator
- interest-based recommendations
- application-readiness planning aid
- application document checklist
- funding/bursary discovery
- UMP application preparation
- official application links where verified
- saved programmes
- learner application status/journey tracking
- responsive mobile navigation
- accessibility-focused interaction patterns
- reduced-motion support
- skip-to-content support

## 3.2 Authentication and profiles

Implemented:

- Firebase Authentication integration
- sign-up/sign-in flow
- institution required during signup
- minor/guardian-consent handling
- account/profile page
- saved marks
- programme shortlist
- checklist progress
- profile ownership enforcement
- institution validation
- restricted learner-editable profile fields
- protection against client-side admin role escalation

Production Firebase configuration is still required.

## 3.3 Verified information system

Implemented:

- source register
- source URL validation
- institution/source binding
- source enable/disable state
- source cadence
- robots-policy handling
- ETag/Last-Modified handling
- HTTP status tracking
- fetch error tracking
- content hashing
- retry metadata
- source health
- next-fetch-due calculation
- ingestion history
- running/completed/failed states
- stale-run recovery
- transactional ingestion locks
- duplicate pending-proposal protection
- canonical JSON diffing
- verification queue
- stale verification race protection
- admin approval/edit/rejection
- server-side verification metadata
- protected verified-data fields
- human verification before publication

Core rule:

> **Unverified information must never be presented as verified fact.**

## 3.4 AI ingestion

Implemented:

- provider-agnostic LLM interface
- Gemini provider
- application-window extraction
- programme-requirement extraction
- HTML-to-text reduction
- Zod extraction validation
- subject-code validation
- budget checks
- content diffing
- verification-queue persistence
- human verification boundary
- token accounting
- retry/failure handling
- run/source monitoring

Production use still requires a real provider key and controlled operation.

## 3.5 Security

Implemented:

- admin custom-claim model
- server-side admin enforcement
- protected admin APIs
- Firestore ownership rules
- profile role protection
- institution validation
- public catalogue read-only boundary
- protected internal collections
- verification queue protection
- source register protection
- ingestion-run protection
- ingestion-lock protection
- link-health protection
- protected verification metadata
- source identity immutability
- stale-value/race protection

## 3.6 Admin console

Implemented:

- admin dashboard
- verification queue
- source register
- source health
- ingestion history
- retry/error monitoring
- stale-run recovery
- content editor
- dead-link report
- ingestion triggers
- programme-requirement ingestion infrastructure
- admin API authentication

## 3.7 Tests and CI

Implemented infrastructure/tests include:

- Vitest
- APS tests
- matching tests
- environment/schema tests
- extraction schema tests
- canonical diff tests
- source-fetch tests
- Firestore rules tests
- Playwright calculator-to-apply flow
- desktop E2E
- mobile E2E
- Firestore emulator in CI
- Java 17 emulator setup
- production build in CI
- lint/typecheck workflow
- runtime error boundaries/logging
- cron uptime-check workflow

The repository must still be freshly tested on the final production configuration. Existing test infrastructure is not proof that every current deployment has passed.

---

# 4. What still needs to be done

## Priority 1 — Connect real Firebase

### Required

1. Create/select the production Firebase project.
2. Enable Firebase Authentication.
3. Configure required authentication providers.
4. Create production Firestore.
5. Deploy Firestore rules.
6. Deploy required indexes.
7. Configure production environment variables.
8. Create the trusted admin custom claim.
9. Seed verified catalogue data.
10. Test real account creation and persistence.

### Verify

- signup
- login
- logout
- profile creation
- institution validation
- saved marks
- shortlist
- checklist progress
- offline persistence
- logout/login persistence
- unauthorized access
- admin access boundaries

Do not use Firebase emulator configuration as the production configuration.

---

# 5. Production verified data

A real education platform needs real, current, attributable data.

Seed and verify:

- institutions
- faculties/schools
- programmes
- APS rules
- subject requirements
- application windows
- funding opportunities
- official application URLs
- source records
- academic-year metadata

Every learner-facing factual record should contain appropriate provenance, including:

- `sourceUrl`
- `verifiedOn`
- `academicYear`

The first production dataset should be manually reviewed before being treated as authoritative.

---

# 6. AI ingestion activation

When production AI ingestion is intentionally enabled:

1. Configure the real LLM provider.
2. Store the key only in secure environment configuration.
3. Run a small controlled ingestion.
4. Inspect extraction output.
5. Validate generated proposals.
6. Check source provenance.
7. Approve only facts supported by authoritative sources.
8. Monitor tokens/quota/failures.
9. Establish a human review process.
10. Repeat on a controlled cadence.

**Never automatically publish AI-generated admissions facts.**

AI is an extraction/assistance mechanism, not the authority.

---

# 7. Final production QA

After production Firebase and data are configured:

### Automated

- run install/dependency checks
- typecheck
- lint
- unit tests
- Firestore rules tests
- E2E tests
- production build

### Manual

Test:

- desktop
- mobile
- slow network
- authentication
- profile creation
- APS calculator
- programme matching
- programme details
- comparison
- saving
- funding
- UMP application preparation
- official links
- offline shell
- admin login
- admin queue
- source health
- ingestion
- failed ingestion
- stale-run recovery

Then inspect:

- browser console
- server logs
- Vercel logs
- Firestore security behaviour
- authentication errors
- broken official links

Only after this should a release be considered production-ready.

---

# 8. Known issues and limitations

## 8.1 Vercel deployment/rate limiting

A Vercel Hobby deployment rate-limit issue has been encountered.

This is an external deployment-platform limitation and should not be treated as an application-code defect without evidence.

Action:

1. Retry when the platform limit clears.
2. Check Vercel project/account usage.
3. Check deployment logs.
4. Confirm environment variables.
5. If the Hobby limitation continues to block required deployments, evaluate the appropriate Vercel plan or another deployment option.

Do not change application code merely to disguise a platform/account rate limit.

## 8.2 CI status must be freshly verified

A previous CI failure was traced to real code/configuration problems and fixed in PR #37:

- malformed HTTP URL regex syntax
- unclosed JSX comment
- Node version mismatch with `firebase-admin@14.2.0`
- CI action/runtime configuration

The fix was merged.

However, a fresh successful post-fix workflow run must still be verified before stating that CI is currently green.

## 8.3 Accessibility follow-up

Remaining:

- manual keyboard-only audit
- screen-reader audit
- form-label review
- error announcement review
- focus-order review
- focus-trap review
- 200% zoom/text resize test
- touch-target review
- automated axe scan
- WCAG 2.2 AA remediation where findings exist

## 8.4 PWA icon polish

Remaining:

- dedicated PNG icons
- Apple touch icon
- maskable icon where appropriate
- installability verification
- clean-install offline verification

## 8.5 Bundle budget

The calculator bundle has been reduced, but CI does not yet enforce a hard bundle-size budget.

Implement:

1. exact route budget
2. repeatable measurement
3. CI assertion
4. failure when budget is exceeded
5. documented exceptions

## 8.6 Historical ingestion replay

Historical ingestion rerun by ID intentionally remains a clear **501 Not Implemented**.

This is safer than pretending exact historical replay exists.

Until implemented, use a fresh controlled ingestion and verify the resulting proposals.

---

# 9. Product scope that should remain excluded

Do not add these merely to make the system look bigger:

- StudyMate
- mentor marketplace/system
- campus social network
- residence booking
- counselling booking
- payment processing
- fake application submission
- invented application deadlines
- invented admission requirements
- automatic AI publication of admissions information

If the product scope changes, these should be separately designed and reviewed.

---

# 10. Recommended implementation order

Use this exact order for the remaining production work:

### Phase A — Infrastructure

1. Firebase project
2. Authentication
3. Firestore
4. rules
5. indexes
6. environment variables
7. admin claim

### Phase B — Data

1. source register
2. verified institutions
3. programmes
4. APS rules
5. requirements
6. application windows
7. funding
8. official links

### Phase C — AI

1. provider key
2. controlled extraction
3. proposal review
4. human approval
5. monitoring

### Phase D — Quality

1. automated tests
2. production build
3. E2E
4. mobile
5. desktop
6. accessibility
7. security
8. runtime logs

### Phase E — Deployment

1. resolve deployment limitation
2. deploy final release
3. smoke test production
4. record release commit/date
5. monitor first production operation

---

# 11. Definition of fully operational

UCAG can only be called fully operational when all of the following are true:

- real learner accounts work
- profiles persist in production
- saved marks/programmes persist
- verified catalogue data is populated
- APS rules are correct for the supported institution
- application windows are verified
- official application links work
- funding information is current and attributable
- admin verification works
- AI ingestion works when intentionally enabled
- AI changes remain behind human verification
- security rules are tested
- automated tests pass on the release commit
- production build passes
- production E2E/smoke tests pass
- deployment is stable
- monitoring and operational ownership are established

Until then:

> **UCAG application code: COMPLETE**  
> **UCAG production activation: PENDING EXTERNAL CONFIGURATION AND FINAL QA**

---

# 12. Final handover rule

Future development must preserve the trust boundary.

If data is not verified, do not make it look verified.

If a service is not configured, show the real state.

If an ingestion run fails, record the failure.

If an operation is not implemented, return an honest unsupported/not-implemented response.

If a deployment fails because of an external platform limitation, diagnose the platform limitation separately from application defects.

The objective is a **real working UCAG system**, not a mockup that only appears complete.
