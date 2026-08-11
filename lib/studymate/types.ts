/**
 * Core type definitions for the StudyMate academic support module.
 *
 * Designed for Grade 10-12 high school learners and university students.
 * All models are pure TypeScript interfaces -- no Firebase or framework imports
 * in this file.
 */

export type StudyGrade = "Grade 10" | "Grade 11" | "Grade 12" | "1st Year UMP" | "2nd Year UMP" | "3rd Year UMP";

export type StudyStyle = "visual" | "auditory" | "reading" | "practice" | "group";

export interface StudentSubject {
  code: string;
  name: string;
  currentPercent: number;
  targetPercent: number;
  isWeakArea?: boolean;
}

export interface UpcomingAssessment {
  id: string;
  subjectCode: string;
  title: string; // e.g. "Algebra Class Test 1"
  date: string; // ISO date string YYYY-MM-DD
  type: "test" | "exam" | "assignment";
  topics: string[];
}

export interface StudentStudyProfile {
  id?: string;
  grade: StudyGrade;
  subjects: StudentSubject[];
  availableHoursPerWeek: number;
  preferredStyle: StudyStyle;
  upcomingAssessments: UpcomingAssessment[];
  updatedAt: string;
}

export interface DiagnosisTopicRecommendation {
  subjectCode: string;
  topic: string;
  priority: "high" | "medium" | "low";
  reason: string;
}

export interface StudyDiagnosisResult {
  overallSummary: string;
  strongestSubject: string;
  priorityWeakSubject: string;
  recommendedFocusTopics: DiagnosisTopicRecommendation[];
  weeklyHoursRecommended: number;
  studyHabitAdvice: string;
  disclaimer: string;
}

export interface TimetableSlot {
  id: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  startTime: string; // "16:00"
  endTime: string;   // "17:00"
  subjectCode: string;
  topic: string;
  activityType: "review" | "practice" | "past-paper" | "break";
}

export interface WeeklyStudyTimetable {
  generatedAt: string;
  totalWeeklyHours: number;
  slots: TimetableSlot[];
  tips: string[];
}

export interface WeeklyStudyPlanTask {
  id: string;
  topic: string;
  description: string;
  completed: boolean;
}

export interface WeeklyStudyPlanPhase {
  weekNumber: number;
  mainFocusTopic: string;
  targetOutcome: string;
  tasks: WeeklyStudyPlanTask[];
}

export interface SmartStudyPlan {
  subjectCode: string;
  startingPercent: number;
  targetPercent: number;
  durationWeeks: number;
  phases: WeeklyStudyPlanPhase[];
}

export type MaterialType = "notes" | "pdf" | "summary" | "flashcard" | "past-paper";

export interface StudyMaterial {
  id: string;
  title: string;
  subjectCode: string;
  topic: string;
  grade: StudyGrade;
  type: MaterialType;
  content: string; // Raw text or markdown summary
  tags: string[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  options?: string[]; // required for multiple-choice
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  subjectCode: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  questions: QuizQuestion[];
  generatedAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  subjectCode: string;
  score: number;
  total: number;
  percentage: number;
  answers: Record<string, string>; // questionId -> chosen answer
  topicsToRevise: string[];
  completedAt: string;
}

export interface MockExamSection {
  title: string;
  totalMarks: number;
  questions: {
    id: string;
    questionNumber: string;
    text: string;
    marks: number;
    modelAnswer: string;
  }[];
}

export interface MockExam {
  id: string;
  title: string;
  subjectCode: string;
  grade: StudyGrade;
  durationMinutes: number;
  totalMarks: number;
  instructions: string[];
  sections: MockExamSection[];
}

export interface MockExamAttempt {
  id: string;
  examId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  strongAreas: string[];
  weakAreas: string[];
  revisionRecommendations: string[];
  completedAt: string;
}

export interface TutorMessage {
  id: string;
  sender: "user" | "tutor";
  text: string;
  stepNumber?: number;
  timestamp: string;
}
