import { describe, expect, it } from "vitest";
import { detectInstitutionFromEmail, getInstitutionBranding } from "./branding";

describe("Institution Branding & Domain Detection", () => {
  it("detects UMP from student@ump.ac.za", () => {
    const result = detectInstitutionFromEmail("student@ump.ac.za");
    expect(result).not.toBeNull();
    expect(result?.institutionId).toBe("ump");
    expect(result?.shortName).toBe("UMP");
  });

  it("detects UP from student@up.ac.za", () => {
    const result = detectInstitutionFromEmail("john@tuks.co.za");
    expect(result).not.toBeNull();
    expect(result?.institutionId).toBe("up");
  });

  it("returns null for generic gmail accounts", () => {
    const result = detectInstitutionFromEmail("learner@gmail.com");
    expect(result).toBeNull();
  });

  it("retrieves UMP branding by default for unknown institutionId", () => {
    const branding = getInstitutionBranding("unknown_id");
    expect(branding.institutionId).toBe("ump");
  });

  it("has CPUT branding using its real scraped colors, not a guess", () => {
    const branding = getInstitutionBranding("cput");
    expect(branding.institutionId).toBe("cput");
    expect(branding.primaryColor).toBe("#0198cd");
  });

  it("UNISA's branding is its real maroon/navy/gold, not the old wrong green/amber guess", () => {
    const branding = getInstitutionBranding("unisa");
    expect(branding.primaryColor).toBe("#930010");
    expect(branding.secondaryColor).toBe("#003366");
  });
});
