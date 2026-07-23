import { describe, expect, it } from "vitest";
import { daysUntil, formatDeadlineCountdown } from "./deadline";

const now = new Date("2026-07-23T00:00:00Z");

describe("daysUntil", () => {
  it("returns null when there is no closing date", () => {
    expect(daysUntil(null, now)).toBeNull();
  });

  it("returns a positive count for a future date", () => {
    expect(daysUntil("2026-08-02", now)).toBe(10);
  });

  it("returns a negative count for a past date", () => {
    expect(daysUntil("2026-07-13", now)).toBe(-10);
  });
});

describe("formatDeadlineCountdown", () => {
  it("no closing date on record", () => {
    expect(formatDeadlineCountdown(null, now)).toBe("No closing date on record");
  });

  it("already closed", () => {
    expect(formatDeadlineCountdown("2026-07-01", now)).toBe("Closed");
  });

  it("closes today", () => {
    expect(formatDeadlineCountdown("2026-07-23T12:00:00Z", now)).toBe("Closes today");
  });

  it("closes tomorrow", () => {
    expect(formatDeadlineCountdown("2026-07-24", now)).toBe("Closes tomorrow");
  });

  it("N days left", () => {
    expect(formatDeadlineCountdown("2026-08-02", now)).toBe("10 days left");
  });
});
