import { describe, expect, it } from "vitest";
import { generateLocalDiagnosis, buildStudyDiagnosisPrompt } from "./studyDiagnosis";
import type { StudentStudyProfile } from "@/lib/studymate/types";

describe("studyDiagnosis.ts", () => {
  const sampleProfile: StudentStudyProfile = {
    grade: "Grade 12",
    subjects: [
      { code: "MATH", name: "Mathematics", currentPercent: 50, targetPercent: 70, isWeakArea: true },
      { code: "ENG", name: "English", currentPercent: 80, targetPercent: 85, isWeakArea: false },
    ],
    availableHoursPerWeek: 10,
    preferredStyle: "practice",
    upcomingAssessments: [],
    updatedAt: new Date().toISOString(),
  };

  it("identifies priority weak subject and strongest subject", () => {
    const res = generateLocalDiagnosis(sampleProfile);
    expect(res.strongestSubject).toBe("English");
    expect(res.priorityWeakSubject).toBe("Mathematics");
    expect(res.disclaimer).toContain("does not diagnose learning disabilities");
  });

  it("builds structured prompt containing grade and subjects", () => {
    const prompt = buildStudyDiagnosisPrompt(sampleProfile);
    expect(prompt).toContain("Grade 12");
    expect(prompt).toContain("Mathematics");
    expect(prompt).toContain("JSON");
  });
});
