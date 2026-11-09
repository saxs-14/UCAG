import { describe, expect, it } from "vitest";
import { passwordRequirementError } from "./passwordStrength";

describe("passwordRequirementError", () => {
  it("accepts a password meeting all four requirements", () => {
    expect(passwordRequirementError("Str0ng!Pass")).toBeNull();
  });

  it("rejects a password under 8 characters", () => {
    expect(passwordRequirementError("Str0n!a")).toMatch(/8 characters/);
  });

  it("rejects a password with no capital letter", () => {
    expect(passwordRequirementError("str0ng!pass")).toMatch(/capital letter/);
  });

  it("rejects a password with no digit", () => {
    expect(passwordRequirementError("Strong!pass")).toMatch(/number/);
  });

  it("rejects a password with no special character", () => {
    expect(passwordRequirementError("Str0ngpass")).toMatch(/special character/);
  });
});
