import { describe, expect, it } from "vitest";
import { buildShareUrl, decodeMarksFromQuery, encodeMarksToQuery } from "./shareLink";
import type { SubjectMarkInput } from "@/lib/aps/types";

describe("shareLink", () => {
  const marks: SubjectMarkInput[] = [
    { subjectCode: "ENG-HL", percentage: 85 },
    { subjectCode: "MATH", percentage: 68 },
    { subjectCode: "LO", percentage: 70 },
  ];

  it("round-trips marks through encode/decode", () => {
    const encoded = encodeMarksToQuery(marks);
    expect(decodeMarksFromQuery(encoded)).toEqual(marks);
  });

  it("decodes an empty/missing query to an empty array", () => {
    expect(decodeMarksFromQuery(null)).toEqual([]);
    expect(decodeMarksFromQuery(undefined)).toEqual([]);
    expect(decodeMarksFromQuery("")).toEqual([]);
  });

  it("drops malformed pairs instead of throwing", () => {
    expect(decodeMarksFromQuery("MATH:68,garbage,LO:")).toEqual([
      { subjectCode: "MATH", percentage: 68 },
    ]);
  });

  it("builds a full shareable URL with the marks query param set", () => {
    const url = buildShareUrl("https://ucag.example/", marks);
    expect(url).toContain("marks=");
    const parsed = new URL(url);
    expect(decodeMarksFromQuery(parsed.searchParams.get("marks"))).toEqual(marks);
  });
});
