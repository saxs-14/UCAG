import type { FieldTag } from "@/lib/firestore/types";

/**
 * "Not sure what to study?" quiz (components/interests/InterestQuiz.tsx,
 * lib/recommendations.ts) -- deliberately short (3 questions), each
 * option tagged with the FieldTag(s) it signals. Never overrides APS
 * eligibility -- see lib/recommendations.ts -- this only re-ranks what a
 * learner already qualifies (or almost qualifies) for.
 */

export interface InterestQuizOption {
  label: string;
  tags: FieldTag[];
}

export interface InterestQuizQuestion {
  id: string;
  question: string;
  options: InterestQuizOption[];
}

export const INTEREST_QUIZ: InterestQuizQuestion[] = [
  {
    id: "subject-preference",
    question: "Which of these sounds most interesting to work with every day?",
    options: [
      { label: "Computers and technology", tags: ["technology"] },
      { label: "Numbers, money, and business", tags: ["business"] },
      { label: "Experiments and how things work", tags: ["science"] },
      { label: "Helping and working with people", tags: ["people"] },
    ],
  },
  {
    id: "environment-preference",
    question: "Would you rather work...",
    options: [
      { label: "Mostly indoors, at a desk or in a lab", tags: ["technology", "science"] },
      { label: "Out and about, hands-on", tags: ["practical"] },
      { label: "In an office, meeting people", tags: ["business", "people"] },
      { label: "Somewhere creative -- design, media, art", tags: ["creative"] },
    ],
  },
  {
    id: "task-preference",
    question: "Which task would you enjoy more?",
    options: [
      { label: "Solving a technical problem or writing code", tags: ["technology"] },
      { label: "Planning a budget or running a small business", tags: ["business"] },
      { label: "Running an experiment or analysing data", tags: ["science"] },
      { label: "Organising an event or supporting a team", tags: ["people"] },
    ],
  },
];
