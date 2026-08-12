// cSpell:words studymate
import { describe, expect, it, vi } from "vitest";

const { listVerifiedProgrammeIds } = vi.hoisted(() => ({
  listVerifiedProgrammeIds: vi.fn(),
}));

vi.mock("@/lib/catalog/getRealProgrammeDetail", () => ({
  listVerifiedProgrammeIds,
}));

const STATIC_PATHS = [
  "",
  "/bursaries",
  "/statistics",
  "/privacy",
  "/ump",
  "/ump/programmes",
  "/ump/funding",
  "/ump/careers",
  "/ump/campus",
  "/ump/mentors",
  "/application/documents",
  "/institutions",
  "/account/parent",
  "/account/mentor",
  "/studymate",
  "/studymate/profile",
  "/studymate/timetable",
  "/studymate/plan",
  "/studymate/materials",
  "/studymate/tutor",
  "/studymate/quiz",
  "/studymate/mock-exam",
  "/studymate/progress",
  "/studymate/past-papers",
];

describe("app/sitemap.ts", () => {
  it("still returns the static routes when Firebase Admin is unavailable (build must not crash)", async () => {
    listVerifiedProgrammeIds.mockRejectedValueOnce(
      new Error("Missing/invalid Firebase Admin environment variables: FIREBASE_ADMIN_PROJECT_ID")
    );

    const sitemap = (await import("@/app/sitemap")).default;
    const routes = await sitemap();

    expect(routes).toHaveLength(STATIC_PATHS.length);
    expect(routes.map((r) => r.url.replace(/^https?:\/\/[^/]+/, ""))).toEqual(STATIC_PATHS);
  });

  it("appends verified programme routes when the catalogue lookup succeeds", async () => {
    listVerifiedProgrammeIds.mockResolvedValueOnce([{ id: "ump-ba-media", verifiedOn: "2026-07-26" }]);

    const sitemap = (await import("@/app/sitemap")).default;
    const routes = await sitemap();

    expect(routes).toHaveLength(STATIC_PATHS.length + 1);
    expect(routes.at(-1)?.url).toContain("/programmes/ump-ba-media");
  });
});
