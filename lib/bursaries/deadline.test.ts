import { describe, expect, it } from "vitest";
import { daysUntil, formatApplicationWindow, formatDeadlineCountdown } from "./deadline";

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

describe("formatApplicationWindow", () => {
  it("shows both dates when both are on record", () => {
    expect(formatApplicationWindow("2026-04-01", "2026-08-15")).toBe(
      "Applications: 1 Apr 2026 – 15 Aug 2026"
    );
  });

  it("shows only the opening date when closing isn't confirmed", () => {
    expect(formatApplicationWindow("2026-04-01", null)).toBe("Applications open 1 Apr 2026");
  });

  it("shows only the closing date when opening isn't confirmed", () => {
    expect(formatApplicationWindow(null, "2026-06-30")).toBe("Applications close 30 Jun 2026");
  });

  it("is honest when neither date is confirmed", () => {
    expect(formatApplicationWindow(null, null)).toBe("Application dates not yet confirmed");
  });
});
