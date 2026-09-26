/**
 * Verified North-West University (NWU) Seed Dataset.
 *
 * Every record here has full provenance (sourceUrl, verifiedOn,
 * academicYear) per the core trust primitive in lib/firestore/types.ts
 * and CLAUDE.md. A representative subset across 3 of NWU's real
 * faculties (Economic and Management Sciences has ~37 real programmes
 * on its own source page alone) -- extending it is a data operation,
 * not a code change.
 *
 * Sources: fetched directly from studies.nwu.ac.za's own 2027
 * faculty-specific undergraduate pages (NWU publishes per-faculty
 * pages, not one consolidated PDF). Not sourced from any third-party
 * aggregator/blog site.
 *
 * NWU's own APS rule (best 6 subjects, LO excluded) already exists in
 * scripts/seed-real-aps-rules.mts -- not duplicated here.
 */

import type { ApplicationWindow, Faculty, Programme, School } from "@/lib/firestore/types";
import { CURRENT_ACADEMIC_YEAR } from "./academicYear";

const NWU_EMS_URL = "https://studies.nwu.ac.za/undergraduate-studies/economic-and-management-sciences-2027";
const NWU_HEALTH_URL = "https://studies.nwu.ac.za/undergraduate-studies/health-sciences-2027";
const NWU_ENGINEERING_URL = "https://studies.nwu.ac.za/undergraduate-studies/engineering-2027";
const NWU_APPLY_URL = "https://studies.nwu.ac.za/studies/apply";
const VERIFIED_ON = "2026-09-26";
const ACADEMIC_YEAR = CURRENT_ACADEMIC_YEAR;

// ---------------------------------------------------------------------------
// NWU FACULTIES
// ---------------------------------------------------------------------------

