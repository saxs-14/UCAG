import { describe, expect, it } from "vitest";
import { isFactVerified, isStatVerified } from "./types";

describe("isFactVerified", () => {
  it("passes a fully-provenanced document", () => {
    expect(
      isFactVerified({
        sourceUrl: "https://www.ump.ac.za/",
        verifiedOn: "2026-07-23",
        academicYear: 2027,
      })
    ).toBe(true);
  });

  it("rejects a document missing sourceUrl", () => {
    expect(
      isFactVerified({ verifiedOn: "2026-07-23", academicYear: 2027 })
    ).toBe(false);
  });

  it("rejects a document with an empty sourceUrl", () => {
    expect(
      isFactVerified({
        sourceUrl: "",
        verifiedOn: "2026-07-23",
        academicYear: 2027,
      })
    ).toBe(false);
  });

  it("rejects a document missing verifiedOn", () => {
    expect(
      isFactVerified({ sourceUrl: "https://www.ump.ac.za/", academicYear: 2027 })
    ).toBe(false);
  });

  it("rejects a document missing academicYear", () => {
    expect(
      isFactVerified({
        sourceUrl: "https://www.ump.ac.za/",
        verifiedOn: "2026-07-23",
      })
    ).toBe(false);
  });

  it("rejects a non-finite academicYear", () => {
    expect(
      isFactVerified({
        sourceUrl: "https://www.ump.ac.za/",
        verifiedOn: "2026-07-23",
        academicYear: Number.NaN,
      })
    ).toBe(false);
  });

  it("rejects an empty object", () => {
    expect(isFactVerified({})).toBe(false);
  });
});

describe("isStatVerified", () => {
  it("passes a fully-provenanced statistic", () => {
    expect(
      isStatVerified({
        sourceUrl: "https://www.dhet.gov.za/",
        verifiedOn: "2026-07-23",
        publisher: "DHET",
        year: 2024,
      })
    ).toBe(true);
  });

  it("rejects a statistic missing publisher", () => {
    expect(
      isStatVerified({
        sourceUrl: "https://www.dhet.gov.za/",
        verifiedOn: "2026-07-23",
        year: 2024,
      })
    ).toBe(false);
  });
});
