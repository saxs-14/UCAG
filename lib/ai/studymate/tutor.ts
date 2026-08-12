import type { TutorMessage } from "@/lib/studymate/types";

export function generateTutorResponse(
  userQuery: string,
  history: TutorMessage[],
  subjectCode: string = "MATH"
): TutorMessage {
  const queryLower = userQuery.toLowerCase();
  const stepCount = history.filter((m) => m.sender === "tutor").length + 1;

  let replyText = "";

  if (queryLower.includes("quadratic") || queryLower.includes("algebra")) {
    replyText = `**Step 1: Understand the Goal**\nQuadratic equations are equations of the form $ax^2 + bx + c = 0$. Our goal is to find the values of $x$ that make the equation zero.\n\n**Example:** $x^2 - 5x + 6 = 0$.\nWe need two numbers that multiply to $+6$ and add up to $-5$. Those numbers are $-2$ and $-3$.\nSo $(x - 2)(x - 3) = 0$, which gives $x = 2$ or $x = 3$.\n\n**Now your turn to try:**\nCan you factorise $x^2 - 7x + 12 = 0$? What two numbers multiply to $+12$ and add up to $-7$?`;
  } else if (queryLower.includes("pythagoras") || queryLower.includes("geometry")) {
    replyText = `**Step 1: The Core Formula**\nIn any right-angled triangle, the square of the hypotenuse ($c$) equals the sum of squares of the other two sides ($a$ and $b$): $a^2 + b^2 = c^2$.\n\n**Example:** If side $a = 3$ and side $b = 4$, then $c^2 = 3^2 + 4^2 = 9 + 16 = 25$. So $c = 5$.\n\n**Try this:**\nIf a right triangle has sides $a = 6$ and $b = 8$, what is hypotenuse $c$?`;
  } else if (queryLower.includes("help") || queryLower.includes("don't understand")) {
    replyText = `That's completely okay! Learning takes iteration. Let's break it down together.\n\nTell me: what specific topic or question are you currently working on in ${subjectCode}? Write down the formula or question as best as you can!`;
  } else {
    replyText = `Great question! Let's approach this step by step.\n\n1. **Identify what we know:** Look at the given values in the question.\n2. **Select the formula:** Choose the matching rule for ${subjectCode}.\n3. **Substitute & Solve:** Plug in the numbers.\n\nWould you like me to walk through an example problem for this topic?`;
  }

  return {
    id: `tutor-msg-${Date.now()}`,
    sender: "tutor",
    text: replyText,
    stepNumber: stepCount,
    timestamp: new Date().toISOString(),
  };
}

export function buildTutorSystemPrompt(subjectCode: string): string {
  return `You are VarsityPath AI Tutor -- a patient, encouraging Socratic tutor helping South African matric and high school learners reach their goal of entering university for ${subjectCode}.

TUTORING METHODOLOGY:
Follow the 5-step cycle:
1. Explain the concept simply in plain language.
2. Provide a short worked Example.
3. Ask the student to Try a similar simple practice question.
4. Give constructive Feedback on their attempt.
5. If incorrect, Retry with a simpler hint.

RULES:
- Do NOT simply dump final answers. Guide the learner to discover the answer step by step.
- Keep tone warm, patient, and encouraging.
- Never insult, shame, or label a student's intelligence.
- Never diagnose medical conditions or learning disabilities.`;
}
