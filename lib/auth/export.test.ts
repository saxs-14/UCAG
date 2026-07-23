import { describe, expect, it } from "vitest";
import { profileToExportJson } from "./export";
import type { UserProfile } from "@/lib/firestore/types";

describe("profileToExportJson", () => {
  it("exports exactly the stored profile fields, nothing more", () => {
    const profile: UserProfile = {
      uid: "user-a",
      marks: [{ subjectCode: "MATH", percentage: 75 }],
      shortlist: ["sample-bsc-cs"],
      consentRecord: null,
      isMinor: false,
      guardianConsentAt: null,
      createdAt: "2026-07-23T00:00:00.000Z",
    };
    const parsed = JSON.parse(profileToExportJson(profile));
    expect(parsed).toEqual(profile);
    expect(Object.keys(parsed).sort()).toEqual(Object.keys(profile).sort());
  });
});
