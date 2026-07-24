import "server-only";
import { NextResponse } from "next/server";
import { AdminAuthError } from "./auth";
import { reportError } from "@/lib/errorReporting";

/** Shared error → NextResponse mapping for every /api/admin/* route, so
 * an AdminAuthError's intended status (401 vs 403) survives the trip. A
 * genuine (non-auth) 500 here is always reported -- these are the routes
 * that write real data (approvals, content edits, source changes), so a
 * silent failure here is exactly the kind of thing error monitoring
 * exists to catch. */
export function adminErrorResponse(err: unknown): NextResponse {
  if (err instanceof AdminAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  reportError(err, { scope: "admin-api" });
  return NextResponse.json(
    { error: err instanceof Error ? err.message : "Unexpected error." },
    { status: 500 }
  );
}
