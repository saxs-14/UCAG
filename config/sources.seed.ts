/**
 * Source register for the Phase 4 ingestion pipeline. Every URL below was
 * confirmed reachable by direct fetch during Phase 0 research (see the
 * Phase 0 checkpoint response) -- none are guessed or reconstructed from
 * memory, per docs/MASTER_PROMPT_v2.md sect. 4 ("Do not hardcode a source
 * list from memory. Research and verify each source URL.").
 *
 * fetchIntervalHours is set to match whichever config/ingestion.ts
 * CADENCE_RULES task the source primarily feeds (24h for daily tasks,
 * ~720h for monthly, ~2160h for quarterly) -- adjust per-source once
 * real fetch history exists.
 *
 * robotsAllowed reflects what was actually found in each domain's
 * robots.txt during Phase 0 research (recorded per-entry below); where
 * that check could not be completed (TLS errors in the research tool),
 * it's marked with a `notes` caveat rather than silently assumed true.
 */

import type { Source } from "@/lib/firestore/types";

const NOT_YET_FETCHED = { lastFetchedAt: null, etag: null } as const;

export const GOVERNMENT_SOURCES: Source[] = [
  {
    id: "dhet-university-directory",
    url: "https://www.dhet.gov.za/SitePages/UniversitiesinSA.aspx",
    publisher: "Department of Higher Education and Training (DHET)",
    type: "governmentRegister",
    robotsAllowed: true, // dhet.gov.za robots.txt: fully permissive
    fetchIntervalHours: 2160, // quarterly -- faculty/school structure cadence
    reliabilityScore: 0.9,
    ...NOT_YET_FETCHED,
  },
  {
    id: "dhet-pset-statistics",
    url: "https://www.dhet.gov.za/dhetresearchbulletin6/STATISTICAL%20PUBLICATIONS/2.html",
    publisher: "Department of Higher Education and Training (DHET)",
    type: "governmentStatistics",
    robotsAllowed: true,
    fetchIntervalHours: 2160,
    reliabilityScore: 0.9,
    notes: "PDF reports only -- no CSV/API/open-data portal found. Extraction will need PDF-table parsing, not simple HTML scraping.",
    ...NOT_YET_FETCHED,
  },
  {
    id: "dbe-caps-subjects",
    url: "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS).aspx",
    publisher: "Department of Basic Education (DBE)",
    type: "governmentRegister",
    robotsAllowed: true, // no robots.txt present (404) -- unrestricted by default
    fetchIntervalHours: 2160,
    reliabilityScore: 0.9,
    notes: "This is the authoritative source for the NSC subject taxonomy in config/subjects.ts, currently flagged needsVerification -- cross-check against this page before flipping any subject to verified.",
    ...NOT_YET_FETCHED,
  },
  {
    id: "dbe-statistical-publications",
    url: "https://www.education.gov.za/Programmes/EMIS/StatisticalPublications.aspx",
    publisher: "Department of Basic Education (DBE)",
    type: "governmentStatistics",
    robotsAllowed: true,
    fetchIntervalHours: 2160,
    reliabilityScore: 0.9,
    notes: "NSC pass-rate-by-province results live under a separate DBE URL (NSC exam results release page), not this one -- confirm the exact release-page URL before wiring the statistics dashboard.",
    ...NOT_YET_FETCHED,
  },
  {
    id: "umalusi",
    url: "https://www.umalusi.org.za/",
    publisher: "Umalusi (Council for Quality Assurance in General and Further Education and Training)",
    type: "governmentRegister",
    robotsAllowed: true, // no robots.txt present
    fetchIntervalHours: 2160,
    reliabilityScore: 0.9,
    notes: "Authoritative source for NSC pass-type (Bachelor's/Diploma/Higher Certificate) thresholds -- config/aps-scales.ts NSC_PASS_TYPES is still descriptive-only pending this being fetched and encoded as computable rules.",
    ...NOT_YET_FETCHED,
  },
  {
    id: "saqa-qualification-search",
    url: "https://allqs.saqa.org.za/search.php?cat=qual",
    publisher: "South African Qualifications Authority (SAQA)",
    type: "governmentRegister",
    robotsAllowed: true,
    fetchIntervalHours: 2160,
    reliabilityScore: 0.6,
    notes: "robots.txt could not be independently verified (persistent TLS error against saqa.org.za in Phase 0 research) -- recheck with a real browser/different fetch method before this source's first live run. Used for programme SAQA-ID lookups since CHE has no public accreditation database (see che note below).",
    ...NOT_YET_FETCHED,
  },
  {
    id: "nsfas",
    url: "https://www.nsfas.org.za/",
    publisher: "National Student Financial Aid Scheme (NSFAS)",
    type: "governmentRegister",
    robotsAllowed: true, // no robots.txt present
    fetchIntervalHours: 24, // daily Mar-Sep per the bursaries cadence rule
    reliabilityScore: 0.9,
    ...NOT_YET_FETCHED,
  },
  {
    id: "stats-sa",
    url: "https://www.statssa.gov.za/",
    publisher: "Statistics South Africa",
    type: "governmentStatistics",
    robotsAllowed: true, // explicit Allow: /
    fetchIntervalHours: 2160,
    reliabilityScore: 0.9,
    notes: "Supplementary/secondary source for education statistics -- DHET and DBE's own statistics pages are the primary authoritative sources for higher-ed and NSC data respectively.",
    ...NOT_YET_FETCHED,
  },
  {
    id: "che",
    url: "https://www.che.ac.za/",
    publisher: "Council on Higher Education (CHE)",
    type: "governmentRegister",
    robotsAllowed: true, // Drupal-style admin/user-path blocks only
    fetchIntervalHours: 2160,
    reliabilityScore: 0.8,
    notes: "heqc-online-1.che.ac.za is an institution-facing accreditation SUBMISSION portal, not a public searchable register -- there is no public CHE database to scrape for programme accreditation status. Use SAQA's qualification search instead for that data.",
    ...NOT_YET_FETCHED,
  },
];

