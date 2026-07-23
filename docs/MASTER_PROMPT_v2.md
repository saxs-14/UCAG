# UCAG v2 — Master Claude Code Rebuild Prompt

**Project:** UCAG (University Course Application Guide) — South Africa
**Owner:** Phathutshedzo "Saxs" Mamagau — SaxsProjects
**Action:** Full rebuild from scratch. v1 is archived and removed, not patched.
**Delivery style:** Phase-based. **Stop after every phase and wait for my confirmation before starting the next one.**

---

## 0. How to work with me

Before you write a single line of code, read this section and follow it for the whole project.

1. **Stop at every phase checkpoint.** Print a summary of what you built, what you did not build, and what is broken. Then wait. Do not roll into the next phase.
2. **No truncation.** When you show me a file, show the whole file. When you show me a command, show the whole command, copy-paste ready.
3. **Config over hardcode.** Anything that could differ between institutions, provinces, subjects, or academic years lives in a config file or the database. Never in a component.
4. **Auto-detect over hardcode.** Environment values, base URLs, and API endpoints are read from env vars with sane fallbacks, never pasted inline.
5. **Be honest.** If something in this brief is a bad idea, technically infeasible, or will cost more than it is worth, say so at the checkpoint instead of quietly building a worse version of it.
6. **Never invent a fact a learner will act on.** This whole product is a fact-delivery product. If you do not have a verified source for a closing date, an APS rule, or a bursary, the correct output is "not yet verified", never a plausible guess. Read section 5 before you build the ingestion layer.
7. **Secrets never reach the browser.** Every LLM call, every scrape, every third-party API call happens server-side. No `NEXT_PUBLIC_` prefix on any key. This is not negotiable — v1 of another project of mine leaked a live key to a public repo and I am not repeating it.

---

## 1. What this product is

A South African school-leaver opens UCAG, enters their NSC subjects and marks, and within one screen learns:

- their APS, calculated correctly per institution (not one generic number)
- what they **qualify** for
- what they **almost** qualify for, and the exact reason for the gap
- what they do not qualify for, and the realistic alternative pathway
- the faculty and school each programme sits under
- whether applications are open, and a direct apply link if so
- if applications are closed, no apply link — instead a status-check login link
- bursaries and internships matched to their course choices and their current level

Behind it, a scheduled AI pipeline keeps institutional dates, programme requirements, bursaries, internships, and national education statistics current — with a human verification gate on anything a learner acts on.

**Audience reality check:** many users are on prepaid data, on low-end Android devices, in rural areas, on 3G. Some are under 18. Design and engineer for that, not for a desktop on fibre.

---

## 2. Scope decision (confirm with me at Phase 0 checkpoint)

v1 was UMP-only. This brief is national. That is a large jump, so build it national-capable but seed it in tiers:

- **Tier 1 (must work at launch):** University of Mpumalanga, plus 5 institutions I will name. Full programme catalogue, full APS rules, verified dates.
- **Tier 2:** remaining public universities — schema present, data partially populated, clearly labelled "coming soon" rather than blank.
- **Tier 3:** TVET colleges and private providers — schema supports them, no data yet.

Nothing in the code may assume a fixed institution count. Adding an institution must be a data operation, not a code change.

---

## 3. Stack

Unless you have a strong argument otherwise (raise it at Phase 0):

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15, App Router, TypeScript strict | Server-side route handlers give us a place to hide keys and run cron; SSR gives us SEO, which matters for a public info site |
| Styling | Tailwind CSS + CSS variables for tokens | Matches my existing workflow |
| Database | Firestore | I already run Firebase on other projects |
| Auth | Firebase Auth (email + Google), anonymous session for calculator | Calculator must work with no account |
| Scheduled jobs | Vercel Cron → protected route handlers | Simplest thing that survives a free/hobby tier |
| Validation | Zod on every AI output and every form | AI output is untrusted input |
| Charts | Recharts | |
| Hosting | Vercel | |
| Tests | Vitest; Playwright for one critical E2E path | |

**Hard requirement:** the APS engine must be a pure, dependency-free TypeScript module with no Firebase or React imports, so it can be unit-tested in isolation and reused later in a Flutter/Dart port or a serverless function.

---

## 4. Phases

### Phase 0 — Archive v1, then reset

I want v1 gone, but I have a presentation next week and I am not losing it before then.

