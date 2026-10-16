import { describe, expect, it } from "vitest";
import { validateTrackRequest } from "./validateTrackRequest";

describe("validateTrackRequest", () => {
  it("accepts each of the three valid event names", () => {
    for (const event of ["calculator_completed", "programme_search", "funding_discovery_view"]) {
      const result = validateTrackRequest({ event });
      expect(result.valid).toBe(true);
      if (result.valid) expect(result.event).toBe(event);
    }
  });

  it("rejects when the body isn't the right shape", () => {
    expect(validateTrackRequest({}).valid).toBe(false);
    expect(validateTrackRequest(null).valid).toBe(false);
    expect(validateTrackRequest("calculator_completed").valid).toBe(false);
  });

  it("rejects an event name not on the allowlist -- no free-form events accepted", () => {
    expect(validateTrackRequest({ event: "literally_anything_else" }).valid).toBe(false);
    expect(validateTrackRequest({ event: "" }).valid).toBe(false);
  });

  it("ignores extra fields rather than accepting them as data to track", () => {
    const result = validateTrackRequest({ event: "calculator_completed", userId: "should-be-ignored", note: "x" });
    expect(result.valid).toBe(true);
    if (result.valid) expect(result).toEqual({ valid: true, event: "calculator_completed" });
  });
});
