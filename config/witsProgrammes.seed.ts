/**
 * Verified University of the Witwatersrand (Wits) Seed Dataset.
 *
 * Every record here has full provenance (sourceUrl, verifiedOn,
 * academicYear) per the core trust primitive in lib/firestore/types.ts
 * and CLAUDE.md. A representative subset across all 5 real Wits
 * faculties (one from each) -- extending it with more programmes is a
 * data operation, not a code change.
 *
 * Sources: fetched directly from wits.ac.za's own course-finder pages
 * (one fetch per programme, each URL recorded on its own entry below --
 * Wits doesn't publish one consolidated requirements PDF the way UMP/UP
 * do) plus the general entry-requirements page for the institution-wide
 * notes. Not sourced from any third-party aggregator/blog site.
 *
 * Wits' own APS rule (best 7 subjects INCLUDING Life Orientation, with
 * an English/Maths bonus -- unusual among SA universities, already
 * independently re-confirmed per that file's own comment) already
 * exists in scripts/seed-real-aps-rules.mts -- not duplicated here.
 */

import type { ApplicationWindow, Faculty, Programme, School } from "@/lib/firestore/types";
import { CURRENT_ACADEMIC_YEAR } from "./academicYear";

const WITS_GENERAL_URL = "https://www.wits.ac.za/undergraduate/entry-requirements/";
const WITS_APPLY_URL = "https://www.wits.ac.za/undergraduate/apply-to-wits/";
const VERIFIED_ON = "2026-09-26";
const ACADEMIC_YEAR = CURRENT_ACADEMIC_YEAR;

// ---------------------------------------------------------------------------
// WITS FACULTIES
// ---------------------------------------------------------------------------

