/**
 * Verified Tshwane University of Technology (TUT) Seed Dataset.
 *
 * Every record here has full provenance (sourceUrl, verifiedOn,
 * academicYear) per the core trust primitive in lib/firestore/types.ts
 * and CLAUDE.md.
 *
 * Source: TUT's own "2027 General Information for First Year Enrolment"
 * PDF, fetched directly from tut.ac.za and read locally -- unlike most
 * other institutions researched this session, this single PDF (unlike
 * TUT's larger faculty-specific prospectus PDFs, which needed
 * pdftoppm/poppler-utils to render and could not be read) contained the
 * full real per-programme Admission Point Score (APS) tables, subject
 * achievement-level requirements, real qualification/SAQA codes, real
 * campuses and real closing dates for every one of TUT's 7 faculties.
 * This is the richest single source found this session.
 *
 * TUT's APS rule (best subjects, standard NSC 7-point achievement
 * levels summed, Life Orientation excluded) already exists in
 * scripts/seed-real-aps-rules.mts -- not duplicated here. Representative
 * subset: 2 programmes per faculty (3 for Science, TUT's largest and
 * most APS-rich faculty) -- extending this file to TUT's other ~280
 * programmes is a data operation, not a code change.
 */

import type { ApplicationWindow, Faculty, Programme, School } from "@/lib/firestore/types";
import { CURRENT_ACADEMIC_YEAR } from "./academicYear";

const TUT_GENERAL_URL = "https://www.tut.ac.za/media/tshwane-interim/site-content/documents/General-Information-First-Year-Enrolment.pdf";
const TUT_APPLY_URL = "https://www.tut.ac.za/study-at-tut/";
const VERIFIED_ON = "2026-09-27";
const ACADEMIC_YEAR = CURRENT_ACADEMIC_YEAR;

// ---------------------------------------------------------------------------
// TUT FACULTIES
// ---------------------------------------------------------------------------

