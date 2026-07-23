/**
 * SAMPLE DATA ONLY. Nothing in this file is real -- no real institution,
 * programme, APS rule, or application date. It exists purely so Phase 3's
 * matching/results UI can be demonstrated end to end before Phase 4's
 * ingestion pipeline produces actual verified programme catalogues.
 *
 * This is deliberately kept out of config/institutions.seed.ts and out of
 * anything that could be mistaken for real seed data -- every name below
 * is prefixed "[Sample]" specifically so it can never be confused with a
 * real Tier 1/2 institution on screen. Do not attach this data to any
 * real institution id (ump/up/wits/etc.) -- that would be exactly the
 * "invented fact a learner acts on" CLAUDE.md forbids.
 */

import { STANDARD_NSC_SCALE } from "./aps-scales";
import type {
  ApplicationWindow,
  ApsRule,
  Bursary,
  Faculty,
  Institution,
  Internship,
  Programme,
  School,
  Statistic,
} from "@/lib/firestore/types";

const SAMPLE_VERIFIED_ON = "2026-07-23";
const SAMPLE_ACADEMIC_YEAR = 2027;
const SAMPLE_SOURCE_URL = "https://example.test/not-a-real-source";

export const SAMPLE_INSTITUTION: Institution = {
  id: "sample-university",
  name: "[Sample] Demo University",
  shortName: "[Sample] DU",
  type: "traditionalUniversity",
  province: "N/A -- fictional",
  tier: 3,
  campuses: ["Sample Campus"],
  websiteUrl: "https://example.test/",
  applicationPortalUrl: "https://example.test/apply",
  appliesThroughThirdParty: null,
  statusCheckUrl: "https://example.test/status",
  nbtRequired: false,
  logoUrl: null,
  sourceUrl: SAMPLE_SOURCE_URL,
  verifiedOn: SAMPLE_VERIFIED_ON,
  academicYear: SAMPLE_ACADEMIC_YEAR,
};

export const SAMPLE_FACULTY: Faculty = {
  id: "sample-faculty-science",
  institutionId: SAMPLE_INSTITUTION.id,
  name: "[Sample] Faculty of Science & Technology",
  code: "SCI",
  sourceUrl: SAMPLE_SOURCE_URL,
  verifiedOn: SAMPLE_VERIFIED_ON,
  academicYear: SAMPLE_ACADEMIC_YEAR,
};

export const SAMPLE_SCHOOL: School = {
  id: "sample-school-computing",
  facultyId: SAMPLE_FACULTY.id,
  name: "[Sample] School of Computing",
  code: "COMP",
  sourceUrl: SAMPLE_SOURCE_URL,
  verifiedOn: SAMPLE_VERIFIED_ON,
  academicYear: SAMPLE_ACADEMIC_YEAR,
};

/** Uses the standard 7-point scale, LO excluded, best 6 -- a plausible
 * but entirely fictional rule, not any real institution's verified formula. */
export const SAMPLE_APS_RULE: ApsRule = {
  id: "sample-aps-rule",
  institutionId: SAMPLE_INSTITUTION.id,
  scaleName: "[Sample] 7-point scale",
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
  notes: "Fictional rule for demo purposes only.",
  sourceUrl: SAMPLE_SOURCE_URL,
  verifiedOn: SAMPLE_VERIFIED_ON,
  academicYear: SAMPLE_ACADEMIC_YEAR,
};