1. Confirm the repo is clean and everything is committed.
2. Tag current state: `git tag -a v1-archive -m "UCAG v1 — simulated backend prototype, archived $(date +%F)"`.
3. Push the tag: `git push origin v1-archive`. **Verify on the remote that the tag exists before touching anything.**
4. Also create and push branch `archive/v1` from the same commit, as a second safety net.
5. Only then: on `main`, remove all application source. Keep `.git`, `LICENSE`, and `.gitignore`. Everything else goes.
6. Write a fresh `README.md` and a fresh `CLAUDE.md` stating the v2 architecture and the rule "never publish an unverified fact".

**Checkpoint 0:** show me the tag and branch on the remote, the list of deleted paths, and your recommendation on the Tier 1 institution list. Wait for my go-ahead.

---

### Phase 1 — Foundation and data model

Scaffold Next.js + TypeScript + Tailwind. Set up Firestore, env var handling, and the token system.

**Firestore collections** (adjust names if you have a better scheme, but justify it):

```
institutions          id, name, shortName, type, province, campuses[], websiteUrl,
                      applicationPortalUrl, statusCheckUrl, nbtRequired, logoUrl
faculties             institutionId, name, code
schools               facultyId, name, code
programmes            institutionId, facultyId, schoolId, name, qualificationType,
                      nqfLevel, saqaId, duration, campuses[], modeOfDelivery,
                      minAps, subjectRequirements[], additionalRequirements,
                      careerOutcomes[], applyUrl, sourceUrl, verifiedOn, academicYear
apsRules              institutionId, scaleName, bands[], loPolicy, bestNSubjects,
                      excludedSubjects[], mathLitPolicy, lifeOrientationWeight,
                      nbtPolicy, notes, sourceUrl, verifiedOn, academicYear
applicationWindows    institutionId, programmeId?, academicYear, opensOn, closesOn,
                      lateClosesOn, status, sourceUrl, verifiedOn
subjects              code, name, category, isDesignated, isCompulsory, languageType
bursaries             name, provider, fieldsOfStudy[], levelRequired, closesOn,
                      value, criteria, applyUrl, sourceUrl, verifiedOn, riskFlags[]
internships           title, provider, fieldsOfStudy[], minQualification,
                      matricOnly, province, closesOn, applyUrl, sourceUrl, verifiedOn
statistics            dataset, year, dimension, metric, value, unit, sourceUrl,
                      publisher, verifiedOn
sources               url, publisher, type, robotsAllowed, lastFetchedAt, etag,
                      fetchIntervalHours, reliabilityScore
ingestionRuns         startedAt, finishedAt, sourceIds[], tokensUsed, costEstimate,
                      itemsProposed, itemsAutoPublished, itemsQueued, errors[]
verificationQueue     collection, docId, field, currentValue, proposedValue,
                      confidence, sourceUrl, extractedAt, corroboratingSources[],
                      status, reviewedBy, reviewedAt
userProfiles          uid, marks[], shortlist[], consentRecord, isMinor,
                      guardianConsentAt, createdAt
```

**Every fact-bearing document carries `sourceUrl`, `verifiedOn`, and `academicYear`.** A document without those three cannot be rendered on a public page. Enforce this in a type guard, not in code review.

**Config files** (these are the knobs I will actually turn):

- `config/subjects.ts` — the NSC subject taxonomy
- `config/aps-scales.ts` — the point band definitions
- `config/institutions.seed.ts` — Tier 1 seed data
- `config/ingestion.ts` — cadences, token budgets, kill switch
- `config/labels.ts` — every user-facing string, in one place

**Checkpoint 1.**

---

### Phase 2 — Subject taxonomy and the APS engine

This is the heart of the product and the part most likely to quietly be wrong.

#### 2.1 Subject selection UI

The learner form must mirror the real NSC structure. Seven subjects minimum:

**Compulsory, always rendered:**

1. **Home Language** — dropdown of: Afrikaans, English, isiNdebele, isiXhosa, isiZulu, Sepedi, Sesotho, Setswana, siSwati, Tshivenda, Xitsonga, South African Sign Language.
2. **First Additional Language** — same list, minus whatever was chosen as Home Language. Enforce that exclusion.
3. **Mathematics** — dropdown: Mathematics / Mathematical Literacy / Technical Mathematics. Exactly one.
4. **Life Orientation** — **always present, pre-filled, locked, cannot be removed.** The learner enters a mark for it.

**Then three or four electives**, from a searchable dropdown of the full NSC subject list, grouped by category, with designated-list subjects visually marked. Seed list (mark all of these `VERIFY` in the config until sourced against the current DBE subject list):

