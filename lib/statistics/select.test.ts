import { describe, expect, it } from "vitest";
import { getVerifiedStatisticsForDataset } from "./select";
import type { Statistic } from "@/lib/firestore/types";

function makeStat(overrides: Partial<Statistic>): Statistic {
  return {
    id: "s1",
    dataset: "enrolments",
    dimension: "2024",
    metric: "totalEnrolments",
    value: 100,
    unit: "learners",
    sourceUrl: "https://example.test/",
    verifiedOn: "2026-07-23",
    publisher: "DHET",
    year: 2024,
    ...overrides,
  };
}

describe("getVerifiedStatisticsForDataset", () => {
  it("returns fully-provenanced statistics matching the dataset", () => {
    const stats = [makeStat({})];
    expect(getVerifiedStatisticsForDataset(stats, "enrolments")).toHaveLength(1);
  });

  it("excludes statistics from a different dataset", () => {
    const stats = [makeStat({ dataset: "graduations" })];
    expect(getVerifiedStatisticsForDataset(stats, "enrolments")).toHaveLength(0);
  });

  it("excludes a statistic missing sourceUrl even if the dataset matches", () => {
    const stats = [makeStat({ sourceUrl: "" })];
    expect(getVerifiedStatisticsForDataset(stats, "enrolments")).toHaveLength(0);
  });

  it("excludes a statistic missing publisher", () => {
    const stats = [makeStat({ publisher: "" })];
    expect(getVerifiedStatisticsForDataset(stats, "enrolments")).toHaveLength(0);
  });
});
