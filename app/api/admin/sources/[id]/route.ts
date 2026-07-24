import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { adminErrorResponse } from "@/lib/admin/respond";
import { getAdminDb } from "@/lib/firebase/admin";

/** Source register "disable, set cadence" (Phase 7). */

const patchSchema = z
  .object({
    enabled: z.boolean().optional(),
    fetchIntervalHours: z.number().positive().optional(),
    robotsAllowed: z.boolean().optional(),
    notes: z.string().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update." });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
  } catch (err) {
    return adminErrorResponse(err);
  }

  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: `Invalid patch: ${parsed.error.issues.map((i) => i.message).join("; ")}` },
      { status: 400 }
    );
  }

  const db = getAdminDb();
  const ref = db.collection("sources").doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Source not found." }, { status: 404 });
  }

  await ref.update(parsed.data);
  return NextResponse.json({ ok: true });
}