Accounting · Agricultural Management Practices · Agricultural Sciences · Agricultural Technology · Business Studies · Civil Technology · Computer Applications Technology · Consumer Studies · Dance Studies · Design · Dramatic Arts · Economics · Electrical Technology · Engineering Graphics and Design · Equine Studies · Geography · History · Hospitality Studies · Information Technology · Life Sciences · Marine Sciences · Maritime Economics · Mechanical Technology · Music · Nautical Science · Physical Sciences · Religion Studies · Second Additional Language · Sport and Exercise Science · Technical Sciences · Tourism · Visual Arts

Mark input: accept a percentage (0–100), display the derived achievement level live next to it. Percentage is the source of truth — never store only the level, because some institutions calculate on raw percentages.

**Important UI note on Life Orientation:** LO is always captured, because every NSC learner takes it. But many institutions **exclude LO from the APS total, or count it at reduced weight, or cap it**. So the form always shows it, and the engine decides per institution whether it counts. Make that visible to the learner: when showing a result, state "LO excluded by this institution" or "LO counted at half weight". This is a trust feature, not a detail.

#### 2.2 APS rules engine

`lib/aps/` — pure TypeScript, no framework imports.

Model each institution's rule as a **strategy object**, not an `if` chain:

```ts
interface ApsRule {
  institutionId: string;
  academicYear: number;
  scale: PointBand[];              // e.g. 7-point or 8-point
  loPolicy: 'exclude' | 'include' | 'halfWeight' | 'capAt';
  loCap?: number;
  bestNSubjects?: number;          // e.g. best 6 excluding LO
  excludedSubjects: string[];
  mathLitPolicy: 'equal' | 'penalised' | 'excludedForSomeProgrammes';
  usesRawPercentage: boolean;      // some institutions do not use point bands at all
  nbtPolicy: 'none' | 'required' | 'requiredForSomeFaculties';
  compute(marks: SubjectMark[]): ApsResult;
  sourceUrl: string;
  verifiedOn: string;
}
```

**Do not assume one national APS.** South African institutions genuinely differ — some use a 7-point scale, some an 8-point scale that splits 90–100, at least one uses a faculty points score on raw percentages, at least one uses a percentage average rather than points, and several require National Benchmark Tests on top. Build the engine so all of these are expressible, then populate the actual rules **only from verified institutional sources** in Phase 4. Until a rule is verified, that institution shows "APS rules being verified" rather than a wrong number.

Seed the standard NSC achievement levels as the default scale, flagged `VERIFY`:

| Percentage | Level |
|---|---|
| 80–100 | 7 |
| 70–79 | 6 |
| 60–69 | 5 |
| 50–59 | 4 |
| 40–49 | 3 |
| 30–39 | 2 |
| 0–29 | 1 |

Also encode, flagged `VERIFY` against the current DBE/Umalusi definitions, the three NSC pass types — Bachelor's, Diploma, Higher Certificate — since these gate eligibility before APS even matters.

#### 2.3 Tests

Unit tests are mandatory here, not optional. Minimum coverage:

- each `loPolicy` branch
- best-N selection with and without LO
- Mathematical Literacy vs Mathematics on a programme that requires Mathematics
- boundary marks: 29/30, 39/40, 49/50, 79/80, 89/90
- a learner with only 6 subjects (incomplete input)
- percentage-based institutions

A wrong APS sends a learner to the wrong application. Treat a failing test here as a production incident.

**Checkpoint 2:** show me the engine, the tests passing, and the subject dropdowns working.

---

### Phase 3 — Matching, results, and the apply path

The landing page **is** the calculator. No marketing hero above it. A learner arriving from a WhatsApp link should see subject dropdowns without scrolling.

#### Result buckets

**Qualify** — meets APS and every subject requirement.
**Almost qualify** — fails on a small, nameable margin. Show the exact gap:
- "You have 28 APS. This programme needs 30. You are 2 points short."
- "This programme requires Mathematics level 4. You have Mathematical Literacy."
- "This programme requires Physical Sciences level 5. You have level 3."
- "You have a Diploma pass. This programme requires a Bachelor's pass."

Never a vague "you nearly made it". Always the number, the subject, and the shortfall.

**Not yet** — show the realistic route instead: extended/foundation programme, higher certificate that articulates upward, TVET pathway, or rewriting a subject. Always give one forward step. This page is read by teenagers who have just been told no; the copy must be direct without being cold.

#### Every result card shows

- Programme name, qualification type, NQF level, duration
- **Faculty** and **School** (both, explicitly — this was in the brief and is often missing elsewhere)
- Campus, mode of delivery
- Requirements met / not met, itemised
- Application status and the correct action:
  - **Open** → prominent apply link, deep-linked to the institution's portal
  - **Opening soon** → the opening date, plus "remind me" (email or calendar file)
  - **Closed** → **no apply link at all.** Instead: a status-check login link for learners who already applied, plus the next cycle's expected opening
  - **Unknown** → "dates being verified" with a link to the institution's admissions page. Never guess.
