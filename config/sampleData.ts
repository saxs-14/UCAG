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
  Faculty,
  Institution,
  Programme,
  School,
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
