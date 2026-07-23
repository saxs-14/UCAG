import { checkLinksHealth, type LinkHealthResult } from "./linkHealth";
import type { Institution } from "@/lib/firestore/types";

export function collectInstitutionUrls(institutions: Institution[]): string[] {
  const urls = new Set<string>();
  for (const institution of institutions) {
    if (institution.websiteUrl) urls.add(institution.websiteUrl);
    if (institution.applicationPortalUrl) urls.add(institution.applicationPortalUrl);
    if (institution.statusCheckUrl) urls.add(institution.statusCheckUrl);
    if (institution.appliesThroughThirdParty) urls.add(institution.appliesThroughThirdParty);
  }
  return Array.from(urls);
}

export interface LinkHealthRunSummary {
  startedAt: string;
  finishedAt: string;
  checkedCount: number;
  deadCount: number;
  results: LinkHealthResult[];
  dryRun: boolean;
  firestoreWritesPerformed: number;
}

/**
 * The one ingestion task that's actually runnable right now with zero
 * external dependencies (no LLM key, no live Firebase project needed) --
 * see README.md Phase 4 status for why the rest of the pipeline
 * (extract/corroborate/publish against Firestore) is architecture-ready
 * but not live-executable yet.
 *
 * dryRun: true (the only supported mode today) never touches Firestore --
 * it just returns what it found. dryRun: false is deliberately
 * unimplemented rather than silently pretending to write: when a real
 * Firebase project exists, this is where getAdminDb() writes dead-link
 * flags per the linkHealthCheck cadence rule's autoPublish: true (a dead
 * link is safe to flag automatically -- it doesn't assert a new fact, it
 * just marks an existing one unreachable).
 */
export async function runLinkHealthCheck(
  institutions: Institution[],
  options: { dryRun: boolean; fetchImpl?: typeof fetch }
): Promise<LinkHealthRunSummary> {
  if (!options.dryRun) {
    // Fail fast, before spending any time on network requests -- there's
    // no point checking 24+ URLs just to throw at the end.
    throw new Error(
      "Non-dry-run link health writes are not implemented yet -- no live Firestore project is connected for v2. Use dryRun: true."
    );
  }

  const startedAt = new Date().toISOString();
  const urls = collectInstitutionUrls(institutions);
  const results = await checkLinksHealth(urls, options.fetchImpl);
  const deadCount = results.filter((r) => !r.alive).length;

  return {
    startedAt,
    finishedAt: new Date().toISOString(),
    checkedCount: results.length,
    deadCount,
    results,
    dryRun: true,
    firestoreWritesPerformed: 0,
  };
}