- "Verified [date] · Source: [institution]" with the source as a link

#### Sharing and saving

Results shareable as a link and downloadable as a one-page PDF, because learners will want to show a parent or teacher. The PDF must include the verification dates.

**Checkpoint 3.**

---

### Phase 4 — The AI ingestion pipeline

**Read this whole section before designing it. My original brief said "every hour". I want you to build something better than that, and here is why.**

Application dates, programme requirements, and faculty structures change a handful of times per year, not hourly. Hourly LLM extraction across dozens of institutions would burn budget continuously to rediscover the same unchanged facts, and would hammer university servers hard enough to get us rate-limited or blocked. Worse, every extraction pass is another chance to hallucinate a closing date. More frequent extraction of stable facts does not mean fresher data — it means more opportunities to be confidently wrong.

So: **tiered cadence, and a human gate on anything a learner acts on.**

#### Cadence table (in `config/ingestion.ts`, all overridable)

| Data | Cadence | Auto-publish? |
|---|---|---|
| Link health check (are apply URLs alive?) | Every 6 hours | Yes — it only flags dead links |
| Application open/close dates | Daily, 03:00 SAST | **No — always human-verified** |
| Bursaries | Daily Mar–Sep, weekly otherwise | **No** |
| Internships | Daily | Low-risk fields only |
| Programme requirements & APS rules | Monthly, plus on-demand | **No** |
| Faculty/school structure | Quarterly | **No** |
| National statistics | Quarterly | Yes, if pulled from an official published dataset |

Add a **manual "refresh now"** button in the admin console for when I know something changed. That covers the real need behind "hourly" — responsiveness — without the cost and risk.

#### Pipeline stages

1. **Fetch** — respect `robots.txt`. Send conditional requests using stored ETag/Last-Modified. If unchanged, stop — no LLM call, no cost.
2. **Extract** — server-side LLM call, structured JSON output only, validated against a Zod schema. Reject and log anything that fails validation rather than coercing it.
3. **Corroborate** — where a second source exists, cross-check. Record corroborating sources on the proposal.
4. **Diff** — compare against the current published value. No change, no proposal.
5. **Route** — high-confidence + corroborated + low-risk field → auto-publish. Everything else → `verificationQueue`.
6. **Publish** — write with `sourceUrl`, `verifiedOn`, `verifiedBy`, `confidence`.
7. **Log** — write an `ingestionRuns` record with tokens used and cost estimate.

#### Guardrails, all mandatory

- Per-run and per-month token budget. Hard stop when exceeded, with an alert.
- Global kill switch in config that halts all ingestion.
- Cron routes protected by a secret header — a public cron endpoint is a free way for someone to run up my API bill.
- Exponential backoff and a per-domain rate limit.
- Full audit trail: every published value traceable to a run, a source, and a reviewer.
- **Prefer official structured data over scraping.** Where a department, institution, or agency publishes a dataset, portal, or open-data file, use it. Scrape only where nothing structured exists. Log which method was used per source.

#### Source strategy

Identify and register authoritative sources for each data type — national education departments and their published statistics, the qualifications authority and quality council registers, the national student financial aid scheme, and the institutions' own admissions and prospectus pages. **Do not hardcode a source list from memory. Research and verify each source URL, record it in the `sources` collection with its publisher and robots status, and show me the list at the checkpoint for approval.** If a source cannot be verified as authoritative, it does not go in.

#### Bursary and internship safety

Bursary scams targeting school-leavers are a real and active problem in South Africa. Encode these rules:

- Never publish a bursary or internship that requires an upfront payment, "registration fee", or "administration fee". Auto-reject and flag.
- Never publish one sourced from a social media post, WhatsApp forward, or aggregator without a verifiable provider website.
- Every listing shows its provider and source link.
- Add a visible "how to spot a bursary scam" explainer on the bursaries page.
- Listings past their closing date are hidden automatically, not left to rot.

**Checkpoint 4:** show me the source register, the cadence config, a dry-run of one ingestion pass with zero writes, and the estimated monthly cost.

---

### Phase 5 — Bursaries, internships, and statistics

**Bursaries and internships** — filtered by the learner's qualified/shortlisted fields of study, and by level: matric-only opportunities separated from those needing current enrolment or a completed qualification. My brief specifically called out matric-only internships; make that a first-class filter, not a buried checkbox. Deadline countdown on every card.