export const TUT_FACULTIES: Faculty[] = [
  { id: "tut-faculty-arts-design", institutionId: "tut", name: "Faculty of Arts and Design", code: "AD", sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "tut-faculty-economics-finance", institutionId: "tut", name: "Faculty of Economics and Finance", code: "EF", sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "tut-faculty-engineering", institutionId: "tut", name: "Faculty of Engineering and the Built Environment", code: "EBE", sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "tut-faculty-humanities", institutionId: "tut", name: "Faculty of Humanities", code: "HUM", sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "tut-faculty-ict", institutionId: "tut", name: "Faculty of Information and Communication Technology", code: "ICT", sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "tut-faculty-management-sciences", institutionId: "tut", name: "Faculty of Management Sciences", code: "MS", sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "tut-faculty-science", institutionId: "tut", name: "Faculty of Science", code: "SCI", sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
];

// ---------------------------------------------------------------------------
// TUT SCHOOLS
// ---------------------------------------------------------------------------
// TUT's own prospectus doesn't publish named sub-schools within most
// faculties (Science is described as "incorporating Natural Sciences,
// Health Sciences and Agriculture" narratively, not as named schools) --
// each school mirrors its own faculty 1:1, the same fallback pattern
// already established for UP/Wits/NWU/NMU/UKZN.

export const TUT_SCHOOLS: School[] = [
  { id: "tut-school-arts-design", facultyId: "tut-faculty-arts-design", name: "Faculty of Arts and Design", code: "AD", sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "tut-school-economics-finance", facultyId: "tut-faculty-economics-finance", name: "Faculty of Economics and Finance", code: "EF", sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "tut-school-engineering", facultyId: "tut-faculty-engineering", name: "Faculty of Engineering and the Built Environment", code: "EBE", sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "tut-school-humanities", facultyId: "tut-faculty-humanities", name: "Faculty of Humanities", code: "HUM", sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "tut-school-ict", facultyId: "tut-faculty-ict", name: "Faculty of Information and Communication Technology", code: "ICT", sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "tut-school-management-sciences", facultyId: "tut-faculty-management-sciences", name: "Faculty of Management Sciences", code: "MS", sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "tut-school-science", facultyId: "tut-faculty-science", name: "Faculty of Science", code: "SCI", sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
];

// ---------------------------------------------------------------------------
// TUT PROGRAMMES
// ---------------------------------------------------------------------------

export const TUT_PROGRAMMES: Programme[] = [
  // --- Faculty of Arts and Design ---
  {
    id: "tut-dip-fashion-design", institutionId: "tut", facultyId: "tut-faculty-arts-design", schoolId: "tut-school-arts-design",
    name: "Diploma in Fashion Design and Technology", qualificationType: "diploma", nqfLevel: 6, saqaId: "100951",
    duration: "3 years", campuses: ["Arts Campus"], modeOfDelivery: "contact", minAps: 20,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 3 }],
    additionalRequirements: [
      "Qualification code: DPFD19.",
      "Selection includes a practical selection project and an interview alongside the APS.",
      "Closing date for application: 31 July.",
    ],
    careerOutcomes: ["Fashion Designer", "Garment Technologist", "Fashion Entrepreneur"],
    applyUrl: TUT_APPLY_URL, fieldTags: ["creative"], sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "tut-hcert-music", institutionId: "tut", facultyId: "tut-faculty-arts-design", schoolId: "tut-school-arts-design",
    name: "Higher Certificate in Music", qualificationType: "higherCertificate", nqfLevel: 5, saqaId: "110420",
    duration: "1 year", campuses: ["Arts Campus"], modeOfDelivery: "contact", minAps: 18,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 3 }],
    additionalRequirements: [
      "Qualification code: HCMU20.",
      "Selection includes a vocal or instrument audition and an interview.",
      "Closing date for application: 31 July.",
    ],
    careerOutcomes: ["Jazz Musician", "Music Producer", "Opera Singer"],
    applyUrl: TUT_APPLY_URL, fieldTags: ["creative"], sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Faculty of Economics and Finance ---
  {
    id: "tut-dip-accounting", institutionId: "tut", facultyId: "tut-faculty-economics-finance", schoolId: "tut-school-economics-finance",
    name: "Diploma in Accounting", qualificationType: "diploma", nqfLevel: 6, saqaId: "104503",
    duration: "3 years", campuses: ["Ga-Rankuwa Campus", "Mbombela Campus", "Polokwane Campus"], modeOfDelivery: "contact", minAps: 22,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }, { subjectCode: "MATH", minLevel: 3 }],
    additionalRequirements: [
      "Qualification code: DPAG20.",
      "Minimum APS 22 with Mathematics/Technical Mathematics (or Accounting Level 3), or 24 with Mathematical Literacy Level 5.",
      "Closing date for application: 30 September.",
    ],
    careerOutcomes: ["Financial Accountant", "Auditor", "Asset Manager"],
    applyUrl: TUT_APPLY_URL, fieldTags: ["business"], sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "tut-hcert-accounting", institutionId: "tut", facultyId: "tut-faculty-economics-finance", schoolId: "tut-school-economics-finance",
    name: "Higher Certificate in Accounting", qualificationType: "higherCertificate", nqfLevel: 5, saqaId: "103080",
    duration: "1 year", campuses: ["Ga-Rankuwa Campus"], modeOfDelivery: "contact", minAps: 22,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }, { subjectCode: "MATH", minLevel: 3 }],
    additionalRequirements: [
      "Qualification code: HCAG20.",
      "Minimum APS 22 with Mathematics/Technical Mathematics, or 23 with Mathematical Literacy Level 4.",
      "Closing date for application: 30 September.",
    ],
    careerOutcomes: ["Accounting Technician", "Bookkeeper", "Tax Consultant"],
    applyUrl: TUT_APPLY_URL, fieldTags: ["business"], sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Faculty of Engineering and the Built Environment ---
  {
    id: "tut-beng-tech-civil", institutionId: "tut", facultyId: "tut-faculty-engineering", schoolId: "tut-school-engineering",
    name: "Bachelor of Engineering Technology in Civil Engineering", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: "98844",
    duration: "3 years", campuses: ["Pretoria Campus"], modeOfDelivery: "contact", minAps: 30,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }, { subjectCode: "MATH", minLevel: 5 }, { subjectCode: "PHS", minLevel: 5 }],
    additionalRequirements: [
      "Qualification code: BPCE18.",
      "Recommended subjects: Engineering Graphics and Design, Civil Technology.",
      "Closing date for application: 30 September.",
    ],
    careerOutcomes: ["Construction Manager", "Project Manager", "Civil Engineering Technician"],
    applyUrl: TUT_APPLY_URL, fieldTags: ["technology"], sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "tut-dip-civil-engineering", institutionId: "tut", facultyId: "tut-faculty-engineering", schoolId: "tut-school-engineering",
    name: "Diploma in Civil Engineering", qualificationType: "diploma", nqfLevel: 6, saqaId: "123081",
    duration: "3 years", campuses: ["Pretoria Campus"], modeOfDelivery: "contact", minAps: 26,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }, { subjectCode: "MATH", minLevel: 4 }, { subjectCode: "PHS", minLevel: 4 }],
    additionalRequirements: [
      "Qualification code: DPCE26.",
      "Recommended subject: Engineering Graphics.",
      "Closing date for application: 30 September.",
    ],
    careerOutcomes: ["Construction Supervisor", "Civil Engineering Technician"],
    applyUrl: TUT_APPLY_URL, fieldTags: ["technology"], sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Faculty of Humanities ---
  {
    id: "tut-bed-foundation-phase", institutionId: "tut", facultyId: "tut-faculty-humanities", schoolId: "tut-school-humanities",
    name: "Bachelor of Education in Foundation Phase Teaching", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: "109086",
    duration: "4 years", campuses: ["Soshanguve North Campus"], modeOfDelivery: "contact", minAps: 25,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }, { subjectCode: "MATH", minLevel: 4 }],
    additionalRequirements: [
      "Qualification code: BPFN20.",
      "Home language at Level 5 (must align with the language offered in the programme), First Additional Language at Level 4, Mathematics Level 4 or Mathematical Literacy Level 5.",
      "Closing date for application: 31 July.",
    ],
    careerOutcomes: ["Foundation Phase Educator", "Life-Skills Facilitator"],
    applyUrl: TUT_APPLY_URL, fieldTags: ["people"], sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "tut-dip-journalism", institutionId: "tut", facultyId: "tut-faculty-humanities", schoolId: "tut-school-humanities",
    name: "Diploma in Journalism", qualificationType: "diploma", nqfLevel: 6, saqaId: "111495",
    duration: "3 years", campuses: ["Soshanguve North Campus"], modeOfDelivery: "contact", minAps: 24,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }],
    additionalRequirements: [
      "Qualification code: DPJR20.",
      "Recommended subjects: Geography, History, a third language, any art-related subject.",
      "Selection includes a selection test and interview; portfolio of media output requested.",
      "Closing date for application: 31 July.",
    ],
    careerOutcomes: ["Journalist", "Broadcast Journalist"],
    applyUrl: TUT_APPLY_URL, fieldTags: ["creative", "people"], sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Faculty of Information and Communication Technology ---
  {
    id: "tut-dip-information-technology", institutionId: "tut", facultyId: "tut-faculty-ict", schoolId: "tut-school-ict",
    name: "Diploma in Information Technology", qualificationType: "diploma", nqfLevel: 6, saqaId: "111493",
    duration: "3 years", campuses: ["Soshanguve South Campus"], modeOfDelivery: "contact", minAps: 26,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }, { subjectCode: "MATH", minLevel: 5 }, { subjectCode: "PHS", minLevel: 3 }],
    additionalRequirements: [
      "Qualification code: DPIT20.",
      "Minimum APS 26 with Mathematics/Technical Mathematics, or 28 with Mathematical Literacy Level 7. An extended (4-year) programme is available at APS 23 (or 25 with Mathematical Literacy).",
      "Closing date for application: 30 September.",
    ],
    careerOutcomes: ["Network Administrator", "Cybersecurity Specialist", "Cloud Security Engineer"],
    applyUrl: TUT_APPLY_URL, fieldTags: ["technology"], sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "tut-dip-computer-science", institutionId: "tut", facultyId: "tut-faculty-ict", schoolId: "tut-school-ict",
    name: "Diploma in Computer Science", qualificationType: "diploma", nqfLevel: 6, saqaId: "109017",
    duration: "3 years", campuses: ["Soshanguve South Campus", "eMalahleni Campus", "Polokwane Campus"], modeOfDelivery: "contact", minAps: 26,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }, { subjectCode: "MATH", minLevel: 5 }],
    additionalRequirements: [
      "Qualification code: DPRS20.",
      "Minimum APS 26 with Mathematics/Technical Mathematics, or 28 with Mathematical Literacy Level 7. An extended (4-year) programme is available at APS 23 (or 25 with Mathematical Literacy).",
      "Closing date for application: 30 September.",
    ],
    careerOutcomes: ["Software Developer", "Data Scientist", "Systems Analyst"],
    applyUrl: TUT_APPLY_URL, fieldTags: ["technology"], sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Faculty of Management Sciences ---
  {
    id: "tut-dip-hr-management", institutionId: "tut", facultyId: "tut-faculty-management-sciences", schoolId: "tut-school-management-sciences",
    name: "Diploma in Human Resource Management", qualificationType: "diploma", nqfLevel: 6, saqaId: "100969",
    duration: "3 years", campuses: ["Pretoria Campus", "eMalahleni Campus", "Polokwane Campus"], modeOfDelivery: "contact", minAps: 24,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }, { subjectCode: "MATH", minLevel: 3 }],
    additionalRequirements: [
      "Qualification code: DPHR19.",
      "Closing date for application: 30 September.",
    ],
    careerOutcomes: ["Training Officer", "Personnel Manager", "Labour Relations Officer"],
    applyUrl: TUT_APPLY_URL, fieldTags: ["business", "people"], sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "tut-dip-marketing", institutionId: "tut", facultyId: "tut-faculty-management-sciences", schoolId: "tut-school-management-sciences",
    name: "Diploma in Marketing", qualificationType: "diploma", nqfLevel: 6, saqaId: "100962",
    duration: "3 years", campuses: ["Pretoria Campus", "Mbombela Campus"], modeOfDelivery: "contact", minAps: 24,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }, { subjectCode: "MATH", minLevel: 3 }],
    additionalRequirements: [
      "Qualification code: DPMK19.",
      "Recommended subjects: Accounting, Business Studies, Economics.",
      "Closing date for application: 30 September.",
    ],
    careerOutcomes: ["Marketing Manager", "Sales Consultant", "Product Manager"],
    applyUrl: TUT_APPLY_URL, fieldTags: ["business"], sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Faculty of Science ---
  {
    id: "tut-bnursing", institutionId: "tut", facultyId: "tut-faculty-science", schoolId: "tut-school-science",
    name: "Bachelor of Nursing", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: "98958",
    duration: "4 years", campuses: ["Pretoria Campus"], modeOfDelivery: "contact", minAps: 27,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }, { subjectCode: "MATH", minLevel: 4 }, { subjectCode: "LFS", minLevel: 4 }],
    additionalRequirements: [
      "Qualification code: BPNS20.",
      "Applicants with an APS between 27 and 29 must pass a TUT potential assessment; APS 30+ is automatically eligible.",
      "Registration with the South African Nursing Council required; graduates complete one year of community service.",
      "Closing date for application: 15 June.",
    ],
    careerOutcomes: ["Registered Nurse", "Midwife"],
    applyUrl: TUT_APPLY_URL, fieldTags: ["science", "people"], sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "tut-bpharm", institutionId: "tut", facultyId: "tut-faculty-science", schoolId: "tut-school-science",
    name: "Bachelor of Pharmacy", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: "90565",
    duration: "4 years", campuses: ["Arcadia Campus"], modeOfDelivery: "contact", minAps: 24,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }, { subjectCode: "MATH", minLevel: 4 }, { subjectCode: "PHS", minLevel: 4 }, { subjectCode: "LFS", minLevel: 4 }],
    additionalRequirements: [
      "Qualification code: BPPH01.",
      "Entry is highly competitive with limited spaces; applicants meeting the minimum APS of 24 are invited to a TUT potential assessment and departmental interview. Applicants with an APS of 32 or more are given preference subject to availability.",
      "Closing date for application: 15 June.",
    ],
    careerOutcomes: ["Pharmacist"],
    applyUrl: TUT_APPLY_URL, fieldTags: ["science", "people"], sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "tut-dip-analytical-chemistry", institutionId: "tut", facultyId: "tut-faculty-science", schoolId: "tut-school-science",
    name: "Diploma in Analytical Chemistry", qualificationType: "diploma", nqfLevel: 6, saqaId: "100979",
    duration: "3 years", campuses: ["Arcadia Campus"], modeOfDelivery: "contact", minAps: 21,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }, { subjectCode: "MATH", minLevel: 4 }, { subjectCode: "PHS", minLevel: 4 }],
    additionalRequirements: [
      "Qualification code: DPAC19.",
      "Applicants with an APS of 27 or more are considered directly for admission; applicants scoring 21-26 are kept on a waiting list.",
      "Closing date for application: 31 July.",
    ],
    careerOutcomes: ["Laboratory Analyst", "Chemist"],
    applyUrl: TUT_APPLY_URL, fieldTags: ["science"], sourceUrl: TUT_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
];