export const NWU_FACULTIES: Faculty[] = [
  { id: "nwu-faculty-ems", institutionId: "nwu", name: "Faculty of Economic and Management Sciences", code: "EMS", sourceUrl: NWU_EMS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "nwu-faculty-health", institutionId: "nwu", name: "Faculty of Health Sciences", code: "FHS", sourceUrl: NWU_HEALTH_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "nwu-faculty-engineering", institutionId: "nwu", name: "Faculty of Engineering", code: "ENG", sourceUrl: NWU_ENGINEERING_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
];

// ---------------------------------------------------------------------------
// NWU SCHOOLS
// ---------------------------------------------------------------------------

export const NWU_SCHOOLS: School[] = [
  { id: "nwu-school-pharmacy", facultyId: "nwu-faculty-health", name: "School of Pharmacy", code: "SOP", sourceUrl: NWU_HEALTH_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "nwu-school-nursing", facultyId: "nwu-faculty-health", name: "School of Nursing", code: "SON", sourceUrl: NWU_HEALTH_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "nwu-school-psychosocial-health", facultyId: "nwu-faculty-health", name: "School of Psychosocial Health", code: "SPH", sourceUrl: NWU_HEALTH_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "nwu-school-applied-health-sciences", facultyId: "nwu-faculty-health", name: "School of Applied Health Sciences", code: "SAHS", sourceUrl: NWU_HEALTH_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  // No named sub-school surfaced for these 2 faculties -- mirrors its
  // own faculty 1:1 rather than inventing one (same pattern used for
  // UP/Wits faculties without a verified sub-school breakdown).
  { id: "nwu-school-ems", facultyId: "nwu-faculty-ems", name: "Faculty of Economic and Management Sciences", code: "EMS", sourceUrl: NWU_EMS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "nwu-school-engineering", facultyId: "nwu-faculty-engineering", name: "Faculty of Engineering", code: "ENG", sourceUrl: NWU_ENGINEERING_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
];

// ---------------------------------------------------------------------------
// NWU PROGRAMMES
// ---------------------------------------------------------------------------

export const NWU_PROGRAMMES: Programme[] = [
  // --- Economic and Management Sciences ---
  {
    id: "nwu-bcom-accounting", institutionId: "nwu", facultyId: "nwu-faculty-ems", schoolId: "nwu-school-ems",
    name: "Bachelor of Commerce - Accounting", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Vanderbijlpark"], modeOfDelivery: "contact", minAps: 24,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }, { subjectCode: "MATH", minLevel: 3 }],
    additionalRequirements: [], careerOutcomes: ["Accountant", "Bookkeeper"],
    applyUrl: NWU_APPLY_URL, fieldTags: ["business"], sourceUrl: NWU_EMS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nwu-bcom-chartered-accountancy", institutionId: "nwu", facultyId: "nwu-faculty-ems", schoolId: "nwu-school-ems",
    name: "Bachelor of Commerce - Chartered Accountancy (CA)", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Potchefstroom", "Mahikeng", "Vanderbijlpark"], modeOfDelivery: "contact", minAps: 32,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }, { subjectCode: "MATH", minLevel: 5 }],
    additionalRequirements: [], careerOutcomes: ["Chartered Accountant", "Auditor"],
    applyUrl: NWU_APPLY_URL, fieldTags: ["business"], sourceUrl: NWU_EMS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nwu-bcom-forensic-accountancy", institutionId: "nwu", facultyId: "nwu-faculty-ems", schoolId: "nwu-school-ems",
    name: "Bachelor of Commerce - Forensic Accountancy", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Potchefstroom"], modeOfDelivery: "contact", minAps: 36,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }, { subjectCode: "MATH", minLevel: 5 }],
    additionalRequirements: [], careerOutcomes: ["Forensic Accountant", "Fraud Examiner"],
    applyUrl: NWU_APPLY_URL, fieldTags: ["business"], sourceUrl: NWU_EMS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nwu-badmin-hr-management", institutionId: "nwu", facultyId: "nwu-faculty-ems", schoolId: "nwu-school-ems",
    name: "Bachelor of Administration - Human Resource Management", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Mahikeng"], modeOfDelivery: "contact", minAps: 23,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }],
    additionalRequirements: ["Mathematics Level 3 (40-49%) OR Mathematical Literacy Level 4 (50-59%)."],
    careerOutcomes: ["HR Officer", "Recruitment Specialist"],
    applyUrl: NWU_APPLY_URL, fieldTags: ["business", "people"], sourceUrl: NWU_EMS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nwu-bcom-business-management", institutionId: "nwu", facultyId: "nwu-faculty-ems", schoolId: "nwu-school-ems",
    name: "Bachelor of Commerce in Management Sciences - Business Management", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Mahikeng", "Potchefstroom", "Vanderbijlpark"], modeOfDelivery: "contact", minAps: 24,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }, { subjectCode: "MATH", minLevel: 3 }],
    additionalRequirements: [], careerOutcomes: ["Business Manager", "Operations Manager"],
    applyUrl: NWU_APPLY_URL, fieldTags: ["business"], sourceUrl: NWU_EMS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nwu-ba-tourism-management", institutionId: "nwu", facultyId: "nwu-faculty-ems", schoolId: "nwu-school-ems",
    name: "Bachelor of Arts - Tourism Management", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Mahikeng"], modeOfDelivery: "contact", minAps: 22,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }],
    additionalRequirements: ["No specific Mathematics requirement."], careerOutcomes: ["Tourism Manager", "Travel Consultant"],
    applyUrl: NWU_APPLY_URL, fieldTags: ["business", "people"], sourceUrl: NWU_EMS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Health Sciences ---
  {
    id: "nwu-bpharm", institutionId: "nwu", facultyId: "nwu-faculty-health", schoolId: "nwu-school-pharmacy",
    name: "Bachelor of Pharmacy", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Potchefstroom"], modeOfDelivery: "contact", minAps: 32,
    subjectRequirements: [{ subjectCode: "MATH", minLevel: 5 }, { subjectCode: "PHS", minLevel: 5 }],
    additionalRequirements: ["Applications close 31 July."], careerOutcomes: ["Pharmacist"],
    applyUrl: NWU_APPLY_URL, fieldTags: ["science", "people"], sourceUrl: NWU_HEALTH_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nwu-bsc-dietetics", institutionId: "nwu", facultyId: "nwu-faculty-health", schoolId: "nwu-school-applied-health-sciences",
    name: "Bachelor of Science in Dietetics", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "4 years", campuses: ["Potchefstroom"], modeOfDelivery: "contact", minAps: 30,
    subjectRequirements: [{ subjectCode: "MATH", minLevel: 5 }, { subjectCode: "PHS", minLevel: 5 }],
    additionalRequirements: ["Applications close 31 August."], careerOutcomes: ["Dietitian", "Nutritionist"],
    applyUrl: NWU_APPLY_URL, fieldTags: ["science", "people"], sourceUrl: NWU_HEALTH_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nwu-bnursing", institutionId: "nwu", facultyId: "nwu-faculty-health", schoolId: "nwu-school-nursing",
    name: "Bachelor of Nursing", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "4 years", campuses: ["Mahikeng", "Potchefstroom"], modeOfDelivery: "contact", minAps: 25,
    subjectRequirements: [{ subjectCode: "MATH", minLevel: 4 }],
    additionalRequirements: ["Mathematics OR Mathematical Literacy Level 4.", "Physical Sciences OR Life Sciences Level 4.", "Applications close 30 June."],
    careerOutcomes: ["Registered Nurse"],
    applyUrl: NWU_APPLY_URL, fieldTags: ["science", "people"], sourceUrl: NWU_HEALTH_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nwu-bsocial-work", institutionId: "nwu", facultyId: "nwu-faculty-health", schoolId: "nwu-school-psychosocial-health",
    name: "Bachelor of Social Work", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "4 years", campuses: ["Mahikeng", "Potchefstroom", "Vanderbijlpark"], modeOfDelivery: "contact", minAps: 28,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }],
    additionalRequirements: ["Applications close 30 June."], careerOutcomes: ["Social Worker"],
    applyUrl: NWU_APPLY_URL, fieldTags: ["people"], sourceUrl: NWU_HEALTH_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Engineering ---
  {
    id: "nwu-beng-electrical-electronic", institutionId: "nwu", facultyId: "nwu-faculty-engineering", schoolId: "nwu-school-engineering",
    name: "Bachelor of Engineering in Electrical and Electronic Engineering", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Potchefstroom"], modeOfDelivery: "contact", minAps: 34,
    subjectRequirements: [{ subjectCode: "MATH", minLevel: 6 }, { subjectCode: "PHS", minLevel: 6 }],
    additionalRequirements: ["English or Afrikaans (language of instruction) at 60%+.", "A 1-year Xcel bridging programme is available for applicants scoring 40%+ in Mathematics and Physical Sciences with 60%+ in the language of instruction."],
    careerOutcomes: ["Electrical Engineer", "Electronics Engineer"],
    applyUrl: NWU_APPLY_URL, fieldTags: ["technology"], sourceUrl: NWU_ENGINEERING_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nwu-beng-mechanical", institutionId: "nwu", facultyId: "nwu-faculty-engineering", schoolId: "nwu-school-engineering",
    name: "Bachelor of Engineering in Mechanical Engineering", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Potchefstroom"], modeOfDelivery: "contact", minAps: 34,
    subjectRequirements: [{ subjectCode: "MATH", minLevel: 6 }, { subjectCode: "PHS", minLevel: 6 }],
    additionalRequirements: ["English or Afrikaans (language of instruction) at 60%+.", "A 1-year Xcel bridging programme is available for applicants scoring 40%+ in Mathematics and Physical Sciences with 60%+ in the language of instruction."],
    careerOutcomes: ["Mechanical Engineer", "Design Engineer"],
    applyUrl: NWU_APPLY_URL, fieldTags: ["technology"], sourceUrl: NWU_ENGINEERING_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
];

// ---------------------------------------------------------------------------
// NWU APPLICATION WINDOWS
// ---------------------------------------------------------------------------

export const NWU_APPLICATION_WINDOWS: ApplicationWindow[] = [
  {
    id: "nwu-window-2027-general",
    institutionId: "nwu",
    programmeId: null,
    opensOn: "2026-04-01",
    closesOn: "2026-06-30",
    lateClosesOn: null,
    status: "open",
    sourceUrl: NWU_HEALTH_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nwu-window-2027-pharmacy",
    institutionId: "nwu",
    programmeId: "nwu-bpharm",
    opensOn: "2026-04-01",
    closesOn: "2026-07-31",
    lateClosesOn: null,
    status: "open",
    sourceUrl: NWU_HEALTH_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nwu-window-2027-dietetics",
    institutionId: "nwu",
    programmeId: "nwu-bsc-dietetics",
    opensOn: "2026-04-01",
    closesOn: "2026-08-31",
    lateClosesOn: null,
    status: "open",
    sourceUrl: NWU_HEALTH_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
];
