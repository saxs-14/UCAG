import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { adminErrorResponse } from "@/lib/admin/respond";
import { getAdminStats } from "@/lib/admin/getAdminStats";

/** Powers the Admin Overview page's stats dashboard. Read-only, admin-gated
 * the same way every other /api/admin/* route is -- these are real counts
 * computed server-side via the Admin SDK (not the public verified-only
 * figures lib/catalog/getCatalogStats.ts exposes to the NavBar banner),
 * so this must never be reachable without a verified admin token. */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch (err) {
    return adminErrorResponse(err);
  }

  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (err) {
    return adminErrorResponse(err);
  }
}
