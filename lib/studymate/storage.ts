import type {
  StudentStudyProfile,
  StudyMaterial,
  QuizAttempt,
  MockExamAttempt,
} from "./types";

/**
 * Anonymous-first storage helper for StudyMate / VarsityPath AI.
 * Uses localStorage when unauthenticated — no forced registration needed.
 * Returns null when no profile is saved so the UI shows proper onboarding.
 */

const PROFILE_KEY = "ucag_studymate_profile";
const MATERIALS_KEY = "ucag_studymate_materials";
const QUIZ_ATTEMPTS_KEY = "ucag_studymate_quiz_attempts";
const MOCK_ATTEMPTS_KEY = "ucag_studymate_mock_attempts";

/** Returns null when no profile has been saved yet — callers must show onboarding. */
export function loadStudyProfile(): StudentStudyProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StudentStudyProfile;
  } catch {
    return null;
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
