import { describe, expect, it } from "vitest";
import { collectInstitutionUrls, runLinkHealthCheck } from "./pipeline";
import type { Institution } from "@/lib/firestore/types";

function makeInstitution(overrides: Partial<Institution>): Institution {
  return {
    id: "test",
    name: "Test University",
    shortName: "TU",
    type: "traditionalUniversity",
    province: "Gauteng",
    tier: 1,
    campuses: [],
    websiteUrl: "https://test.example/",
    applicationPortalUrl: null,
    appliesThroughThirdParty: null,
    statusCheckUrl: null,
    nbtRequired: false,
    logoUrl: null,
    sourceUrl: "https://test.example/",
    verifiedOn: "2026-07-23",
    academicYear: 2027,
    ...overrides,
  };
}

describe("collectInstitutionUrls", () => {
  it("collects all non-null URL fields across institutions", () => {
    const urls = collectInstitutionUrls([
      makeInstitution({
        websiteUrl: "https://a.example/",
        applicationPortalUrl: "https://a.example/apply",
        statusCheckUrl: "https://a.example/status",
      }),
      makeInstitution({ id: "b", websiteUrl: "https://b.example/" }),
    ]);
    expect(urls).toEqual([
      "https://a.example/",
      "https://a.example/apply",
      "https://a.example/status",
      "https://b.example/",
    ]);
  });

  it("dedupes identical URLs (e.g. shared third-party portals like CAO)", () => {
    const urls = collectInstitutionUrls([
      makeInstitution({
        id: "a",
        websiteUrl: "https://a.example/",
        appliesThroughThirdParty: "https://cao.ac.za/",
      }),
      makeInstitution({
        id: "b",
        websiteUrl: "https://b.example/",
        appliesThroughThirdParty: "https://cao.ac.za/",
      }),
    ]);
    expect(urls).toEqual(["https://a.example/", "https://cao.ac.za/", "https://b.example/"]);
  });
});

function fakeFetch(statusByUrl: Record<string, number>): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = String(input);
    const status = statusByUrl[url] ?? 200;
    return new Response(null, { status });
  }) as typeof fetch;
}

describe("runLinkHealthCheck", () => {
  it("dry run reports results without touching Firestore", async () => {
    const institutions = [makeInstitution({ websiteUrl: "https://alive.example/" })];
    const summary = await runLinkHealthCheck(institutions, {
      dryRun: true,
      fetchImpl: fakeFetch({ "https://alive.example/": 200 }),
    });
    expect(summary.dryRun).toBe(true);
    expect(summary.firestoreWritesPerformed).toBe(0);
    expect(summary.checkedCount).toBe(1);
    expect(summary.deadCount).toBe(0);
  });

  it("counts dead links correctly", async () => {
    const institutions = [
      makeInstitution({ id: "a", websiteUrl: "https://alive.example/" }),
      makeInstitution({ id: "b", websiteUrl: "https://dead.example/" }),
    ];
    const summary = await runLinkHealthCheck(institutions, {
      dryRun: true,
      fetchImpl: fakeFetch({ "https://alive.example/": 200, "https://dead.example/": 404 }),
    });
    expect(summary.deadCount).toBe(1);
  });

  it("refuses to run in non-dry-run mode rather than silently no-op or crash on missing Firebase", async () => {
    const institutions = [makeInstitution({})];
    await expect(
      runLinkHealthCheck(institutions, { dryRun: false, fetchImpl: fakeFetch({}) })
    ).rejects.toThrow(/not implemented/i);
  });
});
