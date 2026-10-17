# UCAG Figma Redesign Implementation Plan

**Design source:** [UCAG — Complete Product Redesign](https://www.figma.com/design/ESMzjguGV5nlAK7fE1hlVD)  
**Repository:** [saxs-14/UCAG](https://github.com/saxs-14/UCAG)  
**Implementation strategy:** incremental changes to the existing application; preserve real domain logic and data provenance.

## Guardrails

- Keep the existing APS calculator, institution-specific eligibility engine, programme catalogue, bursary/internship data, authentication, learner profile, admin tools, and activity reporting.
- Never replace live functionality with static Figma sample content.
- Never present illustrative programme names, marks, dates, counts, or opportunities as verified admissions facts.
- Preserve the source URL, verification date, and academic-year context wherever admissions facts are displayed.
- Keep the calculator usable without an account; require sign-in only for features that need a saved profile.
- Prefer shared Tailwind v4 theme tokens and existing components over one-off styles.
- Keep every page responsive, keyboard accessible, and readable at narrow viewport widths.

## Delivery phases

| Phase | Scope | Status |
|---|---|---|
| 1 | Shared navigation visual refresh and home/APS landing experience | Implemented on `feat/figma-redesign-home-shell`; needs CI and browser verification |
| 2 | Programme explorer and programme detail; eligibility result cards and provenance presentation | Partially implemented: explorer/detail visual alignment; eligibility states still require full regression review |
| 3 | Funding/bursaries, institution directory and UMP hub visual alignment | Partially implemented: bursaries, institutions and UMP routes exist; full cross-page visual and content verification remains |
| 4 | Learner journey, account/profile/settings and comparison/APS simulator | Account shell exists; journey and comparison/simulator scope must be checked against existing functionality before claiming complete |
| 5 | Admin trust console, analytics/reports, data-source health and audit states | Partially implemented: admin overview and activity report visual refresh; remaining admin screens need alignment and regression review |
| 6 | Mobile layouts, loading/empty/error states, keyboard navigation, contrast and responsive regression tests | Partially implemented: navigation and shared page heroes refreshed; systematic accessibility and viewport checks pending |
| 7 | Final rubric mapping, screenshots, end-to-end verification and production readiness review | Not verified |

## Phase 1 implementation notes

- Desktop navigation now uses the existing warm-paper, ink, teal and line tokens and includes the existing UMP hub route.
- Home page has a responsive navy hero, a clear calculator entry point, an explanation of the three-step journey, a verification reminder, the existing NSC subject form, the existing result section, and real links to programmes/funding/account.
- The existing subject form, APS calculation/result components, profile prefill, save-marks action, and best-effort activity tracking remain in place.
- The hero and journey cards use explanatory copy only; no fabricated live programme data or admission thresholds were introduced.

## Verification checklist

- [ ] CI build passes on the PR head.
- [ ] ESLint and TypeScript checks pass.
- [ ] Existing unit tests pass.
- [ ] Home page verified at mobile, tablet, and desktop widths.
- [ ] Keyboard-only navigation and visible focus verified.
- [ ] Calculator validation, calculation, result rendering, profile prefill, and save-marks action regression-tested.
- [ ] Programme, funding, UMP and account links checked.
- [ ] No unverified admissions claims introduced.
- [ ] Update this document with actual check links/results before merging.


## Follow-up implementation notes

- Programme detail header and requirements/application panels now use the shared brand palette and clearer visual grouping while retaining live catalogue fields, provenance and official application links.
- Admin overview is now a responsive trust-console landing page with navigable cards for the existing queue, source register, ingestion runs, editor, dead-link report and aggregate activity report.
- Learner activity report styling now uses shared paper/ink/teal tokens, responsive aggregate metric cards and a horizontally scrollable table. Existing Firestore subscription and privacy-minimised aggregate-only semantics are retained.
- The general bursaries page and account page already use the shared PageHero component. The UMP hub retains its institution-specific navy/gold identity; it needs a final visual/accessibility review rather than a blind palette replacement.
- These are UI changes, not evidence that the full Figma prototype has been implemented. The comparison/APS simulator, complete learner journey, and some Figma-only states must be matched to existing routes and real data before new functionality is claimed.
- After each implementation batch, CI and browser testing are still required. Do not mark the checklist complete based only on source edits.
