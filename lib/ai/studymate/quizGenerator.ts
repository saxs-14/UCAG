import type { Quiz } from "@/lib/studymate/types";
import { validateQuiz } from "./assessmentValidator";

export function generateLocalQuiz(
  subjectCode: string,
  topic: string,
  difficulty: "easy" | "medium" | "hard" = "medium"
): Quiz {
  const isMath = subjectCode === "MATH";

  const mathQuestions = [
    {
      id: "q-m-1",
      question: "Solve for x: 2x + 6 = 14",
      type: "multiple-choice" as const,
      options: ["x = 3", "x = 4", "x = 5", "x = 8"],
      correctAnswer: "x = 4",
      explanation: "Subtract 6 from both sides to get 2x = 8. Divide by 2 to get x = 4.",
    },
    {
      id: "q-m-2",
      question: "Factorise completely: x² - 9",
      type: "multiple-choice" as const,
      options: ["(x - 3)(x - 3)", "(x + 3)(x - 3)", "(x + 9)(x - 1)", "(x - 9)(x + 1)"],
      correctAnswer: "(x + 3)(x - 3)",
      explanation: "This is a difference of squares: a² - b² = (a + b)(a - b).",
    },
    {
      id: "q-m-3",
      question: "True or False: The domain of f(x) = 1/x includes x = 0.",
      type: "true-false" as const,
      options: ["True", "False"],
      correctAnswer: "False",
      explanation: "Division by zero is undefined, so x = 0 is excluded from the domain.",
    },
  ];

  const generalQuestions = [
    {
      id: "q-g-1",
      question: `What is a primary principle when studying ${topic}?`,
      type: "multiple-choice" as const,
      options: [
        "Memorising definitions without practice",
        "Understanding core concepts and applying them to problems",
        "Reading the textbook once before the exam",
        "Ignoring past papers",
      ],
      correctAnswer: "Understanding core concepts and applying them to problems",
      explanation: "Active application builds long-term retrieval strength.",
    },
    {
      id: "q-g-2",
      question: `True or False: Past paper practice is effective for ${subjectCode} revision.`,
      type: "true-false" as const,
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: "Past papers familiarize you with exam format, question styling, and time management.",
    },
  ];

  const rawQuiz: Quiz = {
    id: `quiz-${subjectCode.toLowerCase()}-${Date.now()}`,
    title: `${subjectCode} — ${topic} Practice Quiz`,
    subjectCode,
    topic,
    difficulty,
    questions: isMath ? mathQuestions : generalQuestions,
    generatedAt: new Date().toISOString(),
  };

  const val = validateQuiz(rawQuiz);
  if (!val.valid) {
    throw new Error(`Quiz validation failed: ${val.errors.join("; ")}`);
  }

  return rawQuiz;
}
