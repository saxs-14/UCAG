/**
 * Verified University of Pretoria (UP) Seed Dataset.
 *
 * Every record here has full provenance (sourceUrl, verifiedOn,
 * academicYear) per the core trust primitive in lib/firestore/types.ts
 * and CLAUDE.md. This is a representative subset across all 8 UP
 * faculties (~20 of the ~70 programmes listed in the source), not
 * exhaustive -- extending it with the remaining programmes is a data
 * operation (add more entries below, same shape), not a code change.
 *
 * Primary source: the official UP "Application requirements for
 * undergraduate programmes AT THE UNIVERSITY OF PRETORIA 2027" PDF,
 * published by UP's own Department of Enrolment and Student
 * Administration (December 2025) -- fetched and read directly
 * (2026-09-26), not sourced from any third-party aggregator/blog site.
 * UP's own APS rule (best 6 subjects, LO excluded, standard 7-point
 * scale) already exists in scripts/seed-real-aps-rules.mts -- not
 * duplicated here.
 */

import type { ApplicationWindow, Faculty, Programme, School } from "@/lib/firestore/types";
import { CURRENT_ACADEMIC_YEAR } from "./academicYear";

const UP_SOURCE_URL =
  "https://drupalwebprod-files.up.ac.za/Public/2026-03/UP_DESA_Application%20requirements%20tables_2027_web.pdf";
const UP_APPLY_URL = "https://www.up.ac.za/online-application";
const VERIFIED_ON = "2026-09-26";
const ACADEMIC_YEAR = CURRENT_ACADEMIC_YEAR;

// ---------------------------------------------------------------------------
// UP FACULTIES
// ---------------------------------------------------------------------------

