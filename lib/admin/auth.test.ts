import { afterEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const verifyIdTokenMock = vi.fn();

vi.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: async () => ({ verifyIdToken: verifyIdTokenMock }),
}));

import { AdminAuthError, requireAdmin } from "./auth";

/**
 * requireAdmin is the single enforcement mechanism every one of the 10
 * /api/admin/* routes depends on (see lib/admin/auth.ts's own header
 * comment and firestore.rules, which deliberately denies all client writes
 * and relies on this function, not the rules themselves, as the real
 * gate). It had no test coverage at all before this file -- these tests
 * exercise it against a mocked Admin SDK rather than touching a real
 * Firebase project.
 */
function requestWithAuthHeader(value: string | null): NextRequest {
  return {
    headers: { get: (name: string) => (name.toLowerCase() === "authorization" ? value : null) },
  } as unknown as NextRequest;
}

describe("requireAdmin", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the decoded token for a valid admin bearer token", async () => {
    verifyIdTokenMock.mockResolvedValue({ uid: "admin-1", role: "admin" });
    const decoded = await requireAdmin(requestWithAuthHeader("Bearer real-admin-token"));
    expect(decoded).toEqual({ uid: "admin-1", role: "admin" });
    expect(verifyIdTokenMock).toHaveBeenCalledWith("real-admin-token");
  });

  it("is case-insensitive and tolerant of extra whitespace in the Bearer prefix", async () => {
    verifyIdTokenMock.mockResolvedValue({ uid: "admin-1", role: "admin" });
    await requireAdmin(requestWithAuthHeader("bearer   real-admin-token"));
    expect(verifyIdTokenMock).toHaveBeenCalledWith("real-admin-token");
  });

  it("throws 401 when the Authorization header is missing entirely", async () => {
    await expect(requireAdmin(requestWithAuthHeader(null))).rejects.toThrow(AdminAuthError);
    await expect(requireAdmin(requestWithAuthHeader(null))).rejects.toMatchObject({ status: 401 });
    expect(verifyIdTokenMock).not.toHaveBeenCalled();
  });

  it("throws 401 when the Authorization header has no token after Bearer", async () => {
    await expect(requireAdmin(requestWithAuthHeader("Bearer "))).rejects.toMatchObject({ status: 401 });
  });

  it("throws 401 when verifyIdToken rejects (expired/forged/malformed token)", async () => {
    verifyIdTokenMock.mockRejectedValue(new Error("Firebase ID token has expired"));
    await expect(requireAdmin(requestWithAuthHeader("Bearer stale-token"))).rejects.toMatchObject({ status: 401 });
  });

  it("throws 403 for a valid, real token belonging to a signed-in but non-admin user", async () => {
    verifyIdTokenMock.mockResolvedValue({ uid: "learner-1", role: "learner" });
    await expect(requireAdmin(requestWithAuthHeader("Bearer real-learner-token"))).rejects.toMatchObject({ status: 403 });
  });

  it("throws 403 for a valid token with no role claim at all", async () => {
    verifyIdTokenMock.mockResolvedValue({ uid: "learner-1" });
    await expect(requireAdmin(requestWithAuthHeader("Bearer real-token-no-role"))).rejects.toMatchObject({ status: 403 });
  });

  it("never trusts a client-supplied role field over the verified token's own claim", async () => {
    // A client can't put a 'role' key on the request itself to influence this --
    // the only path to admin is a role claim verifyIdToken itself decodes from
    // a token signed by Firebase. This test documents that there is no such
    // field to spoof in the first place: requireAdmin's only inputs are the
    // Authorization header and what verifyIdToken returns for it.
    verifyIdTokenMock.mockResolvedValue({ uid: "attacker-1", role: "learner" });
    const spoofedRequest = {
      headers: { get: (name: string) => (name.toLowerCase() === "authorization" ? "Bearer real-learner-token" : null) },
      role: "admin",
    } as unknown as NextRequest;
    await expect(requireAdmin(spoofedRequest)).rejects.toMatchObject({ status: 403 });
  });
});
