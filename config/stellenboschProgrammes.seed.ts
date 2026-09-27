/**
 * Verified Stellenbosch University (SU) Seed Dataset.
 *
 * Every record here has full provenance (sourceUrl, verifiedOn,
 * academicYear) per the core trust primitive in lib/firestore/types.ts
 * and CLAUDE.md.
 *
 * Source: Stellenbosch's own official "2027 Undergraduate Prospectus"
 * PDF (files.su.ac.za), fetched directly and read in full.
 *
 * UPDATE: all 9 real faculties are now represented. Faculty of
 * Engineering and Faculty of Science genuinely layer a materially
 * different, competitive, WEIGHTED "selection mark" on top of the
 * general NSC-aggregate gate (Engineering: "Mathematics% + Physical
 * Sciences% + 6 x Matric average", max 800; Science: "(Mathematics% x 2
 * + 5 other subjects%) / 7") -- lib/aps/engine.ts now supports this
 * (ApsRule.forcedSubjects/extraCountedSubjects/divisor), so each has its
 * own faculty-specific ApsRule (facultyId set) in
 * scripts/seed-real-aps-rules.mts, resolved via
 * lib/matching/resolveApsRule.ts. Faculty of Law does NOT need a new
 * formula: its own admission text describes the same plain NSC-aggregate
 * floor as every other faculty here, with a separate 80:20 (Grade
 * 11/12 results : National Benchmark Test) RANKING on top for actual
 * selection among applicants who clear that floor -- the NBT component
 * can't be computed (this app doesn't collect NBT scores), so Law's
 * programmes use the institution-wide general rule like AgriSciences/
 * Arts/etc., with the real NBT-ranking mechanism described honestly in
 * additionalRequirements instead of a fabricated combined score.
 *
 * The 6 non-weighted faculties (AgriSciences, Arts and Social Sciences,
 * Economic and Management Sciences, Education, Medicine and Health
 * Sciences, Theology) plus Law use the plain NSC-aggregate gate with
 * flat per-subject percentage minimums -- fully and correctly
 * computable via SubjectRequirement.minPercent (raw percentage, not an
 * NSC band) and a minAps expressed on the same sum-scale the engine
 * actually computes (aggregate% x bestNSubjects, mathematically
 * identical to "average >= threshold" since bestNSubjects is a fixed
 * constant here). Engineering's minAps uses the same real, documented
 * lower bound the source itself states ("a selection mark of 600 or
 * more gave students a good chance... in others, 620 or more were
 * required") -- the honest floor, not the higher per-programme number
 * the source doesn't actually give. Science's minAps stays null: its
 * real formula IS now computed and shown to the learner, but the source
 * states the real selection threshold is "higher than the minimum
 * criteria" WITHOUT giving a number -- inventing one here would be
 * exactly the "unverified displayed as fact" failure this project
 * exists to prevent.
 *
 * Where a programme's real requirement offers multiple equally-valid
 * subject alternatives (e.g. "Mathematics 50% OR Mathematical Literacy
 * 60%"), the more commonly-taken subject is encoded as the
 * SubjectRequirement and the real alternative is spelled out in
 * additionalRequirements text -- the same convention already used for
 * every other institution's OR-style requirements this session.
 */

import type { ApplicationWindow, Faculty, Programme, School } from "@/lib/firestore/types";
import { CURRENT_ACADEMIC_YEAR } from "./academicYear";

const SU_PROSPECTUS_URL =
  "https://files.su.ac.za/public/undergraduate-maties/documents/2026-01/su-admissions-booklet-2027.pdf";
const SU_APPLY_URL = "https://www.su.ac.za/english/maties/admissions";
const VERIFIED_ON = "2026-09-27";
const ACADEMIC_YEAR = CURRENT_ACADEMIC_YEAR;

// ---------------------------------------------------------------------------
// SU FACULTIES (6 of Stellenbosch's 9 real faculties -- see file header)
// ---------------------------------------------------------------------------

