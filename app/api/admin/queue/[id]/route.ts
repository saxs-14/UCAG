import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { adminErrorResponse } from "@/lib/admin/respond";
import { isEditableFactCollection } from "@/lib/admin/allowlist";
import { getAdminDb } from "@/lib/firebase/admin";

/**
 * Verification queue approve/edit/reject (docs/MASTER_PROMPT_v2.md Phase
 * 7: "Approve / edit / reject, one keystroke each"). Approve writes the
 * queue item's proposedValue; edit writes a human-supplied replacement
 * instead; reject writes nothing to the target document. Either way the
 * queue item itself is stamped reviewed so it can't be actioned twice.
 */

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve") }),
  z.object({ action: z.literal("reject") }),
  z.object({ action: z.literal("edit"), editedValue: z.unknown() }),
]);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    proposedValue: unknown;
    sourceUrl: string;
    status: string;
  };

  if (item.status !== "pending") {
    return NextResponse.json(
      { error: `This item was already reviewed (status: ${item.status}).` },
      { status: 409 }
    );
  }

  if (!isEditableFactCollection(item.collection)) {
    return NextResponse.json(
      { error: `Refusing to write to collection "${item.collection}" -- not on the editable-fact allowlist.` },
      { status: 422 }
    );
  }

  const { action } = parsedBody.data;
  const now = new Date().toISOString();
  const newStatus = action === "reject" ? "rejected" : action === "edit" ? "edited" : "approved";
  const batch = db.batch();

  if (action !== "reject") {
    const value = action === "edit" ? parsedBody.data.editedValue : item.proposedValue;
    const targetRef = db.collection(item.collection).doc(item.docId);
    batch.set(
      targetRef,
      { [item.field]: value, sourceUrl: item.sourceUrl, verifiedOn: now.slice(0, 10) },
      { merge: true }
    );
  }

  batch.update(queueRef, { status: newStatus, reviewedBy: admin.uid, reviewedAt: now });
  await batch.commit();

  return NextResponse.json({ ok: true, status: newStatus });
}
