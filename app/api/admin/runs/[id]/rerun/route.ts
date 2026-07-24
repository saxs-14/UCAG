import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { adminErrorResponse } from "@/lib/admin/respond";
import { getAdminDb } from "@/lib/firebase/admin";

/**
 * Ingestion run manual re-run (Phase 7 brief). Honestly scoped: no live
 * extraction pipeline is wired end-to-end yet -- no LLM_API_KEY is
 * configured for v2 (see README.md Phase 4 status), so there is nothing
 * real to re-run for a general ingestion task. This route is real and
 * admin-gated, not a stub returning fake success -- it looks the run up
 * and returns a clear, honest 501 rather than pretending. The one
 * ingestion task that IS live-runnable today is the link health checker;
 * see app/api/admin/link-health/run (Dead Link Report page's "Run now").
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
        "Manual re-run isn't wired to a live extraction pipeline yet -- no LLM_API_KEY is configured for v2 (see README.md Phase 4 status). The link health checker is the one ingestion task that can be re-run live today -- use the Dead Link Report page instead.",
    },
    { status: 501 }
  );
}
