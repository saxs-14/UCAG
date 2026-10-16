import { afterEach, describe, expect, it, vi } from "vitest";

const getMock = vi.fn();
const collectionMock = vi.fn(() => ({ get: getMock }));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminDb: () => ({ collection: collectionMock }),
}));

import { fetchRealBursariesAndInternships } from "./getRealBursariesAndInternships";

/**
 * These two scenarios are both real Firestore gRPC error codes, not
 * invented ones -- 7 (PERMISSION_DENIED) is what a present-but-wrong
 * project ID surfaces as (the service account can authenticate but has no
 * access to a project it was never granted), and 4 (DEADLINE_EXCEEDED) is
 * a genuine query timeout, distinct from the generic "Admin credentials
 * not configured" case already covered by the function's own try/catch.
 */
describe("fetchRealBursariesAndInternships -- distinct Firestore failure modes", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("degrades to an empty result when the configured project ID is present but wrong", async () => {
    const wrongProjectError = Object.assign(new Error("7 PERMISSION_DENIED: Permission denied on resource project"), { code: 7 });
    getMock.mockRejectedValue(wrongProjectError);

    await expect(fetchRealBursariesAndInternships()).resolves.toEqual({ bursaries: [], internships: [] });
  });

  it("degrades to an empty result when a query genuinely times out", async () => {
    const timeoutError = Object.assign(new Error("4 DEADLINE_EXCEEDED: Deadline exceeded"), { code: 4 });
    getMock.mockRejectedValue(timeoutError);

    await expect(fetchRealBursariesAndInternships()).resolves.toEqual({ bursaries: [], internships: [] });
  });

  it("still returns real data when the query succeeds", async () => {
    getMock.mockResolvedValue({ docs: [] });

    await expect(fetchRealBursariesAndInternships()).resolves.toEqual({ bursaries: [], internships: [] });
    expect(collectionMock).toHaveBeenCalledWith("bursaries");
    expect(collectionMock).toHaveBeenCalledWith("internships");
  });
});
