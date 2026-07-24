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
 * The one ingestion task that's actually runnable end-to-end with zero
 * external dependencies (no LLM key needed) -- see README.md Phase 4
 * status for why the rest of the pipeline (extract/corroborate/publish
 * against Firestore) is architecture-ready but not live-executable yet.
 *
 * dryRun: true never touches Firestore -- it just returns what it found.
 * dryRun: false persists via `writeImpl` (Phase 7: the admin console's
 * "Dead link report" needs something to read). `writeImpl` defaults to
 * the real Firestore-backed lib/ingestion/persistLinkHealth.ts, imported
 * lazily so a dry-run call -- or a unit test that injects its own
 * writeImpl -- never pulls in the Firebase Admin SDK at all.
 */
export async function runLinkHealthCheck(
  institutions: Institution[],
  options: {
    dryRun: boolean;
    fetchImpl?: typeof fetch;
    writeImpl?: (results: LinkHealthResult[]) => Promise<number>;
  }
): Promise<LinkHealthRunSummary> {
  const startedAt = new Date().toISOString();
  const urls = collectInstitutionUrls(institutions);
  const results = await checkLinksHealth(urls, options.fetchImpl);
  const deadCount = results.filter((r) => !r.alive).length;

  let firestoreWritesPerformed = 0;
  if (!options.dryRun) {
    const writeImpl =
      options.writeImpl ?? (await import("./persistLinkHealth")).persistLinkHealthResults;
    firestoreWritesPerformed = await writeImpl(results);
  }

  return {
    startedAt,
    finishedAt: new Date().toISOString(),
    checkedCount: results.length,
    deadCount,
    results,
    dryRun: options.dryRun,
    firestoreWritesPerformed,
  };
}
