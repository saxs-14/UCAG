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
 * IMPORTANT SCOPE NOTE, matching the precedent already documented in
 * scripts/seed-real-aps-rules.mts for UCT: Stellenbosch's Faculty of
 * Engineering, Faculty of Science, and Faculty of Law each layer a
 * materially different, competitive, WEIGHTED "selection mark" formula
 * on top of the general NSC-aggregate admission gate (e.g. Engineering:
 * "Mathematics % + Physical Sciences % + 6 x Matric average", max 800;
 * Science: "(Mathematics % x 2 + 5 other subjects %) / 7"). The pure,
 * dependency-free lib/aps/engine.ts (a hard requirement per CLAUDE.md)
 * only implements a generic "sum of best-N raw subject values" model and
 * cannot correctly compute either of those weighted formulas. Rather
 * than silently misrepresent the most competitive applicants' real
 * eligibility, programmes from those 3 faculties are deliberately NOT
 * included here -- exactly the same reasoning UCT was excluded from
 * seed-real-aps-rules.mts for. This can be revisited once/if lib/aps/
 * gains real support for weighted faculty-score formulas.
 *
 * The 6 faculties included below (AgriSciences, Arts and Social
 * Sciences, Economic and Management Sciences, Education, Medicine and
 * Health Sciences, Theology) genuinely only use the plain NSC-aggregate
 * gate with flat per-subject percentage minimums -- fully and correctly
 * computable by the existing engine via SubjectRequirement.minPercent
 * (raw percentage, not an NSC band) and a minAps expressed on the same
 * sum-scale the engine actually computes (aggregate% x bestNSubjects,
 * mathematically identical to "average >= threshold" since
 * bestNSubjects is a fixed constant here).
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
