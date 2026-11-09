import { describe, expect, it } from "vitest";
import { buildUserContext } from "./buildUserContext";
import { STANDARD_NSC_SCALE } from "@/config/aps-scales";
import type { RealCatalog } from "@/lib/catalog/getRealCatalog";
import type { UserProfile } from "@/lib/firestore/types";

const VERIFIED = { sourceUrl: "https://example.com", verifiedOn: "2026-01-01", academicYear: "2026" };

const catalog: RealCatalog = {
  institutions: [
    { id: "ump", name: "University of Mpumalanga", shortName: "UMP", ...VERIFIED } as unknown as RealCatalog["institutions"][number],
  ],
  faculties: [],
  schools: [],
  programmes: [
    { id: "ump-bsc-agri", name: "Bachelor of Science in Agriculture" } as RealCatalog["programmes"][number],
  ],
  apsRules: [
    {
      id: "ump-rule",
      institutionId: "ump",
      facultyId: null,
      bestNSubjects: 6,
      extraCountedSubjects: [],
      excludedSubjects: [],
      loPolicy: "exclude",
      divisor: null,
      formulaType: "pointBand",
      bands: STANDARD_NSC_SCALE,
      usesRawPercentage: false,
      forcedSubjects: [],
      bonusRules: [],
      scaleName: "standard",
      mathLitPolicy: "include",
      nbtPolicy: "none",
      notes: null,
      ...VERIFIED,
    } as unknown as RealCatalog["apsRules"][number],
  ],
  applicationWindows: [],
};

const baseProfile: UserProfile = {
  uid: "u1",
  marks: [],
  shortlist: [],
  consentRecord: null,
  isMinor: false,
  guardianConsentAt: null,
  createdAt: "2026-01-01",
};

describe("buildUserContext", () => {
  it("returns null for a profile with no marks or shortlist", () => {
    expect(buildUserContext(baseProfile, catalog)).toBeNull();
  });

  it("returns null when there is no profile at all (signed out)", () => {
    expect(buildUserContext(null, catalog)).toBeNull();
  });

  it("includes saved marks with resolved subject labels", () => {
    const profile: UserProfile = { ...baseProfile, marks: [{ subjectCode: "MATH", percentage: 72 }] };
    const context = buildUserContext(profile, catalog);
    expect(context).toMatch(/Mathematics: 72%/);
  });

  it("resolves shortlisted programme ids to their real names", () => {
    const profile: UserProfile = { ...baseProfile, shortlist: ["ump-bsc-agri"] };
    const context = buildUserContext(profile, catalog);
    expect(context).toContain("Bachelor of Science in Agriculture");
  });

  it("silently drops a shortlisted id that no longer exists in the catalog", () => {
    const profile: UserProfile = { ...baseProfile, shortlist: ["ump-bsc-agri", "deleted-programme"] };
    const context = buildUserContext(profile, catalog);
    expect(context).toContain("Bachelor of Science in Agriculture");
    expect(context).not.toContain("deleted-programme");
  });
});