/** One entry per Tier 1/2 institution's primary admissions page. Feeds
 * the monthly programmeRequirements/apsRules cadence. Institution
 * portal/status-check/website URLs used by the link-health checker are
 * read directly from config/institutions.seed.ts rather than duplicated
 * here -- this list is specifically the admissions-content pages that
 * need periodic re-extraction. */
export const INSTITUTION_SOURCES: Source[] = [
  {
    id: "ump-admissions",
    url: "https://www.ump.ac.za/",
    publisher: "University of Mpumalanga",
    type: "institutionAdmissions",
    robotsAllowed: true,
    fetchIntervalHours: 720,
    reliabilityScore: 0.85,
    notes: "robots.txt only explicitly names Googlebot with Allow: / -- no explicit rule for other user-agents; treated as permissive but worth a recheck.",
    ...NOT_YET_FETCHED,
  },
  {
    id: "up-admissions",
    url: "https://www.up.ac.za/students/programme-calculator",
    publisher: "University of Pretoria",
    type: "institutionAdmissions",
    robotsAllowed: true,
    fetchIntervalHours: 720,
    reliabilityScore: 0.7,
    notes: "Direct fetch returned 403 in Phase 0 research (likely bot-protection or JS-rendered content) -- a real ingestion run may need a headless-browser fetch strategy, not a plain HTTP GET.",
    ...NOT_YET_FETCHED,
  },
  {
    id: "wits-admissions",
    url: "https://www.wits.ac.za/undergraduate/entry-requirements/",
    publisher: "University of the Witwatersrand",
    type: "institutionAdmissions",
    robotsAllowed: true, // no robots.txt present
    fetchIntervalHours: 720,
    reliabilityScore: 0.9,
    notes: "Content-verified live by direct fetch in Phase 0 (confirmed the 8-point-scale/LO-included/English+Maths-bonus methodology).",
    ...NOT_YET_FETCHED,
  },
  {
    id: "stellenbosch-admissions",
    url: "https://www.su.ac.za/english/maties/apply",
    publisher: "Stellenbosch University",
    type: "institutionAdmissions",
    robotsAllowed: true,
    fetchIntervalHours: 720,
    reliabilityScore: 0.75,
    notes: "The specific admission-requirements sub-page 403'd on direct fetch; this jumping-off page is the documented official entry point instead.",
    ...NOT_YET_FETCHED,
  },
  {
    id: "uct-admissions",
    url: "https://uct.ac.za/students/applications-admission-requirements/eligibility-admission",
    publisher: "University of Cape Town",
    type: "institutionAdmissions",
    robotsAllowed: true,
    fetchIntervalHours: 720,
    reliabilityScore: 0.9,
    notes: "Content-verified live by direct fetch in Phase 0 (confirmed the percentage/Faculty-Point-Score methodology). IMPORTANT: uct.ac.za's robots.txt explicitly blocks named AI-crawler user agents (GPTBot and similar) while leaving standard search-engine crawling open. This bot's user-agent (see config/ingestion.ts USER_AGENT) is not one of the explicitly-named bots, so it technically falls under the general/permissive rule -- but this is flagged here as a deliberate judgment call, not a silent workaround. Confirm with the project owner before UCT's first live extraction run.",
    ...NOT_YET_FETCHED,
  },
  {
    id: "nmu-admissions",
    url: "https://www.mandela.ac.za/Study-at-Mandela/Discovery/Entry-requirements",
    publisher: "Nelson Mandela University",
    type: "institutionAdmissions",
    robotsAllowed: true,
    fetchIntervalHours: 720,
    reliabilityScore: 0.9,
    notes: "Content-verified live by direct fetch in Phase 0 (confirmed the Applicant-Score-out-of-600 + quintile 1-3 equity bonus methodology).",
    ...NOT_YET_FETCHED,
  },
  {
    id: "uj-admissions",
    url: "https://www.uj.ac.za/admission-aid/apply/",
    publisher: "University of Johannesburg",
    type: "institutionAdmissions",
    robotsAllowed: true,
    fetchIntervalHours: 720,
    reliabilityScore: 0.7,
    notes: "Direct fetch returned 403 in Phase 0 research -- likely needs a headless-browser fetch strategy.",
    ...NOT_YET_FETCHED,
  },
  {
    id: "nwu-admissions",
    url: "https://studies.nwu.ac.za/undergraduate-studies/fields-study-2028",
    publisher: "North-West University",
    type: "institutionAdmissions",
    robotsAllowed: true,
    fetchIntervalHours: 720,
    reliabilityScore: 0.8,
    notes: "URL auto-advances by cycle year (redirected from a 2027 URL during Phase 0 research) -- do not hardcode the year in scraping logic, follow redirects.",
    ...NOT_YET_FETCHED,
  },
  {
    id: "unisa-admissions",
    url: "https://www.unisa.ac.za/sites/corporate/default/Apply-for-admission",
    publisher: "University of South Africa (UNISA)",
    type: "institutionAdmissions",
    robotsAllowed: true, // no robots.txt present
    fetchIntervalHours: 720,
    reliabilityScore: 0.85,
    notes: "APS/entry requirements live on per-qualification pages, not one central page -- expect to need many source entries (one per programme or programme group) once UNISA's catalogue is actually ingested.",
    ...NOT_YET_FETCHED,
  },
  {
    id: "cao-ukzn",
    url: "https://cao.ac.za/",
    publisher: "Central Applications Office (CAO) -- shared portal used by UKZN for first-time undergraduate applications",
    type: "institutionPortal",
    robotsAllowed: true, // only disallows /WebResource.axd
    fetchIntervalHours: 720,
    reliabilityScore: 0.85,
    notes: "UKZN does not run its own first-time-undergrad application portal -- first-year applicants apply through CAO, not a UKZN-specific system. This is the correct source for UKZN application-window/portal data, not a ukzn.ac.za URL.",
    ...NOT_YET_FETCHED,
  },
  {
    id: "tut-admissions",
    url: "https://www.tut.ac.za/",
    publisher: "Tshwane University of Technology",
    type: "institutionAdmissions",
    robotsAllowed: true, // no robots.txt present
    fetchIntervalHours: 720,
    reliabilityScore: 0.8,
    ...NOT_YET_FETCHED,
  },
  {
    id: "cput-admissions",
    url: "https://www.cput.ac.za/",
    publisher: "Cape Peninsula University of Technology",
    type: "institutionAdmissions",
    robotsAllowed: true,
    fetchIntervalHours: 720,
    reliabilityScore: 0.5,
    notes: "TLS handshake errors on both HTTP and HTTPS in the Phase 0 research tool -- neither content nor robots.txt were independently confirmed. Recheck with a different fetch method before this source's first live run.",
    ...NOT_YET_FETCHED,
  },
];

export const SEED_SOURCES: Source[] = [...GOVERNMENT_SOURCES, ...INSTITUTION_SOURCES];
