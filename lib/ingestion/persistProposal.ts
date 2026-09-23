import "server-only";
import { createHash } from "node:crypto";
import { getAdminDb } from "@/lib/firebase/admin";
import type { ApplicationWindow, Bursary, IngestionRun, Programme, VerificationQueueItem } from "@/lib/firestore/types";

/**
 * Real Firestore writers for the ingestion pipeline's two output
 * collections -- the queue console (Phase 7) and run history have been
 * ready to read real data since they were built; nothing has ever
 * written to either until now.
 */

function proposalKey(item: Omit<VerificationQueueItem, "id">): string {
  const canonical = JSON.stringify({
    collection: item.collection,
    docId: item.docId,
    field: item.field,
    currentValue: item.currentValue ?? null,
    proposedValue: item.proposedValue ?? null,
    sourceUrl: item.sourceUrl,
  });
  return createHash("sha256").update(canonical).digest("hex");
}

export async function persistVerificationQueueItem(
  item: Omit<VerificationQueueItem, "id">
): Promise<string> {
  const db = getAdminDb();
  const key = proposalKey(item);
  const pendingQuery = db
    .collection("verificationQueue")
    .where("proposalKey", "==", key)
    .where("status", "==", "pending")
    .limit(1);

  return db.runTransaction(async (transaction) => {
    const existing = await transaction.get(pendingQuery);
    if (!existing.empty) return existing.docs[0]!.id;

    const ref = db.collection("verificationQueue").doc();
    transaction.set(ref, { id: ref.id, proposalKey: key, ...item });
    return ref.id;
  });
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

/** Programme on record for this exact derived docId, if any -- what a
 * programmeRequirements proposal is diffed against. See
 * lib/ingestion/programmeRequirementsPipeline.ts for how docId is
 * derived and its known collision/drift limitations. */
export async function getExistingProgramme(docId: string): Promise<Programme | null> {
  const db = getAdminDb();
  const doc = await db.collection("programmes").doc(docId).get();
  if (!doc.exists) return null;
  return doc.data() as Programme;
}

/** Bursary on record for this exact derived docId, if any -- what a
 * bursaries proposal is diffed against. See lib/ingestion/bursaryPipeline.ts
 * for how docId is derived and its known collision/drift limitations. */
export async function getExistingBursary(docId: string): Promise<Bursary | null> {
  const db = getAdminDb();
  const doc = await db.collection("bursaries").doc(docId).get();
  if (!doc.exists) return null;
  return doc.data() as Bursary;
}
