import type { StudentStudyProfile, StudyDiagnosisResult } from "@/lib/studymate/types";

/**
 * Pure fallback diagnosis generator used when offline or in unit tests.
 */
export function generateLocalDiagnosis(profile: StudentStudyProfile): StudyDiagnosisResult {
  const sorted = [...profile.subjects].sort((a, b) => b.currentPercent - a.currentPercent);
  const strongest = sorted[0]?.name ?? "None";
  const weakestSubject = sorted[sorted.length - 1];
  const priorityWeak = weakestSubject?.name ?? "None";

  const recommendations = profile.subjects
    .filter((s) => s.currentPercent < 65 || s.isWeakArea)
    .map((s) => ({
      subjectCode: s.code,
      topic: `${s.name} Core Concepts & Practice Problems`,
      priority: s.currentPercent < 55 ? ("high" as const) : ("medium" as const),
      reason: `Current mark (${s.currentPercent}%) is below your target (${s.targetPercent}%). Focus on fundamentals first.`,
    }));

  return {
    overallSummary: `Your strongest subject is ${strongest} (${sorted[0]?.currentPercent ?? 0}%). Your main area requiring dedicated attention is ${priorityWeak} (${weakestSubject?.currentPercent ?? 0}%).`,
    strongestSubject: strongest,
    priorityWeakSubject: priorityWeak,
    recommendedFocusTopics: recommendations.length > 0 ? recommendations : [
      {
        subjectCode: sorted[0]?.code ?? "GEN",
        topic: "General Revision & Advanced Problem Solving",
        priority: "low",
        reason: "Maintain high performance by practicing past papers.",
      },
    ],
    weeklyHoursRecommended: Math.max(profile.availableHoursPerWeek, 8),
    studyHabitAdvice: "Break study sessions into 45-minute blocks with 10-minute breaks. Prioritise active recall over passive reading.",
    disclaimer: "StudyMate is an educational support tool. It does not diagnose learning disabilities, medical conditions, or cognitive impairments.",
  };
}

export function buildStudyDiagnosisPrompt(profile: StudentStudyProfile): string {
  const subjectList = profile.subjects
    .map((s) => `- ${s.name} (${s.code}): Current ${s.currentPercent}%, Target ${s.targetPercent}%${s.isWeakArea ? " [WEAK AREA]" : ""}`)
    .join("\n");

  const assessmentsList = profile.upcomingAssessments
    .map((a) => `- ${a.title} (${a.subjectCode}) on ${a.date}: Topics ${a.topics.join(", ")}`)
    .join("\n") || "None specified";

  return `You are StudyMate AI -- an encouraging South African educational diagnostic assistant.
Analyze this student's profile and return a structured diagnostic response:

Grade: ${profile.grade}
Available Study Hours: ${profile.availableHoursPerWeek} hrs/week
Preferred Style: ${profile.preferredStyle}

Subjects:
${subjectList}

Upcoming Assessments:
${assessmentsList}

RULES:
1. Be constructive and encouraging. Never shame the learner for low marks.
2. Recommend practical focus topics prioritizing subjects where current mark < target mark.
3. Keep response strictly grounded in education. Never claim to diagnose medical or learning disabilities.

Return a JSON object matching this structure:
{
  "overallSummary": "string",
  "strongestSubject": "string",
  "priorityWeakSubject": "string",
  "recommendedFocusTopics": [
    { "subjectCode": "string", "topic": "string", "priority": "high|medium|low", "reason": "string" }
  ],
  "weeklyHoursRecommended": number,
  "studyHabitAdvice": "string"
}`;
}
