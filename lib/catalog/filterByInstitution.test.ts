import { describe, expect, it } from "vitest";
import { filterProgrammesByInstitution } from "./filterByInstitution";

const programmes = [
  { id: "ump-1", institutionId: "ump" },
  { id: "ump-2", institutionId: "ump" },
  { id: "up-1", institutionId: "up" },
  { id: "wits-1", institutionId: "wits" },
];

describe("filterProgrammesByInstitution", () => {
  it("returns only the selected institution's programmes", () => {
    const result = filterProgrammesByInstitution(programmes, "ump");
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.institutionId === "ump")).toBe(true);
  });

  it("excludes every programme from a different institution", () => {
    const result = filterProgrammesByInstitution(programmes, "up");
    expect(result).toEqual([{ id: "up-1", institutionId: "up" }]);
  });

  it("returns everything unfiltered when 'all' is selected", () => {
    const result = filterProgrammesByInstitution(programmes, "all");
    expect(result).toHaveLength(4);
  });

  it("returns an empty list for an institution with no catalogued programmes", () => {
    const result = filterProgrammesByInstitution(programmes, "tut");
    expect(result).toEqual([]);
  });
});
