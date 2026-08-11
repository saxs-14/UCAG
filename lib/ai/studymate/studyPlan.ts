// cSpell:words studymate
import type { SmartStudyPlan } from "@/lib/studymate/types";

/**
 * Generates a structured multi-week smart study plan for improving a subject mark.
 */
export function generateLocalStudyPlan(
  subjectCode: string,
  startingPercent: number,
  targetPercent: number
): SmartStudyPlan {
  const durationWeeks = 4;

  const topicsBySubject: Record<string, string[]> = {
    MATH: ["Algebraic Expressions & Equations", "Functions & Graphs", "Euclidean & Analytical Geometry", "Trigonometry & Calculus"],
    PHS: ["Newton's Laws & Momentum", "Work, Energy & Power", "Organic Chemistry", "Electrodynamics & Chemical Change"],
    ENG: ["Comprehension & Language Skills", "Poetry Analysis", "Novel & Drama Studies", "Transactional & Essay Writing"],
    LIFE: ["DNA & Molecular Code", "Meiosis & Genetics", "Human Reproduction", "Population Ecology"],
  };

  const defaultTopics = topicsBySubject[subjectCode] ?? [
    "Core Definitions & Foundations",
    "Application & Problem Solving",
    "Advanced Topics & Synthesis",
    "Past Paper Revision & Exam Technique",
  ];

  return {
    subjectCode,
    startingPercent,
    targetPercent,
    durationWeeks,
    phases: defaultTopics.map((topic, idx) => ({
      weekNumber: idx + 1,
      mainFocusTopic: topic,
      targetOutcome: `Master key concepts in ${topic} to move from ${startingPercent}% towards ${targetPercent}%.`,
      tasks: [
        {
          id: `task-w${idx + 1}-1`,
          topic,
          description: `Review theory notes and key formulas for ${topic}.`,
          completed: false,
        },
        {
          id: `task-w${idx + 1}-2`,
          topic,
          description: `Complete 10 textbook practice problems on ${topic}.`,
          completed: false,
        },
        {
          id: `task-w${idx + 1}-3`,
          topic,
          description: `Attempt past exam questions specifically testing ${topic}.`,
          completed: false,
        },
      ],
    })),
  };
}
