import { describe, expect, it } from "vitest";
import { formatChatContext } from "./getRealChatContext";
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

describe("formatChatContext", () => {
  it("lists nothing on record when every collection is empty", () => {
    const text = formatChatContext({
      institutions: [],
      programmes: [],
      bursaries: [],
      internships: [],
      applicationWindows: [],
    });
    expect(text).toContain("(none on record yet)");
    expect(text.match(/\(none on record yet\)/g)).toHaveLength(4);
  });

  it("includes an institution's name, province, type, and website", () => {
    const text = formatChatContext({
      institutions: [makeInstitution()],
      programmes: [],
      bursaries: [],
      internships: [],
      applicationWindows: [],
    });
    expect(text).toContain("University of Mpumalanga (UMP)");
    expect(text).toContain("Mpumalanga, traditionalUniversity");
    expect(text).toContain("https://www.ump.ac.za/");
  });

  it("attaches real application dates to the matching institution", () => {
    const text = formatChatContext({
      institutions: [makeInstitution()],
      programmes: [],
      bursaries: [],
      internships: [],
      applicationWindows: [
        {
          id: "ump-general",
          institutionId: "ump",
          programmeId: null,
          opensOn: "2026-06-01",
          closesOn: "2026-11-30",
          lateClosesOn: null,
          status: "unknown",
          ...PROVENANCE,
        },
      ],
    });
    expect(text).toContain("applications 2026-06-01 to 2026-11-30");
  });

  it("resolves a programme's institution name and itemises real requirements", () => {
    const programme: Programme = {
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
      subjectRequirements: [
        { subjectCode: "MATH", minLevel: 2 },
        { subjectCode: "MATHLIT", minLevel: 3 },
      ],
      additionalRequirements: ["English (Home Language or First Additional Language) at NSC level 4"],
      careerOutcomes: [],
      applyUrl: null,
      fieldTags: [],
      ...PROVENANCE,
    };

    const text = formatChatContext({
      institutions: [makeInstitution()],
      programmes: [programme],
      bursaries: [],
      internships: [],
      applicationWindows: [],
    });

    expect(text).toContain("Bachelor of Arts in Media, Communication and Culture -- University of Mpumalanga -- minimum APS 32");
    expect(text).toContain("MATH level 2");
    expect(text).toContain("MATHLIT level 3");
    expect(text).toContain("English (Home Language or First Additional Language) at NSC level 4");
  });

  it("falls back to the raw institutionId when a programme's institution isn't in the list", () => {
    const programme: Programme = {
      id: "orphan-programme",
      institutionId: "unknown-institution",
      facultyId: "x",
      schoolId: "x",
      name: "Orphan Programme",
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
    };

    const text = formatChatContext({
      institutions: [],
      programmes: [programme],
      bursaries: [],
      internships: [],
      applicationWindows: [],
    });

    expect(text).toContain("Orphan Programme -- unknown-institution");
  });

  it("shows a bursary's provider, value, apply link, and an honest closing-date fallback", () => {
    const text = formatChatContext({
      institutions: [],
      programmes: [],
      bursaries: [
        {
          id: "nsfas",
          name: "NSFAS Bursary",
          provider: "National Student Financial Aid Scheme (NSFAS)",
          fieldsOfStudy: [],
          levelRequired: "matricOnly",
          closesOn: null,
          value: "Full tuition and living allowance",
          criteria: [],
          applyUrl: "https://www.nsfas.org.za/",
          riskFlags: [],
          ...PROVENANCE,
        },
      ],
      internships: [],
      applicationWindows: [],
    });

    expect(text).toContain("NSFAS Bursary (National Student Financial Aid Scheme (NSFAS))");
    expect(text).toContain("Full tuition and living allowance");
    expect(text).toContain("closing date not confirmed");
    expect(text).toContain("https://www.nsfas.org.za/");
  });
});
