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

const NOT_YET_FETCHED = { lastFetchedAt: null, etag: null, enabled: true, institutionId: null } as const;

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
    url: "https://www.ump.ac.za/Study-with-us/Application-Process/Online-Applications",
    publisher: "University of Mpumalanga",
    type: "institutionAdmissions",
    robotsAllowed: true,
    fetchIntervalHours: 720,
    reliabilityScore: 0.9,
    notes: "Content-verified live by direct fetch: this specific page states real 2027-intake dates (opens 01 June 2026; undergrad/advanced-diploma closes 30 November 2026; honours/postgrad-diploma/masters/doctoral closes 30 January 2027), unlike the bare homepage this entry previously pointed at (which has no dates on it -- confirmed by a real ingestion run returning 0%-confidence nulls for every date field). robots.txt only explicitly names Googlebot with Allow: / -- no explicit rule for other user-agents; treated as permissive (same caveat as before), and independently confirmed fetchable with this project's real bot user-agent (200 response).",
    ...NOT_YET_FETCHED,
    institutionId: "ump",
  },
  {
    id: "up-admissions",
    url: "https://www.up.ac.za/students/programme-calculator",
    publisher: "University of Pretoria",
    type: "institutionAdmissions",
    robotsAllowed: true,
    fetchIntervalHours: 720,
    reliabilityScore: 0.7,
    notes: "CONFIRMED (not just suspected) via live diagnosis: this is deliberate Cloudflare bot-management, not a bad URL or JS-rendering issue. curl with this project's real bot user-agent gets a clean 200; Node's fetch() -- what the actual pipeline uses -- gets a 403 whose body is a genuine Cloudflare \"Attention Required!\" challenge page (TLS/HTTP client fingerprinting, not the User-Agent header, is what's being scored). The only way past this is a real headless browser (Playwright/Chromium) instead of a plain fetch. Deliberately not built: same category of judgment call CLAUDE.md already flags for UCT's bot-crawler block -- confirmed with the project owner (2026-07-25) to leave this as a documented, honest failure rather than add headless-browser fetching's real memory/cost overhead to route around it.",
    ...NOT_YET_FETCHED,
    institutionId: "up",
  },
  {
    id: "wits-admissions",
    url: "https://www.wits.ac.za/undergraduate/apply-to-wits/timelines/",
    publisher: "University of the Witwatersrand",
    type: "institutionAdmissions",
    robotsAllowed: true,
    fetchIntervalHours: 720,
    reliabilityScore: 0.9,
    notes: "Switched from the entry-requirements page (real, but has no application DATES on it -- confirmed by a real ingestion run returning 0%-confidence nulls) to this dedicated timelines page, which live-verified states real closing dates (30 June for specialised programmes, 30 September for the rest). robots.txt at wits.ac.za is served as raw RTF content (a real anomaly on their end, not a parsing bug here) -- decodes to \"User-agent: *\\nDisallow: /admintest/\", i.e. permissive for this path; earlier \"no robots.txt present\" note was likely this same anomaly defeating a normal parser.",
    ...NOT_YET_FETCHED,
    institutionId: "wits",
  },
  {
    id: "stellenbosch-admissions",
    url: "https://www.su.ac.za/en/apply/undergrad/apply-0/how-apply",
    publisher: "Stellenbosch University",
    type: "institutionAdmissions",
    robotsAllowed: true, // robots.txt has no Disallow matching /en/apply/*
    fetchIntervalHours: 720,
    reliabilityScore: 0.9,
    notes: "The site has been restructured since the old entry was seeded (the old URL 404s now). This page live-verified states a real closing date (\"Undergraduate applications and residences close on 31 July\") in its Closing Dates tab, cross-checked against an independent third-party summary reporting the same close month/day for the 2027 intake. Observed one transient HTTP 403 minutes after several successful 200s during verification (same bot-protection/rate-limit category already seen on up-admissions/uj-admissions) -- a follow-up direct check succeeded again immediately, so this looks like rate-limiting from rapid repeated requests during verification, not a broken URL; worth retry-with-backoff logic if it recurs on a real scheduled run.",
    ...NOT_YET_FETCHED,
    institutionId: "stellenbosch",
  },
  {
    id: "uct-admissions",
    url: "https://uct.ac.za/students/applications/key-dates",
    publisher: "University of Cape Town",
    type: "institutionAdmissions",
    robotsAllowed: true,
    fetchIntervalHours: 720,
    reliabilityScore: 0.9,
    notes: "Switched from the eligibility-requirements page (real, but has no application DATES -- confirmed by a real ingestion run returning 0%-confidence nulls) to this dedicated key-dates page, which live-verified states real dates (\"Applications open for the 2027 admission cycle\" 1 April 2026; \"Undergraduate applications close\" 31 July 2026 -- \"We do not consider late application requests\"), cross-checked against an independent third-party summary reporting the exact same dates. IMPORTANT: uct.ac.za's robots.txt explicitly blocks named AI-crawler user agents (GPTBot and similar) while leaving standard search-engine crawling open. This bot's user-agent (see config/ingestion.ts USER_AGENT) is not one of the explicitly-named bots, so it technically falls under the general/permissive rule -- but this is flagged here as a deliberate judgment call, not a silent workaround. Confirm with the project owner before UCT's first live extraction run.",
    ...NOT_YET_FETCHED,
    institutionId: "uct",
  },
  {
    id: "nmu-admissions",
    url: "https://www.mandela.ac.za/Study-at-Mandela/Application/Closing-dates",
    publisher: "Nelson Mandela University",
    type: "institutionAdmissions",
    robotsAllowed: true, // robots.txt only disallows /websurvey/ and two /media/SecureStore paths
    fetchIntervalHours: 720,
    reliabilityScore: 0.9,
    notes: "Switched from the entry-requirements page (real, but has no application DATES -- confirmed by a real ingestion run returning 0%-confidence nulls) to this dedicated closing-dates page, which live-verified states real dates (Health Sciences 30 June 2026; early applications for other programmes 3 August 2026; late applications 30 September 2026).",
    ...NOT_YET_FETCHED,
    institutionId: "nmu",
  },
  {
    id: "uj-admissions",
    url: "https://www.uj.ac.za/admission-aid/apply/",
    publisher: "University of Johannesburg",
    type: "institutionAdmissions",
    robotsAllowed: true,
    fetchIntervalHours: 720,
    reliabilityScore: 0.7,
    notes: "CONFIRMED (not just suspected) via live diagnosis, same as up-admissions: deliberate Cloudflare bot-management, not a bad URL. curl gets a clean 200; Node's fetch() -- what the actual pipeline uses -- gets a 403 whose body is a genuine Cloudflare \"Attention Required!\" challenge page. Deliberately not building headless-browser fetching to route around it -- confirmed with the project owner (2026-07-25), same reasoning as up-admissions.",
    ...NOT_YET_FETCHED,
    institutionId: "uj",
  },
  {
    id: "nwu-admissions",
    url: "https://studies.nwu.ac.za/undergraduate-studies/application",
    publisher: "North-West University",
    type: "institutionAdmissions",
    robotsAllowed: true, // robots.txt has no Disallow matching /undergraduate-studies/*
    fetchIntervalHours: 720,
    reliabilityScore: 0.9,
    notes: "Switched from the fields-of-study catalogue page (real, but a programme list, not dates) to this application page, which live-verified states real dates (\"Applications open: 1 June 2026\"; selection courses close 30 June 2026; general courses and residence applications close 31 August 2026), cross-checked against an independent third-party summary reporting the same figures.",
    ...NOT_YET_FETCHED,
    institutionId: "nwu",
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
    institutionId: "unisa",
  },
  {
    id: "cao-ukzn",
    url: "https://cao.ac.za/",
    publisher: "Central Applications Office (CAO) -- shared portal used by UKZN for first-time undergraduate applications",
    type: "institutionPortal",
    robotsAllowed: true, // only disallows /WebResource.axd
    fetchIntervalHours: 720,
    reliabilityScore: 0.85,
    notes: "UKZN does not run its own first-time-undergrad application portal -- first-year applicants apply through CAO, not a UKZN-specific system. Re-verified live: UKZN's own applications.ukzn.ac.za page still explicitly states \"First time entering students must apply via Central Applications Office (CAO)\", confirming this is still the correct source, not a stale assumption. Left pointed at the CAO homepage rather than a specific page: unlike the other institutions, CAO genuinely has no single \"general application window\" -- closing dates vary per programme (e.g. Medicine closes earlier than most programmes), spread across a yearly entry handbook/PDFs rather than one HTML page with one date. The applicationWindows schema's 0%-confidence-null result for this source each run is therefore likely an honest reflection of reality, not a wrong source URL to fix -- extracting real CAO data would need a per-programme schema, out of scope for this orchestrator.",
    ...NOT_YET_FETCHED,
    institutionId: "ukzn",
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
    institutionId: "tut",
  },
  {
    id: "cput-admissions",
    url: "https://www.cput.ac.za/",
    publisher: "Cape Peninsula University of Technology",
    type: "institutionAdmissions",
    robotsAllowed: true,
    fetchIntervalHours: 720,
    reliabilityScore: 0.5,
    notes: "CONFIRMED root cause via live diagnosis (2026-07-25): this is not a fetch-strategy problem at all -- cput.ac.za's own production TLS certificate is REVOKED (curl: \"CRYPT_E_REVOKED -- The certificate is revoked\"; Node's fetch independently reports an unverifiable certificate chain). This is a real security problem on CPUT's own infrastructure. Do NOT work around it by disabling certificate validation -- a revoked cert is specifically a signal not to trust the connection, and failing closed here is correct behaviour, not a bug. Nothing to fix on this project's side; CPUT would need to renew/reissue their certificate.",
    ...NOT_YET_FETCHED,
    institutionId: "cput",
  },
];

export const SEED_SOURCES: Source[] = [...GOVERNMENT_SOURCES, ...INSTITUTION_SOURCES];
