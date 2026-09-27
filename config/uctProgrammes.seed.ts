/**
 * Verified University of Cape Town (UCT) Seed Dataset.
 *
 * Every record here has full provenance (sourceUrl, verifiedOn,
 * academicYear) per the core trust primitive in lib/firestore/types.ts
 * and CLAUDE.md.
 *
 * UCT has no single university-wide APS formula (see the header comment
 * in scripts/seed-real-aps-rules.mts) -- each faculty here has its own
 * ApsRule (facultyId set), resolved via lib/matching/resolveApsRule.ts.
 * Only 2 of UCT's faculties are seeded so far, both because their real
 * Faculty Points Score (FPS) formula and real per-programme numeric
 * cutoffs were found on the faculty's own official PDF (not just a
 * general prospectus description):
 *
 * - Faculty of Engineering and the Built Environment (EBE): real,
 *   dated "NSC Entrance Requirements" PDF with an exact worked FPS
 *   definition and a full per-programme Band A/B/C table (source:
 *   ebe.uct.ac.za). Only the 4 core Engineering streams (Chemical,
 *   Civil, Mechanical, Electrical) are included -- they all share the
 *   identical "English + Mathematics + Physical Science forced, plus
 *   the 3 next-best subjects, out of 600" formula. Construction
 *   Studies, Property Studies, Architectural Studies, and Geomatics use
 *   a DIFFERENT variant (English + Mathematics forced, plus 4 next-best,
 *   no forced Physical Science) plus, for Architecture, a portfolio
 *   score that isn't a subject mark at all -- deliberately left out
 *   rather than forced into the same ApsRule and silently misrepresented.
 * - Faculty of Science: real, dated "Admission Guidelines" PDF
 *   (science.uct.ac.za) with an exact worked FPS example (verified
 *   against the engine's own computation in this file's programmes) and
 *   a full Band A/B/C table.
 *
 * UCT's Faculty of Commerce is real and confirmed to use its own "cut
 * off FPS" system too (per UCT's 2027 Directions for Undergraduate
 * Applicants), but no PDF with Commerce's own exact formula/cutoff
 * numbers was found this session -- not guessed at, left for later.
 *
 * The real WPS (Weighted Points Score) redress/disadvantage adjustment
 * mentioned by both faculties (FPS adjusted by 0-10% based on an
 * applicant's school/family background data) is NOT computed here --
 * this app's calculator doesn't collect that background data. Every
 * programme's minAps uses the real, published Band A ("guaranteed
 * admission") FPS threshold instead, with the WPS/Band B/C nuance
 * described honestly in additionalRequirements.
 */

import type { ApplicationWindow, Faculty, Programme, School } from "@/lib/firestore/types";
import { CURRENT_ACADEMIC_YEAR } from "./academicYear";

const UCT_EBE_URL =
  "https://ebe.uct.ac.za/sites/default/files/media/documents/ebe_uct_ac_za/53/2026-ebe-nsc-entry-requirements.pdf";
const UCT_SCIENCE_URL =
  "https://science.uct.ac.za/sites/default/files/media/documents/2025%20Science%20UG%20Admissions%20Criteria.pdf";
const UCT_APPLY_URL = "https://applyonline.uct.ac.za/";
const VERIFIED_ON = "2026-09-27";
const ACADEMIC_YEAR = CURRENT_ACADEMIC_YEAR;

// ---------------------------------------------------------------------------
// UCT FACULTIES (2 of UCT's real faculties -- see file header)
// ---------------------------------------------------------------------------

