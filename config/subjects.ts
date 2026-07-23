/**
 * NSC subject taxonomy. Per docs/MASTER_PROMPT_v2.md sect. 2.1: every
 * elective below is seeded with verificationStatus "needsVerification"
 * until it's been checked against the current DBE subject list
 * (education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements).
 * Do not flip a subject to "verified" without recording its sourceUrl.
 */

import type { Subject } from "@/lib/firestore/types";

export const HOME_LANGUAGE_OPTIONS = [
  "Afrikaans",
  "English",
  "isiNdebele",
  "isiXhosa",
  "isiZulu",
  "Sepedi",
  "Sesotho",
  "Setswana",
  "siSwati",
  "Tshivenda",
  "Xitsonga",
  "South African Sign Language",
] as const;

export type LanguageOption = (typeof HOME_LANGUAGE_OPTIONS)[number];

/** First Additional Language reuses the same list; the UI must exclude
 * whichever language was chosen as Home Language. */
export const FIRST_ADDITIONAL_LANGUAGE_OPTIONS = HOME_LANGUAGE_OPTIONS;

export const MATHEMATICS_OPTIONS = [
  "Mathematics",
  "Mathematical Literacy",
  "Technical Mathematics",
] as const;

export type MathematicsOption = (typeof MATHEMATICS_OPTIONS)[number];

function elective(
  code: string,
  name: string,
  isDesignated: boolean
): Subject {
  return {
    code,
    name,
    category: "elective",
    isDesignated,
    isCompulsory: false,
    languageType: null,
    verificationStatus: "needsVerification",
  };
}

/**
 * Designated-list flags below are seeded per the commonly-cited DBE
 * designated subject list (used by many institutions for faculty-specific
 * requirements, e.g. "at least one designated subject other than Maths").
 * All flagged needsVerification -- confirm against DBE before Tier 1 launch.
 */
export const ELECTIVE_SUBJECTS: Subject[] = [
  elective("ACC", "Accounting", true),
  elective("AMP", "Agricultural Management Practices", true),
  elective("AGS", "Agricultural Sciences", true),
  elective("AGT", "Agricultural Technology", false),
  elective("BUS", "Business Studies", true),
  elective("CIV", "Civil Technology", false),
  elective("CAT", "Computer Applications Technology", false),
  elective("CST", "Consumer Studies", false),
  elective("DNC", "Dance Studies", false),
  elective("DSN", "Design", false),
  elective("DRA", "Dramatic Arts", false),
  elective("ECO", "Economics", true),
  elective("ELT", "Electrical Technology", false),
  elective("EGD", "Engineering Graphics and Design", true),
  elective("EQS", "Equine Studies", false),
  elective("GEO", "Geography", true),
  elective("HIS", "History", true),
  elective("HSP", "Hospitality Studies", false),
  elective("IT", "Information Technology", true),
  elective("LFS", "Life Sciences", true),
  elective("MAR", "Marine Sciences", false),
  elective("MTE", "Maritime Economics", false),
  elective("MEC", "Mechanical Technology", false),
  elective("MUS", "Music", false),
  elective("NAU", "Nautical Science", false),
  elective("PHS", "Physical Sciences", true),
  elective("REL", "Religion Studies", false),
  elective("SAL", "Second Additional Language", false),
  elective("SES", "Sport and Exercise Science", false),
  elective("TES", "Technical Sciences", true),
  elective("TOU", "Tourism", false),
  elective("VAR", "Visual Arts", false),
];

export const COMPULSORY_LIFE_ORIENTATION: Subject = {
  code: "LO",
  name: "Life Orientation",
  category: "lifeOrientation",
  isDesignated: false,
  isCompulsory: true,
  languageType: null,
  verificationStatus: "needsVerification",
};

/** All subjects for seeding the `subjects` Firestore collection. Language
 * and Mathematics options are represented as picklists (above), not
 * individual Subject records, since the learner's choice determines the
 * subject code (e.g. home-language choice becomes "EngHL", "ZulHL", etc.)
 * -- that mapping belongs in the Phase 2 subject-selection UI, not here. */
export const ALL_SEED_SUBJECTS: Subject[] = [
  COMPULSORY_LIFE_ORIENTATION,
  ...ELECTIVE_SUBJECTS,
];
