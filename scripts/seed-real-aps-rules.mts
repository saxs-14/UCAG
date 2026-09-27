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
 * Two institutions already in config/institutions.seed.ts are
 * deliberately NOT here, on purpose, not because research stalled:
 *   - UNISA: is qualification-endorsement-based (Bachelor's/Diploma/
 *     Higher Certificate pass type + programme-specific subject
 *     minimums), not a points-score formula at all -- forcing it into
 *     this schema would misrepresent how UNISA actually admits.
 *   - CPUT: its admissions methodology is only published inside an
 *     Issuu.com flip-book with no extractable text layer -- no
 *     primary-source formula text could be independently confirmed.
 *
 * University of Cape Town has NO single university-wide formula (see
 * config/uctProgrammes.seed.ts's header) -- it gets 2 separate
 * faculty-specific rules below (facultyId set) instead of one
 * institution-wide entry, now that lib/aps/engine.ts supports forced/
 * extra-counted subjects (ApsRule.forcedSubjects/extraCountedSubjects).
 * Faculty of Commerce also has its own real "cut off FPS" system, per
 * UCT's own 2027 Directions for Undergraduate Applicants, but no source
 * with its exact formula/cutoff numbers was found this session -- not
 * guessed at, left unseeded.
 *
 * A missing institution or faculty here means "APS rules being verified"
 * (the honest, existing UI state) -- not a bug to chase.
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
    facultyId: null,
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
    forcedSubjects: [],
    extraCountedSubjects: [],
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
    facultyId: null,
    scaleName: "NSC Admission Point Score (APS)",
    formulaType: "pointBandSum",
    bands: NSC_7_POINT_BANDS,
    usesRawPercentage: false,
    loPolicy: "exclude",
    bestNSubjects: 6,
    excludedSubjects: [],
    forcedSubjects: [],
    extraCountedSubjects: [],
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
    facultyId: null,
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
    forcedSubjects: [],
    extraCountedSubjects: [],
    mathLitPolicy: "excludedForSomeProgrammes",
    nbtPolicy: "none",
    bonusRules: [
      {
        subjectCode: "ENG-HL",
        condition: "none",
        bonusPoints: 2,
        description: "Flat +2 bonus added to the band-derived points for English (Home Language or First Additional Language).",
      },
      {
        subjectCode: "MATH",
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
    facultyId: null,
    scaleName: "NMU Applicant Score (AS) -- also called APS on NMU's own FAQ page",
    formulaType: "percentageSum",
    bands: [],
    usesRawPercentage: true,
    loPolicy: "exclude",
    bestNSubjects: 6,
    excludedSubjects: [],
    forcedSubjects: [],
    extraCountedSubjects: [],
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
    facultyId: null,
    scaleName: "UJ Admission Point Score (APS)",
    formulaType: "pointBandSum",
    bands: NSC_7_POINT_BANDS,
    usesRawPercentage: false,
    loPolicy: "exclude",
    bestNSubjects: 6,
    excludedSubjects: [],
    forcedSubjects: [],
    extraCountedSubjects: [],
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
    facultyId: null,
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
    forcedSubjects: [],
    extraCountedSubjects: [],
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
    facultyId: null,
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
    forcedSubjects: [],
    extraCountedSubjects: [],
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
    facultyId: null,
    scaleName: "TUT Admission Point Score (APS)",
    formulaType: "pointBandSum",
    bands: NSC_7_POINT_BANDS,
    usesRawPercentage: false,
    loPolicy: "exclude",
    bestNSubjects: 6,
    excludedSubjects: [],
    forcedSubjects: [],
    extraCountedSubjects: [],
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
  {
    institutionId: "stellenbosch",
    facultyId: null,
    scaleName: "Stellenbosch University NSC Aggregate (%)",
    formulaType: "percentageSum",
    bands: [],
    usesRawPercentage: true,
    loPolicy: "exclude",
    bestNSubjects: 6,
    excludedSubjects: [],
    forcedSubjects: [],
    extraCountedSubjects: [],
    mathLitPolicy: "equal",
    nbtPolicy: "requiredForSomeFaculties",
    bonusRules: [],
    maxScore: 600,
    notes:
      "Stellenbosch's own official 2027 Undergraduate Prospectus: every programme states 'An NSC aggregate of at least X% (excluding Life Orientation)' plus flat per-subject percentage minimums -- a genuine average across the candidate's non-LO subjects (6, matching the standard NSC subject count), not a banded points sum. This is the institution-wide default (facultyId: null): it correctly describes Faculty of AgriSciences, Faculty of Arts and Social Sciences, Faculty of Economic and Management Sciences, Faculty of Education, Faculty of Law, Faculty of Medicine and Health Sciences, and Faculty of Theology. Faculty of Law's own text layers a separate 80:20 (Grade 11/12 results : National Benchmark Test) RANKING on top of this same aggregate floor for actual selection -- not a different subject-counting formula -- so it uses this general rule too, with the NBT component (uncomputable; this app doesn't collect NBT scores) described in each Law programme's own additionalRequirements instead. Faculty of Engineering and Faculty of Science have their own separate ApsRule entries below (facultyId set) since their real formulas force/double-count specific subjects. National Benchmark Tests (NBTs) are not required for 2027 admission generally, except for all Faculty of Law programmes, School of Tomorrow applicants, the South African-based American High School Diploma, and all online schools.",
    sourceUrl: "https://files.su.ac.za/public/undergraduate-maties/documents/2026-01/su-admissions-booklet-2027.pdf",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    institutionId: "stellenbosch",
    facultyId: "su-faculty-engineering",
    scaleName: "Stellenbosch Engineering Selection Mark",
    formulaType: "facultyPointScore",
    bands: [],
    usesRawPercentage: true,
    loPolicy: "exclude",
    bestNSubjects: 6,
    excludedSubjects: [],
    forcedSubjects: [],
    extraCountedSubjects: ["MATH", "PHS"],
    mathLitPolicy: "equal",
    nbtPolicy: "none",
    bonusRules: [],
    maxScore: 800,
    notes:
      "Stellenbosch's own official 2027 Undergraduate Prospectus, Faculty of Engineering's own 'Admission and selection' section, verbatim: 'your selection mark is calculated by using the marks... of your Grade 11 subjects (for conditional selection) or Grade 12 subjects (for final selection) as follows: Selection mark = Mathematics percentage + Physical Sciences percentage + (6 x Matric average). The Matric average is calculated from the six best Matric subjects' percentages (excluding Life Orientation). The maximum score is 800.' '6 x Matric average' of the best 6 non-LO subjects is mathematically identical to the sum of those 6 subjects' raw percentages, already exactly what bestNSubjects=6/usesRawPercentage=true computes -- Mathematics and Physical Sciences are then added again via extraCountedSubjects, matching the formula's own '+ Mathematics percentage + Physical Sciences percentage' terms regardless of whether they also happened to fall within the natural best-6 average. Real, documented competitive guidance (not encoded numerically, described in each programme's additionalRequirements instead): 'a selection mark of 600 or more gave students a good chance of admission to certain programmes, but in others, 620 or more were required.'",
    sourceUrl: "https://files.su.ac.za/public/undergraduate-maties/documents/2026-01/su-admissions-booklet-2027.pdf",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    institutionId: "stellenbosch",
    facultyId: "su-faculty-science",
    scaleName: "Stellenbosch Science Selection Mark",
    formulaType: "facultyPointScore",
    bands: [],
    usesRawPercentage: true,
    loPolicy: "exclude",
    bestNSubjects: 5,
    excludedSubjects: [],
    forcedSubjects: ["MATH"],
    extraCountedSubjects: ["MATH"],
    divisor: 7,
    mathLitPolicy: "equal",
    nbtPolicy: "none",
    bonusRules: [],
    maxScore: 100,
    notes:
      "Stellenbosch's own official 2027 Undergraduate Prospectus, Faculty of Science's own 'Admission and selection' section, verbatim: 'A selection mark is calculated as follows: Selection mark (SM): [(Mathematics x 2) + 5 other subjects (of which at least one must be English or Afrikaans; excluding Life Orientation)] / 7.' Mathematics is forced out of the 5-other-subjects ranking pool (so it doesn't occupy one of those 5 slots) and counted twice via extraCountedSubjects, then the whole total is divided by 7. The source explicitly states 'the selection threshold is higher than the minimum criteria' (the flat per-programme aggregate/subject requirements already encoded on programmes) but never gives that higher number -- every Science programme's minAps is deliberately left null rather than guessing one; this rule still lets the real selection mark itself be computed and shown to the learner.",
    sourceUrl: "https://files.su.ac.za/public/undergraduate-maties/documents/2026-01/su-admissions-booklet-2027.pdf",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    institutionId: "uct",
    facultyId: "uct-faculty-ebe",
    scaleName: "UCT EBE Faculty Points Score (FPS)",
    formulaType: "facultyPointScore",
    bands: [],
    usesRawPercentage: true,
    loPolicy: "exclude",
    bestNSubjects: 3,
    excludedSubjects: [],
    forcedSubjects: ["ENG-HL", "MATH", "PHS"],
    extraCountedSubjects: [],
    mathLitPolicy: "excludedForSomeProgrammes",
    nbtPolicy: "required",
    bonusRules: [],
    maxScore: 600,
    notes:
      "UCT Faculty of Engineering & the Built Environment's own '2026 NSC Entrance Requirements' PDF, verbatim: 'The EBE FPS is a score out of 600, and is calculated by adding the percentages for NSC English and NSC Mathematics, plus four other subjects... Engineering Programmes, Construction Studies and Geomatics Programmes: Score English, Mathematics and Physical Science and the three next best subjects excluding Life Orientation.' This rule covers only the Engineering-stream variant (English+Mathematics+Physical Science forced, +3 next best); Property Studies (English+Mathematics forced, +4 next best, no forced Physical Science) and Architectural Studies (same, plus a non-numeric portfolio score) use a genuinely different variant -- deliberately not seeded under this same rule (see config/uctProgrammes.seed.ts). 'Maths Literacy or Technical Maths cannot be substituted for Maths, and Technical Science cannot be substituted for Physical Sciences.' The real WPS (Weighted Points Score = FPS adjusted by a 0-10% redress/disadvantage factor) is NOT computed by this rule -- this app's calculator doesn't collect the school/family background data WPS depends on; every seeded programme's minAps uses the real, published Band A ('guaranteed admission') FPS threshold instead. NBTs must be written (Mathematics, Academic Literacy, Quantitative Literacy) but the EBE's own document states explicitly they 'are not taken into account for admission' -- nbtPolicy 'required' reflects the write requirement, not a scoring input.",
    sourceUrl:
      "https://ebe.uct.ac.za/sites/default/files/media/documents/ebe_uct_ac_za/53/2026-ebe-nsc-entry-requirements.pdf",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    institutionId: "uct",
    facultyId: "uct-faculty-science",
    scaleName: "UCT Science Faculty Points Score (FPS)",
    formulaType: "facultyPointScore",
    bands: [],
    usesRawPercentage: true,
    loPolicy: "exclude",
    bestNSubjects: 6,
    excludedSubjects: [],
    forcedSubjects: [],
    extraCountedSubjects: ["MATH", "PHS"],
    mathLitPolicy: "excludedForSomeProgrammes",
    nbtPolicy: "required",
    bonusRules: [],
    maxScore: 800,
    notes:
      "UCT Faculty of Science's own 'Admission Guidelines' PDF, verbatim: 'The FPS (a score out of 800) is calculated as the sum of the percentages achieved in the best six NSC subjects, including English but excluding Life Orientation, and doubling the percentages achieved in Mathematics and Physical Science.' Independently re-verified against the document's own full worked example (English 85 + Afrikaans/isiXhosa FAL 89 + Maths 84x2 + Life Sciences 86 + Geography 79 + Physical Science 81x2 = 669) -- 85+89+168+86+79+162 sums to exactly 669, confirming both the formula and this engine's computation of it. Admission requires FPS >= 550, Mathematics >= 70%, Physical Science >= 60% at minimum (Band C, targeted redress groups only); the real, published Band A ('guaranteed admission') threshold used for every seeded programme's minAps is FPS >= 660. The real WPS (Band B, FPS adjusted by up to 10% for school/home background) is NOT computed here -- this app's calculator doesn't collect that background data. NBTs must be written but 'are not used as part of the admission point score calculation' per the Faculty's own document -- nbtPolicy 'required' reflects the write requirement, not a scoring input.",
    sourceUrl:
      "https://science.uct.ac.za/sites/default/files/media/documents/2025%20Science%20UG%20Admissions%20Criteria.pdf",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
];

let written = 0;
for (const rule of APS_RULES) {
  // Doc ID must be unique per (institutionId, facultyId) now that an
  // institution can have more than one rule -- institutionId alone
  // (the old scheme) silently overwrote earlier rules for the same
  // institution once Stellenbosch/UCT each got multiple faculty-specific
  // entries. The app never reads apsRules by doc ID (lib/matching/
  // resolveApsRule.ts always matches on the institutionId/facultyId
  // fields from a full collection fetch), so this is purely an internal
  // write-key fix with no read-path impact.
  const docId = rule.facultyId ? `${rule.institutionId}-${rule.facultyId}` : rule.institutionId;
  await db.collection("apsRules").doc(docId).set(rule);
  written++;
  console.log(`  apsRule: ${docId} (${rule.scaleName})`);
}

console.log(`Seeded ${written} real APS rules into ${useEmulator ? "the local emulator" : "the real Firestore project"}.`);
