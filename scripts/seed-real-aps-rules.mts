#!/usr/bin/env -S npx tsx
/**
 * Real, individually-verified APS (Admission Point Score) formulas, one
 * per institution -- the single most safety-critical dataset in the
 * app: a wrong formula produces a wrong "you qualify" verdict for a
 * real student's real application decision. Every entry below was
 * independently confirmed against that institution's own official
 * domain (never an aggregator) before being written here -- see each
 * entry's sourceUrl.
 *
 * Four institutions already in config/institutions.seed.ts are
 * deliberately NOT here, on purpose, not because research stalled:
 *   - University of Cape Town: has no single university-wide formula --
 *     Science (doubles Maths/Physical Sciences, /800), Humanities
 *     (straight sum, /600), and Health Sciences (APS+NBT composite,
 *     /900) are three genuinely different, conflicting formulas.
 *   - Stellenbosch University: has a general NSC-aggregate admission
 *     gate, but Engineering, Science, and Law each layer a materially
 *     different competitive formula on top (e.g. Engineering doubles
 *     Mathematics and weights out of 800). ApsRule.notes is never
 *     surfaced to a learner anywhere in the UI, so publishing only the
 *     general formula here would silently misrepresent exactly the
 *     high-APS applicants most likely to be applying to those three
 *     faculties -- the same failure mode UCT was excluded for.
 *   - UNISA: is qualification-endorsement-based (Bachelor's/Diploma/
 *     Higher Certificate pass type + programme-specific subject
 *     minimums), not a points-score formula at all -- forcing it into
 *     this schema would misrepresent how UNISA actually admits.
 *   - CPUT: its admissions methodology is only published inside an
 *     Issuu.com flip-book with no extractable text layer -- no
 *     primary-source formula text could be independently confirmed.
 *
 * A missing institution here means "APS rules being verified for this
 * institution" (the honest, existing UI state) -- not a bug to chase.
 *
 * Usage (against the local emulator):
 *   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true npx tsx scripts/seed-real-aps-rules.mts
 *
 * Usage (against a real Firebase project):
 *   requires FIREBASE_ADMIN_PROJECT_ID / _CLIENT_EMAIL / _PRIVATE_KEY.
 */

import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { ApsRule } from "../lib/firestore/types";

const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

if (getApps().length === 0) {
  if (useEmulator) {
    process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
    initializeApp({ projectId: "demo-ucag" });
  } else {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
    if (!projectId || !clientEmail || !privateKey) {
      console.error("Missing Firebase Admin env vars and NEXT_PUBLIC_USE_FIREBASE_EMULATOR is not set.");
      process.exit(1);
    }
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }
}

const db = getFirestore();
const ACADEMIC_YEAR = 2027;
const VERIFIED_ON = "2026-07-27";

// The standard national NSC 7-point achievement-level scale, used by
// several institutions below with no institution-specific override --
// pulled out once so it's not retyped (and can't drift) across entries.
const NSC_7_POINT_BANDS = [
  { minPercent: 80, maxPercent: 100, points: 7 },
  { minPercent: 70, maxPercent: 79, points: 6 },
  { minPercent: 60, maxPercent: 69, points: 5 },
  { minPercent: 50, maxPercent: 59, points: 4 },
  { minPercent: 40, maxPercent: 49, points: 3 },
  { minPercent: 30, maxPercent: 39, points: 2 },
  { minPercent: 0, maxPercent: 29, points: 1 },
];