export const UCT_FACULTIES: Faculty[] = [
  { id: "uct-faculty-ebe", institutionId: "uct", name: "Faculty of Engineering and the Built Environment", code: "EBE", sourceUrl: UCT_EBE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "uct-faculty-science", institutionId: "uct", name: "Faculty of Science", code: "SCI", sourceUrl: UCT_SCIENCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
];

// ---------------------------------------------------------------------------
// UCT SCHOOLS -- UCT's own documents don't publish named sub-schools
// within these faculties; each school mirrors its own faculty 1:1, the
// same fallback pattern already used for TUT/NWU/NMU/Stellenbosch.
// ---------------------------------------------------------------------------

export const UCT_SCHOOLS: School[] = [
  { id: "uct-school-ebe", facultyId: "uct-faculty-ebe", name: "Faculty of Engineering and the Built Environment", code: "EBE", sourceUrl: UCT_EBE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
  { id: "uct-school-science", facultyId: "uct-faculty-science", name: "Faculty of Science", code: "SCI", sourceUrl: UCT_SCIENCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR },
];

// ---------------------------------------------------------------------------
// UCT PROGRAMMES
// ---------------------------------------------------------------------------

export const UCT_PROGRAMMES: Programme[] = [
  // --- Faculty of Engineering and the Built Environment (Upper Campus) ---
  // All 4 share the real "Band A" FPS=500 guaranteed-admission threshold.
  {
    id: "uct-beng-chemical-engineering", institutionId: "uct", facultyId: "uct-faculty-ebe", schoolId: "uct-school-ebe",
    name: "Bachelor of Science in Engineering in Chemical Engineering", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Upper Campus"], modeOfDelivery: "contact", minAps: 500,
    subjectRequirements: [{ subjectCode: "MATH", minPercent: 80 }, { subjectCode: "PHS", minPercent: 70 }],
    additionalRequirements: [
      "Band A (guaranteed admission): FPS of 500 or above, Mathematics >= 80%, Physical Sciences >= 70%.",
      "Band B (admission likely): Weighted Points Score (WPS, FPS adjusted by up to 10% for school/home background) of 480 or above, same subject minimums.",
      "Band C (admission possible, SA applicants in targeted redress race groups only): FPS of 420 or above, same subject minimums.",
      "FPS = English% + Mathematics% + Physical Sciences% + your next 3 best subjects (excluding Life Orientation), out of 600.",
      "Mathematical Literacy or Technical Mathematics cannot substitute for Mathematics; Technical Science cannot substitute for Physical Sciences.",
      "Must write the National Benchmark Tests (Mathematics, Academic Literacy, Quantitative Literacy) -- results are not factored into the FPS but must be written.",
    ],
    careerOutcomes: ["Chemical Engineer"],
    applyUrl: UCT_APPLY_URL, fieldTags: ["technology", "science"], sourceUrl: UCT_EBE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "uct-beng-civil-engineering", institutionId: "uct", facultyId: "uct-faculty-ebe", schoolId: "uct-school-ebe",
    name: "Bachelor of Science in Engineering in Civil Engineering", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Upper Campus"], modeOfDelivery: "contact", minAps: 500,
    subjectRequirements: [{ subjectCode: "MATH", minPercent: 75 }, { subjectCode: "PHS", minPercent: 70 }],
    additionalRequirements: [
      "Band A (guaranteed admission): FPS of 500 or above, Mathematics >= 75%, Physical Sciences >= 70%.",
      "Band B (admission likely): WPS of 460 or above, same subject minimums.",
      "Band C (admission possible, targeted redress groups only): FPS of 420 or above, same subject minimums.",
      "FPS = English% + Mathematics% + Physical Sciences% + your next 3 best subjects (excluding Life Orientation), out of 600.",
      "Must write the National Benchmark Tests -- not factored into the FPS but must be written.",
    ],
    careerOutcomes: ["Civil Engineer"],
    applyUrl: UCT_APPLY_URL, fieldTags: ["technology", "science"], sourceUrl: UCT_EBE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "uct-beng-mechanical-engineering", institutionId: "uct", facultyId: "uct-faculty-ebe", schoolId: "uct-school-ebe",
    name: "Bachelor of Science in Engineering in Mechanical Engineering", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Upper Campus"], modeOfDelivery: "contact", minAps: 500,
    subjectRequirements: [{ subjectCode: "MATH", minPercent: 80 }, { subjectCode: "PHS", minPercent: 75 }],
    additionalRequirements: [
      "Band A (guaranteed admission): FPS of 500 or above, Mathematics >= 80%, Physical Sciences >= 75%.",
      "Band B (admission likely): WPS of 480 or above, same subject minimums.",
      "Band C (admission possible, targeted redress groups only): FPS of 420 or above, same subject minimums.",
      "FPS = English% + Mathematics% + Physical Sciences% + your next 3 best subjects (excluding Life Orientation), out of 600.",
      "Also covers Mechanical & Mechatronic Engineering. Must write the National Benchmark Tests -- not factored into the FPS but must be written.",
    ],
    careerOutcomes: ["Mechanical Engineer"],
    applyUrl: UCT_APPLY_URL, fieldTags: ["technology", "science"], sourceUrl: UCT_EBE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "uct-beng-electrical-engineering", institutionId: "uct", facultyId: "uct-faculty-ebe", schoolId: "uct-school-ebe",
    name: "Bachelor of Science in Engineering in Electrical Engineering", qualificationType: "bachelorsDegree", nqfLevel: 8, saqaId: null,
    duration: "4 years", campuses: ["Upper Campus"], modeOfDelivery: "contact", minAps: 500,
    subjectRequirements: [{ subjectCode: "MATH", minPercent: 80 }, { subjectCode: "PHS", minPercent: 75 }],
    additionalRequirements: [
      "Band A (guaranteed admission): FPS of 500 or above, Mathematics >= 80%, Physical Sciences >= 75%.",
      "Band B (admission likely): WPS of 480 or above, same subject minimums.",
      "Band C (admission possible, targeted redress groups only): FPS of 420 or above, same subject minimums.",
      "FPS = English% + Mathematics% + Physical Sciences% + your next 3 best subjects (excluding Life Orientation), out of 600.",
      "Also covers Electrical & Computer Engineering and Mechatronics. Must write the National Benchmark Tests -- not factored into the FPS but must be written.",
    ],
    careerOutcomes: ["Electrical Engineer", "Electronic Engineer"],
    applyUrl: UCT_APPLY_URL, fieldTags: ["technology", "science"], sourceUrl: UCT_EBE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  // --- Faculty of Science (Upper Campus) ---
  // All share the real Band A FPS=660 guaranteed-admission threshold.
  {
    id: "uct-bsc-computer-science", institutionId: "uct", facultyId: "uct-faculty-science", schoolId: "uct-school-science",
    name: "Bachelor of Science (Computer Science major)", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Upper Campus"], modeOfDelivery: "contact", minAps: 660,
    subjectRequirements: [{ subjectCode: "MATH", minPercent: 70 }, { subjectCode: "PHS", minPercent: 60 }],
    additionalRequirements: [
      "Band A (guaranteed admission): FPS of 660 or above, Mathematics >= 70%, Physical Science >= 60%.",
      "Band B (admission very likely, all applicants): WPS of 640 or above, same subject minimums.",
      "Band C (admission possible, SA applicants in targeted redress race groups only): FPS of 550 or above, same subject minimums.",
      "FPS = sum of your best 6 NSC subjects' percentages (including English, excluding Life Orientation), with Mathematics and Physical Science each DOUBLED, out of 800. Worked example from UCT's own guide: English 85 + Afrikaans/isiXhosa FAL 89 + Maths 84x2 + Life Sciences 86 + Geography 79 + Physical Science 81x2 = FPS 669.",
      "For Computer Science, Physical Science may be replaced by Information Technology if Physical Science was not taken.",
      "Applicants must choose two majors; this record represents Computer Science as one of them.",
      "Must write the National Benchmark Tests -- not used in the FPS calculation but required, and used for extended-degree placement.",
    ],
    careerOutcomes: ["Software Developer", "Systems Analyst", "Data Engineer"],
    applyUrl: UCT_APPLY_URL, fieldTags: ["technology", "science"], sourceUrl: UCT_SCIENCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "uct-bsc-chemistry", institutionId: "uct", facultyId: "uct-faculty-science", schoolId: "uct-school-science",
    name: "Bachelor of Science (Chemistry major)", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Upper Campus"], modeOfDelivery: "contact", minAps: 660,
    subjectRequirements: [{ subjectCode: "MATH", minPercent: 70 }, { subjectCode: "PHS", minPercent: 60 }],
    additionalRequirements: [
      "Band A (guaranteed admission): FPS of 660 or above, Mathematics >= 70%, Physical Science >= 60%.",
      "Band B (admission very likely): WPS of 640 or above, same subject minimums.",
      "Band C (admission possible, targeted redress groups only): FPS of 550 or above, same subject minimums.",
      "FPS = sum of your best 6 NSC subjects' percentages (including English, excluding Life Orientation), with Mathematics and Physical Science each DOUBLED, out of 800.",
      "Applicants must choose two majors; this record represents Chemistry as one of them.",
      "Must write the National Benchmark Tests -- not used in the FPS calculation but required.",
    ],
    careerOutcomes: ["Research Scientist", "Analytical Chemist"],
    applyUrl: UCT_APPLY_URL, fieldTags: ["science"], sourceUrl: UCT_SCIENCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "uct-bsc-mathematics", institutionId: "uct", facultyId: "uct-faculty-science", schoolId: "uct-school-science",
    name: "Bachelor of Science (Mathematics major)", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Upper Campus"], modeOfDelivery: "contact", minAps: 660,
    subjectRequirements: [{ subjectCode: "MATH", minPercent: 70 }, { subjectCode: "PHS", minPercent: 60 }],
    additionalRequirements: [
      "Band A (guaranteed admission): FPS of 660 or above, Mathematics >= 70%, Physical Science >= 60%.",
      "Band B (admission very likely): WPS of 640 or above, same subject minimums.",
      "Band C (admission possible, targeted redress groups only): FPS of 550 or above, same subject minimums.",
      "FPS = sum of your best 6 NSC subjects' percentages (including English, excluding Life Orientation), with Mathematics and Physical Science each DOUBLED, out of 800.",
      "Applicants must choose two majors; this record represents Mathematics as one of them.",
      "Must write the National Benchmark Tests -- not used in the FPS calculation but required.",
    ],
    careerOutcomes: ["Actuarial Analyst", "Data Scientist", "Mathematician"],
    applyUrl: UCT_APPLY_URL, fieldTags: ["science"], sourceUrl: UCT_SCIENCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
  {
    id: "uct-bsc-physics", institutionId: "uct", facultyId: "uct-faculty-science", schoolId: "uct-school-science",
    name: "Bachelor of Science (Physics major)", qualificationType: "bachelorsDegree", nqfLevel: 7, saqaId: null,
    duration: "3 years", campuses: ["Upper Campus"], modeOfDelivery: "contact", minAps: 660,
    subjectRequirements: [{ subjectCode: "MATH", minPercent: 70 }, { subjectCode: "PHS", minPercent: 60 }],
    additionalRequirements: [
      "Band A (guaranteed admission): FPS of 660 or above, Mathematics >= 70%, Physical Science >= 60%.",
      "Band B (admission very likely): WPS of 640 or above, same subject minimums.",
      "Band C (admission possible, targeted redress groups only): FPS of 550 or above, same subject minimums.",
      "FPS = sum of your best 6 NSC subjects' percentages (including English, excluding Life Orientation), with Mathematics and Physical Science each DOUBLED, out of 800.",
      "Applicants must choose two majors; this record represents Physics as one of them.",
      "Must write the National Benchmark Tests -- not used in the FPS calculation but required.",
    ],
    careerOutcomes: ["Medical Physicist", "Geophysicist", "Research Scientist"],
    applyUrl: UCT_APPLY_URL, fieldTags: ["science"], sourceUrl: UCT_SCIENCE_URL, verifiedOn: VERIFIED_ON, academicYear: ACADEMIC_YEAR,
  },
];

// ---------------------------------------------------------------------------
// UCT APPLICATION WINDOWS
// ---------------------------------------------------------------------------

export const UCT_APPLICATION_WINDOWS: ApplicationWindow[] = [
  {
    id: "uct-window-2027-general",
    institutionId: "uct",
    programmeId: null,
    opensOn: "2026-04-01",
    closesOn: "2026-07-31",
    lateClosesOn: null,
    status: "open",
    sourceUrl: "https://uct.ac.za/sites/default/files/media/documents/ug-directions-for-applicants-2027.pdf",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
];
