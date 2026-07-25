import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { adminErrorResponse } from "@/lib/admin/respond";
import { getAdminDb } from "@/lib/firebase/admin";

/**
 * Ingestion run manual re-run BY ID (Phase 7 brief) -- re-executing the
 * exact same historical run, source-for-source. Honestly scoped: that
 * specific replay isn't implemented. This is a different feature from
 * "run application-window ingestion fresh right now," which IS live (see
 * app/api/admin/application-windows/run, and the Dead Link Report page's
 * "Run now" for link health). This route is real and admin-gated, not a
 * stub returning fake success -- it looks the run up and returns a clear,
 * honest 501 rather than pretending.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
  } catch (err) {
    return adminErrorResponse(err);
  }

  const { id } = await params;
  const snap = await getAdminDb().collection("ingestionRuns").doc(id).get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Ingestion run not found." }, { status: 404 });
  }

  return NextResponse.json(
    {
      error:
        "Re-running this exact historical run by id isn't implemented. To run application-window ingestion fresh right now, use the \"Run application windows now\" button above instead; for link health, use the Dead Link Report page's \"Run now\".",
    },
    { status: 501 }
  );
}
