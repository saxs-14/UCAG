import { describe, expect, it } from "vitest";
import { statisticsToCsv } from "./csv";
import type { Statistic } from "@/lib/firestore/types";

describe("statisticsToCsv", () => {
  it("produces a header row plus one row per statistic", () => {
    const stats: Statistic[] = [
      {
        id: "s1",
        dataset: "enrolments",
        dimension: "2024",
        metric: "totalEnrolments",
        value: 1000,
        unit: "learners",
        sourceUrl: "https://example.test/",
        verifiedOn: "2026-07-23",
        publisher: "DHET",
        year: 2024,
      },
    ];
    const csv = statisticsToCsv(stats);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("dataset,dimension,metric,value,unit,publisher,year,verifiedOn,sourceUrl");
    expect(lines[1]).toBe("enrolments,2024,totalEnrolments,1000,learners,DHET,2024,2026-07-23,https://example.test/");
  });

  it("escapes fields containing commas or quotes", () => {
    const stats: Statistic[] = [
      {
        id: "s1",
        dataset: "enrolments",
        dimension: "Gauteng, Western Cape",
        metric: 'total "enrolled"',
        value: 500,
        unit: "learners",
        sourceUrl: "https://example.test/",
        verifiedOn: "2026-07-23",
        publisher: "DHET",
        year: 2024,
      },
    ];
    const csv = statisticsToCsv(stats);
    expect(csv).toContain('"Gauteng, Western Cape"');
    expect(csv).toContain('"total ""enrolled"""');
  });

  it("returns just the header for an empty list", () => {
    expect(statisticsToCsv([])).toBe(
      "dataset,dimension,metric,value,unit,publisher,year,verifiedOn,sourceUrl"
    );
  });
});