// ---------------------------------------------------------------------------
// TUT APPLICATION WINDOWS
// ---------------------------------------------------------------------------

export const TUT_APPLICATION_WINDOWS: ApplicationWindow[] = [
  {
    id: "tut-window-2027-general",
    institutionId: "tut",
    programmeId: null,
    opensOn: "2026-04-01",
    closesOn: "2026-09-30",
    lateClosesOn: null,
    status: "open",
    sourceUrl: TUT_GENERAL_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "tut-window-2027-arts-humanities-early",
    institutionId: "tut",
    programmeId: null,
    opensOn: "2026-04-01",
    closesOn: "2026-07-31",
    lateClosesOn: null,
    status: "open",
    sourceUrl: TUT_GENERAL_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "tut-window-2027-nursing",
    institutionId: "tut",
    programmeId: "tut-bnursing",
    opensOn: "2026-04-01",
    closesOn: "2026-06-15",
    lateClosesOn: null,
    status: "open",
    sourceUrl: TUT_GENERAL_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "tut-window-2027-pharmacy",
    institutionId: "tut",
    programmeId: "tut-bpharm",
    opensOn: "2026-04-01",
    closesOn: "2026-06-15",
    lateClosesOn: null,
    status: "open",
    sourceUrl: TUT_GENERAL_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
];
