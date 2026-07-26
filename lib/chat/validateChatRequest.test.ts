import { describe, expect, it } from "vitest";
import { MAX_MESSAGES, MAX_MESSAGE_LENGTH, validateChatRequest } from "./validateChatRequest";

describe("validateChatRequest", () => {
  it("accepts a single user message", () => {
    const result = validateChatRequest({ messages: [{ role: "user", text: "How is APS calculated?" }] });
    expect(result.valid).toBe(true);
  });

  it("accepts an alternating user/model/user history", () => {
    const result = validateChatRequest({
      messages: [
        { role: "user", text: "Hi" },
        { role: "model", text: "Hello! How can I help?" },
        { role: "user", text: "What does 'almost qualify' mean?" },
      ],
    });
    expect(result.valid).toBe(true);
  });

  it("rejects when the body isn't the right shape", () => {
    expect(validateChatRequest({}).valid).toBe(false);
    expect(validateChatRequest(null).valid).toBe(false);
    expect(validateChatRequest({ messages: "not an array" }).valid).toBe(false);
  });

  it("rejects an empty messages array", () => {
    expect(validateChatRequest({ messages: [] }).valid).toBe(false);
  });

  it("rejects when the last message isn't from the user", () => {
    const result = validateChatRequest({
      messages: [{ role: "model", text: "I'm the assistant, not the user." }],
    });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/last message must be from the user/);
  });

  it("rejects a message over MAX_MESSAGE_LENGTH", () => {
    const result = validateChatRequest({
      messages: [{ role: "user", text: "x".repeat(MAX_MESSAGE_LENGTH + 1) }],
    });
    expect(result.valid).toBe(false);
  });

  it("rejects more than MAX_MESSAGES messages", () => {
    const messages = Array.from({ length: MAX_MESSAGES + 1 }, (_, i) => ({
      role: (i % 2 === 0 ? "user" : "model") as "user" | "model",
      text: "hi",
    }));
    const result = validateChatRequest({ messages });
    expect(result.valid).toBe(false);
  });

  it("rejects an invalid role", () => {
    const result = validateChatRequest({ messages: [{ role: "system", text: "hi" }] });
    expect(result.valid).toBe(false);
  });

  it("rejects an empty message string", () => {
    const result = validateChatRequest({ messages: [{ role: "user", text: "" }] });
    expect(result.valid).toBe(false);
  });
});
