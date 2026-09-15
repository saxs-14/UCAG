import { describe, expect, it } from "vitest";
import { detectBursaryRiskFlags, scoreBursaryScamRiskForListing } from "./detectRisk";
import { isSafeToPublish } from "../bursarySafety";
import type { BursaryScamCheckInput } from "../bursarySafety";

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

  it("flags a scam listing the keyword check alone would miss, via the ML classifier", () => {
    // No exact match for any upfront-payment keyword here -- "quick
    // refundable fee" isn't "registration fee"/"admin fee"/etc -- this is
    // exactly the gap the ML classifier exists to close.
    const scam: BursaryScamCheckInput = {
      ...cleanListing,
      rawText:
        "Amazing news, you have been chosen for a guaranteed cash bursary! To unlock your funds today, just send a quick refundable fee via EFT before midnight or you will lose this exclusive opportunity forever.",
    };
    const flags = detectBursaryRiskFlags(scam);
    expect(flags).not.toContain("requiresUpfrontPayment");
    expect(flags).toContain("mlHighScamRisk");
    expect(isSafeToPublish(flags)).toBe(false);
  });

  it("does not ML-flag a genuinely clean, fully-described listing", () => {
    const clean: BursaryScamCheckInput = {
      ...cleanListing,
      rawText:
        "The ABC Foundation bursary covers tuition and accommodation for engineering students who achieve at least 70% for Mathematics in matric. Apply through the official ABC Foundation website; there is no cost to apply and selection is based on academic merit.",
    };
    expect(detectBursaryRiskFlags(clean)).toEqual([]);
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

describe("scoreBursaryScamRiskForListing", () => {
  it("prefers rawText over the structured fields when both are present", () => {
    const scoreWithScamRawText = scoreBursaryScamRiskForListing({
      ...cleanListing,
      rawText:
        "Amazing news, you have been chosen for a guaranteed cash bursary! To unlock your funds today, just send a quick refundable fee via EFT before midnight or you will lose this exclusive opportunity forever.",
    });
    expect(scoreWithScamRawText).toBeGreaterThan(0.5);
  });

  it("falls back to name/value/criteria when rawText is absent", () => {
    const score = scoreBursaryScamRiskForListing(cleanListing);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});
