import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { adminErrorResponse } from "@/lib/admin/respond";
import { recoverStaleIngestionRuns } from "@/lib/ingestion/persistProposal";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const recovered = await recoverStaleIngestionRuns();
    return NextResponse.json({ recovered });
  } catch (err) {
    return adminErrorResponse(err);
  }
}
