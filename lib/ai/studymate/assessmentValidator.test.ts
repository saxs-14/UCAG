import { describe, expect, it } from "vitest";
import { validateQuiz, validateMockExam } from "./assessmentValidator";

describe("assessmentValidator.ts", () => {
  it("validates a well-formed quiz", () => {
    const validQuiz = {
      id: "q-1",
      title: "Math Quiz",
      subjectCode: "MATH",
      topic: "Algebra",
      difficulty: "medium",
      questions: [
        {
          id: "q1",
          question: "Solve 2x = 4",
          type: "multiple-choice",
          options: ["x=2", "x=4"],
          correctAnswer: "x=2",
          explanation: "Divide by 2",
        },
      ],
      generatedAt: new Date().toISOString(),
    };

    const res = validateQuiz(validQuiz);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it("catches multiple-choice questions missing options", () => {
    const brokenQuiz = {
      id: "q-1",
      title: "Broken Quiz",
      subjectCode: "MATH",
      topic: "Algebra",
      difficulty: "medium",
      questions: [
        {
          id: "q1",
          question: "Solve 2x = 4",
          type: "multiple-choice",
          options: [],
          correctAnswer: "x=2",
          explanation: "Divide by 2",
        },
      ],
      generatedAt: new Date().toISOString(),
    };

    const res = validateQuiz(brokenQuiz);
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it("validates a well-formed mock exam", () => {
    const validExam = {
      id: "m-1",
      title: "Math Mock",
      subjectCode: "MATH",
      grade: "Grade 12",
      durationMinutes: 180,
      totalMarks: 50,
      instructions: ["Answer all questions"],
      sections: [
        {
          title: "Section A",
          totalMarks: 50,
          questions: [
            {
              id: "q1",
              questionNumber: "Question 1",
              text: "Solve 3x=9",
              marks: 50,
              modelAnswer: "x=3",
            },
          ],
        },
      ],
    };

    const res = validateMockExam(validExam);
    expect(res.valid).toBe(true);
  });
});
