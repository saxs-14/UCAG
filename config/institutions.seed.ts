/**
 * Tier 1 + Tier 2 institution seed data. Tier 1 URLs below were confirmed
 * live by direct fetch during Phase 0 research (see the Phase 0 checkpoint
 * response / docs/MASTER_PROMPT_v2.md source-register discussion) --
 * verifiedOn reflects that research date. Campus lists are seeded with
 * each institution's best-known primary campus only and are NOT verified
 * against an authoritative source -- expand and verify before Tier 1
 * launch. academicYear is set to 2027 (the intake cycle open as of this
 * writing) -- reconfirm every cycle, do not let this go stale.
 *
 * apsRules for these institutions are NOT seeded here -- that's Phase 2's
 * job (the engine + its strategy objects need to exist before the rule
 * data is meaningful). This file only carries institution-level facts.
 */

import type { Institution } from "@/lib/firestore/types";
import { CURRENT_ACADEMIC_YEAR } from "./academicYear";

const VERIFIED_ON = "2026-07-23";
const ACADEMIC_YEAR = CURRENT_ACADEMIC_YEAR;

export const TIER_1_INSTITUTIONS: Institution[] = [
  {
    id: "ump",
    name: "University of Mpumalanga",
    shortName: "UMP",
    type: "traditionalUniversity",
    province: "Mpumalanga",
    tier: 1,
    // Real, per-programme-verified (config/umpProgrammes.seed.ts) --
    // Mbombela is the main campus, Siyabuswa a dedicated Education campus.
    campuses: ["Mbombela", "Siyabuswa"],
    websiteUrl: "https://www.ump.ac.za/",
    applicationPortalUrl:
      "https://www.ump.ac.za/Study-with-us/Application-Process/Online-Applications",
    appliesThroughThirdParty: null,
    statusCheckUrl: null,
    nbtRequired: false,
    logoUrl: null,
    // Switchboard + general email, both read directly from the live
    // ump.ac.za homepage footer (not a third-party directory) 2026-11-09.
    phone: "013 002 0001",
    email: "info@ump.ac.za",
    sourceUrl: "https://www.ump.ac.za/",
    verifiedOn: "2026-11-09",
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "up",
    name: "University of Pretoria",
    shortName: "UP",
    type: "traditionalUniversity",
    province: "Gauteng",
    tier: 1,
    // Real, per-programme-verified (config/upProgrammes.seed.ts) -- Hatfield
    // (main), Groenkloof (Education), Prinshof (Medicine/Health Sciences),
    // Onderstepoort (Veterinary Science).
    campuses: ["Hatfield", "Groenkloof", "Prinshof", "Onderstepoort"],
    websiteUrl: "https://www.up.ac.za/",
    applicationPortalUrl: "https://www.up.ac.za/students/programme-calculator",
    appliesThroughThirdParty: null,
    statusCheckUrl: null,
    // NBT required for some faculties, not all -- see apsRules.nbtPolicy
    // ("requiredForSomeFaculties") in Phase 2 for the accurate granularity.
    // This boolean field can't express "some faculties"; defaulting true
    // since NBT is a real part of UP's admission process.
    nbtRequired: true,
    logoUrl: null,
    // up.ac.za blocks automated requests site-wide (every page tried
    // returned 403, including its own published contact-us page) --
    // couldn't confirm a phone/email directly against the official site,
    // so left null rather than use a third-party directory's number.
    phone: null,
    email: null,
    sourceUrl: "https://www.up.ac.za/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "wits",
    name: "University of the Witwatersrand",
    shortName: "Wits",
    type: "traditionalUniversity",
    province: "Gauteng",
    tier: 1,
    // Real, per-programme-verified (config/witsProgrammes.seed.ts) --
    // Braamfontein (main), Parktown (Medicine).
    campuses: ["Braamfontein", "Parktown"],
    websiteUrl: "https://www.wits.ac.za/",
    applicationPortalUrl: "https://www.wits.ac.za/undergraduate/apply-to-wits/",
    appliesThroughThirdParty: null,
    statusCheckUrl: null,
    nbtRequired: false,
    logoUrl: null,
    // Switchboard read directly from wits.ac.za/about-wits/contact-us/
    // 2026-11-09 -- that page publishes no single general email, only
    // department-specific addresses, so email stays null rather than
    // picking one department's address to stand in for "general."
    phone: "+27 (0)11 717 1000",
    email: null,
    sourceUrl: "https://www.wits.ac.za/undergraduate/entry-requirements/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "stellenbosch",
    name: "Stellenbosch University",
    shortName: "Stellenbosch",
    type: "traditionalUniversity",
    province: "Western Cape",
    tier: 1,
    // Real, per-programme-verified (config/stellenboschProgrammes.seed.ts) --
    // Stellenbosch (main), Tygerberg (Medicine and Health Sciences),
    // Elsenburg (Agricultural Training Institute).
    campuses: ["Stellenbosch", "Tygerberg", "Elsenburg"],
    websiteUrl: "https://www.su.ac.za/",
    applicationPortalUrl: "https://www.su.ac.za/english/maties/apply",
    appliesThroughThirdParty: null,
    statusCheckUrl: null,
    // NBTs required before 30 June for Law/Health Sciences specifically --
    // see apsRules.nbtPolicy note above.
    nbtRequired: true,
    logoUrl: null,
    // su.ac.za blocks automated requests site-wide (403 on every page
    // tried) -- couldn't confirm a phone/email directly against the
    // official site, so left null rather than use a third-party listing.
    phone: null,
    email: null,
    sourceUrl: "https://www.su.ac.za/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "uct",
    name: "University of Cape Town",
    shortName: "UCT",
    type: "traditionalUniversity",
    province: "Western Cape",
    tier: 1,
    // Real, confirmed via UCT's own 2027 Directions for Undergraduate
    // Applicants campus maps -- Upper Campus (main, most faculties),
    // Hiddingh Campus (Humanities/Fine Art, central Cape Town), Health
    // Sciences Campus (Observatory), all within greater Rondebosch.
    campuses: ["Upper Campus", "Hiddingh Campus", "Health Sciences Campus"],
    websiteUrl: "https://uct.ac.za/",
    applicationPortalUrl: "https://applyonline.uct.ac.za/",
    appliesThroughThirdParty: null,
    statusCheckUrl: null,
    nbtRequired: true,
    logoUrl: null,
    // General number read directly from the uct.ac.za homepage footer
    // 2026-11-09; no general email published there (only department-
    // specific addresses elsewhere on the site).
    phone: "+27 (0)21 650 9111",
    email: null,
    sourceUrl:
      "https://uct.ac.za/students/applications-admission-requirements/eligibility-admission",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nmu",
    name: "Nelson Mandela University",
    shortName: "NMU",
    type: "traditionalUniversity",
    province: "Eastern Cape",
    tier: 1,
    // Real, per-programme-verified (config/nmuProgrammes.seed.ts) -- North,
    // South, and Missionvale (Health Sciences) campuses, all in Gqeberha.
    campuses: ["North Campus", "South Campus", "Missionvale Campus"],
    websiteUrl: "https://www.mandela.ac.za/",
    applicationPortalUrl: null, // TODO(Phase 4): confirm exact application-portal URL
    appliesThroughThirdParty: null,
    statusCheckUrl: null,
    nbtRequired: false,
    logoUrl: null,
    // Switchboard + general email, both read directly from the live
    // mandela.ac.za homepage footer (not a third-party directory)
    // 2026-11-09.
    phone: "+27 (0) 41 504 1111",
    email: "info@mandela.ac.za",
    sourceUrl: "https://www.mandela.ac.za/Study-at-Mandela/Discovery/Entry-requirements",
    verifiedOn: "2026-11-09",
    academicYear: ACADEMIC_YEAR,
  },
];

