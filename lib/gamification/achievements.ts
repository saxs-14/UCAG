export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "journey" | "studymate";
  unlocked: boolean;
  unlockedAt?: string;
}

const ACHIEVEMENTS_KEY = "ucag_achievements";

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: "ach-career-explorer", title: "Career Explorer", description: "Explored UMP career roadmaps", icon: "🗺️", category: "journey", unlocked: false },
  { id: "ach-programme-explorer", title: "Programme Explorer", description: "Browsed UMP verified programmes", icon: "📚", category: "journey", unlocked: false },
  { id: "ach-app-ready", title: "Application Ready", description: "Completed application document checklist", icon: "✅", category: "journey", unlocked: false },
  { id: "ach-first-quiz", title: "First Quiz Completed", description: "Finished your first StudyMate quiz", icon: "⚡", category: "studymate", unlocked: false },
  { id: "ach-study-streak", title: "7-Day Study Streak", description: "Studied 7 days in a row on StudyMate", icon: "🔥", category: "studymate", unlocked: false },
  { id: "ach-grade-improved", title: "Improved Grade", description: "Increased a subject mark by 10%", icon: "🎯", category: "studymate", unlocked: false },
  { id: "ach-mock-exam", title: "Mock Exam Master", description: "Completed a full 150-mark mock exam", icon: "📝", category: "studymate", unlocked: false },
  { id: "ach-target-reached", title: "Target Grade Reached", description: "Achieved target percentage in a subject", icon: "🏆", category: "studymate", unlocked: false },
];

export function loadAchievements(): Achievement[] {
  if (typeof window === "undefined") return DEFAULT_ACHIEVEMENTS;
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) return DEFAULT_ACHIEVEMENTS;
    const saved = JSON.parse(raw) as Record<string, boolean>;
    return DEFAULT_ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: Boolean(saved[a.id]),
    }));
  } catch {
    return DEFAULT_ACHIEVEMENTS;
  }
}

export function unlockAchievement(id: string): Achievement[] {
  if (typeof window === "undefined") return DEFAULT_ACHIEVEMENTS;
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    const saved = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    saved[id] = true;
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(saved));
    return loadAchievements();
  } catch {
    return DEFAULT_ACHIEVEMENTS;
  }
}