export const STELLENBOSCH_FACULTIES: Faculty[] = [
  { id: "su-faculty-agrisciences", institutionId: "stellenbosch", name: "Faculty of AgriSciences", code: "AGRI", sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "su-faculty-arts-social-sciences", institutionId: "stellenbosch", name: "Faculty of Arts and Social Sciences", code: "ARTS", sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "su-faculty-economic-management-sciences", institutionId: "stellenbosch", name: "Faculty of Economic and Management Sciences", code: "EMS", sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "su-faculty-education", institutionId: "stellenbosch", name: "Faculty of Education", code: "EDU", sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "su-faculty-medicine-health-sciences", institutionId: "stellenbosch", name: "Faculty of Medicine and Health Sciences", code: "MHS", sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "su-faculty-theology", institutionId: "stellenbosch", name: "Faculty of Theology", code: "THEO", sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "su-faculty-engineering", institutionId: "stellenbosch", name: "Faculty of Engineering", code: "ENG", sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "su-faculty-science", institutionId: "stellenbosch", name: "Faculty of Science", code: "SCI", sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "su-faculty-law", institutionId: "stellenbosch", name: "Faculty of Law", code: "LAW", sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
];

// ---------------------------------------------------------------------------
// SU SCHOOLS -- SU's prospectus doesn't publish named sub-schools within
// these faculties; each school mirrors its own faculty 1:1, the same
// fallback pattern already used for TUT/NWU/NMU.
// ---------------------------------------------------------------------------

export const STELLENBOSCH_SCHOOLS: School[] = [
  { id: "su-school-agrisciences", facultyId: "su-faculty-agrisciences", name: "Faculty of AgriSciences", code: "AGRI", sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "su-school-arts-social-sciences", facultyId: "su-faculty-arts-social-sciences", name: "Faculty of Arts and Social Sciences", code: "ARTS", sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "su-school-economic-management-sciences", facultyId: "su-faculty-economic-management-sciences", name: "Faculty of Economic and Management Sciences", code: "EMS", sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "su-school-education", facultyId: "su-faculty-education", name: "Faculty of Education", code: "EDU", sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "su-school-medicine-health-sciences", facultyId: "su-faculty-medicine-health-sciences", name: "Faculty of Medicine and Health Sciences", code: "MHS", sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "su-school-theology", facultyId: "su-faculty-theology", name: "Faculty of Theology", code: "THEO", sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "su-school-engineering", facultyId: "su-faculty-engineering", name: "Faculty of Engineering", code: "ENG", sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "su-school-science", facultyId: "su-faculty-science", name: "Faculty of Science", code: "SCI", sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "su-school-law", facultyId: "su-faculty-law", name: "Faculty of Law", code: "LAW", sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
];

// ---------------------------------------------------------------------------
// SU PROGRAMMES
// ---------------------------------------------------------------------------
// minAps = real aggregate% x 6 (bestNSubjects for SU's ApsRule) -- an
// EXACT conversion, not an approximation: average >= threshold is
// mathematically identical to sum >= threshold x 6 when N is fixed.

export const STELLENBOSCH_PROGRAMMES: Programme[] = [
  // --- Faculty of AgriSciences ---
  {
    id: "su-bagric-agricultural-production-elsenburg", institutionId: "stellenbosch", facultyId: "su-faculty-agrisciences", schoolId: "su-school-agrisciences",
    name: "BAgric in Agricultural Production and Management: Elsenburg", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Elsenburg Campus"], modeOfDelivery: "contact", minAps: 330,
    subjectRequirements: [{ subjectCode: "ENG-HL", minPercent: 50 }, { subjectCode: "MATH", minPercent: 50 }, { subjectCode: "PHS", minPercent: 50 }],
    additionalRequirements: [
      "NSC aggregate of at least 55% (excluding Life Orientation).",
      "English or Afrikaans (Home Language or First Additional Language) 50% -- either language qualifies.",
      "Mathematics 50%, OR Mathematical Literacy 60%.",
      "Physical Sciences 50%, OR Life Sciences 50%, OR Agricultural Sciences 50%.",
      "Offered in collaboration with Elsenburg Agricultural Training Institute -- students reside on the Elsenburg campus for all training.",
      "Fields of study: Animal Production, Cellar Management, Cellar Technology, Extension and Animal Production, Extension and Plant Production, Plant Production, Plant and Animal Production.",
    ],
    careerOutcomes: ["Farm Manager", "Cellar Manager/Winemaker", "Agricultural Extension Officer"],
    applyUrl: SU_APPLY_URL, fieldTags: ["science", "practical"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "su-bscagric-agricultural-economics", institutionId: "stellenbosch", facultyId: "su-faculty-agrisciences", schoolId: "su-school-agrisciences",
    name: "BScAgric in Agricultural Economics", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Stellenbosch Campus"], modeOfDelivery: "contact", minAps: 360,
    subjectRequirements: [{ subjectCode: "ENG-HL", minPercent: 50 }, { subjectCode: "MATH", minPercent: 60 }, { subjectCode: "PHS", minPercent: 50 }],
    additionalRequirements: [
      "NSC aggregate of at least 60% (excluding Life Orientation).",
      "English or Afrikaans (Home Language or First Additional Language) 50%.",
      "Fields of study: Agricultural Economic Analysis, Agricultural Economic Analysis and Management, Agricultural Economic Analysis and Management with Food Science, Agricultural Economics with Food Science.",
    ],
    careerOutcomes: ["Agricultural Economist", "Policy Researcher", "Financial Institution Analyst"],
    applyUrl: SU_APPLY_URL, fieldTags: ["science", "business"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Faculty of Arts and Social Sciences ---
  {
    id: "su-ba-humanities", institutionId: "stellenbosch", facultyId: "su-faculty-arts-social-sciences", schoolId: "su-school-arts-social-sciences",
    name: "BA in Humanities", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Stellenbosch Campus"], modeOfDelivery: "contact", minAps: 378,
    subjectRequirements: [{ subjectCode: "ENG-HL", minPercent: 50 }],
    additionalRequirements: [
      "NSC aggregate of at least 63% (excluding Life Orientation).",
      "Home Language 50%, First Additional Language 40% -- any official SA language combination qualifies, not only English.",
      "If taking Organisational Informatics as a university subject: Mathematics 50% OR Mathematical Literacy 70%.",
      "Also available as an Extended Curriculum Programme (4 years) for applicants who don't meet the standard requirement.",
    ],
    careerOutcomes: ["Teacher", "Psychologist", "Language Practitioner", "Journalist", "Town and Regional Planner"],
    applyUrl: SU_APPLY_URL, fieldTags: ["people", "creative"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "su-ba-human-resource-management", institutionId: "stellenbosch", facultyId: "su-faculty-arts-social-sciences", schoolId: "su-school-arts-social-sciences",
    name: "BA in Human Resource Management", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Stellenbosch Campus"], modeOfDelivery: "contact", minAps: 378,
    subjectRequirements: [{ subjectCode: "ENG-HL", minPercent: 50 }, { subjectCode: "MATH", minPercent: 50 }],
    additionalRequirements: [
      "NSC aggregate of at least 63% (excluding Life Orientation).",
      "Home Language 50%, First Additional Language 40%.",
      "Mathematics 50%, OR Mathematical Literacy 70%.",
      "Leads toward non-statutory registration as a Human Resource Practitioner with the South African Board for People Practices.",
    ],
    careerOutcomes: ["Human Resource Manager", "Labour Relations Practitioner", "Management Consultant"],
    applyUrl: SU_APPLY_URL, fieldTags: ["people", "business"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Faculty of Economic and Management Sciences ---
  {
    id: "su-bcom-economic-sciences", institutionId: "stellenbosch", facultyId: "su-faculty-economic-management-sciences", schoolId: "su-school-economic-management-sciences",
    name: "BCom (Economic Sciences)", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Stellenbosch Campus"], modeOfDelivery: "contact", minAps: 390,
    subjectRequirements: [{ subjectCode: "MATH", minPercent: 60 }, { subjectCode: "ENG-HL", minPercent: 50 }],
    additionalRequirements: [
      "NSC aggregate of at least 65% (excluding Life Orientation).",
      "English Home Language 50%, OR Afrikaans Home Language 50%, OR Afrikaans First Additional Language 70%, OR English First Additional Language 70%.",
      "To register for the Econometrics or Financial Sector focal areas, or to enrol for Actuarial Science 112, a Grade 12 Mathematics final mark of 70% or higher is required.",
      "Focal areas: Econometrics, Economic and Management Consultation, Financial Sector, Transport Economics.",
    ],
    careerOutcomes: ["Economist", "Business or Investment Analyst", "Policy Researcher"],
    applyUrl: SU_APPLY_URL, fieldTags: ["business"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "su-bacc", institutionId: "stellenbosch", facultyId: "su-faculty-economic-management-sciences", schoolId: "su-school-economic-management-sciences",
    name: "BAcc", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Stellenbosch Campus"], modeOfDelivery: "contact", minAps: 420,
    subjectRequirements: [{ subjectCode: "MATH", minPercent: 70 }, { subjectCode: "ENG-HL", minPercent: 50 }],
    additionalRequirements: [
      "NSC aggregate of at least 70% (excluding Life Orientation).",
      "Mathematics 70%, OR Mathematics 60% with Accounting 70%.",
      "English Home Language 50%, OR Afrikaans Home Language 50%, OR Afrikaans First Additional Language 70%, OR English First Additional Language 70%.",
      "First step toward the Chartered Accountant (CA(SA)) qualification via SAICA/IRBA examinations.",
    ],
    careerOutcomes: ["Chartered Accountant", "Auditor", "Financial Manager"],
    applyUrl: SU_APPLY_URL, fieldTags: ["business"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Faculty of Education ---
  {
    id: "su-bed-foundation-phase", institutionId: "stellenbosch", facultyId: "su-faculty-education", schoolId: "su-school-education",
    name: "BEd (Foundation Phase Education)", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "4 years", campuses: ["Stellenbosch Campus"], modeOfDelivery: "contact", minAps: 360,
    subjectRequirements: [{ subjectCode: "MATH", minPercent: 40 }, { subjectCode: "ENG-HL", minPercent: 60 }],
    additionalRequirements: [
      "NSC, IEB, or equivalent aggregate of at least 60% (excluding Life Orientation).",
      "Mathematics 40%, OR Mathematical Literacy 60%.",
      "125 places in the programme.",
      "For learners taught in English: English Home Language 60%, Afrikaans or isiXhosa (Home Language or First Additional Language) 50%. Afrikaans-medium and isiXhosa-medium tracks follow the equivalent pattern with their own language at 60%.",
      "Career: Teacher for Grades R to 3.",
    ],
    careerOutcomes: ["Foundation Phase Teacher (Grades R-3)"],
    applyUrl: SU_APPLY_URL, fieldTags: ["people"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "su-bed-intermediate-phase", institutionId: "stellenbosch", facultyId: "su-faculty-education", schoolId: "su-school-education",
    name: "BEd (Intermediate Phase Education)", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "4 years", campuses: ["Stellenbosch Campus"], modeOfDelivery: "contact", minAps: 360,
    subjectRequirements: [{ subjectCode: "MATH", minPercent: 40 }, { subjectCode: "ENG-HL", minPercent: 60 }],
    additionalRequirements: [
      "NSC, IEB, or equivalent aggregate of at least 60% (excluding Life Orientation).",
      "Mathematics 40%, OR Mathematical Literacy 60%.",
      "125 places in the programme.",
      "Mathematics (Ed) is compulsory in the first year, passed with a 60% average, plus two additional teaching subjects from Life Skills, Natural Sciences (Ed) (needs Life Sciences or Physical Sciences 50%), or Social Sciences (Ed) (needs History or Geography 50%).",
      "Career: Teacher for Grades 4 to 7, competent to teach two intermediate subjects plus two languages.",
    ],
    careerOutcomes: ["Intermediate Phase Teacher (Grades 4-7)"],
    applyUrl: SU_APPLY_URL, fieldTags: ["people"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Faculty of Medicine and Health Sciences (Tygerberg Campus) ---
  {
    id: "su-mbchb", institutionId: "stellenbosch", facultyId: "su-faculty-medicine-health-sciences", schoolId: "su-school-medicine-health-sciences",
    name: "MBChB", qualificationType: "bachelorsDegree", nqfLevel: 9, saqaId: null,
    duration: "6 years", campuses: ["Tygerberg Campus"], modeOfDelivery: "contact", minAps: 450,
    subjectRequirements: [{ subjectCode: "MATH", minPercent: 60 }, { subjectCode: "PHS", minPercent: 50 }, { subjectCode: "LFS", minPercent: 50 }],
    additionalRequirements: [
      "Aggregate of at least 75% for the NSC or equivalent qualification (excluding Life Orientation).",
      "Approximately 280 candidates selected annually.",
      "Selection is based on academic merit AND non-academic merit criteria, per the Faculty's own selection guidelines -- meeting the minimum aggregate does not guarantee a place given the volume of applications.",
      "Applicants are considered in 3 categories: current Grade 12 learners/recent school leavers, registered SU students, and applicants with tertiary qualifications/work experience.",
      "After a 2-year internship and a community service year, graduates may register with the HPCSA as an Independent Medical Practitioner.",
    ],
    careerOutcomes: ["Medical Doctor"],
    applyUrl: SU_APPLY_URL, fieldTags: ["science", "people"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "su-bachelor-of-nursing", institutionId: "stellenbosch", facultyId: "su-faculty-medicine-health-sciences", schoolId: "su-school-medicine-health-sciences",
    name: "Bachelor of Nursing", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Tygerberg Campus"], modeOfDelivery: "contact", minAps: 360,
    subjectRequirements: [{ subjectCode: "LFS", minPercent: 50 }],
    additionalRequirements: [
      "Aggregate of at least 60% for the NSC or equivalent qualification (excluding Life Orientation).",
      "Mathematics 40%, OR Mathematical Literacy 70%.",
      "Approximately 50 candidates selected annually.",
      "After a year of community service, graduates may register with SANC as a Nurse and Midwife.",
    ],
    careerOutcomes: ["Registered Nurse", "Midwife"],
    applyUrl: SU_APPLY_URL, fieldTags: ["science", "people"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Faculty of Theology ---
  {
    id: "su-bth", institutionId: "stellenbosch", facultyId: "su-faculty-theology", schoolId: "su-school-theology",
    name: "BTh (Bachelor of Theology)", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Stellenbosch Campus"], modeOfDelivery: "contact", minAps: 360,
    subjectRequirements: [],
    additionalRequirements: [
      "NSC aggregate of at least 60% (excluding Life Orientation) -- no other specific subject minimums stated.",
      "An Extended Curriculum Programme (+1 year) is available for applicants with an aggregate of 55%-59.9%, subject to an interview and limited spaces.",
    ],
    careerOutcomes: ["Youth Worker", "Counsellor", "Community Worker"],
    applyUrl: SU_APPLY_URL, fieldTags: ["people"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "su-bdiv", institutionId: "stellenbosch", facultyId: "su-faculty-theology", schoolId: "su-school-theology",
    name: "BDiv (Bachelor of Divinity)", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Stellenbosch Campus"], modeOfDelivery: "contact", minAps: 360,
    subjectRequirements: [],
    additionalRequirements: [
      "NSC aggregate of at least 60% (excluding Life Orientation) -- no other specific subject minimums stated.",
      "First step of ministerial training; Dutch Reformed Church (DRC) and Uniting Reformed Church (URC) candidates also need the Postgraduate Diploma in Theology (Christian Ministry) plus the MDiv.",
    ],
    careerOutcomes: ["Minister", "Ministerial Trainee"],
    applyUrl: SU_APPLY_URL, fieldTags: ["people"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Faculty of Engineering (weighted "selection mark" formula --
  // see su-faculty-engineering's own ApsRule in scripts/seed-real-aps-rules.mts) ---
  {
    id: "su-beng-civil", institutionId: "stellenbosch", facultyId: "su-faculty-engineering", schoolId: "su-school-engineering",
    name: "BEng (Civil)", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Stellenbosch Campus"], modeOfDelivery: "contact", minAps: 600,
    subjectRequirements: [{ subjectCode: "MATH", minPercent: 70 }, { subjectCode: "PHS", minPercent: 60 }, { subjectCode: "ENG-HL", minPercent: 50 }],
    additionalRequirements: [
      "NSC aggregate of at least 70% (excluding Life Orientation) -- the minimum admission floor.",
      "Real selection is competitive: 'a selection mark of 600 or more gave students a good chance of admission to certain programmes, but in others, 620 or more were required.' Selection mark = Mathematics% + Physical Sciences% + (6 x best-6 Matric average), out of 800.",
      "A 5-year Extended Curriculum Programme is available for applicants close to but not meeting the minimum requirements.",
      "Career: civil engineer -- irrigation systems, bridges, dams, harbours, roads, water supply, and heavy construction.",
    ],
    careerOutcomes: ["Civil Engineer"],
    applyUrl: SU_APPLY_URL, fieldTags: ["technology"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "su-beng-electrical-electronic", institutionId: "stellenbosch", facultyId: "su-faculty-engineering", schoolId: "su-school-engineering",
    name: "BEng (Electrical and Electronic)", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Stellenbosch Campus"], modeOfDelivery: "contact", minAps: 600,
    subjectRequirements: [{ subjectCode: "MATH", minPercent: 70 }, { subjectCode: "PHS", minPercent: 60 }, { subjectCode: "ENG-HL", minPercent: 50 }],
    additionalRequirements: [
      "NSC aggregate of at least 70% (excluding Life Orientation) -- the minimum admission floor.",
      "Real selection is competitive: 'a selection mark of 600 or more gave students a good chance of admission to certain programmes, but in others, 620 or more were required.' Selection mark = Mathematics% + Physical Sciences% + (6 x best-6 Matric average), out of 800.",
      "Career: generation/transmission of electrical energy, robotic systems control, computer and communication networks, large software systems.",
    ],
    careerOutcomes: ["Electrical Engineer", "Electronic Engineer"],
    applyUrl: SU_APPLY_URL, fieldTags: ["technology"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "su-beng-mechanical", institutionId: "stellenbosch", facultyId: "su-faculty-engineering", schoolId: "su-school-engineering",
    name: "BEng (Mechanical)", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Stellenbosch Campus"], modeOfDelivery: "contact", minAps: 600,
    subjectRequirements: [{ subjectCode: "MATH", minPercent: 70 }, { subjectCode: "PHS", minPercent: 60 }, { subjectCode: "ENG-HL", minPercent: 50 }],
    additionalRequirements: [
      "NSC aggregate of at least 70% (excluding Life Orientation) -- the minimum admission floor.",
      "Real selection is competitive: 'a selection mark of 600 or more gave students a good chance of admission to certain programmes, but in others, 620 or more were required.' Selection mark = Mathematics% + Physical Sciences% + (6 x best-6 Matric average), out of 800.",
      "Career: motion and energy transfer -- vehicles, aeroplanes, cooling systems, power stations, process plants, manufacturing.",
    ],
    careerOutcomes: ["Mechanical Engineer"],
    applyUrl: SU_APPLY_URL, fieldTags: ["technology"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Faculty of Science (weighted "selection mark" formula -- see
  // su-faculty-science's own ApsRule in scripts/seed-real-aps-rules.mts.
  // minAps stays null: the real formula IS computed and shown, but the
  // source states the actual selection threshold without giving a
  // number -- see this file's header.) ---
  {
    id: "su-bsc-computer-science", institutionId: "stellenbosch", facultyId: "su-faculty-science", schoolId: "su-school-science",
    name: "BSc Computer Science", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Stellenbosch Campus"], modeOfDelivery: "contact", minAps: null,
    subjectRequirements: [{ subjectCode: "MATH", minPercent: 70 }, { subjectCode: "ENG-HL", minPercent: 50 }],
    additionalRequirements: [
      "NSC aggregate of at least 65% (excluding Life Orientation) -- the minimum admission floor; the real selection threshold is stated to be higher, without a published number.",
      "If taking Chemistry or Physics as a first-year university subject: Physical Sciences 50% is also required.",
      "Selection mark = (Mathematics% x 2 + best 5 other subjects%, at least one of which must be English or Afrikaans) / 7.",
      "Focal areas: General Computer Science, Computer Systems, Data Science.",
    ],
    careerOutcomes: ["Software Developer", "Data Scientist", "Systems Analyst"],
    applyUrl: SU_APPLY_URL, fieldTags: ["technology", "science"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "su-bsc-mathematical-sciences", institutionId: "stellenbosch", facultyId: "su-faculty-science", schoolId: "su-school-science",
    name: "BSc Mathematical Sciences", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Stellenbosch Campus"], modeOfDelivery: "contact", minAps: null,
    subjectRequirements: [{ subjectCode: "MATH", minPercent: 70 }, { subjectCode: "ENG-HL", minPercent: 50 }],
    additionalRequirements: [
      "NSC aggregate of at least 65% (excluding Life Orientation) -- the minimum admission floor; the real selection threshold is stated to be higher, without a published number.",
      "If taking Chemistry or Physics as a first-year university subject: Physical Sciences 50% is also required.",
      "Selection mark = (Mathematics% x 2 + best 5 other subjects%, at least one of which must be English or Afrikaans) / 7.",
      "Focal areas: Applied Mathematics, Mathematics, Operations Research.",
    ],
    careerOutcomes: ["Actuarial Analyst", "Data Analyst", "Operations Research Analyst"],
    applyUrl: SU_APPLY_URL, fieldTags: ["science"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "su-bsc-chemistry", institutionId: "stellenbosch", facultyId: "su-faculty-science", schoolId: "su-school-science",
    name: "BSc Chemistry", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Stellenbosch Campus"], modeOfDelivery: "contact", minAps: null,
    subjectRequirements: [{ subjectCode: "MATH", minPercent: 70 }, { subjectCode: "PHS", minPercent: 50 }, { subjectCode: "ENG-HL", minPercent: 50 }],
    additionalRequirements: [
      "NSC aggregate of at least 65% (excluding Life Orientation) -- the minimum admission floor; the real selection threshold is stated to be higher, without a published number.",
      "Selection mark = (Mathematics% x 2 + best 5 other subjects%, at least one of which must be English or Afrikaans) / 7.",
      "Focal areas: Chemistry and Polymer Science, Chemical Biology, Applied and Sustainable Chemistry, Chemistry with Chemical Engineering.",
    ],
    careerOutcomes: ["Research Scientist", "Analytical Chemist", "Quality Assurance Manager"],
    applyUrl: SU_APPLY_URL, fieldTags: ["science"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "su-bsc-physics", institutionId: "stellenbosch", facultyId: "su-faculty-science", schoolId: "su-school-science",
    name: "BSc Physics", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Stellenbosch Campus"], modeOfDelivery: "contact", minAps: null,
    subjectRequirements: [{ subjectCode: "MATH", minPercent: 70 }, { subjectCode: "PHS", minPercent: 50 }, { subjectCode: "ENG-HL", minPercent: 50 }],
    additionalRequirements: [
      "NSC aggregate of at least 65% (excluding Life Orientation) -- the minimum admission floor; the real selection threshold is stated to be higher, without a published number.",
      "Selection mark = (Mathematics% x 2 + best 5 other subjects%, at least one of which must be English or Afrikaans) / 7.",
      "Focal areas: Laser Physics (Physical), Laser Physics (Biological), Theoretical Physics.",
    ],
    careerOutcomes: ["Medical Physicist", "Geophysicist", "Research Scientist"],
    applyUrl: SU_APPLY_URL, fieldTags: ["science"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Faculty of Law (plain NSC-aggregate gate like every non-weighted
  // faculty above -- uses the institution-wide general ApsRule, no
  // faculty-specific override needed; only the real 80:20 NBT-weighted
  // RANKING on top of this floor can't be computed, since this app
  // doesn't collect NBT scores) ---
  {
    id: "su-llb-four-year", institutionId: "stellenbosch", facultyId: "su-faculty-law", schoolId: "su-school-law",
    name: "LLB (four-year)", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Stellenbosch Campus"], modeOfDelivery: "contact", minAps: 420,
    subjectRequirements: [{ subjectCode: "ENG-HL", minPercent: 60 }],
    additionalRequirements: [
      "NSC aggregate of at least 70% (excluding Life Orientation).",
      "English or Afrikaans Home Language 60%, OR Afrikaans or English First Additional Language 70%.",
      "120 places in the programme. Must write the National Benchmark Test (NBT) AQL paper before 31 July.",
      "Real selection is based on final Grade 11 (or final Grade 12) results and NBT results in an 80:20 ratio -- meeting the aggregate/subject floor above does not by itself determine your selection mark.",
      "If taking Economics as a university subject: Mathematics 60% is also required.",
    ],
    careerOutcomes: ["Legal Practitioner (Attorney or Advocate)", "Judge", "Public Prosecutor", "Legal Advisor"],
    applyUrl: SU_APPLY_URL, fieldTags: ["people"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "su-bcom-law", institutionId: "stellenbosch", facultyId: "su-faculty-law", schoolId: "su-school-law",
    name: "BCom (Law)", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Stellenbosch Campus"], modeOfDelivery: "contact", minAps: 420,
    subjectRequirements: [{ subjectCode: "ENG-HL", minPercent: 60 }, { subjectCode: "MATH", minPercent: 60 }],
    additionalRequirements: [
      "NSC aggregate of at least 70% (excluding Life Orientation).",
      "English or Afrikaans Home Language 60%, OR Afrikaans or English First Additional Language 70%.",
      "80 places in the programme (interfaculty with Economic and Management Sciences). Must write NBTs AQL and MAT before 31 July.",
      "Real selection is based on final Grade 11 (or final Grade 12) results and NBT results in an 80:20 ratio -- meeting the aggregate/subject floor above does not by itself determine your selection mark.",
      "Also provides entry to the 2-year LLB degree required to become a legal practitioner.",
    ],
    careerOutcomes: ["Commercial Lawyer", "Legal Advisor"],
    applyUrl: SU_APPLY_URL, fieldTags: ["business", "people"], sourceUrl: SU_PROSPECTUS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
];

// ---------------------------------------------------------------------------
// SU APPLICATION WINDOWS
// ---------------------------------------------------------------------------

export const STELLENBOSCH_APPLICATION_WINDOWS: ApplicationWindow[] = [
  {
    id: "su-window-2027-general",
    institutionId: "stellenbosch",
    programmeId: null,
    opensOn: "2026-04-01",
    closesOn: "2026-07-31",
    lateClosesOn: null,
    status: "open",
    sourceUrl:
      "https://blogs.sun.ac.za/open-day/files/2026/03/How-to-Apply-Undergraduate-programmes-2027-intake.pdf",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
];