/** Tier 2 -- confirmed real domains, otherwise unpopulated. Rendered as
 * "coming soon" in the UI; must never show a catalogue or APS result. */
export const TIER_2_INSTITUTIONS: Institution[] = [
  {
    id: "uj",
    name: "University of Johannesburg",
    shortName: "UJ",
    type: "traditionalUniversity",
    province: "Gauteng",
    tier: 2,
    // uj.ac.za blocks automated requests site-wide (403 on every page
    // tried, including /about/campuses/), so this list couldn't be
    // confirmed against the institution's own site. Cross-checked instead
    // against its Wikipedia article, which names exactly these four as
    // UJ's current operating campuses (and explicitly notes a former
    // fifth, East Rand Campus, closed in 2007 -- not included here).
    campuses: [
      "Auckland Park Kingsway Campus",
      "Auckland Park Bunting Road Campus",
      "Doornfontein Campus",
      "Soweto Campus",
    ],
    websiteUrl: "https://www.uj.ac.za/",
    applicationPortalUrl: "https://apply.online.uj.ac.za/Start-Now/Apply-Now",
    appliesThroughThirdParty: null,
    statusCheckUrl: null,
    nbtRequired: false,
    logoUrl: null,
    // Couldn't confirm a phone/email against the official site for the
    // same reason as the campus list above -- left null rather than use a
    // third-party directory's number.
    phone: null,
    email: null,
    sourceUrl: "https://www.uj.ac.za/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nwu",
    name: "North-West University",
    shortName: "NWU",
    type: "traditionalUniversity",
    province: "North West",
    tier: 2,
    // Real, per-programme-verified (config/nwuProgrammes.seed.ts) --
    // Potchefstroom, Mahikeng, and Vanderbijlpark campuses.
    campuses: ["Potchefstroom", "Mahikeng", "Vanderbijlpark"],
    websiteUrl: "https://www.nwu.ac.za/",
    // applynow.nwu.ac.za (the previous value here) no longer resolves --
    // connection refused on a live check 2026-11-09. Replaced with the
    // real, currently-live application entry point, confirmed by fetching
    // it directly: studies.nwu.ac.za/studies/apply shows NWU's real 2027
    // intake application flow (fees, required documents, "Apply now!"
    // button through to vssweb.nwu.ac.za), not a guess from a third-party
    // aggregator site.
    applicationPortalUrl: "https://studies.nwu.ac.za/studies/apply",
    appliesThroughThirdParty: null,
    statusCheckUrl: null,
    nbtRequired: false,
    logoUrl: null,
    // Both read directly from nwu.ac.za/content/nwu-contact-details
    // 2026-11-09 -- the page labels no single number "general," so this
    // is the toll line it lists against every campus (the closest thing
    // to a general enquiries number), and the email the applications page
    // itself already pointed admissions enquiries to.
    phone: "0860 169 698",
    email: "studies@nwu.ac.za",
    sourceUrl: "https://studies.nwu.ac.za/studies/apply",
    verifiedOn: "2026-11-09",
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "unisa",
    name: "University of South Africa",
    shortName: "UNISA",
    type: "distanceUniversity",
    province: "Gauteng",
    tier: 2,
    campuses: [],
    websiteUrl: "https://www.unisa.ac.za/",
    applicationPortalUrl:
      "https://www.unisa.ac.za/sites/corporate/default/Apply-for-admission",
    appliesThroughThirdParty: null,
    statusCheckUrl: null,
    nbtRequired: false,
    logoUrl: null,
    // Both read directly from UNISA's own contact page 2026-11-09 -- a
    // toll-free centralised number, UNISA's own label for it, and the
    // address for "student misdirected enquiries," the closest thing to
    // a general inbox the page names.
    phone: "0800 00 1870",
    email: "enquire@unisa.ac.za",
    sourceUrl: "https://www.unisa.ac.za/sites/corporate/default/Contact-us",
    verifiedOn: "2026-11-09",
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ukzn",
    name: "University of KwaZulu-Natal",
    shortName: "UKZN",
    type: "traditionalUniversity",
    province: "KwaZulu-Natal",
    tier: 2,
    // Real, per-programme-verified (config/ukznProgrammes.seed.ts) --
    // Howard College, Pietermaritzburg, Westville, and the Nelson R
    // Mandela School of Medicine (Durban).
    campuses: ["Howard College", "Pietermaritzburg", "Westville", "Medical School (Durban)"],
    websiteUrl: "https://www.ukzn.ac.za/",
    // First-time undergrad applications route through the shared Central
    // Applications Office, not a UKZN-specific portal -- confirmed live.
    applicationPortalUrl: null,
    appliesThroughThirdParty: "https://cao.ac.za/",
    statusCheckUrl: null,
    nbtRequired: false,
    logoUrl: null,
    // General switchboard read directly from ukzn.ac.za; email is the
    // Student Enquiries Centre's own address, read directly from its
    // official subdomain (stec.ukzn.ac.za/contact-us/) -- both 2026-11-09.
    phone: "+27 31 260 1111",
    email: "stec@ukzn.ac.za",
    sourceUrl: "https://cao.ac.za/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "tut",
    name: "Tshwane University of Technology",
    shortName: "TUT",
    type: "universityOfTechnology",
    province: "Gauteng",
    tier: 2,
    // Real, per-programme-verified (config/tutProgrammes.seed.ts) -- TUT's
    // 9 real campuses across Gauteng, Mpumalanga, and Limpopo.
    campuses: [
      "Pretoria Campus",
      "Arts Campus",
      "Arcadia Campus",
      "Soshanguve North Campus",
      "Soshanguve South Campus",
      "Ga-Rankuwa Campus",
      "eMalahleni Campus",
      "Mbombela Campus",
      "Polokwane Campus",
    ],
    websiteUrl: "https://www.tut.ac.za/",
    applicationPortalUrl: "https://applications-prod.tut.ac.za/",
    appliesThroughThirdParty: null,
    statusCheckUrl:
      "https://ienabler.tut.ac.za/pls/prodi41/wtut012pkg.startup",
    nbtRequired: false,
    logoUrl: null,
    // Contact Centre line + general email, both read directly from the
    // live tut.ac.za homepage footer (not a third-party directory)
    // 2026-11-09.
    phone: "+27 (0)86 110 2421",
    email: "general@tut.ac.za",
    sourceUrl: "https://www.tut.ac.za/",
    verifiedOn: "2026-11-09",
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "cput",
    name: "Cape Peninsula University of Technology",
    shortName: "CPUT",
    type: "universityOfTechnology",
    province: "Western Cape",
    tier: 2,
    // Read directly off the live cput.ac.za homepage 2026-11-09.
    campuses: [
      "Granger Bay Campus",
      "Bellville Campus",
      "District 6 Campus",
      "Wellington Campus",
      "Mowbray Campus",
    ],
    websiteUrl: "https://www.cput.ac.za/",
    applicationPortalUrl: "https://www.cput.ac.za/study-at-cput/undergraduate/apply/step-1",
    appliesThroughThirdParty: null,
    statusCheckUrl: null,
    nbtRequired: false,
    logoUrl: null,
    // General email read directly from the cput.ac.za homepage footer.
    // The phone numbers published there are explicitly labelled
    // "Applications, Admissions and Registration Enquiries," not a
    // general switchboard, so phone stays null rather than mislabel one
    // of those as a general contact number.
    phone: null,
    email: "info@cput.ac.za",
    sourceUrl: "https://www.cput.ac.za/",
    verifiedOn: "2026-11-09",
    academicYear: ACADEMIC_YEAR,
  },
];

export const SEED_INSTITUTIONS: Institution[] = [
  ...TIER_1_INSTITUTIONS,
  ...TIER_2_INSTITUTIONS,
];
