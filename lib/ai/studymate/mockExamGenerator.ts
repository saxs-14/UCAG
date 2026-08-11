import type { MockExam, StudyGrade } from "@/lib/studymate/types";
import { validateMockExam } from "./assessmentValidator";

export function generateLocalMockExam(
  subjectCode: string,
  grade: StudyGrade = "Grade 12"
): MockExam {
  const exam: MockExam = {
    id: `mock-${subjectCode.toLowerCase()}-${Date.now()}`,
    title: `${grade} ${subjectCode} Practice Examination`,
    subjectCode,
    grade,
    durationMinutes: 180,
    totalMarks: 150,
    instructions: [
      "This question paper consists of 2 sections.",
      "Answer ALL questions.",
      "Show all calculations, diagrams, and formulas where applicable.",
      "Number the answers correctly according to the numbering system used in this question paper.",
    ],
    sections: [
      {
        title: "Section A: Algebra & Functions",
        totalMarks: 75,
        questions: [
          {
            id: "m-q1",
            questionNumber: "Question 1",
            text: "1.1 Solve for x: x² - 5x + 6 = 0 [3 marks]\n1.2 Solve for x: 3^(x+1) = 27 [3 marks]\n1.3 Given f(x) = 2x² - 4, determine f'(x) using first principles. [5 marks]",
            marks: 11,
            modelAnswer: "1.1 (x-2)(x-3)=0 => x=2 or x=3\n1.2 3^(x+1) = 3^3 => x+1=3 => x=2\n1.3 f'(x) = lim(h->0) [2(x+h)²-4 - (2x²-4)]/h = 4x.",
          },
          {
            id: "m-q2",
            questionNumber: "Question 2",
            text: "2.1 Sketch the graph of g(x) = 2/(x-1) + 3, showing all asymptotes and axis intercepts. [8 marks]\n2.2 State the domain and range of g. [4 marks]",
            marks: 12,
            modelAnswer: "2.1 Asymptotes: x=1, y=3. Intercepts: (0, 1) and (-1/3, 0).\n2.2 Domain: x ∈ R, x ≠ 1. Range: y ∈ R, y ≠ 3.",
          },
          {
            id: "m-q3",
            questionNumber: "Question 3",
            text: "3.1 The sum of the first n terms of an arithmetic series is Sn = 3n² + 2n. Determine the first three terms of the sequence. [6 marks]",
            marks: 6,
            modelAnswer: "S1 = T1 = 5. S2 = T1 + T2 = 16 => T2 = 11. T3 = S3 - S2 = 33 - 16 = 17. Sequence: 5, 11, 17.",
          },
          {
            id: "m-q4",
            questionNumber: "Question 4",
            text: "4.1 Financial Mathematics: An investment of R50 000 accumulates interest at 8.5% p.a. compounded monthly. Calculate the value of the investment after 5 years. [6 marks]",
            marks: 6,
            modelAnswer: "A = P(1 + i/n)^(n*t) = 50000(1 + 0.085/12)^(60) = R76,377.92.",
          },
          {
            id: "m-q5",
            questionNumber: "Question 5",
            text: "5.1 Differential Calculus: A rectangular box with an open top has a square base of side length x metres and height h metres. If the volume is 32 m³, find the minimum surface area. [12 marks]",
            marks: 12,
            modelAnswer: "V = x²h = 32 => h = 32/x². S = x² + 4xh = x² + 128/x. S'(x) = 2x - 128/x² = 0 => x³ = 64 => x = 4m, h = 2m. Min area = 48 m².",
          },
          {
            id: "m-q6",
            questionNumber: "Question 6",
            text: "6.1 Probability & Statistics: Events A and B are independent. P(A) = 0.4 and P(B) = 0.5. Calculate P(A or B). [4 marks]",
            marks: 4,
            modelAnswer: "P(A and B) = P(A)*P(B) = 0.2. P(A or B) = P(A) + P(B) - P(A and B) = 0.4 + 0.5 - 0.2 = 0.7.",
          },
          {
            id: "m-q7",
            questionNumber: "Question 7",
            text: "7.1 Comprehensive Problem Solving: A factory produces items where the cost function is C(x) = 5000 + 200x - 0.5x². Determine the production level x that minimises marginal cost. [16 marks]",
            marks: 16,
            modelAnswer: "C'(x) = 200 - x = 0 => x = 200 items.",
          },
        ],
      },
      {
        title: "Section B: Geometry & Trigonometry",
        totalMarks: 75,
        questions: [
          {
            id: "m-q8",
            questionNumber: "Question 8",
            text: "8.1 Analytical Geometry: Find the equation of the circle passing through (0,0) with centre at (3,4). [6 marks]",
            marks: 6,
            modelAnswer: "r² = 3² + 4² = 25. Circle equation: (x - 3)² + (y - 4)² = 25.",
          },
          {
            id: "m-q9",
            questionNumber: "Question 9",
            text: "9.1 Trigonometric Identities: Prove that sin(2x)/(1 + cos(2x)) = tan(x). [6 marks]",
            marks: 6,
            modelAnswer: "LHS = (2 sin x cos x)/(1 + 2 cos² x - 1) = (2 sin x cos x)/(2 cos² x) = sin x / cos x = tan x = RHS.",
          },
          {
            id: "m-q10",
            questionNumber: "Question 10",
            text: "10.1 Sine & Cosine Rules: In triangle ABC, AB = 7 cm, BC = 9 cm, and angle B = 60°. Calculate the length of AC. [8 marks]",
            marks: 8,
            modelAnswer: "AC² = 7² + 9² - 2(7)(9) cos(60°) = 49 + 81 - 126(0.5) = 130 - 63 = 67 => AC = √67 ≈ 8.19 cm.",
          },
          {
            id: "m-q11",
            questionNumber: "Question 11",
            text: "11.1 Euclidean Geometry: In circle O, chord AB is parallel to chord CD. Prove that arc AC = arc BD. [10 marks]",
            marks: 10,
            modelAnswer: "Alternate interior angles equal => inscribed angles subtending arcs AC and BD are equal => arc AC = arc BD.",
          },
          {
            id: "m-q12",
            questionNumber: "Question 12",
            text: "12.1 Circle Theorems: Prove that the angle subtended by an arc at the centre of a circle is double the angle subtended by it at any point on the circumference. [12 marks]",
            marks: 12,
            modelAnswer: "Standard circle theorem proof using isosceles triangles created by radii.",
          },
          {
            id: "m-q13",
            questionNumber: "Question 13",
            text: "13.1 Trigonometric Equations: Solve for θ in the interval [0°, 360°]: 2 sin²(θ) - 3 sin(θ) + 1 = 0. [15 marks]",
            marks: 15,
            modelAnswer: "(2 sin θ - 1)(sin θ - 1) = 0 => sin θ = 1/2 or sin θ = 1 => θ = 30°, 150°, or 90°.",
          },
          {
            id: "m-q14",
            questionNumber: "Question 14",
            text: "14.1 3D Trigonometric Application: A vertical tower TP stands on a horizontal plane. From points A and B on the ground, the angles of elevation of T are 30° and 45° respectively. If AB = 50m and angle APB = 90°, calculate the height of the tower. [18 marks]",
            marks: 18,
            modelAnswer: "Let h = TP. PA = h cot 30° = h√3. PB = h cot 45° = h. In right triangle APB: PA² + PB² = AB² => 3h² + h² = 2500 => 4h² = 2500 => h = 25m.",
          },
        ],
      },
    ],
  };

  const val = validateMockExam(exam);
  if (!val.valid) {
    throw new Error(`Mock exam validation failed: ${val.errors.join("; ")}`);
  }

  return exam;
}
