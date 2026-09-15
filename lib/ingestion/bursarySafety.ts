import type { BursaryRiskFlag } from "@/lib/firestore/types";

/**
 * Bursary/internship safety types plus the two checks that also run
 * client-side at display time (lib/bursaries/filter.ts's "defence in
 * depth" re-check) -- kept free of any server-only dependency for
 * exactly that reason. The actual risk-detection logic (keyword scan +
 * ML classifier) that only ever needs to run once, at ingestion time,
 * lives in bursaryScamModel/detectRisk.ts instead, which is marked
 * server-only -- importing anything from it here would silently make
 * this whole file (and therefore the client bundle that needs
 * isSafeToPublish) server-only too, the same mistake lib/env/server.ts's
 * own comment warns about.
 */

export type ListingSourceType = "officialProviderSite" | "aggregator" | "socialMedia";

export interface BursaryScamCheckInput {
  name: string;
  value: string;
  criteria: string[];
  providerWebsiteUrl: string | null;
  sourceType: ListingSourceType;
  /** The full scraped/extracted listing text, when the ingestion step
   * captured one, before it was structured into name/value/criteria --
   * richer signal for both the keyword scan and the ML classifier in
   * bursaryScamModel/detectRisk.ts (urgency/guarantee phrasing tends to
   * live in the surrounding prose, not in a terse value or criteria
   * list). Falls back to name+value+criteria when not available. */
  rawText?: string;
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
