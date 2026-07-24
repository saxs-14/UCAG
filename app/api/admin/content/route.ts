import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { adminErrorResponse } from "@/lib/admin/respond";
import { isEditableFactCollection } from "@/lib/admin/allowlist";
import { getAdminDb } from "@/lib/firebase/admin";

/**
 * Content editor: "manual override for any fact, with a mandatory source
 * URL field" (Phase 7 brief, verbatim). A generic patch across the
 * allowlisted fact collections rather than one bespoke form per entity
 * type -- a deliberate scope call for this phase (each collection's real
 * shape is in lib/firestore/types.ts and can grow dedicated forms later
 * without changing this route's contract).
 *
 * sourceUrl is required by the Zod schema, not just documented as a
 * convention -- CLAUDE.md's provenance rule applies to admin-entered
 * facts exactly as much as ingested ones. verifiedOn is always stamped
 * server-side to today; a caller cannot backdate or omit it.
 */

const bodySchema = z.object({
  collection: z.string().min(1),
  docId: z.string().min(1),
  patch: z
    .record(z.string(), z.unknown())
    .refine((v) => Object.keys(v).length > 0, { message: "patch must have at least one field." }),
  sourceUrl: z.string().url(),
});

export async function POST(request: NextRequest) {
  let admin;
  try {
    admin = await requireAdmin(request);
  } catch (err) {
    return adminErrorResponse(err);
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: `Invalid request: ${parsed.error.issues.map((i) => i.message).join("; ")}` },
      { status: 400 }
    );
  }

  const { collection, docId, patch, sourceUrl } = parsed.data;

  if (!isEditableFactCollection(collection)) {
    return NextResponse.json({ error: `"${collection}" is not an editable fact collection.` }, { status: 422 });
  }

  const write = { ...patch, sourceUrl, verifiedOn: new Date().toISOString().slice(0, 10) };
  await getAdminDb().collection(collection).doc(docId).set(write, { merge: true });

  return NextResponse.json({ ok: true, editedBy: admin.uid });
}
