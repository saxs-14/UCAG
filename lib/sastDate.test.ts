import { describe, expect, it } from "vitest";
import { parseSastDayEnd, parseSastDayStart } from "./sastDate";

describe("parseSastDayStart", () => {
  it("treats a date-only string as SAST midnight, not UTC midnight", () => {
    // SAST midnight on 2026-06-01 is 2026-05-31T22:00:00Z (SAST = UTC+2).
    expect(parseSastDayStart("2026-06-01")).toBe(Date.parse("2026-05-31T22:00:00.000Z"));
  });

  it("passes a full ISO timestamp through unchanged", () => {
    expect(parseSastDayStart("2026-06-01T10:30:00.000Z")).toBe(
      Date.parse("2026-06-01T10:30:00.000Z")
    );
  });
});

describe("parseSastDayEnd", () => {
  it("treats a date-only string as the last millisecond of that SAST day", () => {
    // 23:59:59.999 SAST on 2026-11-30 is 2026-11-30T21:59:59.999Z.
    expect(parseSastDayEnd("2026-11-30")).toBe(Date.parse("2026-11-30T21:59:59.999Z"));
  });

  it("passes a full ISO timestamp through unchanged", () => {
    expect(parseSastDayEnd("2026-11-30T18:00:00.000Z")).toBe(
      Date.parse("2026-11-30T18:00:00.000Z")
    );
  });

  it("regression: a learner applying at 3pm SAST on the stated closing day is still within the window", () => {
    const closesOn = "2026-11-30";
    const learnerAppliesAt = Date.parse("2026-11-30T15:00:00+02:00"); // 3pm SAST
    expect(learnerAppliesAt).toBeLessThanOrEqual(parseSastDayEnd(closesOn));
  });

  it("regression: the naive new Date(dateOnlyString) parse would have failed the same check", () => {
    const closesOn = "2026-11-30";
    const learnerAppliesAt = Date.parse("2026-11-30T15:00:00+02:00");
    // Documents the bug this file fixes: without SAST-aware parsing, this
    // learner (applying mid-afternoon on the actual closing day) would
    // already be past the naive UTC-midnight cutoff.
    expect(learnerAppliesAt).toBeGreaterThan(new Date(closesOn).getTime());
  });
});
