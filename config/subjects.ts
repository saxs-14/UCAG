/**
 * NSC subject taxonomy. Per docs/MASTER_PROMPT_v2.md sect. 2.1: every
 * elective below is seeded with verificationStatus "needsVerification"
 * until it's been checked against the current DBE subject list
 * (education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements).
 * Do not flip a subject to "verified" without recording its sourceUrl.
 *
 * Canonical subject codes used throughout the engine and UI:
 * - Mathematics: "MATH" | "MATHLIT" | "TECHMATH"
 * - Languages: "<LANG3>-HL" or "<LANG3>-FAL", e.g. "ENG-HL", "ZUL-FAL"
 *   (see LANGUAGE_CODES / getLanguageSubjectCode below)
 * - Life Orientation: "LO"
 * - Electives: 3-letter codes, see ELECTIVE_SUBJECTS
 */

import type { Subject } from "@/lib/firestore/types";
import type { SubjectMarkInput } from "@/lib/aps/types";

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

/** 3-letter codes for the language-subject-code scheme (see file header). */
export const LANGUAGE_CODES: Record<LanguageOption, string> = {
  Afrikaans: "AFR",
  English: "ENG",
  isiNdebele: "NBL",
  isiXhosa: "XHO",
  isiZulu: "ZUL",
  Sepedi: "NSO",
  Sesotho: "SOT",
  Setswana: "TSN",
  siSwati: "SSW",
  Tshivenda: "VEN",
  Xitsonga: "TSO",
  "South African Sign Language": "SASL",
};

export function getLanguageSubjectCode(
  language: LanguageOption,
  type: "home" | "firstAdditional"
): string {
  return `${LANGUAGE_CODES[language]}-${type === "home" ? "HL" : "FAL"}`;
}

export const MATHEMATICS_OPTIONS = [
  "Mathematics",
  "Mathematical Literacy",
  "Technical Mathematics",
] as const;

export type MathematicsOption = (typeof MATHEMATICS_OPTIONS)[number];

export const MATHEMATICS_CODES: Record<MathematicsOption, string> = {
  Mathematics: "MATH",
  "Mathematical Literacy": "MATHLIT",
  "Technical Mathematics": "TECHMATH",
};

const REVERSE_MATHEMATICS_CODES: Record<string, MathematicsOption> = Object.fromEntries(
  Object.entries(MATHEMATICS_CODES).map(([option, code]) => [code, option as MathematicsOption])
);

export const MATHEMATICS_SUBJECTS: Subject[] = [
  {
    code: "MATH",
    name: "Mathematics",
    category: "mathematics",
    isDesignated: true,
    isCompulsory: true,
    languageType: null,
    verificationStatus: "needsVerification",
  },
  {
    code: "MATHLIT",
    name: "Mathematical Literacy",
    category: "mathematics",
    isDesignated: false,
    isCompulsory: true,
    languageType: null,
    verificationStatus: "needsVerification",
  },
  {
    code: "TECHMATH",
    name: "Technical Mathematics",
    category: "mathematics",
    isDesignated: true,
    isCompulsory: true,
    languageType: null,
    verificationStatus: "needsVerification",
  },
];

function elective(
  code: string,
  name: string,
  isDesignated: boolean,
  groupLabel: string
): Subject {
  return {
    code,
    name,
    category: "elective",
    isDesignated,
    isCompulsory: false,
    languageType: null,
    verificationStatus: "needsVerification",
    groupLabel,
  };
}

/**
 * Designated-list flags are seeded per the commonly-cited DBE designated
 * subject list (used by many institutions for faculty-specific
 * requirements, e.g. "at least one designated subject other than Maths").
 * groupLabel is a UI organisational aid only, not a DBE taxonomy -- see
 * the note on Subject.groupLabel in lib/firestore/types.ts.
 * All flagged needsVerification -- confirm against DBE before Tier 1 launch.
 */
