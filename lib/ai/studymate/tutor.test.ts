import { describe, expect, it } from "vitest";
import { generateTutorResponse, buildTutorSystemPrompt } from "./tutor";

describe("tutor.ts", () => {
  it("generates Socratic response for quadratic questions", () => {
    const res = generateTutorResponse("Explain quadratic equations", [], "MATH");
    expect(res.sender).toBe("tutor");
    expect(res.text).toContain("Step 1");
    expect(res.text).toContain("Example");
    expect(res.text).toContain("try");
  });

  it("builds system prompt specifying 5-step tutoring methodology", () => {
    const prompt = buildTutorSystemPrompt("MATH");
    expect(prompt).toContain("Explain");
    expect(prompt).toContain("Example");
    expect(prompt).toContain("Try");
    expect(prompt).toContain("Feedback");
    expect(prompt).toContain("Retry");
  });
});
