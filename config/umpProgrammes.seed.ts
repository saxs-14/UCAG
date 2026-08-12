/**
 * Verified UMP (University of Mpumalanga) Seed Dataset.
 * 
 * Every record here has been structured with full provenance (sourceUrl,
 * verifiedOn, academicYear) according to the core trust primitive in
 * lib/firestore/types.ts and CLAUDE.md.
 * 
 * Sources:
 * - UMP Official Undergraduate Programmes Handbook / Brochure:
 *   https://www.ump.ac.za/getattachment/Study-with-us/Application-Process/Online-Applications/Undergraduate-Programmes.pdf.aspx
 * - UMP Application Portal:
 *   https://www.ump.ac.za/Study-with-us/Application-Process/Online-Applications
 */

import type {
  ApsRule,
  ApplicationWindow,
  Faculty,
  Programme,
  School,
} from "@/lib/firestore/types";
import { CURRENT_ACADEMIC_YEAR } from "./academicYear";
import { STANDARD_NSC_SCALE } from "./aps-scales";

const UMP_SOURCE_URL =
  "https://www.ump.ac.za/getattachment/Study-with-us/Application-Process/Online-Applications/Undergraduate-Programmes.pdf.aspx";
const UMP_APPLY_URL =
  "https://www.ump.ac.za/Study-with-us/Application-Process/Online-Applications";
const VERIFIED_ON = "2026-08-11";
const ACADEMIC_YEAR = CURRENT_ACADEMIC_YEAR;

// ---------------------------------------------------------------------------
// UMP FACULTIES
// ---------------------------------------------------------------------------

