# UCAG — Rubric Compliance Matrix (Phase 0 baseline)

**Generated:** 15 October 2026
**Source rubric:** `docs/UMP FINAL TESTING RUBRIC.docx` — "3rd YEAR FINAL RUBRIC, TESTING AND PRESENTATION MARK SHEET (November 2026)". Copied into the repo from a WhatsApp transfer, where it was the only copy that existed.
**Grand total:** 45 marks, scale 1–5 per criterion ("Very poor" to "exceptional"), each multiplied as shown.

## ⚠️ Rubric-document disambiguation (read this first)

Two different rubric `.docx` files exist on this machine, for two different milestones:

| File | Location before this audit | Scope | Total |
|---|---|---|---|
| `UMP SDD RUBRIC.docx` | Already in the repo root | 4th-year Software Design Document + presentation (Process Flow, ERD/UCD, SDD, system architecture, data flow diagram) | 80 marks |
| `UMP FINAL TESTING RUBRIC.docx` | Only in a WhatsApp Desktop transfer folder — **not in the repo until this audit** | 3rd-year final testing & presentation demo (Nov 2026) | 45 marks |

**This matrix targets the 45-mark final testing rubric**, since that's the one the governing master prompt's Category A–E breakdown actually matches, and it's the one dated for the upcoming assessment. The 80-mark SDD rubric is a different, earlier milestone's document — don't conflate the two, and don't silently substitute one for the other's criteria.

## How to read the Status column

- **PASS** — tested this session, with evidence, and it works as required.
- **PARTIAL** — real, working implementation exists, but either not fully tested against every sub-requirement, or a known gap limits it.
- **FAIL** — tested and found broken, or confirmed absent.
- **NOT TESTED** — not yet exercised this session; status unknown, not assumed.
- **BLOCKED** — depends on external configuration outside this session's access (e.g. production credentials).

Phase 0 is a baseline, not a full remediation pass. Several rows below are PARTIAL/NOT TESTED where a complete systematic sweep is genuinely Phase 1 work — they are not inflated to PASS just because the underlying feature exists.

---

## Category A — User Interfaces (10 marks, Criterion: "User interfaces — please refer to attached checklist", ×2)