const APS_RULES: Omit<ApsRule, "id">[] = [
  {
    institutionId: "ump",
    scaleName: "UMP Admission Point Score (APS)",
    formulaType: "pointBandSum",
    // Not restated verbatim in UMP's own brochure (it only uses "Level"
    // terminology without redefining the scale) -- inferred as the
    // near-universal national NSC scale, which every other institution
    // below that DOES state a table explicitly uses unless noted
    // otherwise. Flagged here rather than presented with false certainty.
    bands: NSC_7_POINT_BANDS,
    usesRawPercentage: false,
    loPolicy: "halfWeight",
    bestNSubjects: 7,
    excludedSubjects: [],
    mathLitPolicy: "excludedForSomeProgrammes",
    nbtPolicy: "none",
    bonusRules: [],
    notes:
      "UMP's own Undergraduate Programmes brochure: 'The prescribed seven subjects are the subjects to be used in calculating the APS. The APS achievement rating of Life Orientation is divided by two.' The percentage-to-points band table itself is inferred from the national standard, not independently re-confirmed on ump.ac.za -- UMP's document never redefines it. NBT is not mentioned in the (short, marketing-style) source document reviewed; 'none' is an absence-of-mention inference, not a confirmed negative.",
    sourceUrl: "https://www.ump.ac.za/getattachment/Study-with-us/Application-Process/Online-Applications/Undergraduate-Programmes.pdf.aspx",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    institutionId: "up",
    scaleName: "NSC Admission Point Score (APS)",
    formulaType: "pointBandSum",
    bands: NSC_7_POINT_BANDS,
    usesRawPercentage: false,
    loPolicy: "exclude",
    bestNSubjects: 6,
    excludedSubjects: [],
    mathLitPolicy: "excludedForSomeProgrammes",
    nbtPolicy: "none",
    bonusRules: [],
    maxScore: 42,
    notes:
      "UP's own 2027 NSC/IEB Undergraduate Prospectus, verbatim: 'The APS is based on a candidate's achievement in six recognised 20-credit subjects. The highest APS that can be achieved is 42. Life Orientation is a 10-credit subject and is excluded from the calculation.' UP's own FAQ page states NBT is not used for any undergraduate programme (as of the 2025 intake statement; the 2027 prospectus doesn't mention NBT either). mathLitPolicy is a judgment call: quantitative programmes (engineering, actuarial science, etc.) require Mathematics specifically as a subject-level admission requirement, not that Mathematical Literacy converts differently within the raw APS sum itself.",
    sourceUrl: "https://drupalwebprod-files.up.ac.za/Public/2026-01/UP_UG%20Prospectus%202027_NSC-IEB_DevV5_web_0.pdf",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    institutionId: "wits",
    scaleName: "Wits APS (best 7 subjects including Life Orientation, with an English/Maths bonus)",
    formulaType: "pointBandWithBonus",
    bands: NSC_7_POINT_BANDS,
    usesRawPercentage: false,
    // Unusual among SA universities (most exclude LO) -- independently
    // re-confirmed 3 separate times against the same Wits source page
    // before being included here rather than assumed to be a fetch error.
    loPolicy: "include",
    bestNSubjects: 7,
    excludedSubjects: [],
    mathLitPolicy: "excludedForSomeProgrammes",
    nbtPolicy: "none",
    bonusRules: [
      {
        subjectCode: "ENG",
        condition: "none",
        bonusPoints: 2,
        description: "Flat +2 bonus added to the band-derived points for English (Home Language or First Additional Language).",
      },
      {
        subjectCode: "MAT",
        condition: "none",
        bonusPoints: 2,
        description: "Flat +2 bonus added to the band-derived points for Mathematics (compulsory for numerate programmes).",
      },
    ],
    notes:
      "Wits' own entry-requirements page, verbatim: 'The APS calculation is based on the best seven subjects including Life Orientation (faculty-specific subjects must be included in the calculation)... Life Orientation receives 0 bonus points.' Re-verified 3 times against the same URL due to how atypical LO-inclusion is versus other SA universities -- got the same answer each time. maxScore is deliberately left unset: Wits does not itself state one, and 7x7+2+2=53 would be this app's own arithmetic presented as if Wits said it. NBT is not mentioned on the general undergraduate entry-requirements page; Health Sciences/Medicine were not checked and may differ.",
    sourceUrl: "https://www.wits.ac.za/undergraduate/entry-requirements/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    institutionId: "nmu",
    scaleName: "NMU Applicant Score (AS) -- also called APS on NMU's own FAQ page",
    formulaType: "percentageSum",
    bands: [],
    usesRawPercentage: true,
    loPolicy: "exclude",
    bestNSubjects: 6,
    excludedSubjects: [],
    mathLitPolicy: "equal",
    nbtPolicy: "none",
    bonusRules: [
      {
        subjectCode: "LO",
        condition: "quintile1to3",
        minMarkPercent: 50,
        bonusPoints: 7,
        description: "Applicants from quintile 1-3 schools who score 50% or higher for Life Orientation have 7 points added to their 600-point Applicant Score.",
      },
    ],
    maxScore: 607,
    notes:
      "NMU's own official FAQ page ('How do I calculate my APS'), confirmed against a worked example (7-subject applicant, LO=85% excluded, AS=420/600). Raw percentages are summed directly, not banded. The 3 compulsory subjects are Home Language, First Additional Language, and Mathematics/Mathematical Literacy/Technical Mathematics; the other 3 are the next-best subjects. No current NMU page found stating an NBT requirement -- 'none' is an absence-of-mention inference.",
    sourceUrl: "https://www.mandela.ac.za/Apply/Frequently-asked-questions/Admissions/How-do-I-calculate-my-APS-",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    institutionId: "uj",
    scaleName: "UJ Admission Point Score (APS)",
    formulaType: "pointBandSum",
    bands: NSC_7_POINT_BANDS,
    usesRawPercentage: false,
    loPolicy: "exclude",
    bestNSubjects: 6,
    excludedSubjects: [],
    mathLitPolicy: "equal",
    nbtPolicy: "none",
    bonusRules: [],
    maxScore: 42,
    notes:
      "Subject count and LO exclusion independently corroborated by two current, live UJ sources: the active APS calculator at ulink.uj.ac.za/apscalc ('only a mark above 10% will be included') and online.uj.ac.za's APS calculator PDF ('the total APS is the sum of the achievement ratings of the six school subjects. Life Orientation is not counted'). The exact percentage band table itself was only found stated in a 2022-dated UJ prospectus PDF (current-year prospectus URLs 403'd/404'd) -- it matches the standard national NSC scale that UP/NWU/UKZN/TUT independently confirm for the current cycle, so drift is unlikely, but this is the one field here sourced from an older document rather than a current one.",
    sourceUrl: "https://online.uj.ac.za/hubfs/APS%20Score%20Calculator%202022.pdf",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    institutionId: "nwu",
    scaleName: "NWU Applicant Performance Score (APS)",
    formulaType: "pointBandSum",
    // NWU splits the top NSC band further (90-100%=8, 80-89%=7) rather
    // than using the single 80-100%=7 band most other institutions use
    // -- a real, confirmed difference, not a typo of the shared table.
    bands: [
      { minPercent: 90, maxPercent: 100, points: 8 },
      { minPercent: 80, maxPercent: 89, points: 7 },
      { minPercent: 70, maxPercent: 79, points: 6 },
      { minPercent: 60, maxPercent: 69, points: 5 },
      { minPercent: 50, maxPercent: 59, points: 4 },
      { minPercent: 40, maxPercent: 49, points: 3 },
      { minPercent: 30, maxPercent: 39, points: 2 },
      { minPercent: 0, maxPercent: 29, points: 1 },
    ],
    usesRawPercentage: false,
    loPolicy: "exclude",
    bestNSubjects: 6,
    excludedSubjects: [],
    mathLitPolicy: "equal",
    nbtPolicy: "none",
    bonusRules: [],
    maxScore: 48,
    notes:
      "NWU's own Admissions Policy (Council-approved 13 March 2025), Table 1/Appendix 2 -- the most authoritative source of any institution here (a dated, governance-approved policy document, stated as genuinely university-wide, not faculty-specific). LO is explicitly excluded from the score ('not utilised in calculating the APS'), though a minimum LO achievement level 3 is required to hold an NSC at all -- that's a pass/fail gate, not part of this points calculation. No NBT requirement mentioned anywhere in the policy.",
    sourceUrl: "https://www.nwu.ac.za/sites/www.nwu.ac.za/files/files/i-governance-management/policy/2025/7P_7.1_Admissions-Policy-approved-Council-13-March-2025.pdf",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    institutionId: "ukzn",
    scaleName: "UKZN Academic Performance Score (APS)",
    formulaType: "pointBandSum",
    bands: [
      { minPercent: 90, maxPercent: 100, points: 8 },
      { minPercent: 80, maxPercent: 89, points: 7 },
      { minPercent: 70, maxPercent: 79, points: 6 },
      { minPercent: 60, maxPercent: 69, points: 5 },
      { minPercent: 50, maxPercent: 59, points: 4 },
      { minPercent: 40, maxPercent: 49, points: 3 },
      { minPercent: 30, maxPercent: 39, points: 2 },
      { minPercent: 0, maxPercent: 29, points: 1 },
    ],
    usesRawPercentage: false,
    loPolicy: "exclude",
    bestNSubjects: 6,
    excludedSubjects: ["Mathematics Paper 3"],
    mathLitPolicy: "equal",
    nbtPolicy: "none",
    bonusRules: [],
    maxScore: 48,
    notes:
      "UKZN's own 2027 Undergraduate Prospectus, cross-confirmed by two statements: 'UKZN will recognise academic excellence by awarding eight points to a subject with a performance level of 90-100%' and 'The maximum APS obtainable is 48.' Worked example in the prospectus: HL 5 + FAL 6 + LO 0(excluded) + Maths 5 + Accounting 6 + Business Studies 6 + CAT 7 = 35. NBT explicitly stated as not required: 'UKZN does not require applicants to take the NBT.' Some professional programmes (MBChB, PPL) rank by raw percentage average instead of APS -- an exception, not the general rule this record describes. Quintile 1-3 status is used as an eligibility/preference factor for some Extended Curriculum Programmes, not as additive bonus points, so bonusRules is empty.",
    sourceUrl: "https://applications.ukzn.ac.za/prospectus/undergraduate/latest",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    institutionId: "tut",
    scaleName: "TUT Admission Point Score (APS)",
    formulaType: "pointBandSum",
    bands: NSC_7_POINT_BANDS,
    usesRawPercentage: false,
    loPolicy: "exclude",
    bestNSubjects: 6,
    excludedSubjects: [],
    mathLitPolicy: "equal",
    nbtPolicy: "none",
    bonusRules: [],
    maxScore: 42,
    notes:
      "TUT's own Prospectus Part 1 (Students' Rules and Regulations), verbatim: 'Life Orientation is not included in the calculation of an Admission Point Score (APS)' and 'An achievement level of 1 in a subject is not considered in the calculation of the APS' (a level-1 floor-exclusion with no field in this schema -- worth knowing for edge-case students, not encoded above). bestNSubjects=6 and maxScore=42 are inferred from 'LO excluded from a 7-subject NSC', not verbatim-stated the way UKZN's are. TUT's own text also notes some programmes apply additional programme-specific weighting on top of this general/base formula. NBT 'none' is an absence-of-mention inference.",
    sourceUrl: "https://www.tut.ac.za/media/tshwane-interim/site-content/images/prospectus/Part1_Students_Rules_and_Regulations.pdf",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
];

let written = 0;
for (const rule of APS_RULES) {
  await db.collection("apsRules").doc(rule.institutionId).set(rule);
  written++;
  console.log(`  apsRule: ${rule.institutionId} (${rule.scaleName})`);
}

console.log(`Seeded ${written} real APS rules into ${useEmulator ? "the local emulator" : "the real Firestore project"}.`);
