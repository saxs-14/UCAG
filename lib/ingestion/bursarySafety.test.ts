import { describe, expect, it } from "vitest";
import { isPastClosingDate, isSafeToPublish } from "./bursarySafety";

describe("isSafeToPublish", () => {
  it("is true when there are no risk flags", () => {
    expect(isSafeToPublish([])).toBe(true);
  });

  it("is false when any risk flag is present", () => {
    expect(isSafeToPublish(["requiresUpfrontPayment"])).toBe(false);
  });
});

describe("isPastClosingDate", () => {
  const now = new Date("2026-07-23T00:00:00Z");

  it("returns false when there is no closing date on record", () => {
    expect(isPastClosingDate(null, now)).toBe(false);
  });

  it("returns true once the closing date has passed", () => {
    expect(isPastClosingDate("2026-06-01", now)).toBe(true);
  });

  it("returns false for a future closing date", () => {
    expect(isPastClosingDate("2026-12-01", now)).toBe(false);
  });
});
