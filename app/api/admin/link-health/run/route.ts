import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { adminErrorResponse } from "@/lib/admin/respond";
import { runLinkHealthCheck } from "@/lib/ingestion/pipeline";
import { SEED_INSTITUTIONS } from "@/config/institutions.seed";
import { INGESTION_KILL_SWITCH } from "@/config/ingestion";

/**
 * Admin-triggered, on-demand, non-dry-run link health check -- what the
 * Dead Link Report page's "Run now" button calls. Independent of the
 * 6-hourly cron (app/api/cron/link-health/route.ts, CRON_SECRET-gated,
 * still dry-run only in vercel.json); this one is gated by requireAdmin
 * instead, since a human is triggering it, not a schedule.
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch (err) {
    return adminErrorResponse(err);
  }

  if (INGESTION_KILL_SWITCH) {
    return NextResponse.json({ error: "Ingestion kill switch is enabled." }, { status: 503 });
  }

  try {
    const summary = await runLinkHealthCheck(SEED_INSTITUTIONS, { dryRun: false });
    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
