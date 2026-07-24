/**
 * Server-side gate for every /api/admin/* route. "Protected route,
 * role-gated" (docs/MASTER_PROMPT_v2.md Phase 7) means role is a Firebase
 * custom claim (`role: "admin"`), verified here against a real ID token
 * via the Admin SDK -- never a client-supplied field, never a Firestore
 * document a signed-in user could write to themselves (see
 * lib/firebase/admin.ts's header comment, which already committed to this
 * design before Phase 7 existed).
 *
 * Client-side admin-route gating (app/admin/layout.tsx) is a UX nicety,
 * not the enforcement mechanism -- this function is. Every admin API
 * route must call it before touching Firestore.
 */

import "server-only";
import type { NextRequest } from "next/server";
import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdminAuth } from "@/lib/firebase/admin";

export class AdminAuthError extends Error {
  constructor(message: string, readonly status: 401 | 403 = 401) {
    super(message);
    this.name = "AdminAuthError";
  }
}

/** Throws AdminAuthError (never returns for a non-admin caller). */
export async function requireAdmin(request: NextRequest): Promise<DecodedIdToken> {
  const header = request.headers.get("authorization");
  const token = header?.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    throw new AdminAuthError("Missing Authorization bearer token.");
  }

  let decoded: DecodedIdToken;
  try {
    decoded = await getAdminAuth().verifyIdToken(token);
  } catch {
    throw new AdminAuthError("Invalid or expired sign-in token.");
  }

  if (decoded.role !== "admin") {
    throw new AdminAuthError("This account does not have admin access.", 403);
  }

  return decoded;
}
