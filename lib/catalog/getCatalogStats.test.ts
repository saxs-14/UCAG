import { describe, expect, it } from "vitest";
import { computeCatalogStats } from "./getCatalogStats";
import type { Bursary, Institution, Programme } from "@/lib/firestore/types";

const PROVENANCE = { sourceUrl: "https://example.test/", verifiedOn: "2026-07-26", academicYear: 2027 };

function makeInstitution(overrides: Partial<Institution> = {}): Institution {
  return {
    id: "ump",
    name: "University of Mpumalanga",
    shortName: "UMP",
    type: "traditionalUniversity",
    province: "Mpumalanga",
    tier: 1,
    campuses: [],
    websiteUrl: "https://www.ump.ac.za/",
    applicationPortalUrl: null,
    appliesThroughThirdParty: null,
    statusCheckUrl: null,
    nbtRequired: false,
    logoUrl: null,
    ...PROVENANCE,
    ...overrides,
  };
}

function makeProgramme(overrides: Partial<Programme> = {}): Programme {
  return {
    id: "ump-ba-media",
    institutionId: "ump",
    facultyId: "x",
    schoolId: "x",
    name: "Programme",
    qualificationType: "bachelorsDegree",
    nqfLevel: 7,
    saqaId: null,
    duration: "3 years",
    campuses: [],
    modeOfDelivery: "contact",
    minAps: null,
    subjectRequirements: [],
    additionalRequirements: [],
    careerOutcomes: [],
    applyUrl: null,
    fieldTags: [],
    ...PROVENANCE,
    ...overrides,
  };
}

function makeBursary(overrides: Partial<Bursary> = {}): Bursary {
  return {
    id: "nsfas",
    name: "NSFAS Bursary",
    provider: "NSFAS",
    fieldsOfStudy: [],
    levelRequired: "matricOnly",
    opensOn: null,
    closesOn: null,
    value: "Full tuition",
    criteria: [],
    applyUrl: "https://www.nsfas.org.za/",
    riskFlags: [],
    ...PROVENANCE,
    ...overrides,
  };
}

describe("computeCatalogStats", () => {
  it("counts only verified records", () => {
    const unverified = makeInstitution({ id: "x", sourceUrl: "" });
    const stats = computeCatalogStats({
      institutions: [makeInstitution(), unverified],
      programmes: [makeProgramme()],
      bursaries: [makeBursary()],
    });
    expect(stats).toEqual({
      institutionCount: 1,
      programmeCount: 1,
      bursaryCount: 1,
      lastVerifiedOn: "2026-07-26",
    });
  });

  it("returns zero counts and a null date when nothing is verified", () => {
    const stats = computeCatalogStats({ institutions: [], programmes: [], bursaries: [] });
    expect(stats).toEqual({ institutionCount: 0, programmeCount: 0, bursaryCount: 0, lastVerifiedOn: null });
  });

  it("reports the most recent verifiedOn across all three collections", () => {
    const stats = computeCatalogStats({
      institutions: [makeInstitution({ verifiedOn: "2026-01-01" })],
      programmes: [makeProgramme({ verifiedOn: "2026-08-05" })],
      bursaries: [makeBursary({ verifiedOn: "2026-03-15" })],
    });
    expect(stats.lastVerifiedOn).toBe("2026-08-05");
  });
});