export const UMP_FACULTIES: Faculty[] = [
  {
    id: "ump-faculty-edbs",
    institutionId: "ump",
    name: "Faculty of Economics, Development and Business Sciences",
    code: "FEDBS",
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ump-faculty-fans",
    institutionId: "ump",
    name: "Faculty of Agriculture and Natural Sciences",
    code: "FANS",
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ump-faculty-edu",
    institutionId: "ump",
    name: "Faculty of Education",
    code: "FEDU",
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
];

// ---------------------------------------------------------------------------
// UMP SCHOOLS
// ---------------------------------------------------------------------------

export const UMP_SCHOOLS: School[] = [
  {
    id: "ump-school-computing",
    facultyId: "ump-faculty-fans",
    name: "School of Computing and Mathematical Sciences",
    code: "SCMS",
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ump-school-development-studies",
    facultyId: "ump-faculty-edbs",
    name: "School of Development Studies",
    code: "SDS",
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ump-school-hospitality",
    facultyId: "ump-faculty-edbs",
    name: "School of Hospitality and Tourism Management",
    code: "SHTM",
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ump-school-accounting",
    facultyId: "ump-faculty-edbs",
    name: "School of Accounting and Financial Management",
    code: "SAFM",
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ump-school-agriculture",
    facultyId: "ump-faculty-fans",
    name: "School of Agricultural Sciences",
    code: "SAS",
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ump-school-biology",
    facultyId: "ump-faculty-fans",
    name: "School of Biology and Environmental Sciences",
    code: "SBES",
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ump-school-education",
    facultyId: "ump-faculty-edu",
    name: "School of Educational Foundation Studies",
    code: "SEFS",
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
];

// ---------------------------------------------------------------------------
// UMP PROGRAMMES
// ---------------------------------------------------------------------------

export const UMP_PROGRAMMES: Programme[] = [
  // --- ICT & Computing ---
  {
    id: "ump-bict",
    institutionId: "ump",
    facultyId: "ump-faculty-fans",
    schoolId: "ump-school-computing",
    name: "Bachelor of Information and Communication Technology",
    qualificationType: "bachelorsDegree",
    nqfLevel: 7,
    saqaId: "111283",
    duration: "3 years",
    campuses: ["Mbombela"],
    modeOfDelivery: "contact",
    minAps: 26,
    subjectRequirements: [
      { subjectCode: "ENG", minLevel: 4 },
      { subjectCode: "MAT", minLevel: 4 },
    ],
    additionalRequirements: [
      "Mathematical Literacy accepted at Level 5 with min APS of 28",
    ],
    careerOutcomes: [
      "Software Developer",
      "Systems Analyst",
      "Network Administrator",
      "Database Administrator",
      "Cybersecurity Analyst",
    ],
    applyUrl: UMP_APPLY_URL,
    fieldTags: ["technology", "practical"],
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ump-dip-ict-appdev",
    institutionId: "ump",
    facultyId: "ump-faculty-fans",
    schoolId: "ump-school-computing",
    name: "Diploma in Information and Communication Technology in Applications Development",
    qualificationType: "diploma",
    nqfLevel: 6,
    saqaId: "97943",
    duration: "3 years",
    campuses: ["Mbombela"],
    modeOfDelivery: "contact",
    minAps: 24,
    subjectRequirements: [
      { subjectCode: "ENG", minLevel: 4 },
      { subjectCode: "MAT", minLevel: 3 },
    ],
    additionalRequirements: [
      "Mathematical Literacy accepted at Level 4",
    ],
    careerOutcomes: [
      "Web Developer",
      "Mobile App Developer",
      "Junior Software Programmer",
      "IT Technical Support Specialist",
    ],
    applyUrl: UMP_APPLY_URL,
    fieldTags: ["technology", "practical"],
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },

  // --- Law & Development ---
  {
    id: "ump-llb",
    institutionId: "ump",
    facultyId: "ump-faculty-edbs",
    schoolId: "ump-school-development-studies",
    name: "Bachelor of Laws (LLB)",
    qualificationType: "bachelorsDegree",
    nqfLevel: 8,
    saqaId: "115967",
    duration: "4 years",
    campuses: ["Mbombela"],
    modeOfDelivery: "contact",
    minAps: 32,
    subjectRequirements: [
      { subjectCode: "ENG", minLevel: 5 },
    ],
    additionalRequirements: [
      "NSC Bachelor endorsement required",
      "National Benchmark Test (NBT) may be used for selection placement",
    ],
    careerOutcomes: [
      "Advocate",
      "Attorney",
      "Legal Advisor",
      "Corporate Legal Consultant",
      "Public Prosecutor",
    ],
    applyUrl: UMP_APPLY_URL,
    fieldTags: ["people", "business"],
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ump-ba-media",
    institutionId: "ump",
    facultyId: "ump-faculty-edbs",
    schoolId: "ump-school-development-studies",
    name: "Bachelor of Arts in Media, Communication and Culture",
    qualificationType: "bachelorsDegree",
    nqfLevel: 7,
    saqaId: "101905",
    duration: "3 years",
    campuses: ["Mbombela"],
    modeOfDelivery: "contact",
    minAps: 26,
    subjectRequirements: [
      { subjectCode: "ENG", minLevel: 4 },
    ],
    additionalRequirements: [],
    careerOutcomes: [
      "Media Practitioner",
      "Journalist",
      "Public Relations Officer",
      "Corporate Communication Manager",
      "Digital Content Strategist",
    ],
    applyUrl: UMP_APPLY_URL,
    fieldTags: ["creative", "people"],
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ump-b-development-studies",
    institutionId: "ump",
    facultyId: "ump-faculty-edbs",
    schoolId: "ump-school-development-studies",
    name: "Bachelor of Development Studies",
    qualificationType: "bachelorsDegree",
    nqfLevel: 7,
    saqaId: "97188",
    duration: "3 years",
    campuses: ["Mbombela"],
    modeOfDelivery: "contact",
    minAps: 26,
    subjectRequirements: [
      { subjectCode: "ENG", minLevel: 4 },
    ],
    additionalRequirements: [],
    careerOutcomes: [
      "Development Officer",
      "Community Development Manager",
      "Policy Analyst",
      "NGO Project Coordinator",
      "Public Administrator",
    ],
    applyUrl: UMP_APPLY_URL,
    fieldTags: ["people", "business"],
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },

  // --- Hospitality & Tourism ---
  {
    id: "ump-dip-hospitality",
    institutionId: "ump",
    facultyId: "ump-faculty-edbs",
    schoolId: "ump-school-hospitality",
    name: "Diploma in Hospitality Management",
    qualificationType: "diploma",
    nqfLevel: 6,
    saqaId: "97942",
    duration: "3 years",
    campuses: ["Mbombela"],
    modeOfDelivery: "contact",
    minAps: 22,
    subjectRequirements: [
      { subjectCode: "ENG", minLevel: 3 },
    ],
    additionalRequirements: [
      "Hospitality Studies or Consumer Studies is recommended",
    ],
    careerOutcomes: [
      "Hotel Operations Manager",
      "Event Coordinator",
      "Food and Beverage Manager",
      "Guest Relations Officer",
    ],
    applyUrl: UMP_APPLY_URL,
    fieldTags: ["practical", "business"],
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ump-dip-culinary",
    institutionId: "ump",
    facultyId: "ump-faculty-edbs",
    schoolId: "ump-school-hospitality",
    name: "Diploma in Culinary Arts",
    qualificationType: "diploma",
    nqfLevel: 6,
    saqaId: "110940",
    duration: "3 years",
    campuses: ["Mbombela"],
    modeOfDelivery: "contact",
    minAps: 22,
    subjectRequirements: [
      { subjectCode: "ENG", minLevel: 3 },
    ],
    additionalRequirements: [],
    careerOutcomes: [
      "Chef de Partie",
      "Sous Chef",
      "Catering Manager",
      "Culinary Business Entrepreneur",
    ],
    applyUrl: UMP_APPLY_URL,
    fieldTags: ["creative", "practical"],
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },

  // --- Business & Accounting ---
  {
    id: "ump-bcom-general",
    institutionId: "ump",
    facultyId: "ump-faculty-edbs",
    schoolId: "ump-school-accounting",
    name: "Bachelor of Commerce (General)",
    qualificationType: "bachelorsDegree",
    nqfLevel: 7,
    saqaId: "101906",
    duration: "3 years",
    campuses: ["Mbombela"],
    modeOfDelivery: "contact",
    minAps: 28,
    subjectRequirements: [
      { subjectCode: "ENG", minLevel: 4 },
      { subjectCode: "MAT", minLevel: 4 },
    ],
    additionalRequirements: [
      "Mathematical Literacy accepted at Level 6 with min APS of 30",
    ],
    careerOutcomes: [
      "Financial Accountant",
      "Business Analyst",
      "Market Researcher",
      "Financial Services Advisor",
    ],
    applyUrl: UMP_APPLY_URL,
    fieldTags: ["business"],
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },

  // --- Agriculture & Science ---
  {
    id: "ump-bsc-agric",
    institutionId: "ump",
    facultyId: "ump-faculty-fans",
    schoolId: "ump-school-agriculture",
    name: "Bachelor of Science in Agriculture",
    qualificationType: "bachelorsDegree",
    nqfLevel: 8,
    saqaId: "97941",
    duration: "4 years",
    campuses: ["Mbombela"],
    modeOfDelivery: "contact",
    minAps: 26,
    subjectRequirements: [
      { subjectCode: "ENG", minLevel: 4 },
      { subjectCode: "MAT", minLevel: 4 },
      { subjectCode: "PHS", minLevel: 4 },
    ],
    additionalRequirements: [
      "Life Sciences at Level 4 recommended",
    ],
    careerOutcomes: [
      "Agricultural Scientist",
      "Agronomist",
      "Crop Production Manager",
      "Soil Scientist",
      "Agricultural Consultant",
    ],
    applyUrl: UMP_APPLY_URL,
    fieldTags: ["science", "practical"],
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ump-bsc-general",
    institutionId: "ump",
    facultyId: "ump-faculty-fans",
    schoolId: "ump-school-biology",
    name: "Bachelor of Science (General)",
    qualificationType: "bachelorsDegree",
    nqfLevel: 7,
    saqaId: "97940",
    duration: "3 years",
    campuses: ["Mbombela"],
    modeOfDelivery: "contact",
    minAps: 26,
    subjectRequirements: [
      { subjectCode: "ENG", minLevel: 4 },
      { subjectCode: "MAT", minLevel: 4 },
      { subjectCode: "PHS", minLevel: 4 },
    ],
    additionalRequirements: [
      "Life Sciences Level 4 required for Biological Science majors",
    ],
    careerOutcomes: [
      "Research Scientist",
      "Environmental Consultant",
      "Laboratory Analyst",
      "Ecologist",
    ],
    applyUrl: UMP_APPLY_URL,
    fieldTags: ["science"],
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },

  // --- Education ---
  {
    id: "ump-bed-foundation",
    institutionId: "ump",
    facultyId: "ump-faculty-edu",
    schoolId: "ump-school-education",
    name: "Bachelor of Education in Foundation Phase Teaching",
    qualificationType: "bachelorsDegree",
    nqfLevel: 7,
    saqaId: "97938",
    duration: "4 years",
    campuses: ["Siyabuswa"],
    modeOfDelivery: "contact",
    minAps: 26,
    subjectRequirements: [
      { subjectCode: "ENG", minLevel: 4 },
    ],
    additionalRequirements: [
      "siswati or isiNdebele Home Language or First Additional Language recommended",
    ],
    careerOutcomes: [
      "Foundation Phase Educator (Grades R-3)",
      "Early Childhood Development Specialist",
      "Education Administrator",
    ],
    applyUrl: UMP_APPLY_URL,
    fieldTags: ["people"],
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "ump-bed-intermediate",
    institutionId: "ump",
    facultyId: "ump-faculty-edu",
    schoolId: "ump-school-education",
    name: "Bachelor of Education in Intermediate Phase Teaching",
    qualificationType: "bachelorsDegree",
    nqfLevel: 7,
    saqaId: "97939",
    duration: "4 years",
    campuses: ["Siyabuswa"],
    modeOfDelivery: "contact",
    minAps: 26,
    subjectRequirements: [
      { subjectCode: "ENG", minLevel: 4 },
    ],
    additionalRequirements: [
      "Mathematics or Natural Sciences at Level 4 required for respective teaching specializations",
    ],
    careerOutcomes: [
      "Intermediate Phase Educator (Grades 4-6)",
      "School Subject Advisor",
      "Curriculum Developer",
    ],
    applyUrl: UMP_APPLY_URL,
    fieldTags: ["people"],
    sourceUrl: UMP_SOURCE_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
];

// ---------------------------------------------------------------------------
// UMP APPLICATION WINDOWS
// ---------------------------------------------------------------------------

export const UMP_APPLICATION_WINDOWS: ApplicationWindow[] = [
  {
    id: "ump-window-2027",
    institutionId: "ump",
    programmeId: null, // applies institution-wide
    opensOn: "2026-06-01",
    closesOn: "2026-11-30",
    lateClosesOn: "2026-12-15",
    status: "open",
    sourceUrl: UMP_APPLY_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
];

// ---------------------------------------------------------------------------
// UMP APS RULE
// ---------------------------------------------------------------------------

export const UMP_APS_RULE: ApsRule = {
  id: "ump-aps-rule",
  institutionId: "ump",
  scaleName: "UMP Standard 7-Point Scale",
  formulaType: "pointBandSum",
  bands: STANDARD_NSC_SCALE,
  usesRawPercentage: false,
  loPolicy: "exclude",
  bestNSubjects: 6,
  excludedSubjects: [],
  mathLitPolicy: "equal",
  nbtPolicy: "none",
  bonusRules: [],
  maxScore: 42,
  notes: "University of Mpumalanga APS score is calculated on best 6 NSC subjects excluding Life Orientation.",
  sourceUrl: UMP_SOURCE_URL,
  verifiedOn: VERIFIED_ON,
  academicYear: ACADEMIC_YEAR,
};

