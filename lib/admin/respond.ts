import "server-only";
import { NextResponse } from "next/server";
import { AdminAuthError } from "./auth";

/** Shared error → NextResponse mapping for every /api/admin/* route, so
 * an AdminAuthError's intended status (401 vs 403) survives the trip. */
export function adminErrorResponse(err: unknown): NextResponse {
  if (err instanceof AdminAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  return NextResponse.json(
    { error: err instanceof Error ? err.message : "Unexpected error." },
    { status: 500 }
  );
}
