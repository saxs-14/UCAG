import type {
  StudentStudyProfile,
  StudyMaterial,
  QuizAttempt,
  MockExamAttempt,
} from "./types";

/**
 * Anonymous-first storage helper for StudyMate.
 * Uses localStorage when unauthenticated (same discipline as useApplicationChecklist.ts),
 * allowing full access to StudyMate without forcing registration.
 */

const PROFILE_KEY = "ucag_studymate_profile";
const MATERIALS_KEY = "ucag_studymate_materials";
const QUIZ_ATTEMPTS_KEY = "ucag_studymate_quiz_attempts";
const MOCK_ATTEMPTS_KEY = "ucag_studymate_mock_attempts";

const DEFAULT_PROFILE: StudentStudyProfile = {
  grade: "Grade 12",
  subjects: [
    { code: "MATH", name: "Mathematics", currentPercent: 54, targetPercent: 70, isWeakArea: true },
    { code: "PHS", name: "Physical Sciences", currentPercent: 62, targetPercent: 75, isWeakArea: true },
    { code: "ENG", name: "English Home Language", currentPercent: 78, targetPercent: 82, isWeakArea: false },
    { code: "LIFE", name: "Life Sciences", currentPercent: 68, targetPercent: 75, isWeakArea: false },
  ],
  availableHoursPerWeek: 12,
  preferredStyle: "practice",
  upcomingAssessments: [
    {
      id: "assess-1",
      subjectCode: "MATH",
      title: "Mathematics Algebra Test",
      date: new Date(Date.now() + 12 * 86400000).toISOString().split("T")[0],
      type: "test",
      topics: ["Algebraic Expressions", "Quadratic Equations"],
    },
  ],
  updatedAt: new Date().toISOString(),
};

export function loadStudyProfile(): StudentStudyProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return JSON.parse(raw) as StudentStudyProfile;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveStudyProfile(profile: StudentStudyProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // quota / private mode fallback
  }
}

export function loadStudyMaterials(): StudyMaterial[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MATERIALS_KEY);
    return raw ? (JSON.parse(raw) as StudyMaterial[]) : [];
  } catch {
    return [];
  }
}

export function saveStudyMaterial(material: StudyMaterial): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadStudyMaterials();
    const updated = [material, ...current.filter((m) => m.id !== material.id)];
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(updated));
  } catch {
    // fallback
  }
}

export function loadQuizAttempts(): QuizAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUIZ_ATTEMPTS_KEY);
    return raw ? (JSON.parse(raw) as QuizAttempt[]) : [];
  } catch {
    return [];
  }
}

export function saveQuizAttempt(attempt: QuizAttempt): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadQuizAttempts();
    const updated = [attempt, ...current];
    localStorage.setItem(QUIZ_ATTEMPTS_KEY, JSON.stringify(updated));
  } catch {
    // fallback
  }
}

export function loadMockExamAttempts(): MockExamAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MOCK_ATTEMPTS_KEY);
    return raw ? (JSON.parse(raw) as MockExamAttempt[]) : [];
  } catch {
    return [];
  }
}

export function saveMockExamAttempt(attempt: MockExamAttempt): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadMockExamAttempts();
    const updated = [attempt, ...current];
    localStorage.setItem(MOCK_ATTEMPTS_KEY, JSON.stringify(updated));
  } catch {
    // fallback
  }
}
