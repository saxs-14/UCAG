import { z } from "zod";
import type { Quiz, MockExam } from "@/lib/studymate/types";

const QuizQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(3),
  type: z.enum(["multiple-choice", "true-false", "short-answer"]),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(1),
});

const QuizSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  subjectCode: z.string().min(1),
  topic: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questions: z.array(QuizQuestionSchema).min(1),
  generatedAt: z.string(),
});

const MockQuestionSchema = z.object({
  id: z.string().min(1),
  questionNumber: z.string().min(1),
  text: z.string().min(3),
  marks: z.number().positive(),
  modelAnswer: z.string().min(1),
});

const MockSectionSchema = z.object({
  title: z.string().min(1),
  totalMarks: z.number().positive(),
  questions: z.array(MockQuestionSchema).min(1),
});

const MockExamSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  subjectCode: z.string().min(1),
  grade: z.string(),
  durationMinutes: z.number().positive(),
  totalMarks: z.number().positive(),
  instructions: z.array(z.string()),
  sections: z.array(MockSectionSchema).min(1),
});

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates an AI-generated quiz to prevent blank questions, missing options,
 * or broken JSON structures from reaching the learner.
 */
export function validateQuiz(quiz: unknown): ValidationResult {
  const parsed = QuizSchema.safeParse(quiz);
  if (!parsed.success) {
    return {
      valid: false,
      errors: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    };
  }

  const errors: string[] = [];
  const q = parsed.data as Quiz;

  // Additional business rule validation
  q.questions.forEach((question, idx) => {
    if (question.type === "multiple-choice" && (!question.options || question.options.length < 2)) {
      errors.push(`Question ${idx + 1}: Multiple choice questions must have at least 2 options.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an AI-generated mock exam to verify mark totals and section structure.
 */
export function validateMockExam(exam: unknown): ValidationResult {
  const parsed = MockExamSchema.safeParse(exam);
  if (!parsed.success) {
    return {
      valid: false,
      errors: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    };
  }

  const errors: string[] = [];
  const e = parsed.data as MockExam;

  // Verify section mark sum matches stated section total
  e.sections.forEach((sec, idx) => {
    const questionSum = sec.questions.reduce((sum, q) => sum + q.marks, 0);
    if (questionSum !== sec.totalMarks) {
      errors.push(`Section ${idx + 1} (${sec.title}): Marks sum (${questionSum}) does not match section totalMarks (${sec.totalMarks}).`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
