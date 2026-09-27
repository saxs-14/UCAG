/**
 * Verified University of KwaZulu-Natal (UKZN) Seed Dataset.
 *
 * Every record here has full provenance (sourceUrl, verifiedOn,
 * academicYear) per the core trust primitive in lib/firestore/types.ts
 * and CLAUDE.md.
 *
 * Sources: fetched directly from clms.ukzn.ac.za's and chs.ukzn.ac.za's
 * own per-programme pages (UKZN's 2027 undergraduate prospectus is a
 * single PDF too large/multi-page to read locally -- pdftoppm/
 * poppler-utils not installed on this machine -- so per-programme HTML
 * pages were used instead, same pattern as NWU/NMU). applications.ukzn.ac.za
 * returned 403 Forbidden on every attempt, so its pages were not used.
 *
 * College of Health Sciences programme pages published real
 * subject-level requirements but did not publish an explicit numeric
 * composite APS on the pages fetched (UKZN's own copy says each
 * programme has "a minimum composite Academic Performance Score", but
 * the number itself wasn't shown) -- minAps is genuinely null for those
 * 3 programmes rather than an invented number, the same honest pattern
 * already used for Wits' MBBCh entry.
 *
 * UKZN's own APS rule (best 6 subjects, standard NSC 7-point bands,
 * already independently researched) exists in
 * scripts/seed-real-aps-rules.mts -- not duplicated here.
 */

import type { ApplicationWindow, Faculty, Programme, School } from "@/lib/firestore/types";
import { CURRENT_ACADEMIC_YEAR } from "./academicYear";

const UKZN_CLMS_URL = "https://clms.ukzn.ac.za/undergraduate-studies/";
const UKZN_CHS_URL = "https://chs.ukzn.ac.za/undergraduate-information/";
const UKZN_APPLY_URL = "https://studyatukzn.ukzn.ac.za/apply-at-ukzn/how-to-apply/";
const VERIFIED_ON = "2026-09-27";
const ACADEMIC_YEAR = CURRENT_ACADEMIC_YEAR;

// ---------------------------------------------------------------------------
// UKZN FACULTIES (Colleges)
// ---------------------------------------------------------------------------

