import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { adminErrorResponse } from "@/lib/admin/respond";
import { isEditableFactCollection, isEditableFactField } from "@/lib/admin/allowlist";
import { getAdminDb } from "@/lib/firebase/admin";
import { CURRENT_ACADEMIC_YEAR } from "@/config/academicYear";
import { diffValue } from "@/lib/ingestion/diff";

/**
 * Verification queue approve/edit/reject.
 *
 * Approval is transactional: the queue item must still be pending and the
 * target field must still equal the value captured when the proposal was
 * created. This prevents an older proposal from overwriting a newer verified
 * value when two ingestion runs or two admins race.
 */

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({ action: z.literal("reject") }),
  z.object({ action: z.literal("edit"), editedValue: z.unknown() }),
]);

function valuesEqual(a: unknown, b: unknown): boolean {
  return !diffValue(a, b).changed;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let admin;
  try {
    admin = await requireAdmin(request);
  } catch (err) {
    return adminErrorResponse(err);
  }

  const { id } = await params;
  const parsedBody = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid request body -- expected { action: 'approve' | 'reject' | 'edit', editedValue? }." },
      { status: 400 }
    );
  }

  const db = getAdminDb();
  const queueRef = db.collection("verificationQueue").doc(id);
  const queueSnap = await queueRef.get();
  if (!queueSnap.exists) {
    return NextResponse.json({ error: "Verification queue item not found." }, { status: 404 });
  }

  const item = queueSnap.data() as {
    collection: string;
    docId: string;
    field: string;
    currentValue: unknown;
    proposedValue: unknown;
    sourceUrl: string;
    status: string;
  };

  if (!isEditableFactCollection(item.collection)) {
    return NextResponse.json(
      { error: `Refusing to write to collection "${item.collection}" -- not on the editable-fact allowlist.` },
      { status: 422 }
    );
  }

  if (!isEditableFactField(item.collection, item.field)) {
    return NextResponse.json(
      { error: `Refusing to write field "${item.field}" in collection "${item.collection}".` },
      { status: 422 }
    );
  }

  if (!/^https?:\\/\\//i.test(item.sourceUrl)) {
    return NextResponse.json({ error: "Queue item has an invalid source URL." }, { status: 422 });
  }

  const { action } = parsedBody.data;
  const now = new Date().toISOString();
  const newStatus = action === "reject" ? "rejected" : action === "edit" ? "edited" : "approved";
  const targetRef = db.collection(item.collection).doc(item.docId);

  try {
    await db.runTransaction(async (transaction) => {
      const [freshQueue, freshTarget] = await Promise.all([
        transaction.get(queueRef),
        transaction.get(targetRef),
      ]);

      if (!freshQueue.exists) {
        throw new Error("QUEUE_NOT_FOUND");
      }

      const freshItem = freshQueue.data() as typeof item;
      if (freshItem.status !== "pending") {
        throw new Error("QUEUE_ALREADY_REVIEWED");
      }

      const currentTargetValue = freshTarget.exists
        ? (freshTarget.data() as Record<string, unknown>)[freshItem.field]
        : null;

      if (!valuesEqual(currentTargetValue ?? null, freshItem.currentValue ?? null)) {
        throw new Error("QUEUE_STALE");
      }

      if (action !== "reject") {
        const value = action === "edit" ? parsedBody.data.editedValue : freshItem.proposedValue;
        transaction.set(
          targetRef,
          {
            [freshItem.field]: value,
            sourceUrl: freshItem.sourceUrl,
            verifiedOn: now.slice(0, 10),
            academicYear: CURRENT_ACADEMIC_YEAR,
          },
          { merge: true }
        );
      }

      transaction.update(queueRef, {
        status: newStatus,
        reviewedBy: admin.uid,
        reviewedAt: now,
      });
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === "QUEUE_NOT_FOUND") {
      return NextResponse.json({ error: "Verification queue item not found." }, { status: 404 });
    }
    if (message === "QUEUE_ALREADY_REVIEWED") {
      return NextResponse.json({ error: "This item was already reviewed." }, { status: 409 });
    }
    if (message === "QUEUE_STALE") {
      return NextResponse.json(
        { error: "This proposal is stale because the target value changed after it was queued. Re-run verification before approving it." },
        { status: 409 }
      );
    }
    throw err;
  }

  return NextResponse.json({ ok: true, status: newStatus });
}