**Statistics dashboard** — two sections:

- *Higher education:* enrolments, graduations, throughput by institution and field of study, student funding coverage.
- *Schools:* NSC results by province and district, bachelor-pass rates, subject-level performance, school counts.

Every chart cites its dataset, publisher, and year beneath it. Every dataset downloadable as CSV. If a statistic has no verified source, the chart does not render — it shows "data pending verification".

**Checkpoint 5.**

---

### Phase 6 — Accounts, saved profiles, and POPIA

Optional accounts. The calculator must work fully without one.

Signed-in learners get: saved marks, a shortlist, deadline reminders, and application-status links for institutions they applied to.

**POPIA compliance is a build requirement, not a legal footnote.** Many users will be 17 or younger, and personal information of children carries specific obligations under POPIA — processing generally requires the consent of a competent person, typically a parent or guardian. Build:

- An age gate at signup. Under-18 flow captures guardian consent and records it (`consentRecord`, `guardianConsentAt`).
- Data minimisation — collect marks and subject choices, not ID numbers, not addresses. If a field is not needed to compute a result, do not ask for it.
- A working "download my data" and "delete my account" flow, not a stub.
- A plain-language privacy notice written for a teenager, not for a lawyer.
- Firestore security rules that actually enforce per-user ownership. Write rule tests.

Do not treat this as boilerplate. It will also be a graded section of my requirements document.

**Checkpoint 6.**

---

### Phase 7 — Admin and verification console

Protected route, role-gated.

- **Verification queue** — proposed changes with current value, proposed value, confidence, source link, and corroborating sources side by side. Approve / edit / reject, one keystroke each. This screen decides whether the product is trustworthy, so make it fast to use, not pretty.
- **Source register** — add, disable, set cadence, view robots status and last fetch.
- **Ingestion runs** — history, token spend, cost, errors, manual re-run.
- **Content editor** — manual override for any fact, with a mandatory source URL field.
- **Dead link report** — from the 6-hourly checker.

**Checkpoint 7.**

---

### Phase 8 — Design pass

Design direction is yours to propose, but constrained by the audience:

- The calculator is the product. It gets the visual weight.
- Legible on a 5-inch screen in daylight. Real contrast, real tap targets.
- The results screen carries emotional weight — a learner is finding out whether they got in. "Almost qualified" must read as a next step, not a rejection.
- Ship a **low-data mode**: no hero imagery, system fonts, deferred charts. Detect `navigator.connection.saveData` and honour it.
- Bundle budget: under 200KB JS on first load for the calculator route. Enforce it in CI.
- WCAG 2.1 AA. Visible keyboard focus. `prefers-reduced-motion` respected.
- PWA — the calculator and the learner's saved results work offline.

Propose a token system (palette, type pairing, layout concept, one signature element) and show it to me **before** writing the CSS. Do not hand me the default AI look — cream background, big serif, terracotta accent. Ground the direction in the actual subject: South African school-leavers, application season, the physical artefacts of that world.

**Checkpoint 8.**

---

### Phase 9 — Test, harden, deploy

- Vitest across the APS engine, matching logic, and Zod schemas.
- Playwright E2E on the one path that matters: enter marks → see results → reach an apply link.
- Firestore security rule tests.
- Lighthouse ≥ 90 on performance, accessibility, best practices, SEO — on a throttled 3G profile, not on desktop.
- SEO: server-rendered programme pages, structured data, sitemap. Learners find this through search.
- Error monitoring and an uptime check on the cron routes.
- Deploy to Vercel. Staging first. **Do not push to the branch that triggers a production deploy until the build passes locally and I have confirmed.**

**Checkpoint 9.**

---

## 5. The rule that overrides everything else

If a learner reads a closing date on this site, misses the real one, and loses a year of their life, no amount of clean architecture matters. So:

> **Unverified is displayed as unverified. Never as a fact.**

When you are unsure whether something belongs in the verification queue or can auto-publish, it goes in the queue. When you are unsure whether a source is authoritative, it does not get registered. When the pipeline cannot determine a date, the UI says "dates being verified" and links to the institution.

Build the product so that being wrong is hard.

---

## 6. First response

Do not start coding. Reply with:

1. Your read of this brief, including anything you think is wrong or infeasible.
2. Your recommended Tier 1 institution list and why.
3. Your proposed source register for Phase 4, with actual verified URLs.
4. A rough monthly cost estimate: hosting, Firestore, LLM tokens at the cadences above.
5. Any stack disagreement.

Then stop and wait for me.
