import { describe, expect, it } from "vitest";
import { detectBursaryRiskFlags, isPastClosingDate, isSafeToPublish } from "./bursarySafety";
import type { BursaryScamCheckInput } from "./bursarySafety";

const cleanListing: BursaryScamCheckInput = {
  name: "ABC Foundation STEM Bursary",
  value: "Full tuition, accommodation, and a laptop",
  criteria: ["Matric with 70%+ average", "South African citizen", "Studying an engineering field"],
  providerWebsiteUrl: "https://abcfoundation.example.test/",
  sourceType: "officialProviderSite",
};

describe("detectBursaryRiskFlags", () => {
  it("flags nothing on a clean, verifiable listing", () => {
    expect(detectBursaryRiskFlags(cleanListing)).toEqual([]);
    expect(isSafeToPublish(detectBursaryRiskFlags(cleanListing))).toBe(true);
  });

  it("flags an upfront-payment scam pattern found in the criteria text", () => {
    const scam: BursaryScamCheckInput = {
      ...cleanListing,
      criteria: ["Pay a R150 registration fee to activate your application"],
    };
    const flags = detectBursaryRiskFlags(scam);
    expect(flags).toContain("requiresUpfrontPayment");
    expect(isSafeToPublish(flags)).toBe(false);
  });

  it("flags an upfront-payment pattern found in the value/description text", () => {
    const scam: BursaryScamCheckInput = {
      ...cleanListing,
      value: "R20 000 -- an admin fee applies before disbursement",
    };
    expect(detectBursaryRiskFlags(scam)).toContain("requiresUpfrontPayment");
  });

  it("flags a listing with no verifiable provider website", () => {
    const flags = detectBursaryRiskFlags({ ...cleanListing, providerWebsiteUrl: null });
    expect(flags).toContain("noVerifiableProviderWebsite");
  });

  it("flags a listing sourced only from social media", () => {
    const flags = detectBursaryRiskFlags({ ...cleanListing, sourceType: "socialMedia" });
    expect(flags).toContain("sourcedFromSocialMediaOnly");
  });

  it("a listing can carry multiple flags at once", () => {
    const flags = detectBursaryRiskFlags({
      ...cleanListing,
      providerWebsiteUrl: null,
      sourceType: "socialMedia",
      criteria: ["registration fee required"],
    });
    expect(flags).toHaveLength(3);
    expect(isSafeToPublish(flags)).toBe(false);
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