export const WITS_FACULTIES: Faculty[] = [
  { id: "wits-faculty-clm", institutionId: "wits", name: "Faculty of Commerce, Law and Management", code: "CLM", sourceUrl: WITS_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "wits-faculty-ebe", institutionId: "wits", name: "Faculty of Engineering and the Built Environment", code: "EBE", sourceUrl: WITS_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "wits-faculty-health", institutionId: "wits", name: "Faculty of Health Sciences", code: "FHS", sourceUrl: WITS_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "wits-faculty-humanities", institutionId: "wits", name: "Faculty of Humanities", code: "HUM", sourceUrl: WITS_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "wits-faculty-science", institutionId: "wits", name: "Faculty of Science", code: "SCI", sourceUrl: WITS_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
];

// ---------------------------------------------------------------------------
// WITS SCHOOLS
// ---------------------------------------------------------------------------

export const WITS_SCHOOLS: School[] = [
  { id: "wits-school-civil-environmental-eng", facultyId: "wits-faculty-ebe", name: "School of Civil and Environmental Engineering", code: "SCEE", sourceUrl: "https://www.wits.ac.za/course-finder/undergraduate/ebe/civil-engineering/", verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "wits-school-clinical-medicine", facultyId: "wits-faculty-health", name: "School of Clinical Medicine", code: "SCM", sourceUrl: "https://www.wits.ac.za/course-finder/undergraduate/health/medicine-and-surgery/", verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  // No named sub-school surfaced for these 3 faculties in the pages
  // fetched -- mirrors its own faculty 1:1 rather than inventing one.
  { id: "wits-school-clm", facultyId: "wits-faculty-clm", name: "Faculty of Commerce, Law and Management", code: "CLM", sourceUrl: WITS_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "wits-school-humanities", facultyId: "wits-faculty-humanities", name: "Faculty of Humanities", code: "HUM", sourceUrl: WITS_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "wits-school-science", facultyId: "wits-faculty-science", name: "Faculty of Science", code: "SCI", sourceUrl: WITS_GENERAL_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
];

// ---------------------------------------------------------------------------
// WITS PROGRAMMES
// ---------------------------------------------------------------------------

export const WITS_PROGRAMMES: Programme[] = [
  {
    id: "wits-ba", institutionId: "wits", facultyId: "wits-faculty-humanities", schoolId: "wits-school-humanities",
    name: "Bachelor of Arts (BA)", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Braamfontein"], modeOfDelivery: "contact", minAps: 36,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }],
    additionalRequirements: ["Applicants scoring 30-35 APS points may be waitlisted, subject to place availability.", "All BA students must complete two-semester courses in isiZulu, Sesotho, or South African Sign Language, unless proficient in two of these or granted an exemption."],
    careerOutcomes: ["Writer", "Researcher", "Policy Analyst"],
    applyUrl: WITS_APPLY_URL, fieldTags: ["people", "creative"],
    sourceUrl: "https://www.wits.ac.za/course-finder/undergraduate/humanities/ba/", verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "wits-bcom", institutionId: "wits", facultyId: "wits-faculty-clm", schoolId: "wits-school-clm",
    name: "Bachelor of Commerce (General)", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Braamfontein"], modeOfDelivery: "contact", minAps: 38,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }, { subjectCode: "MATH", minLevel: 5 }],
    additionalRequirements: ["Applicants scoring 35-37 APS with English Level 6 and Mathematics Level 6 may be considered subject to availability.", "Double-major degree: at least two full majors required."],
    careerOutcomes: ["Accountant", "Business Analyst", "Economist"],
    applyUrl: WITS_APPLY_URL, fieldTags: ["business"],
    sourceUrl: "https://www.wits.ac.za/course-finder/undergraduate/clm/bcom/", verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "wits-bsc-eng-civil", institutionId: "wits", facultyId: "wits-faculty-ebe", schoolId: "wits-school-civil-environmental-eng",
    name: "BSc (Eng) in Civil Engineering", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Braamfontein"], modeOfDelivery: "contact", minAps: 42,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }, { subjectCode: "MATH", minLevel: 5 }, { subjectCode: "PHS", minLevel: 5 }],
    additionalRequirements: ["Applicants achieving Level 6 in English, Mathematics and Physical Sciences have a better chance of acceptance; Level 5 applicants may be waitlisted subject to availability.", "Common first-year programme across all engineering disciplines; specialisation begins in year two."],
    careerOutcomes: ["Civil Engineer", "Structural Engineer", "Geotechnical Engineer"],
    applyUrl: WITS_APPLY_URL, fieldTags: ["technology"],
    sourceUrl: "https://www.wits.ac.za/course-finder/undergraduate/ebe/civil-engineering/", verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "wits-bsc", institutionId: "wits", facultyId: "wits-faculty-science", schoolId: "wits-school-science",
    name: "Bachelor of Science (BSc)", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Braamfontein"], modeOfDelivery: "contact", minAps: 42,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }, { subjectCode: "MATH", minLevel: 5 }],
    additionalRequirements: ["Specific specialisations (Biological Sciences, Earth Sciences, Mathematical Sciences, Physical Sciences) require up to APS 44.", "All Faculty of Science applicants must write the National Benchmark Tests (NBT) before admission is considered.", "Applicants scoring 40-41 APS may be waitlisted subject to availability."],
    careerOutcomes: ["Research Scientist", "Data Analyst", "Lab Scientist"],
    applyUrl: WITS_APPLY_URL, fieldTags: ["science"],
    sourceUrl: "https://www.wits.ac.za/course-finder/undergraduate/science/bsc/", verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "wits-mbbch", institutionId: "wits", facultyId: "wits-faculty-health", schoolId: "wits-school-clinical-medicine",
    name: "Bachelor of Medicine and Bachelor of Surgery (MBBCh)", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "6 years", campuses: ["Parktown"], modeOfDelivery: "contact",
    // Wits selects for Medicine on a Composite Index (75% matric results
    // across 5 specific subjects + 25% National Benchmark Test), not a
    // simple APS threshold -- minAps is genuinely null here rather than
    // a fabricated approximation of a different selection mechanism.
    minAps: null,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 5 }, { subjectCode: "MATH", minLevel: 5 }, { subjectCode: "PHS", minLevel: 5 }],
    additionalRequirements: ["Selection uses a Composite Index, not a simple APS: matric results from 5 subjects (English, Mathematics, best of Physical/Life Sciences, plus best 2 others) weighted 75%, National Benchmark Test (NBT) weighted 25%.", "All applicants must sit an in-person NBT session by 17 August -- online-only results are not accepted.", "Life Sciences accepted in place of Physical Sciences at the same level."],
    careerOutcomes: ["Medical Doctor"],
    applyUrl: WITS_APPLY_URL, fieldTags: ["science", "people"],
    sourceUrl: "https://www.wits.ac.za/course-finder/undergraduate/health/medicine-and-surgery/", verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
];

// ---------------------------------------------------------------------------
// WITS APPLICATION WINDOWS
// ---------------------------------------------------------------------------

export const WITS_APPLICATION_WINDOWS: ApplicationWindow[] = [
  {
    id: "wits-window-2027-general",
    institutionId: "wits",
    programmeId: null,
    opensOn: "2026-04-01",
    closesOn: "2026-09-30",
    lateClosesOn: null,
    status: "open",
    sourceUrl: "https://www.wits.ac.za/course-finder/undergraduate/clm/bcom/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "wits-window-2027-medicine",
    institutionId: "wits",
    programmeId: "wits-mbbch",
    opensOn: "2026-04-01",
    closesOn: "2026-06-30",
    lateClosesOn: null,
    status: "open",
    sourceUrl: "https://www.wits.ac.za/course-finder/undergraduate/health/medicine-and-surgery/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
];
