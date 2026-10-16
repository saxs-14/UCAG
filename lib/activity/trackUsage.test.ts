import { afterEach, describe, expect, it, vi } from "vitest";

const { setMock, docMock, collectionMock, incrementMock } = vi.hoisted(() => {
  const setMock = vi.fn();
  const docMock = vi.fn(() => ({ set: setMock }));
  const collectionMock = vi.fn(() => ({ doc: docMock }));
  const incrementMock = vi.fn((n: number) => ({ __increment: n }));
  return { setMock, docMock, collectionMock, incrementMock };
});

vi.mock("@/lib/firebase/admin", () => ({
  getAdminDb: () => ({ collection: collectionMock }),
}));

vi.mock("firebase-admin/firestore", () => ({
  FieldValue: { increment: incrementMock },
}));

import { incrementUsageStat } from "./trackUsage";

describe("incrementUsageStat", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("writes to today's date document with a merge + FieldValue.increment", async () => {
    const now = new Date("2026-10-16T14:00:00.000Z");
    await incrementUsageStat("calculatorCompletions", now);

    expect(collectionMock).toHaveBeenCalledWith("usageStats");
    expect(docMock).toHaveBeenCalledWith("2026-10-16");
    expect(incrementMock).toHaveBeenCalledWith(1);
    expect(setMock).toHaveBeenCalledWith(
      { date: "2026-10-16", calculatorCompletions: { __increment: 1 } },
      { merge: true }
    );
  });

  it("uses a different field name correctly for each of the three event types", async () => {
    const now = new Date("2026-10-16T14:00:00.000Z");
    await incrementUsageStat("programmeSearches", now);
    expect(setMock).toHaveBeenLastCalledWith(
      { date: "2026-10-16", programmeSearches: { __increment: 1 } },
      { merge: true }
    );

    await incrementUsageStat("fundingDiscoveryViews", now);
    expect(setMock).toHaveBeenLastCalledWith(
      { date: "2026-10-16", fundingDiscoveryViews: { __increment: 1 } },
      { merge: true }
    );
  });

  it("never throws, even when the underlying Firestore write fails -- a tracking failure must not break the page it's attached to", async () => {
    setMock.mockRejectedValueOnce(new Error("Firestore unavailable"));
    await expect(incrementUsageStat("calculatorCompletions")).resolves.toBeUndefined();
  });
});
