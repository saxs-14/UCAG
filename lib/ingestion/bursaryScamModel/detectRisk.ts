import "server-only";
import type { BursaryRiskFlag } from "@/lib/firestore/types";
import type { BursaryScamCheckInput } from "../bursarySafety";
import { scoreBursaryScamRisk } from "./classify";

/**
 * Bursary/internship scam rules, encoded per CLAUDE.md non-negotiable #5
 * and docs/MASTER_PROMPT_v2.md Phase 4 ("Bursary and internship
 * safety"). Bursary scams targeting South African school-leavers are a
 * real, active problem -- these checks run on every candidate listing
 * before it can be routed anywhere near auto-publish or the
 * verification queue as "safe."
 *
 * server-only because this pulls in classify.ts's trained model -- this
 * only ever needs to run once, at ingestion time, never in a page a
 * learner's browser renders. See bursarySafety.ts's own comment for why
 * that split matters.
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

/** Deliberately conservative (matches lib/ingestion/route.ts's own
 * MIN_AUTO_PUBLISH_CONFIDENCE bar for the same reason): the classifier in
 * classify.ts was trained on hand-written examples, not a scraped
 * real-world corpus (see trainingData.ts), so it only gets to add a hard
 * auto-reject flag -- same weight as the deterministic keyword checks
 * below -- when it is very confident. A moderate score isn't discarded;
 * it's exposed via scoreBursaryScamRiskForListing() below for whatever
 * eventually reviews queued listings to use as a second opinion, without
 * it being able to silently hide a real bursary over an ambiguous
 * prediction. */
const ML_HIGH_RISK_THRESHOLD = 0.9;

function resolveText(input: BursaryScamCheckInput): string {
  return input.rawText ?? [input.name, input.value, ...input.criteria].join(" ");
}

/** Returns the ML classifier's estimated probability that this listing is
 * a scam, in [0, 1]. Exposed separately from detectBursaryRiskFlags so a
 * future admin review queue can show the actual score, not just a
 * boolean -- see ML_HIGH_RISK_THRESHOLD's comment for why only very high
 * scores become a hard flag. */
export function scoreBursaryScamRiskForListing(input: BursaryScamCheckInput): number {
  return scoreBursaryScamRisk(resolveText(input));
}

/** Never publish a listing with any of these flags -- see
 * lib/ingestion/route.ts, which treats bursaries/internships as
 * always-high-risk regardless of confidence for exactly this reason. */
export function detectBursaryRiskFlags(input: BursaryScamCheckInput): BursaryRiskFlag[] {
  const flags: BursaryRiskFlag[] = [];
  const text = resolveText(input);
  const haystack = text.toLowerCase();

  if (UPFRONT_PAYMENT_KEYWORDS.some((keyword) => haystack.includes(keyword))) {
    flags.push("requiresUpfrontPayment");
  }

  if (!input.providerWebsiteUrl) {
    flags.push("noVerifiableProviderWebsite");
  }

  if (input.sourceType === "socialMedia") {
    flags.push("sourcedFromSocialMediaOnly");
  }

  if (scoreBursaryScamRisk(text) >= ML_HIGH_RISK_THRESHOLD) {
    flags.push("mlHighScamRisk");
  }

  return flags;
}
