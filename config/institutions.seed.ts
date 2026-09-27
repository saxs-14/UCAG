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
    sourceUrl: "https://www.ump.ac.za/",
    verifiedOn: VERIFIED_ON,
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
    sourceUrl: "https://www.mandela.ac.za/Study-at-Mandela/Discovery/Entry-requirements",
    verifiedOn: VERIFIED_ON,
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
    campuses: [],
    websiteUrl: "https://www.uj.ac.za/",
    applicationPortalUrl: "https://apply.online.uj.ac.za/Start-Now/Apply-Now",
    appliesThroughThirdParty: null,
    statusCheckUrl: null,
    nbtRequired: false,
    logoUrl: null,
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
    applicationPortalUrl: "https://applynow.nwu.ac.za/OnlineApplication/",
    appliesThroughThirdParty: null,
    statusCheckUrl: null,
    nbtRequired: false,
    logoUrl: null,
    sourceUrl: "https://www.nwu.ac.za/",
    verifiedOn: VERIFIED_ON,
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
    sourceUrl: "https://www.unisa.ac.za/",
    verifiedOn: VERIFIED_ON,
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
    sourceUrl: "https://www.tut.ac.za/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "cput",
    name: "Cape Peninsula University of Technology",
    shortName: "CPUT",
    type: "universityOfTechnology",
    province: "Western Cape",
    tier: 2,
    campuses: [],
    websiteUrl: "https://www.cput.ac.za/",
    applicationPortalUrl: "https://www.cput.ac.za/study-at-cput/undergraduate/apply/step-1",
    appliesThroughThirdParty: null,
    statusCheckUrl: null,
    nbtRequired: false,
    logoUrl: null,
    sourceUrl: "https://www.cput.ac.za/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
];

export const SEED_INSTITUTIONS: Institution[] = [
  ...TIER_1_INSTITUTIONS,
  ...TIER_2_INSTITUTIONS,
];
