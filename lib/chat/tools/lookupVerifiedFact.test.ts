import { describe, expect, it } from "vitest";
import { matchVerifiedFact } from "./lookupVerifiedFact";
import type { Institution, Programme } from "@/lib/firestore/types";

const PROVENANCE = { sourceUrl: "https://example.test/", verifiedOn: "2026-07-26", academicYear: 2027 };

function makeInstitution(overrides: Partial<Institution> = {}): Institution {
  return {
    id: "ump",
    name: "University of Mpumalanga",
    shortName: "UMP",
    type: "traditionalUniversity",
    province: "Mpumalanga",
    tier: 1,
    campuses: ["Mbombela"],
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
    facultyId: "ump-fac",
    schoolId: "ump-fac",
    name: "Bachelor of Arts in Media, Communication and Culture",
    qualificationType: "bachelorsDegree",
    nqfLevel: 7,
    saqaId: null,
    duration: "3 years",
    campuses: [],
    modeOfDelivery: "contact",
    minAps: 32,
    subjectRequirements: [{ subjectCode: "MATH", minLevel: 2 }],
    additionalRequirements: ["English at NSC level 4"],
    careerOutcomes: [],
    applyUrl: null,
    fieldTags: [],
    ...PROVENANCE,
    ...overrides,
  };
}

describe("matchVerifiedFact", () => {
  it("returns a summary with APS, requirements, and provenance for a real match", () => {
    const result = matchVerifiedFact(
      { institutions: [makeInstitution()], programmes: [makeProgramme()] },
      { institutionName: "UMP", programmeName: "Media" }
    );
    expect(result.found).toBe(true);
    expect(result.summary).toContain("Bachelor of Arts in Media, Communication and Culture at University of Mpumalanga");
    expect(result.summary).toContain("minimum APS 32");
    expect(result.summary).toContain("MATH level 2");
    expect(result.summary).toContain("English at NSC level 4");
    expect(result.summary).toContain("verified 2026-07-26");
    expect(result.summary).toContain("https://example.test/");
  });

  it("matches by institution short name too", () => {
    const result = matchVerifiedFact(
      { institutions: [makeInstitution()], programmes: [makeProgramme()] },
      { institutionName: "ump", programmeName: "media" }
    );
    expect(result.found).toBe(true);
  });

  it("reports no match when the institution isn't on record", () => {
    const result = matchVerifiedFact(
      { institutions: [], programmes: [] },
      { institutionName: "Some Unknown College", programmeName: "Anything" }
    );
    expect(result.found).toBe(false);
    expect(result.summary).toContain('No verified institution on record matching "Some Unknown College"');
  });

  it("reports the institution but no matching programme when only the programme is missing", () => {
    const result = matchVerifiedFact(
      { institutions: [makeInstitution()], programmes: [makeProgramme()] },
      { institutionName: "UMP", programmeName: "Nonexistent Programme" }
    );
    expect(result.found).toBe(false);
    expect(result.summary).toContain("University of Mpumalanga is on record");
    expect(result.summary).toContain('no verified programme matching "Nonexistent Programme"');
  });
});