export const UP_FACULTIES: Faculty[] = [
  { id: "up-faculty-ems", institutionId: "up", name: "Faculty of Economic and Management Sciences", code: "EMS", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "up-faculty-education", institutionId: "up", name: "Faculty of Education", code: "EDU", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "up-faculty-law", institutionId: "up", name: "Faculty of Law", code: "LAW", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "up-faculty-ebit", institutionId: "up", name: "Faculty of Engineering, Built Environment and Information Technology", code: "EBIT", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "up-faculty-health", institutionId: "up", name: "Faculty of Health Sciences", code: "FHS", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "up-faculty-humanities", institutionId: "up", name: "Faculty of Humanities", code: "HUM", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "up-faculty-theology", institutionId: "up", name: "Faculty of Theology and Religion", code: "THEO", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "up-faculty-vet", institutionId: "up", name: "Faculty of Veterinary Science", code: "VET", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "up-faculty-nas", institutionId: "up", name: "Faculty of Natural and Agricultural Sciences", code: "NAS", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
];

// ---------------------------------------------------------------------------
// UP SCHOOLS
// ---------------------------------------------------------------------------

export const UP_SCHOOLS: School[] = [
  { id: "up-school-engineering", facultyId: "up-faculty-ebit", name: "School of Engineering", code: "SOE", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "up-school-built-environment", facultyId: "up-faculty-ebit", name: "School for the Built Environment", code: "SBE", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "up-school-it", facultyId: "up-faculty-ebit", name: "School of Information Technology", code: "SIT", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "up-school-medicine", facultyId: "up-faculty-health", name: "School of Medicine", code: "SOM", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "up-school-healthcare-sciences", facultyId: "up-faculty-health", name: "School of Healthcare Sciences", code: "SHCS", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  // The source PDF organizes EBIT and Health Sciences by named sub-school,
  // but lists every other faculty's programmes directly with no sub-school
  // breakdown -- rather than invent a plausible-sounding school name for
  // those (a real fact we don't have independent verification for), each
  // of these mirrors its own faculty 1:1: the smallest organizational unit
  // this source actually gives us verified evidence for.
  { id: "up-school-ems", facultyId: "up-faculty-ems", name: "Faculty of Economic and Management Sciences", code: "EMS", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "up-school-education", facultyId: "up-faculty-education", name: "Faculty of Education", code: "EDU", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "up-school-law", facultyId: "up-faculty-law", name: "Faculty of Law", code: "LAW", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "up-school-humanities", facultyId: "up-faculty-humanities", name: "Faculty of Humanities", code: "HUM", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "up-school-theology", facultyId: "up-faculty-theology", name: "Faculty of Theology and Religion", code: "THEO", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "up-school-vet", facultyId: "up-faculty-vet", name: "Faculty of Veterinary Science", code: "VET", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "up-school-nas", facultyId: "up-faculty-nas", name: "Faculty of Natural and Agricultural Sciences", code: "NAS", sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
];

// ---------------------------------------------------------------------------
// UP PROGRAMMES -- representative subset, real APS/subject requirements
// ---------------------------------------------------------------------------

export const UP_PROGRAMMES: Programme[] = [
  // --- Economic and Management Sciences (closing 30 June) ---
  {
    id: "up-bcom-three-year", institutionId: "up", facultyId: "up-faculty-ems", schoolId: "up-school-ems",
    name: "Bachelor of Commerce (Three-year programme)", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Hatfield"], modeOfDelivery: "contact", minAps: 30,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }, { subjectCode: "MATH", minLevel: 4 }],
    additionalRequirements: [], careerOutcomes: ["Accountant", "Business Analyst", "Financial Manager"],
    applyUrl: UP_APPLY_URL, fieldTags: ["business"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "up-bcom-accounting-sciences", institutionId: "up", facultyId: "up-faculty-ems", schoolId: "up-school-ems",
    name: "Bachelor of Commerce in Accounting Sciences", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Hatfield"], modeOfDelivery: "contact", minAps: 34,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }, { subjectCode: "MATH", minLevel: 6 }],
    additionalRequirements: [], careerOutcomes: ["Chartered Accountant", "Auditor", "Tax Consultant"],
    applyUrl: UP_APPLY_URL, fieldTags: ["business"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "up-bcom-investment-management", institutionId: "up", facultyId: "up-faculty-ems", schoolId: "up-school-ems",
    name: "Bachelor of Commerce specialising in Investment Management", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Hatfield"], modeOfDelivery: "contact", minAps: 34,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }, { subjectCode: "MATH", minLevel: 6 }],
    additionalRequirements: [], careerOutcomes: ["Investment Analyst", "Portfolio Manager", "Financial Advisor"],
    applyUrl: UP_APPLY_URL, fieldTags: ["business"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Education (closing 30 June) ---
  {
    id: "up-bed-foundation-phase", institutionId: "up", facultyId: "up-faculty-education", schoolId: "up-school-education",
    name: "Bachelor of Education in Foundation Phase Teaching (Grade R to Grade 3)", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "4 years", campuses: ["Groenkloof"], modeOfDelivery: "contact", minAps: 28,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }],
    additionalRequirements: [], careerOutcomes: ["Foundation Phase Teacher"],
    applyUrl: UP_APPLY_URL, fieldTags: ["people"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "up-bed-intermediate-phase", institutionId: "up", facultyId: "up-faculty-education", schoolId: "up-school-education",
    name: "Bachelor of Education in Intermediate Phase Teaching (Grades 4 to 6)", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "4 years", campuses: ["Groenkloof"], modeOfDelivery: "contact", minAps: 28,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }],
    additionalRequirements: [], careerOutcomes: ["Intermediate Phase Teacher"],
    applyUrl: UP_APPLY_URL, fieldTags: ["people"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Law (closing 30 June) ---
  {
    id: "up-llb", institutionId: "up", facultyId: "up-faculty-law", schoolId: "up-school-law",
    name: "Bachelor of Laws (LLB)", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Hatfield"], modeOfDelivery: "contact", minAps: 35,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 6 }],
    additionalRequirements: [], careerOutcomes: ["Advocate", "Attorney", "Legal Advisor"],
    applyUrl: UP_APPLY_URL, fieldTags: ["people"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Engineering, Built Environment and IT (closing 30 June) ---
  {
    id: "up-beng-civil", institutionId: "up", facultyId: "up-faculty-ebit", schoolId: "up-school-engineering",
    name: "Bachelor of Engineering in Civil Engineering", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Hatfield"], modeOfDelivery: "contact", minAps: 35,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }, { subjectCode: "MATH", minLevel: 6 }, { subjectCode: "PHS", minLevel: 6 }],
    additionalRequirements: [], careerOutcomes: ["Civil Engineer", "Structural Engineer"],
    applyUrl: UP_APPLY_URL, fieldTags: ["technology"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "up-beng-electrical", institutionId: "up", facultyId: "up-faculty-ebit", schoolId: "up-school-engineering",
    name: "Bachelor of Engineering in Electrical Engineering", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Hatfield"], modeOfDelivery: "contact", minAps: 35,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }, { subjectCode: "MATH", minLevel: 6 }, { subjectCode: "PHS", minLevel: 6 }],
    additionalRequirements: [], careerOutcomes: ["Electrical Engineer", "Power Systems Engineer"],
    applyUrl: UP_APPLY_URL, fieldTags: ["technology"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "up-beng-mechanical", institutionId: "up", facultyId: "up-faculty-ebit", schoolId: "up-school-engineering",
    name: "Bachelor of Engineering in Mechanical Engineering", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Hatfield"], modeOfDelivery: "contact", minAps: 35,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }, { subjectCode: "MATH", minLevel: 6 }, { subjectCode: "PHS", minLevel: 6 }],
    additionalRequirements: [], careerOutcomes: ["Mechanical Engineer", "Design Engineer"],
    applyUrl: UP_APPLY_URL, fieldTags: ["technology"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "up-bsc-architecture", institutionId: "up", facultyId: "up-faculty-ebit", schoolId: "up-school-built-environment",
    name: "Bachelor of Science in Architecture", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Hatfield"], modeOfDelivery: "contact", minAps: 30,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }, { subjectCode: "MATH", minLevel: 4 }, { subjectCode: "PHS", minLevel: 4 }],
    additionalRequirements: ["This is a selection programme. Additional selection criteria apply."],
    careerOutcomes: ["Architect", "Urban Designer"],
    applyUrl: UP_APPLY_URL, fieldTags: ["creative", "technology"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "up-bsc-computer-science", institutionId: "up", facultyId: "up-faculty-ebit", schoolId: "up-school-it",
    name: "Bachelor of Science in Computer Science", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Hatfield"], modeOfDelivery: "contact", minAps: 30,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }, { subjectCode: "MATH", minLevel: 6 }],
    additionalRequirements: [], careerOutcomes: ["Software Developer", "Systems Analyst"],
    applyUrl: UP_APPLY_URL, fieldTags: ["technology"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Health Sciences (closing 30 June) ---
  {
    id: "up-mbchb", institutionId: "up", facultyId: "up-faculty-health", schoolId: "up-school-medicine",
    name: "Bachelor of Medicine and Surgery (MBChB)", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "6 years", campuses: ["Prinshof"], modeOfDelivery: "contact", minAps: 35,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }, { subjectCode: "MATH", minLevel: 6 }, { subjectCode: "PHS", minLevel: 5 }],
    additionalRequirements: ["This is a selection programme. Additional selection criteria apply."],
    careerOutcomes: ["Medical Doctor"],
    applyUrl: UP_APPLY_URL, fieldTags: ["science", "people"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "up-bsc-physiotherapy", institutionId: "up", facultyId: "up-faculty-health", schoolId: "up-school-healthcare-sciences",
    name: "Bachelor of Physiotherapy", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "4 years", campuses: ["Prinshof"], modeOfDelivery: "contact", minAps: 30,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }, { subjectCode: "MATH", minLevel: 4 }, { subjectCode: "PHS", minLevel: 4 }],
    additionalRequirements: ["This is a selection programme. Additional selection criteria apply."],
    careerOutcomes: ["Physiotherapist"],
    applyUrl: UP_APPLY_URL, fieldTags: ["science", "people"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "up-bnursing-science", institutionId: "up", facultyId: "up-faculty-health", schoolId: "up-school-healthcare-sciences",
    name: "Bachelor of Nursing Science", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "4 years", campuses: ["Prinshof"], modeOfDelivery: "contact", minAps: 28,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }, { subjectCode: "MATH", minLevel: 4 }, { subjectCode: "LFS", minLevel: 4 }],
    additionalRequirements: ["This is a selection programme. Additional selection criteria apply.", "Life Sciences required (not Physical Sciences)."],
    careerOutcomes: ["Registered Nurse"],
    applyUrl: UP_APPLY_URL, fieldTags: ["science", "people"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Humanities (closing 30 June) ---
  {
    id: "up-ba", institutionId: "up", facultyId: "up-faculty-humanities", schoolId: "up-school-humanities",
    name: "Bachelor of Arts", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Hatfield"], modeOfDelivery: "contact", minAps: 30,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }],
    additionalRequirements: [], careerOutcomes: ["Writer", "Researcher", "Policy Analyst"],
    applyUrl: UP_APPLY_URL, fieldTags: ["people", "creative"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "up-ba-law", institutionId: "up", facultyId: "up-faculty-humanities", schoolId: "up-school-humanities",
    name: "Bachelor of Arts specialising in Law", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Hatfield"], modeOfDelivery: "contact", minAps: 34,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }],
    additionalRequirements: [], careerOutcomes: ["Paralegal", "Legal Researcher"],
    applyUrl: UP_APPLY_URL, fieldTags: ["people"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "up-social-work", institutionId: "up", facultyId: "up-faculty-humanities", schoolId: "up-school-humanities",
    name: "Bachelor of Social Work", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "4 years", campuses: ["Hatfield"], modeOfDelivery: "contact", minAps: 30,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }],
    additionalRequirements: [], careerOutcomes: ["Social Worker", "Community Development Officer"],
    applyUrl: UP_APPLY_URL, fieldTags: ["people"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Theology and Religion (closing 30 June) ---
  {
    id: "up-theology", institutionId: "up", facultyId: "up-faculty-theology", schoolId: "up-school-theology",
    name: "Bachelor of Theology", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Hatfield"], modeOfDelivery: "contact", minAps: 28,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }],
    additionalRequirements: [], careerOutcomes: ["Minister", "Chaplain", "Theologian"],
    applyUrl: UP_APPLY_URL, fieldTags: ["people"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Veterinary Science (closing 31 May -- earlier than every other faculty) ---
  {
    id: "up-bvsc", institutionId: "up", facultyId: "up-faculty-vet", schoolId: "up-school-vet",
    name: "Bachelor of Veterinary Science", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "6 years", campuses: ["Onderstepoort"], modeOfDelivery: "contact", minAps: 35,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }, { subjectCode: "MATH", minLevel: 5 }, { subjectCode: "PHS", minLevel: 5 }],
    additionalRequirements: ["This is a selection programme. Additional selection criteria apply."],
    careerOutcomes: ["Veterinarian"],
    applyUrl: UP_APPLY_URL, fieldTags: ["science"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Natural and Agricultural Sciences (closing 30 June) ---
  {
    id: "up-bsc-biochemistry", institutionId: "up", facultyId: "up-faculty-nas", schoolId: "up-school-nas",
    name: "Bachelor of Science in Biochemistry", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Hatfield"], modeOfDelivery: "contact", minAps: 32,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }, { subjectCode: "MATH", minLevel: 5 }, { subjectCode: "PHS", minLevel: 5 }],
    additionalRequirements: [], careerOutcomes: ["Biochemist", "Research Scientist"],
    applyUrl: UP_APPLY_URL, fieldTags: ["science"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "up-bsc-actuarial-financial-maths", institutionId: "up", facultyId: "up-faculty-nas", schoolId: "up-school-nas",
    name: "Bachelor of Science in Actuarial and Financial Mathematics", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Hatfield"], modeOfDelivery: "contact", minAps: 36,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }, { subjectCode: "MATH", minLevel: 7 }],
    additionalRequirements: [], careerOutcomes: ["Actuary", "Financial Risk Analyst"],
    applyUrl: UP_APPLY_URL, fieldTags: ["science", "business"], sourceUrl: UP_SOURCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
];

// ---------------------------------------------------------------------------
// UP APPLICATION WINDOWS
// ---------------------------------------------------------------------------

export const UP_APPLICATION_WINDOWS: ApplicationWindow[] = [
  {
    // Institution-wide, EXCEPT Veterinary Science (its own earlier window
    // below overrides this for its two programmes -- see ResultsSection.tsx/
    // app/ump/page.tsx's window-lookup: programmeId: null is a fallback,
    // an explicit programmeId match takes precedence).
    id: "up-window-2027-general",
    institutionId: "up",
    programmeId: null,
    opensOn: "2026-04-01",
    closesOn: "2026-06-30",
    lateClosesOn: null,
    status: "open",
    sourceUrl: UP_APPLY_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "up-window-2027-vet-science",
    institutionId: "up",
    programmeId: "up-bvsc",
    opensOn: "2026-04-01",
    closesOn: "2026-05-31",
    lateClosesOn: null,
    status: "open",
    sourceUrl: UP_APPLY_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
];
