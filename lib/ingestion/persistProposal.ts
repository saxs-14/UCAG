import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import type { ApplicationWindow, IngestionRun, VerificationQueueItem } from "@/lib/firestore/types";

/**
 * Real Firestore writers for the ingestion pipeline's two output
 * collections -- the queue console (Phase 7) and run history have been
 * ready to read real data since they were built; nothing has ever
 * written to either until now.
 */

export async function persistVerificationQueueItem(
  item: Omit<VerificationQueueItem, "id">
): Promise<string> {
  const db = getAdminDb();
  const ref = db.collection("verificationQueue").doc();
  await ref.set({ id: ref.id, ...item });
  return ref.id;
}

export async function persistIngestionRun(run: Omit<IngestionRun, "id">): Promise<string> {
  const db = getAdminDb();
  const ref = db.collection("ingestionRuns").doc();
  await ref.set({ id: ref.id, ...run });
  return ref.id;
}

/** Institution-wide application window (programmeId: null) currently on
 * record for this institution, if any -- what a proposal is diffed
 * against. Two equality filters, no orderBy -- doesn't need a composite
 * index. */
export async function getCurrentApplicationWindow(
  institutionId: string
): Promise<ApplicationWindow | null> {
  const db = getAdminDb();
  const snapshot = await db
    .collection("applicationWindows")
    .where("institutionId", "==", institutionId)
    .where("programmeId", "==", null)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0]!.data() as ApplicationWindow;
}