export const UKZN_FACULTIES: Faculty[] = [
  { id: "ukzn-college-law-management", institutionId: "ukzn", name: "College of Law and Management Studies", code: "CLMS", sourceUrl: UKZN_CLMS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "ukzn-college-health-sciences", institutionId: "ukzn", name: "College of Health Sciences", code: "CHS", sourceUrl: UKZN_CHS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
];

// ---------------------------------------------------------------------------
// UKZN SCHOOLS
// ---------------------------------------------------------------------------

export const UKZN_SCHOOLS: School[] = [
  { id: "ukzn-school-commerce", facultyId: "ukzn-college-law-management", name: "School of Commerce", code: "COM", sourceUrl: UKZN_CLMS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "ukzn-school-law", facultyId: "ukzn-college-law-management", name: "School of Law", code: "LAW", sourceUrl: UKZN_CLMS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "ukzn-school-health-sciences", facultyId: "ukzn-college-health-sciences", name: "School of Health Sciences", code: "SHS", sourceUrl: UKZN_CHS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "ukzn-school-medicine", facultyId: "ukzn-college-health-sciences", name: "School of Medicine", code: "SOM", sourceUrl: UKZN_CHS_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
];

// ---------------------------------------------------------------------------
// UKZN PROGRAMMES
// ---------------------------------------------------------------------------

export const UKZN_PROGRAMMES: Programme[] = [
  {
    id: "ukzn-bcom-general", institutionId: "ukzn", facultyId: "ukzn-college-law-management", schoolId: "ukzn-school-commerce",
    name: "Bachelor of Commerce - General (BCom)", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Howard College", "Pietermaritzburg"], modeOfDelivery: "contact", minAps: 30,
    subjectRequirements: [{ subjectCode: "MATH", minLevel: 4 }, { subjectCode: "ENG-HL", minLevel: 4 }],
    additionalRequirements: [
      "Minimum 30 NSC points (Life Orientation excluded).",
      "CAO code: KN-P-BCG.",
    ],
    careerOutcomes: ["Business Analyst", "Economist", "Accountant"],
    applyUrl: UKZN_APPLY_URL, fieldTags: ["business"], sourceUrl: "https://clms.ukzn.ac.za/programme/bachelor-of-commerce-general-bcom/", verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ukzn-bcom-accounting", institutionId: "ukzn", facultyId: "ukzn-college-law-management", schoolId: "ukzn-school-commerce",
    name: "Bachelor of Commerce in Accounting", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Howard College", "Pietermaritzburg"], modeOfDelivery: "contact", minAps: 32,
    subjectRequirements: [{ subjectCode: "MATH", minLevel: 5 }, { subjectCode: "ENG-HL", minLevel: 4 }],
    additionalRequirements: [
      "Minimum 32 NSC points.",
      "CAO code not published on this programme's page.",
    ],
    careerOutcomes: ["Chartered Accountant", "Auditor", "Financial Manager"],
    applyUrl: UKZN_APPLY_URL, fieldTags: ["business"], sourceUrl: "https://clms.ukzn.ac.za/programme/bachelor-of-commerce-in-accounting/", verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ukzn-bba", institutionId: "ukzn", facultyId: "ukzn-college-law-management", schoolId: "ukzn-school-commerce",
    name: "Bachelor of Business Administration (BBA)", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Howard College", "Pietermaritzburg"], modeOfDelivery: "contact", minAps: 26,
    subjectRequirements: [{ subjectCode: "MATH", minLevel: 3 }, { subjectCode: "ENG-HL", minLevel: 4 }],
    additionalRequirements: [
      "Minimum 26 NSC points (Life Orientation excluded).",
      "CAO code: KN-P-BBA.",
    ],
    careerOutcomes: ["Business Manager", "Operations Manager"],
    applyUrl: UKZN_APPLY_URL, fieldTags: ["business"], sourceUrl: "https://clms.ukzn.ac.za/programme/bachelor-of-business-administration-bba/", verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ukzn-llb-fulltime", institutionId: "ukzn", facultyId: "ukzn-college-law-management", schoolId: "ukzn-school-law",
    name: "Bachelor of Laws (LLB)", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Howard College", "Pietermaritzburg"], modeOfDelivery: "contact", minAps: 32,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }, { subjectCode: "MATH", minLevel: 3 }],
    additionalRequirements: [
      "Minimum composite APS of 32 (Life Orientation excluded).",
      "English Home Language at Level 5, or English First Additional Language at Level 6.",
      "Mathematical Literacy at Level 5 accepted as an alternative to Mathematics Level 3.",
      "Life Orientation at Level 4.",
      "A part-time route (6 years, 12 semesters) is also offered with the same admission requirements.",
    ],
    careerOutcomes: ["Attorney", "Advocate", "Legal Advisor"],
    applyUrl: UKZN_APPLY_URL, fieldTags: ["people"], sourceUrl: "https://clms.ukzn.ac.za/programme/bachelor-of-laws-llb-full-time/", verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ukzn-bnursing", institutionId: "ukzn", facultyId: "ukzn-college-health-sciences", schoolId: "ukzn-school-health-sciences",
    name: "Bachelor of Nursing", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Westville"], modeOfDelivery: "contact",
    minAps: null,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }, { subjectCode: "MATH", minLevel: 3 }, { subjectCode: "LFS", minLevel: 4 }],
    additionalRequirements: [
      "UKZN publishes a minimum composite Academic Performance Score (APS) per programme with top-down ranked selection, but the exact number for this programme was not shown on the page fetched -- shown here as unverified rather than approximated.",
      "English Level 4, Mathematics or Mathematical Literacy Level 3, Life Sciences Level 4, Life Orientation Level 4.",
      "CAO code: KN-H-BN1. A 4-year problem-based, community-health-oriented programme.",
    ],
    careerOutcomes: ["Registered Nurse"],
    applyUrl: UKZN_APPLY_URL, fieldTags: ["science", "people"], sourceUrl: "https://chs.ukzn.ac.za/programme/bachelor-of-nursing/", verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ukzn-bpharm", institutionId: "ukzn", facultyId: "ukzn-college-health-sciences", schoolId: "ukzn-school-health-sciences",
    name: "Bachelor of Pharmacy", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Westville"], modeOfDelivery: "contact",
    minAps: null,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }, { subjectCode: "MATH", minLevel: 4 }, { subjectCode: "PHS", minLevel: 4 }, { subjectCode: "LFS", minLevel: 4 }],
    additionalRequirements: [
      "UKZN publishes a minimum composite Academic Performance Score (APS) per programme with top-down ranked selection, but the exact number for this programme was not shown on the page fetched -- shown here as unverified rather than approximated.",
      "English, Mathematics, Physical Sciences and Life Sciences each at Level 4; Life Orientation at Level 4.",
      "CAO code: KN-W-BPR.",
    ],
    careerOutcomes: ["Pharmacist"],
    applyUrl: UKZN_APPLY_URL, fieldTags: ["science", "people"], sourceUrl: "https://chs.ukzn.ac.za/programme/bachelor-of-pharmacy/", verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ukzn-mbchb", institutionId: "ukzn", facultyId: "ukzn-college-health-sciences", schoolId: "ukzn-school-medicine",
    name: "Bachelor of Medicine and Bachelor of Surgery (MBChB)", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "6 years", campuses: ["Medical School (Durban)"], modeOfDelivery: "contact",
    minAps: null,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }, { subjectCode: "MATH", minLevel: 5 }, { subjectCode: "PHS", minLevel: 5 }, { subjectCode: "LFS", minLevel: 5 }],
    additionalRequirements: [
      "UKZN publishes a minimum composite Academic Performance Score (APS) per programme with top-down ranked selection, but the exact number for this programme was not shown on the page fetched -- shown here as unverified rather than approximated.",
      "English, Mathematics, Physical Sciences and Life Sciences each at Level 5; Life Orientation at Level 4.",
      "At least 65% aggregate is required across the qualifying subjects.",
    ],
    careerOutcomes: ["Medical Doctor"],
    applyUrl: UKZN_APPLY_URL, fieldTags: ["science", "people"], sourceUrl: "https://chs.ukzn.ac.za/programme/bachelor-of-medicine-and-bachelor-of-surgery-mbchb/", verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
];

// ---------------------------------------------------------------------------
// UKZN APPLICATION WINDOWS
// ---------------------------------------------------------------------------

export const UKZN_APPLICATION_WINDOWS: ApplicationWindow[] = [
  {
    id: "ukzn-window-2027-general",
    institutionId: "ukzn",
    programmeId: null,
    opensOn: "2026-04-01",
    closesOn: "2026-09-30",
    lateClosesOn: null,
    status: "open",
    sourceUrl: UKZN_CLMS_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
];