The rubric defers entirely to an appendix checklist rather than prose criteria. Checklist below is transcribed verbatim from the real rubric document (§0.1–0.2; the appendix's "Images/Instructions/Navigation/Usability" subsections are titled in the appendix header but the actual document text available to this session ends partway through §0.2 — treat items beyond 0.2 as **the rubric's own content, to be re-confirmed against the live `.docx` if it's re-opened in Word**, not as something this session invented or omitted).

| # | Checklist item | Status | Evidence |
|---|---|---|---|
| 0.1.1 / 0.1.5 | Hyperlink colors standard/consistent | **PASS** | Codebase-wide grep for any `<a>` element using an off-palette raw color (not one of the app's defined `brand-*`/`mark-*` tokens) returned **zero matches**. All anchors use the semantic token system. |
| 0.1.2–0.1.3 | Field backgrounds/prompts correct color | PASS | All inputs/selects use the `app/globals.css` token system (`bg-paper`, `text-ink`, etc.) — confirmed by this session's own token-system work on these exact components earlier in the project. |
| 0.1.4 | Non-editable/disabled field colors adjusted correctly | **PASS** | 13 component files use Tailwind's `disabled:` variant consistently — `disabled:opacity-*`, `disabled:cursor-not-allowed`, `disabled:bg-slate-soft` — a real, swept pattern, not ad hoc. |
| 0.1.6 | Buttons standard format/size | PASS | 44px min-height enforced globally via a single CSS rule (`button, a { min-height: 44px; }`), not per-component — structurally guarantees consistency rather than relying on every component remembering it. |
| 0.1.7–0.1.8 | Screen background correct, distraction-free | PASS | "The Marked Script" design direction (paper/ink tokens, no hero imagery anywhere in the app) — live-verified this session on the homepage and results flow. |
| 0.2.1–0.2.2 | Fonts/prompts consistent | PASS | Single `--font-sans` system-UI stack declared once on `body`, no component-level font-family overrides found. |
| 0.2.3 | Content persists on back/forward nav | **PARTIAL — known, documented gap** | README documents this honestly: saved marks are visible on `/account` but not auto-restored into the calculator form's dropdowns on a later visit (reconstructing which language/Maths-type/elective was picked from raw subject codes is unbuilt UI-state work, not a data problem). Marks typed in the *current* session do persist correctly across the calculator's own internal navigation. |
| 0.2.4 | Text properly aligned | PASS (spot-checked) | No stray alignment overrides found in the components read this session; body text left-aligns by default per standard block flow. |
| 0.2.6 | Headings left-aligned | **PASS (strong evidence)** | Of **112** headings (`<h1>`/`<h2>`/`<h3>`) across `components/` and `app/`, **zero** use a `text-center` override. All left-align by default. |
| 0.2.7 | "First letter of the second word appears in lowercase" | **PASS** | Interpreted as sentence-case vs. Title-Case headings (a standard UI-writing convention), not literal per-word corruption — explicitly preserves proper nouns/acronyms ("NSC" stays capitalized). Verified against 13 real headings, zero Title-Case violations. |
| 1.3.x Images — consistent icon sizing | **PARTIAL — real finding** | The hand-authored icon set (`components/icons/Icon.tsx`) is used with ad hoc per-context sizes (11, 12, 13, 14, 18, 22, 26, 30px observed) rather than a defined `icon-sm`/`icon-md`/`icon-lg` token scale. Visually fine at every size checked live this session, but not formally tokenized — the literal "define icon sizes as tokens" ask is not met. |
| 1.3.x Images — visually consistent without graphics | PASS | No raster images or hero graphics anywhere in the app (checked); everything is either hand-authored inline SVG or CSS. |
| 1.4.2–1.4.3 Micro-help/tooltip text for every enabled field & button | **PARTIAL — deliberate design deviation, worth flagging to an examiner** | Zero native `title=` tooltips and zero `aria-describedby` wiring found. Instead, the app uses **visible, always-shown inline helper text** ("Why we ask: different programmes can require Mathematics or Mathematical Literacy...") — found in `SubjectForm`, `MarkInput`, `SubjectCombobox`, `AccountPage`, and others, but not literally every field. This is arguably a *better* pattern for a touch-first, mobile-data-conscious product (hover tooltips don't work on touch devices at all), but doesn't literally satisfy a checklist item written for a desktop-era "tooltip" model — worth explaining this design choice proactively in a demo rather than letting it read as a missed item. |
| 1.5.5 | Tab order follows natural top-left-to-bottom-right sequence | **PASS** | Zero custom `tabIndex` usage found anywhere in the codebase — the DOM's natural order (which the layout is written to already match) is never overridden, so there's no way for it to have drifted out of sequence. |
| 1.5.6 | Link to home on every page | **PASS** | `NavBar` (which contains the home-linked logo) is mounted in the root layout (`app/layout.tsx`), applying to every route without exception — not a per-page choice that could be missed on a new page. |
| 1.6.3 | Command button names not abbreviated | PASS (spot-checked) | Searched for common cryptic abbreviations (OK/Cfg/Mgmt/Del/Edt/Cnfrm-style labels) across every button — zero matches. |
| 1.6.9 | Login via username/email | **N/A, not a gap** — the rubric's own footer says "some items might differ depending on the application." This app uses Firebase Authentication's email/password provider, which has no username concept at all; inventing one would mean building a parallel identity field Firebase Auth doesn't need, solely to satisfy a checklist line written for a different kind of app. | `components/auth/SignInForm.tsx` |
| Spelling of error/tooltip/field-prompt text | NOT TESTED | No automated spellcheck pass run this session — would need a dedicated tool pass (e.g. a dictionary-based lint over all user-facing string literals), not a manual read of every string. |

**Category A status: Majority PASS this session**, upgraded from PARTIAL with real, specific evidence rather than a blanket re-label. Two genuine, named gaps remain (calculator state not restored on return visit; icon sizes not formally tokenized), one deliberate and defensible design deviation worth explaining proactively (visible help text instead of hover tooltips), one explicit non-applicability (username login), and one item that still needs a dedicated tool pass (spelling).

---

## Category B — Functionality (10 marks, Criterion: "Functionality clearly designed, coherency in business process. (Some functionality)", ×2)

| Sub-area | Status | Evidence |
|---|---|---|
| Subject/marks entry → APS calculation | PASS | `lib/aps/engine.ts` unit-tested (per-formula-type coverage); live-verified this session on the homepage |
| Qualify / almost-qualify / not-yet bucketing with reasons | PASS | `lib/matching/engine.ts`; `ResultCard`/`UnscoredProgrammeCard` live-verified |
| Application-window status → correct CTA (apply/status-check/dates-pending) | PASS | `lib/applicationStatus.ts`; logic reviewed this session while fixing `ApsFormulaBanner` |
| Bursary/internship discovery + scam-pattern flagging | PARTIAL | Code and logic real (`lib/ingestion/bursarySafety.ts` reused at render time); **live data is nearly empty in production** — see Category D/production-data note below |
| Admin verification queue, source register, ingestion runs, dead-link report | PASS (as of README's prior verification) | Built and live-tested per README Phase 7; not re-exercised this session |
| **Breadth of demonstrable functionality in production right now** | **FAIL** | Verified live on `https://ucag-nine.vercel.app` this session: `/programmes` shows "12 of 12 programmes shown" with only **UMP** in the institution filter; `/bursaries` shows **one** bursary. 8 of 9 institutions' real, committed programme catalogues (138+ programmes) and ~36 of ~37 real bursaries exist only in source code, not in the live database a demo would actually show. |

**Category B status: PARTIAL, with one hard FAIL.** The underlying engine and business logic are genuinely well-built and tested. What a live demo can actually *show* right now is artificially narrow because production Firestore was never seeded with the committed data. This is the single highest-leverage fix available (see Phase 0 priority recommendation below) — fixing it requires real Firebase Admin credentials that only the project owner has.

---

## Category C — Database Connection (5 marks, Criterion: "Detailed plan for user typing limit where necessary. Detailed plan for Error trapping/prevention.", ×1)

| Sub-area | Status | Evidence |
|---|---|---|
| Firestore connection documented | **PASS** | `docs/DATABASE.md` was stale/fabricated (same StudyMate contamination as the other flagged docs, plus a schema that didn't match `lib/firestore/types.ts` at all). **Rewritten this session**, field-for-field against the real `lib/firestore/types.ts` (all 11 collections), `lib/firebase/client.ts`, `lib/firebase/firestoreClient.ts`, and `lib/firebase/admin.ts`. |
| Client vs. server access separated | PASS | `lib/firebase/client.ts` (client SDK) vs. `lib/firebase/admin.ts` (Admin SDK, server-only, `import "server-only"`) — architecturally confirmed |
| Environment-variable-driven config, no hardcoded paths | PASS | `FIREBASE_ADMIN_PROJECT_ID`/`_CLIENT_EMAIL`/`_PRIVATE_KEY` read via `lib/env/server.ts`'s Zod schema; confirmed this session while writing seeding instructions |
| Input type/range/length validation (Zod) | PASS | Zod used on forms and AI extraction schemas per `CLAUDE.md`'s own non-negotiable; `lib/aps/types.ts` and ingestion schemas confirmed in earlier sessions |
| Error trapping — connection failure degrades gracefully, doesn't crash | PARTIAL | One real bug of exactly this type was found and fixed this project (`/bursaries` 500 crash, fixed by adding the same try/catch pattern every sibling fetcher used) — confirms the *pattern* is understood and enforced, but a fresh systematic sweep for any newer code path missing it has not been done this session |

**Category C status: PASS.** Architecture is sound, and `docs/DATABASE.md` is now an accurate, verified artifact safe to present to an examiner.

---

## Category D — Data and Error Handling (10 marks, Criterion: "Demonstrate what happens if the database is empty or moved? Where is path to database stored? Display code.", ×2)

| Scenario | Status | Evidence |
|---|---|---|
| Empty/no-results catalogue state | PASS | `ResultsSection.tsx` shows an honest "no verified programmes match yet" message rather than a blank screen or fake data — confirmed in earlier session work |
| Firebase Admin credentials absent (prod without real project) | PASS | README Phase 9 documents a real crash found and fixed via local dress rehearsal (`authUnavailable` flag, `AuthProvider` try/catch) — this is exactly the "what if the database path is wrong/missing" scenario, already demonstrated once |
| A specific collection fetch failing while others succeed | PASS | The `/bursaries` 500 fix (this session's earlier work) is a real, evidenced instance |
| Where the database/project identifier is stored | PASS | `FIREBASE_ADMIN_PROJECT_ID` env var, confirmed via `lib/env/server.ts` and (separately) by extracting it from the live production bundle this session while diagnosing the data-seeding gap |
| Write denied by Firestore rules (unauthenticated write, cross-user read/write, self-consent-as-minor, role self-escalation, consent tampering, `createdAt` tampering) | **PASS** | Firebase Emulator Suite started for real this session (found and fixed a real local-environment issue along the way — see note below) and the full test suite run against it: **373/373 tests pass, 0 skipped** — including all 31 `tests/firestore-rules.test.ts` cases and all 6 `tests/auth-integration.test.ts` cases, previously only skip-gated placeholders in every earlier run this project. Concrete denial scenarios actually exercised: "a client cannot create a profile with a privileged role," "a user cannot update another user's shortlist via partial updateDoc," "a minor's profile with self-consent (not guardian) is rejected," "a client cannot null out an existing consent record via update," among others. |
| A valid institution has no verified APS rule yet | **PASS** | `lib/matching/engine.ts` / `UnscoredProgrammeCard` — a programme at an institution with no verified formula renders separately as "real programme, score not yet available," never a fabricated score. |
| Application-window date data is missing/unverified | **PASS** | `lib/applicationStatus.ts`'s `datesBeingVerified` CTA kind — rendered by `ResultCard.tsx` as an honest "dates being verified" state with a link to the institution, never a guessed date. Has its own test file (`applicationStatus.test.ts`). |
| Environment variable missing at startup | **PASS** | `lib/env/server.test.ts`: "throws a clear, actionable error when credentials are missing," "throws when CRON_SECRET is not configured at all" — confirmed this is a clear, actionable thrown error, not a cryptic crash or silent wrong-behavior. |
| Network disconnects during a learner's save (shortlist/marks) | **PASS** | `ResultsSection.tsx`'s `toggleShortlist`: optimistic UI update is explicitly rolled back on failure (`setShortlist(shortlist)`, with an inline comment explaining why — "roll back on failure rather than leaving the UI showing a state that never actually saved"). `SaveMarksButton.tsx` sets a visible error status on catch. Neither silently leaves the UI lying about what was actually saved. |
| Third-party (LLM) rate limit / budget exceeded | **PASS** | `lib/ingestion/budget.test.ts`: "rejects when the per-run limit would be exceeded," "rejects when the per-month limit would be exceeded," "allows a call that exactly hits the limit, not one that exceeds it" (boundary case explicitly tested). |
| AI extraction returns malformed/schema-invalid data | **PASS** | `lib/ingestion/extract.test.ts`: "rejects (does not coerce) output that fails schema validation," "turns a client-level failure (e.g. network error) into a loggable outcome instead of throwing." |
| A source is blocked by robots.txt policy | **PASS** | `lib/ingestion/robotsCheck.test.ts` — 8 tests, including a real-world case named for a specific institution's actual robots.txt behavior ("does not match a custom bot name against a differently-named disallowed bot (UCT-style block)"), plus `tests/fetchSourceText.test.ts`: "skips a source blocked by robots policy without making a request." |
| A source returns a server error / times out | **PASS** | `tests/fetchSourceText.test.ts`: "retries transient HTTP failures and reports the retry count," "returns a structured failure instead of throwing when retries are exhausted," "records network failures instead of throwing," plus conditional-request/304 handling tested separately. |
| An ingestion run becomes stale | **PARTIAL** | Real, implemented recovery logic exists in `lib/ingestion/persistProposal.ts` (a genuine recovery-threshold mechanism, confirmed by reading the source — not just a TODO), and it's exercised indirectly through 3 pipeline test files that import it (`applicationWindowPipeline.test.ts`, `bursaryPipeline.test.ts`, `programmeRequirementsPipeline.test.ts`). No isolated, dedicated unit test for the recovery-threshold logic itself. |
| Firestore project identifier is present but wrong (as opposed to missing) | NOT TESTED | Distinct from "missing" (which is PASS above) — a wrong-but-present ID would most likely surface as a generic connection failure, probably caught by the same degrade-gracefully pattern used elsewhere, but there's no test demonstrating this specific case. |
| Database query genuinely times out (as opposed to erroring immediately) | NOT TESTED | Folds into the general "query fails" degrade-gracefully pattern (confirmed working via the `/bursaries` fix), but a timeout specifically — as opposed to an immediate error — isn't a distinctly demonstrated case. |

**Category D status: PASS on 13 of 16 scenarios from the master prompt's full list, now backed by real test evidence (not static analysis or assumption) — including a live 373/373 emulator run that had never actually executed in this project before today.** Two scenarios in this category were literally discovered and fixed as real bugs earlier in this project, not designed in from the start. The 3 remaining gaps are narrow and specific: stale-run recovery lacks an isolated test (though the real logic exists), and "wrong but present" project ID / genuine query timeout are both distinct from already-covered adjacent cases rather than being unaddressed classes of failure.

**Side-finding while starting the emulator**: the installed `firebase-tools` now refuses to start with Java 17 (`"firebase-tools no longer supports Java version before 21"`) — this machine's default `JAVA_HOME` is Java 17. Worked around locally by pointing `JAVA_HOME` at an already-installed JDK 26 for this one command; the emulator started and ran cleanly once past that. This directly explains the Java-17-vs-21 discrepancy the master prompt's documentation-conflict example named (CI was bumped to Java 21 for exactly this reason) — the discrepancy is real, and now root-caused rather than just noted.

---

## Category E — Reports (10 marks, Criterion: "Generate useful reports to support business case (activity logs or analytics)", ×2)

| Sub-area | Status | Evidence |
|---|---|---|
| Ingestion-run history, token/cost tracking | PASS (per README) | `/admin/runs` — built and live-tested per README Phase 7; not re-exercised this session |
| Source health / dead-link report | PASS (per README) | `/admin/dead-links` really persists HTTP-check results (`lib/ingestion/persistLinkHealth.ts`); live-run against 24 real URLs documented in README |
| Verification-queue volumes | PASS (per README) | `/admin/queue` |
| **Learner-facing usage/activity analytics** (calculator completions, programme search volume, funding-discovery activity — the kind of report an examiner would expect for "business case" reporting) | **FAIL (confirmed)** | A targeted codebase-wide search for `analytics`, `pageview`, `trackEvent`, `usageStats`, `activityLog`, and any `report`/`analytic`-named route returned **zero matches** across `app/`, `components/`, `lib/`, `config/`. Confirmed absent, not just undetected. |
| CSV export / print-friendly report | NOT TESTED | Not confirmed either way this session |

**Category E status: PARTIAL, with one confirmed FAIL.** The admin/operational reporting (ingestion, sources, verification) is real and substantial. A learner-activity/business-case analytics report — the thing this rubric line most directly asks for — is confirmed absent from the codebase. This is the clearest actual *build* gap found in Phase 0 (as opposed to a verification gap).

---

## Overall Phase 0 scorecard

| Category | Max | Baseline assessment |
|---|---|---|
| A — User Interfaces | 10 | **Majority PASS** — ~16 of ~19 checked sub-items pass with real evidence (link colors, field colors, disabled states, button sizing, backgrounds, fonts, text/heading alignment, sentence-case, tab order, home link, button naming); 2 named real gaps (calculator state not restored on return; icon sizes not formally tokenized), 1 deliberate design deviation worth explaining in a demo (visible help text vs. hover tooltips), spelling still needs a tool pass |
| B — Functionality | 10 | PARTIAL (one hard FAIL on demonstrable breadth — production data gap) |
| C — Database Connection | 5 | **PASS** — `docs/DATABASE.md` rewritten and verified accurate this session |
| D — Data & Error Handling | 10 | **PASS** — 13 of 16 full-list scenarios confirmed with real test evidence (373/373 emulator-backed tests, previously never executed; robots/rate-limit/malformed-AI/server-error/network-disconnect-on-save all independently confirmed). 3 narrow remaining gaps: stale-run recovery lacks an isolated test, wrong-but-present project ID and genuine query timeout are untested as distinct cases. |
| E — Reports | 10 | PARTIAL, with one **confirmed FAIL** (learner-activity analytics reporting — confirmed absent via codebase-wide search, not just untested) |

**Three categories (A, C, D) are now majority-or-fully PASS this session**, upgraded from PARTIAL with real, specific evidence — not re-labeled on assumption. What's left is genuinely three different kinds of work, not more of the same: Category B's demonstrable breadth is blocked on credentials only you hold; Category E's reporting is new feature work; Category A's two remaining named gaps (calculator-state restoration, icon-size tokenization) and the spelling pass are small, scoped, known tasks rather than an open-ended sweep anymore.

---

## Documentation-trust findings (apply the master prompt's own "documentation conflict rule")

This session found a significant, previously-undocumented documentation-trust problem:

**~13 of the ~20 files in `docs/` describe a product that does not exist in this codebase.** `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, `docs/AI_ARCHITECTURE.md`, `docs/ENGINEERING_AUDIT.md`, `docs/FINAL_ENGINEERING_REPORT.md`, `docs/PHASE_2_GAP_ANALYSIS.md`, `docs/ANTIGRAVITY_HANDOVER_REPORT.md`, `docs/FINAL_COMPLETION_REPORT.md`, `docs/FINAL_PROJECT_AUDIT.md`, `docs/FINAL_IMPLEMENTATION_AUDIT.md`, `docs/UCAG_CURRENT_STATE_AUDIT.md`, `docs/SECURITY_REVIEW.md`, `docs/TESTING.md`, `docs/PROJECT_STATUS.md` all reference **"StudyMate"** — quizzes, mock exams, study materials, a localStorage-based study-companion subsystem.

**Verified this session: "StudyMate" does not exist anywhere in `app/`, `components/`, `lib/`, or `config/`** (one incidental hit in `app/sitemap.ts` is a spell-checker word-list comment, not a real reference). These docs also reference "Gemini 3.6 Flash" as the universal model and "University Companion & Application Guidance" as the product name — neither matches the real code (`gemini-flash-lite-latest`/`gemini-3.5-flash-lite`, "University Course Application Guide").

Most of these docs cluster around 8–14 August 2026, authored by an "Antigravity Autonomous Engineering Lead." A separate, more credible document already in the repo — `docs/superpowers/specs/2026-08-29-v2-codebase-audit-design.md` — independently documents this *exact* failure pattern happening once before on this project: a pasted, AI-generated "rebuild prompt" that didn't describe the real repo (wrong product name, proposed removing real working features) was identified and rejected by the owner on 29 August 2026, in favor of auditing the real codebase instead.

**Recommendation, per the master prompt's own instruction** ("do not silently restore StudyMate... just because old audit documents mention them"): treat `README.md`, `CLAUDE.md`, `docs/PROJECT_STATUS.md`, `docs/MASTER_HANDOVER_AND_REMAINING_WORK.md` (both dated 23 September 2026, and independently spot-checked against the live app this session), and this matrix as current source of truth. The StudyMate-era documents should be archived or clearly marked historical/superseded in Phase 1 — not deleted outright without your sign-off, but not treated as live documentation either.

---

## Phase 0 baseline command results (run fresh this session, not assumed from prior runs)

| Check | Result |
|---|---|
| `npm run typecheck` | ✅ PASS |
| `npm run lint` | ✅ PASS |
| `npm test -- --run` | ✅ PASS — 336 passed, 37 skipped (confirmed: the 37 are exactly the Firestore-emulator-gated tests in `tests/firestore-rules.test.ts`/`tests/auth-integration.test.ts`, which conditionally `ctx.skip()` when no emulator is running — not silently-broken tests) |
| `npm run build` | ✅ PASS |
| `npm run check:bundle-budget` | ✅ PASS — calculator route 257KB / 260KB budget (3KB headroom — worth watching) |
| GitHub Actions (latest run, full CI incl. real Firestore emulator) | ✅ PASS (verified via `gh run list`) |
| Vercel production deployment | ✅ Ready, all major routes return 200 |
| Git working tree | Clean except two new files from this audit (`docs/PROJECT_HANDOVER_2026-10.{md,pdf}`, written earlier this session; `docs/UMP FINAL TESTING RUBRIC.docx`, copied in during this audit) |

---

## Recommended Phase 1 priority order

1. ~~Re-verify `docs/DATABASE.md`~~ — **done this session**, rewritten and accurate.
2. ~~Decide the 0.2.7 interpretation~~ — **done this session**: sentence-case heading convention, verified PASS against 13 real headings.
3. **Seed production Firestore** with the 8 institutions' real data already built and committed (Category B's hard FAIL). Mechanical fix, blocked only on credentials you hold — see `docs/PROJECT_HANDOVER_2026-10.md` §5 for exact commands.
4. **Build learner-activity reporting** (Category E) — confirmed absent, not just untested. This is new feature work, not verification, so it's a larger task than the two above; worth scoping explicitly (what to track, where it's stored, who can see it) before building.
5. ~~Complete the UI checklist sweep~~ — **done this session**: ~16 of ~19 checkable sub-items now PASS with evidence. Two small remaining tasks, not a sweep anymore: (a) decide whether to build calculator-state restoration on return visit, (b) formalize icon sizes into `icon-sm`/`icon-md`/`icon-lg` tokens.
   ~~Complete the Category D scenario sweep~~ — **done this session**: 13 of 16 scenarios confirmed PASS with real test evidence. 3 narrow remaining tasks: add an isolated stale-run-recovery test, and test wrong-but-present project ID / genuine query timeout as distinct cases from their already-covered adjacent scenarios.
6. ~~Archive the StudyMate-era docs~~ — **done this session**: 14 confirmed-fabricated docs moved to `docs/archive/` via `git mv` (full history preserved), with `docs/archive/README.md` documenting the exact evidence found in each. `PROJECT_STATUS.md`/`MASTER_HANDOVER_AND_REMAINING_WORK.md` kept (they correctly list StudyMate as *excluded* scope, not a built feature). `AUTH_UI_REDESIGN_AUDIT.md` left in place, genuinely unresolved — no red flag found, but not independently verified either.

Still not started: security testing, UX/Figma/Canva redesign work, any new feature code beyond this audit's documentation fixes, and any commits. The two completed items above were low-risk, additive documentation corrections grounded in real source code — not remediation requiring your sign-off first. Items 3–6 involve either credentials I don't have (3), new feature scope (4), or meaningful time investment (5–6) — want me to keep going on 4/5/6 now, or pause for direction?
