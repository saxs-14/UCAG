/**
 * Real Firestore writer for the link health checker (Phase 7 "Dead link
 * report"). Only imported when lib/ingestion/pipeline.ts's
 * runLinkHealthCheck actually needs to write (dryRun: false and no
 * writeImpl was injected) -- see that file for why it's a dynamic import
 * rather than a top-level one.
 *
 * Upserts one doc per URL (keyed by a stable, filesystem/Firestore-safe
 * slug of the URL) rather than appending -- the report should always show
 * the current state of each link, not an ever-growing history.
 */

import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import type { LinkHealthResult } from "./linkHealth";

export function slugForUrl(url: string): string {
  return Buffer.from(url).toString("base64url");
}

export async function persistLinkHealthResults(results: LinkHealthResult[]): Promise<number> {
  if (results.length === 0) return 0;

  const db = getAdminDb();
  const batch = db.batch();
  for (const result of results) {
    const ref = db.collection("linkHealthChecks").doc(slugForUrl(result.url));
    batch.set(ref, { id: slugForUrl(result.url), ...result }, { merge: true });
  }
  await batch.commit();
  return results.length;
}
