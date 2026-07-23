import { describe, expect, it } from "vitest";
import { filterBursaries, filterInternships } from "./filter";
import type { Bursary, Internship } from "@/lib/firestore/types";

const now = new Date("2026-07-23T00:00:00Z");

function makeBursary(overrides: Partial<Bursary>): Bursary {
  return {
    id: "b1",
    name: "Test Bursary",
    provider: "Test Provider",
    fieldsOfStudy: ["Computer Science"],
    levelRequired: "matricOnly",
    closesOn: "2027-01-01",
    value: "R10 000",
    criteria: [],
    applyUrl: "https://example.test/apply",
    riskFlags: [],
    sourceUrl: "https://example.test/",
    verifiedOn: "2026-07-23",
    academicYear: 2027,
    ...overrides,
  };
}

function makeInternship(overrides: Partial<Internship>): Internship {
  return {
    id: "i1",
    title: "Test Internship",
    provider: "Test Provider",
    fieldsOfStudy: ["Computer Science"],
    minQualification: "NSC (matric)",
    matricOnly: true,
    province: null,
    closesOn: "2027-01-01",
    applyUrl: "https://example.test/apply",
    sourceUrl: "https://example.test/",
    verifiedOn: "2026-07-23",
    academicYear: 2027,
    ...overrides,
  };
}

describe("filterBursaries", () => {
  it("never returns a listing with any risk flag, regardless of other filters", () => {
    const bursaries = [makeBursary({ riskFlags: ["requiresUpfrontPayment"] })];
    expect(filterBursaries(bursaries, { fieldsOfStudy: [], levelFilter: "all", now })).toHaveLength(0);
  });

  it("hides listings past their closing date", () => {
    const bursaries = [makeBursary({ closesOn: "2026-01-01" })];
    expect(filterBursaries(bursaries, { fieldsOfStudy: [], levelFilter: "all", now })).toHaveLength(0);
  });

  it("filters by level when a specific level is requested", () => {
    const bursaries = [
      makeBursary({ id: "matric", levelRequired: "matricOnly" }),
      makeBursary({ id: "enrolled", levelRequired: "currentlyEnrolled" }),
    ];
    const result = filterBursaries(bursaries, { fieldsOfStudy: [], levelFilter: "matricOnly", now });
    expect(result.map((b) => b.id)).toEqual(["matric"]);
  });

  it("filters by field of study overlap", () => {
    const bursaries = [
      makeBursary({ id: "cs", fieldsOfStudy: ["Computer Science"] }),
      makeBursary({ id: "law", fieldsOfStudy: ["Law"] }),
    ];
    const result = filterBursaries(bursaries, {
      fieldsOfStudy: ["Computer Science"],
      levelFilter: "all",
      now,
    });
    expect(result.map((b) => b.id)).toEqual(["cs"]);
  });

  it("with no field filter applied, returns listings across all fields", () => {
    const bursaries = [
      makeBursary({ id: "cs", fieldsOfStudy: ["Computer Science"] }),
      makeBursary({ id: "law", fieldsOfStudy: ["Law"] }),
    ];
    const result = filterBursaries(bursaries, { fieldsOfStudy: [], levelFilter: "all", now });
    expect(result).toHaveLength(2);
  });
});

describe("filterInternships", () => {
  it("matric-only filter is a first-class filter, not folded into level", () => {
    const internships = [
      makeInternship({ id: "matric", matricOnly: true }),
      makeInternship({ id: "grad", matricOnly: false }),
    ];
    expect(filterInternships(internships, { fieldsOfStudy: [], matricOnly: true, now }).map((i) => i.id)).toEqual([
      "matric",
    ]);
    expect(filterInternships(internships, { fieldsOfStudy: [], matricOnly: false, now }).map((i) => i.id)).toEqual([
      "grad",
    ]);
    expect(filterInternships(internships, { fieldsOfStudy: [], matricOnly: "all", now })).toHaveLength(2);
  });

  it("hides internships past their closing date", () => {
    const internships = [makeInternship({ closesOn: "2026-01-01" })];
    expect(filterInternships(internships, { fieldsOfStudy: [], matricOnly: "all", now })).toHaveLength(0);
  });
});