export const ELECTIVE_SUBJECTS: Subject[] = [
  elective("ACC", "Accounting", true, "Commerce"),
  elective("BUS", "Business Studies", true, "Commerce"),
  elective("ECO", "Economics", true, "Commerce"),

  elective("GEO", "Geography", true, "Humanities & Social Sciences"),
  elective("HIS", "History", true, "Humanities & Social Sciences"),
  elective("REL", "Religion Studies", false, "Humanities & Social Sciences"),
  elective("TOU", "Tourism", false, "Humanities & Social Sciences"),

  elective("AGS", "Agricultural Sciences", true, "Sciences"),
  elective("LFS", "Life Sciences", true, "Sciences"),
  elective("MAR", "Marine Sciences", false, "Sciences"),
  elective("PHS", "Physical Sciences", true, "Sciences"),
  elective("TES", "Technical Sciences", true, "Sciences"),

  elective("AMP", "Agricultural Management Practices", true, "Technology"),
  elective("AGT", "Agricultural Technology", false, "Technology"),
  elective("CIV", "Civil Technology", false, "Technology"),
  elective("CAT", "Computer Applications Technology", false, "Technology"),
  elective("ELT", "Electrical Technology", false, "Technology"),
  elective("EGD", "Engineering Graphics and Design", true, "Technology"),
  elective("IT", "Information Technology", true, "Technology"),
  elective("MEC", "Mechanical Technology", false, "Technology"),

  elective("DNC", "Dance Studies", false, "Arts & Culture"),
  elective("DSN", "Design", false, "Arts & Culture"),
  elective("DRA", "Dramatic Arts", false, "Arts & Culture"),
  elective("MUS", "Music", false, "Arts & Culture"),
  elective("VAR", "Visual Arts", false, "Arts & Culture"),

  elective("CST", "Consumer Studies", false, "Services"),
  elective("HSP", "Hospitality Studies", false, "Services"),
  elective("SES", "Sport and Exercise Science", false, "Services"),

  elective("EQS", "Equine Studies", false, "Specialised"),
  elective("MTE", "Maritime Economics", false, "Specialised"),
  elective("NAU", "Nautical Science", false, "Specialised"),
  elective("SAL", "Second Additional Language", false, "Specialised"),
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

/** All non-language subjects for seeding the `subjects` Firestore
 * collection. Language subjects are derived (12 languages x 2 slots) via
 * getLanguageSubjectCode rather than enumerated here. */
export const ALL_SEED_SUBJECTS: Subject[] = [
  COMPULSORY_LIFE_ORIENTATION,
  ...MATHEMATICS_SUBJECTS,
  ...ELECTIVE_SUBJECTS,
];

export const ELECTIVE_GROUP_LABELS = Array.from(
  new Set(ELECTIVE_SUBJECTS.map((s) => s.groupLabel).filter(Boolean))
) as string[];

const REVERSE_LANGUAGE_CODES: Record<string, LanguageOption> = Object.fromEntries(
  Object.entries(LANGUAGE_CODES).map(([lang, code]) => [code, lang as LanguageOption])
);

const SUBJECT_LABEL_LOOKUP: Record<string, string> = Object.fromEntries(
  [COMPULSORY_LIFE_ORIENTATION, ...MATHEMATICS_SUBJECTS, ...ELECTIVE_SUBJECTS].map((s) => [
    s.code,
    s.name,
  ])
);

export const SUBJECT_CODE_ALIASES: Record<string, string> = {
  MAT: "MATH",
  MATHS: "MATH",
  MATHEMATICS: "MATH",
  MATHLIT: "MATHLIT",
  TECHMATH: "TECHMATH",
  ENG: "ENG-HL",
  ENGLISH: "ENG-HL",
  AFR: "AFR-HL",
  AFRIKAANS: "AFR-HL",
  ZUL: "ZUL-HL",
  ZULU: "ZUL-HL",
  ISIZULU: "ZUL-HL",
  XHO: "XHO-HL",
  XHOSA: "XHO-HL",
  ISIXHOSA: "XHO-HL",
  PHY: "PHS",
  PHYS: "PHS",
  "PHYSICAL SCIENCES": "PHS",
  "PHYSICAL SCIENCE": "PHS",
  BIO: "LFS",
  "LIFE SCIENCES": "LFS",
  "LIFE SCIENCE": "LFS",
  BIOLOGY: "LFS",
  ACC: "ACC",
  ACCOUNTING: "ACC",
  BUS: "BUS",
  "BUSINESS STUDIES": "BUS",
  ECO: "ECO",
  ECONOMICS: "ECO",
  GEO: "GEO",
  GEOGRAPHY: "GEO",
  HIS: "HIS",
  HISTORY: "HIS",
  CAT: "CAT",
  IT: "IT",
  LO: "LO",
  "LIFE ORIENTATION": "LO",
};

/** Normalises any raw or non-canonical subject code (e.g. "MAT", "ENG", "PHY")
 * to its canonical DBE system code ("MATH", "ENG-HL", "PHS"). */
export function normalizeSubjectCode(code: string): string {
  if (!code) return code;
  const upper = code.trim().toUpperCase();
  return SUBJECT_CODE_ALIASES[upper] || upper;
}

/** Resolves any canonical or shorthand subject code (elective, Mathematics variant, LO,
 * shorthand like "MAT"/"ENG", or a derived language code like "ENG-HL") to a human-readable label.
 * Used by matching/results copy so reasons read as "Mathematics" not
 * "MATH". Falls back to the raw code for anything unrecognised. */
export function resolveSubjectLabel(code: string): string {
  if (!code) return "";
  const normalized = normalizeSubjectCode(code);
  if (SUBJECT_LABEL_LOOKUP[normalized]) return SUBJECT_LABEL_LOOKUP[normalized];
  if (SUBJECT_LABEL_LOOKUP[code]) return SUBJECT_LABEL_LOOKUP[code];

  const languageMatch = /^([A-Z]+)-(HL|FAL)$/.exec(normalized) || /^([A-Z]+)-(HL|FAL)$/.exec(code.toUpperCase());
  if (languageMatch) {
    const [, langCode, slot] = languageMatch;
    const language = REVERSE_LANGUAGE_CODES[langCode!];
    if (language) {
      return `${language} (${slot === "HL" ? "Home Language" : "First Additional Language"})`;
    }
  }

  if (code.toUpperCase() === "ENG" || code.toUpperCase() === "ENGLISH") return "English";
  if (code.toUpperCase() === "MAT" || code.toUpperCase() === "MATHS") return "Mathematics";

  return code;
}

/** Initial UI state for SubjectForm's granular per-field selects, as opposed
 * to the flat SubjectMarkInput[] the rest of the app deals in. */
export interface SubjectFormInitialState {
  homeLanguage: LanguageOption | "";
  homeLanguageMark: number | null;
  firstAdditionalLanguage: LanguageOption | "";
  firstAdditionalLanguageMark: number | null;
  mathematics: MathematicsOption | "";
  mathematicsMark: number | null;
  lifeOrientationMark: number | null;
  electives: { code: string; percentage: number }[];
}

/**
 * Reverses SubjectForm's own subject-code derivation (see its `marks`
 * useMemo) back into granular form state, so a signed-in learner's saved
 * marks can repopulate the calculator instead of starting blank. Uses the
 * same code-parsing rules as resolveSubjectLabel above -- language codes are
 * "<LANG3>-HL"/"<LANG3>-FAL", Mathematics variants are MATHEMATICS_CODES'
 * values, "LO" is Life Orientation, anything else is checked against
 * ELECTIVE_SUBJECTS. An unrecognised code is silently dropped rather than
 * thrown -- a stale/unknown code shouldn't break the whole restore.
 */
export function subjectMarksToFormState(marks: SubjectMarkInput[]): SubjectFormInitialState {
  const state: SubjectFormInitialState = {
    homeLanguage: "",
    homeLanguageMark: null,
    firstAdditionalLanguage: "",
    firstAdditionalLanguageMark: null,
    mathematics: "",
    mathematicsMark: null,
    lifeOrientationMark: null,
    electives: [],
  };

  for (const { subjectCode, percentage } of marks) {
    if (subjectCode === COMPULSORY_LIFE_ORIENTATION.code) {
      state.lifeOrientationMark = percentage;
      continue;
    }

    const languageMatch = /^([A-Z]+)-(HL|FAL)$/.exec(subjectCode);
    if (languageMatch) {
      const [, langCode, slot] = languageMatch;
      const language = REVERSE_LANGUAGE_CODES[langCode!];
      if (language) {
        if (slot === "HL") {
          state.homeLanguage = language;
          state.homeLanguageMark = percentage;
        } else {
          state.firstAdditionalLanguage = language;
          state.firstAdditionalLanguageMark = percentage;
        }
      }
      continue;
    }

    const mathOption = REVERSE_MATHEMATICS_CODES[subjectCode];
    if (mathOption) {
      state.mathematics = mathOption;
      state.mathematicsMark = percentage;
      continue;
    }

    if (ELECTIVE_SUBJECTS.some((s) => s.code === subjectCode)) {
      state.electives.push({ code: subjectCode, percentage });
    }
  }

  return state;
}
