import { describe, expect, it } from "vitest";
import { loadStudyProfile, saveStudyProfile } from "./storage";
import type { StudentStudyProfile } from "./types";

describe("StudyMate storage.ts", () => {
  it("returns default profile when localStorage is empty", () => {
    const profile = loadStudyProfile();
    expect(profile).toBeDefined();
    expect(profile.grade).toBe("Grade 12");
    expect(profile.subjects.length).toBeGreaterThan(0);
  });

  it("saves and loads updated profile", () => {
    const customProfile: StudentStudyProfile = {
      grade: "Grade 11",
      subjects: [{ code: "MATH", name: "Mathematics", currentPercent: 70, targetPercent: 85 }],
      availableHoursPerWeek: 15,
      preferredStyle: "visual",
      upcomingAssessments: [],
      updatedAt: new Date().toISOString(),
    };

    saveStudyProfile(customProfile);
    const reloaded = loadStudyProfile();
    expect(reloaded.grade).toBe("Grade 11");
    expect(reloaded.availableHoursPerWeek).toBe(15);
  });
});