export const SAMPLE_PROGRAMMES: Programme[] = [
  {
    id: "sample-bsc-cs",
    institutionId: SAMPLE_INSTITUTION.id,
    facultyId: SAMPLE_FACULTY.id,
    schoolId: SAMPLE_SCHOOL.id,
    name: "[Sample] BSc Computer Science",
    qualificationType: "bachelorsDegree",
    nqfLevel: 7,
    saqaId: null,
    duration: "3 years",
    campuses: ["Sample Campus"],
    modeOfDelivery: "contact",
    minAps: 30,
    subjectRequirements: [
      { subjectCode: "MATH", minLevel: 5 },
      { subjectCode: "PHS", minLevel: 4 },
    ],
    additionalRequirements: [],
    careerOutcomes: ["Software Developer", "Data Analyst"],
    applyUrl: "https://example.test/apply/bsc-cs",
    sourceUrl: SAMPLE_SOURCE_URL,
    verifiedOn: SAMPLE_VERIFIED_ON,
    academicYear: SAMPLE_ACADEMIC_YEAR,
  },
  {
    id: "sample-bcom-accounting",
    institutionId: SAMPLE_INSTITUTION.id,
    facultyId: SAMPLE_FACULTY.id,
    schoolId: SAMPLE_SCHOOL.id,
    name: "[Sample] BCom Accounting",
    qualificationType: "bachelorsDegree",
    nqfLevel: 7,
    saqaId: null,
    duration: "3 years",
    campuses: ["Sample Campus"],
    modeOfDelivery: "contact",
    minAps: 26,
    subjectRequirements: [
      { subjectCode: "MATH", minLevel: 4 },
      { subjectCode: "ACC", minLevel: 4 },
    ],
    additionalRequirements: [],
    careerOutcomes: ["Chartered Accountant", "Financial Analyst"],
    applyUrl: null, // deliberately unset -- exercises the "open but no link on record" CTA path
    sourceUrl: SAMPLE_SOURCE_URL,
    verifiedOn: SAMPLE_VERIFIED_ON,
    academicYear: SAMPLE_ACADEMIC_YEAR,
  },
  {
    id: "sample-higher-cert-it",
    institutionId: SAMPLE_INSTITUTION.id,
    facultyId: SAMPLE_FACULTY.id,
    schoolId: SAMPLE_SCHOOL.id,
    name: "[Sample] Higher Certificate in Information Technology",
    qualificationType: "higherCertificate",
    nqfLevel: 5,
    saqaId: null,
    duration: "1 year",
    campuses: ["Sample Campus"],
    modeOfDelivery: "blended",
    minAps: 18,
    subjectRequirements: [],
    additionalRequirements: [],
    careerOutcomes: ["IT Support Technician"],
    applyUrl: "https://example.test/apply/higher-cert-it",
    sourceUrl: SAMPLE_SOURCE_URL,
    verifiedOn: SAMPLE_VERIFIED_ON,
    academicYear: SAMPLE_ACADEMIC_YEAR,
  },
];

/** One window per programme, deliberately covering all four application
 * statuses so the demo exercises every CTA branch in lib/applicationStatus.ts. */
export const SAMPLE_APPLICATION_WINDOWS: ApplicationWindow[] = [
  {
    id: "sample-window-bsc-cs",
    institutionId: SAMPLE_INSTITUTION.id,
    programmeId: "sample-bsc-cs",
    opensOn: "2026-04-01",
    closesOn: "2026-11-30",
    lateClosesOn: null,
    status: "open",
    sourceUrl: SAMPLE_SOURCE_URL,
    verifiedOn: SAMPLE_VERIFIED_ON,
    academicYear: SAMPLE_ACADEMIC_YEAR,
  },
  {
    id: "sample-window-bcom",
    institutionId: SAMPLE_INSTITUTION.id,
    programmeId: "sample-bcom-accounting",
    opensOn: "2026-04-01",
    closesOn: "2026-11-30",
    lateClosesOn: null,
    status: "open",
    sourceUrl: SAMPLE_SOURCE_URL,
    verifiedOn: SAMPLE_VERIFIED_ON,
    academicYear: SAMPLE_ACADEMIC_YEAR,
  },
  {
    id: "sample-window-higher-cert",
    institutionId: SAMPLE_INSTITUTION.id,
    programmeId: "sample-higher-cert-it",
    opensOn: "2027-01-10",
    closesOn: "2027-02-28",
    lateClosesOn: null,
    status: "openingSoon",
    sourceUrl: SAMPLE_SOURCE_URL,
    verifiedOn: SAMPLE_VERIFIED_ON,
    academicYear: SAMPLE_ACADEMIC_YEAR,
  },
];

/** Fictional bursaries for demoing the Phase 5 bursaries page. Real
 * bursary sourcing/verification is Phase 4 ingestion territory (not yet
 * live -- see README status) -- these exist only to prove the filter/
 * deadline/scam-safety UI works, never to be mistaken for a real offer. */
