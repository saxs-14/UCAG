/**
 * Verified Nelson Mandela University (NMU) Seed Dataset.
 *
 * Every record here has full provenance (sourceUrl, verifiedOn,
 * academicYear) per the core trust primitive in lib/firestore/types.ts
 * and CLAUDE.md.
 *
 * Scope: Faculty of Health Sciences only. NMU's own PDF prospectus
 * (Faculty of Health Sciences Prospectus 2026, fetched directly from
 * mandela.ac.za and read locally) is the only source that published
 * real, programme-specific Applicant Score (AS) and subject-percentage
 * thresholds found during research -- the Business and Economic
 * Sciences and Engineering faculty pages listed real programme names
 * and qualification codes but rendered their AS/subject requirements
 * via client-side JS that WebFetch could not capture, so those
 * faculties are deliberately NOT included here rather than filled with
 * approximated numbers. Extending this file to more NMU faculties, once
 * their real admission numbers are found, is a data operation, not a
 * code change.
 *
 * NMU's own Applicant Score (AS) rule (best 6 subjects out of 600,
 * raw-percentage-sum, LO excluded, quintile 1-3 bonus) already exists
 * in scripts/seed-real-aps-rules.mts -- not duplicated here. minAps
 * values below are on that same 600-point raw-percentage-sum scale,
 * consistent with NMU's own source document.
 */

import type { ApplicationWindow, Faculty, Programme, School } from "@/lib/firestore/types";
import { CURRENT_ACADEMIC_YEAR } from "./academicYear";

const NMU_HEALTH_PDF =
  "https://www.mandela.ac.za/health-new/media/Store/Documents/Prospectus/2026-Prospectus-Faculty-of-Health-Sciences.pdf";
const NMU_ADMISSION_URL = "https://www.mandela.ac.za/Study-at-Mandela/Discovery/Entry-requirements";
const NMU_APPLY_URL = "https://www.mandela.ac.za/study-at-mandela/application/apply-undergraduate";
const VERIFIED_ON = "2026-09-26";
const ACADEMIC_YEAR = CURRENT_ACADEMIC_YEAR;

// ---------------------------------------------------------------------------
// NMU FACULTIES
// ---------------------------------------------------------------------------

