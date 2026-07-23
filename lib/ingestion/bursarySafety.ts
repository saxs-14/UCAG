import type { BursaryRiskFlag } from "@/lib/firestore/types";

/**
 * Bursary/internship scam rules, encoded per CLAUDE.md non-negotiable
 * #5 and docs/MASTER_PROMPT_v2.md Phase 4 ("Bursary and internship
 * safety"). Bursary scams targeting South African school-leavers are a
 * real, active problem -- these checks run on every candidate listing
 * before it can be routed anywhere near auto-publish or the
 * verification queue as "safe."
 */

const UPFRONT_PAYMENT_KEYWORDS = [
  "registration fee",
  "admin fee",
  "administration fee",
  "processing fee",
  "activation fee",
  "insurance fee",
  "upfront payment",
  "pay to apply",
  "deposit required",
];

export type ListingSourceType = "officialProviderSite" | "aggregator" | "socialMedia";

export interface BursaryScamCheckInput {
  name: string;
  value: string;
  criteria: string[];
  providerWebsiteUrl: string | null;
  sourceType: ListingSourceType;
}

/** Never publish a listing with any of these flags -- see
 * lib/ingestion/route.ts, which treats bursaries/internships as
 * always-high-risk regardless of confidence for exactly this reason. */
export function detectBursaryRiskFlags(input: BursaryScamCheckInput): BursaryRiskFlag[] {
  const flags: BursaryRiskFlag[] = [];
  const haystack = [input.name, input.value, ...input.criteria].join(" ").toLowerCase();

  if (UPFRONT_PAYMENT_KEYWORDS.some((keyword) => haystack.includes(keyword))) {
    flags.push("requiresUpfrontPayment");
  }

  if (!input.providerWebsiteUrl) {
    flags.push("noVerifiableProviderWebsite");
  }

  if (input.sourceType === "socialMedia") {
    flags.push("sourcedFromSocialMediaOnly");
  }

  return flags;
}

export function isSafeToPublish(flags: BursaryRiskFlag[]): boolean {
  return flags.length === 0;
}

/** Listings past their closing date are hidden automatically, not left
 * to rot (docs/MASTER_PROMPT_v2.md Phase 4). No closing date on record
 * is not treated as expired -- that would hide legitimately open-ended
 * listings. */
export function isPastClosingDate(closesOn: string | null, now: Date): boolean {
  if (!closesOn) return false;
  return new Date(closesOn).getTime() < now.getTime();
}