export const SAMPLE_BURSARIES: Bursary[] = [
  {
    id: "sample-bursary-stem",
    name: "[Sample] STEM Futures Bursary",
    provider: "[Sample] Futures Trust",
    fieldsOfStudy: ["Computer Science", "Information Technology", "Engineering"],
    levelRequired: "matricOnly",
    closesOn: "2027-09-30",
    value: "Full tuition, accommodation, and a laptop allowance",
    criteria: ["Matric with 70%+ average in Mathematics", "South African citizen"],
    applyUrl: "https://example.test/apply/stem-bursary",
    riskFlags: [],
    sourceUrl: SAMPLE_SOURCE_URL,
    verifiedOn: SAMPLE_VERIFIED_ON,
    academicYear: SAMPLE_ACADEMIC_YEAR,
  },
  {
    id: "sample-bursary-commerce",
    name: "[Sample] Commerce Leaders Bursary",
    provider: "[Sample] National Business Federation",
    fieldsOfStudy: ["Accounting", "Commerce", "Business"],
    levelRequired: "currentlyEnrolled",
    closesOn: "2027-05-31",
    value: "R60 000 per year",
    criteria: ["Enrolled in a Commerce-related degree", "Household income under R450 000/year"],
    applyUrl: "https://example.test/apply/commerce-bursary",
    riskFlags: [],
    sourceUrl: SAMPLE_SOURCE_URL,
    verifiedOn: SAMPLE_VERIFIED_ON,
    academicYear: SAMPLE_ACADEMIC_YEAR,
  },
  {
    id: "sample-bursary-postgrad-engineering",
    name: "[Sample] Postgraduate Engineering Fellowship",
    provider: "[Sample] Engineering Council Trust",
    fieldsOfStudy: ["Engineering"],
    levelRequired: "completedQualification",
    closesOn: "2027-03-15",
    value: "Full postgraduate tuition",
    criteria: ["Completed a Bachelor's in an Engineering field", "Accepted into a postgraduate programme"],
    applyUrl: "https://example.test/apply/engineering-fellowship",
    riskFlags: [],
    sourceUrl: SAMPLE_SOURCE_URL,
    verifiedOn: SAMPLE_VERIFIED_ON,
    academicYear: SAMPLE_ACADEMIC_YEAR,
  },
];

/** Fictional internships, same caveats as SAMPLE_BURSARIES above. The
 * brief calls out matric-only internships as a first-class filter, not a
 * buried checkbox -- sample data below deliberately includes both
 * matric-only and post-qualification listings to exercise that filter. */
export const SAMPLE_INTERNSHIPS: Internship[] = [
  {
    id: "sample-internship-it-matric",
    title: "[Sample] IT Support Learnership",
    provider: "[Sample] TechForward (Pty) Ltd",
    fieldsOfStudy: ["Information Technology", "Computer Science"],
    minQualification: "NSC (matric)",
    matricOnly: true,
    province: "Gauteng",
    closesOn: "2027-08-31",
    applyUrl: "https://example.test/apply/it-learnership",
    sourceUrl: SAMPLE_SOURCE_URL,
    verifiedOn: SAMPLE_VERIFIED_ON,
    academicYear: SAMPLE_ACADEMIC_YEAR,
  },
  {
    id: "sample-internship-graduate-commerce",
    title: "[Sample] Graduate Finance Internship",
    provider: "[Sample] National Business Federation",
    fieldsOfStudy: ["Accounting", "Commerce"],
    minQualification: "Completed Bachelor's degree",
    matricOnly: false,
    province: null,
    closesOn: "2027-06-30",
    applyUrl: "https://example.test/apply/finance-internship",
    sourceUrl: SAMPLE_SOURCE_URL,
    verifiedOn: SAMPLE_VERIFIED_ON,
    academicYear: SAMPLE_ACADEMIC_YEAR,
  },
];

/** Fictional statistics -- exist only to prove a chart CAN render once a
 * statistic is fully verified. Every real dataset (DHET/DBE enrolment,
 * graduation, NSC pass-rate figures) has zero entries here on purpose:
 * extracting real numbers out of the PDF-only sources in
 * config/sources.seed.ts is Phase 4 ingestion work that isn't live yet,
 * so those charts correctly show "data pending verification" instead of
 * a fabricated number. See lib/statistics/select.ts for the gate that
 * enforces this. */
export const SAMPLE_STATISTICS: Statistic[] = [
  {
    id: "sample-stat-enrolments-2024",
    dataset: "sample-higher-ed-enrolments",
    dimension: "2024",
    metric: "Total first-time undergraduate enrolments",
    value: 142000,
    unit: "learners",
    sourceUrl: SAMPLE_SOURCE_URL,
    verifiedOn: SAMPLE_VERIFIED_ON,
    publisher: "[Sample] Fictional Publisher",
    year: 2024,
  },
  {
    id: "sample-stat-enrolments-2023",
    dataset: "sample-higher-ed-enrolments",
    dimension: "2023",
    metric: "Total first-time undergraduate enrolments",
    value: 138500,
    unit: "learners",
    sourceUrl: SAMPLE_SOURCE_URL,
    verifiedOn: SAMPLE_VERIFIED_ON,
    publisher: "[Sample] Fictional Publisher",
    year: 2023,
  },
];

/** All fields of study represented in the sample bursary/internship data
 * -- used to populate the filter dropdown. Once Phase 4 ingestion feeds
 * real listings, this becomes a derived/aggregated value, not a fixed list. */
export const SAMPLE_FIELDS_OF_STUDY = Array.from(
  new Set([
    ...SAMPLE_BURSARIES.flatMap((b) => b.fieldsOfStudy),
    ...SAMPLE_INTERNSHIPS.flatMap((i) => i.fieldsOfStudy),
  ])
).sort();