export const NMU_FACULTIES: Faculty[] = [
  { id: "nmu-faculty-health", institutionId: "nmu", name: "Faculty of Health Sciences", code: "FHS", sourceUrl: NMU_HEALTH_PDF, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
];

// ---------------------------------------------------------------------------
// NMU SCHOOLS
// ---------------------------------------------------------------------------

export const NMU_SCHOOLS: School[] = [
  { id: "nmu-school-behavioural-lifestyle", facultyId: "nmu-faculty-health", name: "School of Behavioural and Lifestyle Sciences", code: "SBLS", sourceUrl: NMU_HEALTH_PDF, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "nmu-school-clinical-care-medicinal", facultyId: "nmu-faculty-health", name: "School of Clinical Care and Medicinal Sciences", code: "SCCMS", sourceUrl: NMU_HEALTH_PDF, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "nmu-school-medicine", facultyId: "nmu-faculty-health", name: "School of Medicine", code: "SOM", sourceUrl: NMU_HEALTH_PDF, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
];

// ---------------------------------------------------------------------------
// NMU PROGRAMMES
// ---------------------------------------------------------------------------

export const NMU_PROGRAMMES: Programme[] = [
  {
    id: "nmu-ba-psychology", institutionId: "nmu", facultyId: "nmu-faculty-health", schoolId: "nmu-school-behavioural-lifestyle",
    name: "Bachelor of Arts in Psychology", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: "87240",
    duration: "3 years", campuses: ["South Campus"], modeOfDelivery: "contact", minAps: 350,
    subjectRequirements: [{ subjectCode: "MATH", minLevel: 3 }],
    additionalRequirements: [
      "Applicant Score (AS) of 350 with NSC Mathematics/Technical Mathematics at 45%+, or AS of 365 with Mathematical Literacy at 65%+.",
      "AS calculated on NMU's own 600-point raw-percentage-sum scale (best 6 subjects, Life Orientation excluded).",
    ],
    careerOutcomes: ["Psychologist (with further registration)", "HR Practitioner", "Counsellor"],
    applyUrl: NMU_APPLY_URL, fieldTags: ["people"], sourceUrl: NMU_HEALTH_PDF, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nmu-bsocial-work", institutionId: "nmu", facultyId: "nmu-faculty-health", schoolId: "nmu-school-behavioural-lifestyle",
    name: "Bachelor of Social Work", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: "101526",
    duration: "4 years", campuses: ["South Campus"], modeOfDelivery: "contact", minAps: 350,
    subjectRequirements: [{ subjectCode: "MATH", minLevel: 3 }],
    additionalRequirements: [
      "Applicant Score (AS) of 350 with NSC Mathematics/Technical Mathematics at 40%+, or AS of 365 with Mathematical Literacy at 65%+.",
      "Admission is subject to Departmental Selection.",
      "Registration as a student social worker with the SACSSP and a clean Police Clearance Certificate are required before entering second-year practicum.",
    ],
    careerOutcomes: ["Social Worker"],
    applyUrl: NMU_APPLY_URL, fieldTags: ["people"], sourceUrl: NMU_HEALTH_PDF, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nmu-benv-health", institutionId: "nmu", facultyId: "nmu-faculty-health", schoolId: "nmu-school-behavioural-lifestyle",
    name: "Bachelor of Environmental Health", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: "91805",
    duration: "4 years", campuses: ["North Campus"], modeOfDelivery: "contact", minAps: 390,
    subjectRequirements: [{ subjectCode: "MATH", minLevel: 4 }, { subjectCode: "PHS", minLevel: 4 }, { subjectCode: "LFS", minLevel: 4 }],
    additionalRequirements: [
      "NSC Mathematics at 50%+, Physical Sciences at 50%+, Life Sciences at 50%+.",
      "Admission is subject to Departmental Selection.",
      "Registration with the HPCSA is required from the start of first year.",
    ],
    careerOutcomes: ["Environmental Health Practitioner"],
    applyUrl: NMU_APPLY_URL, fieldTags: ["science"], sourceUrl: NMU_HEALTH_PDF, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nmu-bsc-dietetics", institutionId: "nmu", facultyId: "nmu-faculty-health", schoolId: "nmu-school-behavioural-lifestyle",
    name: "Bachelor of Science in Dietetics", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: "90501",
    duration: "4 years", campuses: ["South Campus"], modeOfDelivery: "contact", minAps: 390,
    subjectRequirements: [{ subjectCode: "MATH", minLevel: 6 }, { subjectCode: "PHS", minLevel: 6 }],
    additionalRequirements: [
      "NSC Mathematics at 60%+, Physical Sciences at 60%+.",
      "Registration with the HPCSA required from first year, group registration facilitated by the department.",
    ],
    careerOutcomes: ["Dietitian", "Nutritionist"],
    applyUrl: NMU_APPLY_URL, fieldTags: ["science"], sourceUrl: NMU_HEALTH_PDF, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nmu-bnursing", institutionId: "nmu", facultyId: "nmu-faculty-health", schoolId: "nmu-school-clinical-care-medicinal",
    name: "Bachelor of Nursing", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: "92062",
    duration: "4 years", campuses: ["North Campus"], modeOfDelivery: "contact", minAps: 370,
    subjectRequirements: [{ subjectCode: "MATH", minLevel: 4 }, { subjectCode: "PHS", minLevel: 4 }, { subjectCode: "LFS", minLevel: 6 }],
    additionalRequirements: [
      "Applicant Score (AS) of 370 with Mathematics at 50%+, or AS of 385 with Mathematical Literacy at 65%+.",
      "Physical Sciences at 50%+, Life Sciences at 60%+.",
      "Minimum 3000 clinical hours required across the qualification; SANC student registration compulsory before commencing study.",
    ],
    careerOutcomes: ["Registered Nurse"],
    applyUrl: NMU_APPLY_URL, fieldTags: ["science", "people"], sourceUrl: NMU_HEALTH_PDF, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nmu-bpharm", institutionId: "nmu", facultyId: "nmu-faculty-health", schoolId: "nmu-school-clinical-care-medicinal",
    name: "Bachelor of Pharmacy", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: "91933",
    duration: "4 years", campuses: ["South Campus"], modeOfDelivery: "contact", minAps: 410,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 4 }, { subjectCode: "MATH", minLevel: 6 }, { subjectCode: "PHS", minLevel: 6 }],
    additionalRequirements: [
      "Minimum Applicant Score (AS) of 410; Home Language or English First Additional Language at 50%+, Mathematics at 60%+, Physical Sciences at 60%+.",
      "Highly competitive stratified selection process: 20% of offers go immediately to applicants with AS >= 450; remaining offers stratified across first-time entrants, Quintile 1-3 schools, prior-qualification applicants, international and articulation applicants.",
      "Early/change-of-qualification applications open 1 April 2026 and close 30 June 2026.",
    ],
    careerOutcomes: ["Pharmacist"],
    applyUrl: NMU_APPLY_URL, fieldTags: ["science", "people"], sourceUrl: NMU_HEALTH_PDF, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nmu-bradiography", institutionId: "nmu", facultyId: "nmu-faculty-health", schoolId: "nmu-school-clinical-care-medicinal",
    name: "Bachelor of Radiography in Diagnostics", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: "91792",
    duration: "4 years", campuses: ["North Campus"], modeOfDelivery: "contact", minAps: 390,
    subjectRequirements: [{ subjectCode: "MATH", minLevel: 4 }, { subjectCode: "PHS", minLevel: 4 }, { subjectCode: "LFS", minLevel: 4 }],
    additionalRequirements: [
      "NSC Mathematics at 50%+, Physical Sciences at 50%+, Life Sciences at 50%+.",
      "Very limited annual intake; admission subject to the Radiography Selection Committee. Applicants must be physically fit and submit a satisfactory medical report.",
    ],
    careerOutcomes: ["Diagnostic Radiographer"],
    applyUrl: NMU_APPLY_URL, fieldTags: ["science", "technology"], sourceUrl: NMU_HEALTH_PDF, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nmu-mbchb", institutionId: "nmu", facultyId: "nmu-faculty-health", schoolId: "nmu-school-medicine",
    name: "Bachelor of Medicine and Bachelor of Surgery (MBChB)", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: "112488",
    duration: "6 years", campuses: ["Missionvale Campus"], modeOfDelivery: "contact", minAps: 430,
    subjectRequirements: [{ subjectCode: "ENG-HL", minLevel: 6 }, { subjectCode: "MATH", minLevel: 6 }, { subjectCode: "PHS", minLevel: 6 }, { subjectCode: "LFS", minLevel: 6 }],
    additionalRequirements: [
      "English (home language or first additional language), Mathematics, Physical Sciences and Life Sciences each at 60%+.",
      "Selection is a stratified, multi-phase process combining academic ranking with an additional screening process for shortlisted applicants -- meeting the minimum AS does not guarantee admission due to strictly limited places.",
      "Closing date for 2027 new intake is 30 June 2026.",
    ],
    careerOutcomes: ["Medical Doctor"],
    applyUrl: NMU_APPLY_URL, fieldTags: ["science", "people"], sourceUrl: NMU_HEALTH_PDF, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
];

// ---------------------------------------------------------------------------
// NMU APPLICATION WINDOWS
// ---------------------------------------------------------------------------

export const NMU_APPLICATION_WINDOWS: ApplicationWindow[] = [
  {
    id: "nmu-window-2027-general",
    institutionId: "nmu",
    programmeId: null,
    opensOn: "2026-04-01",
    closesOn: "2026-08-02",
    lateClosesOn: "2026-09-30",
    status: "open",
    sourceUrl: NMU_ADMISSION_URL,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nmu-window-2027-pharmacy",
    institutionId: "nmu",
    programmeId: "nmu-bpharm",
    opensOn: "2026-04-01",
    closesOn: "2026-06-30",
    lateClosesOn: null,
    status: "open",
    sourceUrl: NMU_HEALTH_PDF,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    id: "nmu-window-2027-mbchb",
    institutionId: "nmu",
    programmeId: "nmu-mbchb",
    opensOn: "2026-04-01",
    closesOn: "2026-06-30",
    lateClosesOn: null,
    status: "open",
    sourceUrl: NMU_HEALTH_PDF,
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
];
