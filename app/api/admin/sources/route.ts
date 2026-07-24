import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { adminErrorResponse } from "@/lib/admin/respond";
import { getAdminDb } from "@/lib/firebase/admin";

/** Source register "add" (Phase 7). Listing/reading happens client-side
 * via Firestore (firestore.rules grants admins read access to `sources`);
 * this route only handles the privileged write. */

const sourceTypeSchema = z.enum([
  "governmentStatistics",
  "governmentRegister",
  "institutionAdmissions",
  "institutionPortal",
  "bursaryProvider",
]);

const createSourceSchema = z.object({
  id: z.string().min(1),
  url: z.string().url(),
  publisher: z.string().min(1),
  type: sourceTypeSchema,
  robotsAllowed: z.boolean(),
  fetchIntervalHours: z.number().positive(),
  reliabilityScore: z.number().min(0).max(1),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch (err) {
    return adminErrorResponse(err);
  }

  const parsed = createSourceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: `Invalid source: ${parsed.error.issues.map((i) => i.message).join("; ")}` },
      { status: 400 }
    );
  }

  const db = getAdminDb();
  const ref = db.collection("sources").doc(parsed.data.id);
  const existing = await ref.get();
  if (existing.exists) {
    return NextResponse.json({ error: `A source with id "${parsed.data.id}" already exists.` }, { status: 409 });
  }

  await ref.set({ ...parsed.data, lastFetchedAt: null, etag: null, enabled: true });

  return NextResponse.json({ ok: true, id: parsed.data.id }, { status: 201 });
}
