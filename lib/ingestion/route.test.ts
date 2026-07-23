import { describe, expect, it } from "vitest";
import { routeProposal } from "./route";
import type { RouteInput } from "./types";

const baseInput: RouteInput = {
  taskAutoPublish: true,
  confidence: 0.95,
  corroboratingSourceCount: 2,
  isHighRiskField: false,
  diffChanged: true,
};

describe("routeProposal", () => {
  it("no change means no proposal at all, regardless of confidence", () => {
    expect(routeProposal({ ...baseInput, diffChanged: false })).toBe("noChange");
  });

  it("auto-publishes when the task allows it, confidence is high, and it's corroborated", () => {
    expect(routeProposal(baseInput)).toBe("autoPublish");
  });

  it("queues for review when the task-level cadence rule disallows auto-publish, no matter the confidence", () => {
    // Mirrors application windows / APS rules / programme requirements in
    // config/ingestion.ts CADENCE_RULES -- always human-verified.
    expect(routeProposal({ ...baseInput, taskAutoPublish: false, confidence: 1 })).toBe(
      "queueForReview"
    );
  });

  it("queues for review when the field is flagged high-risk even if the task allows auto-publish", () => {
    expect(routeProposal({ ...baseInput, isHighRiskField: true })).toBe("queueForReview");
  });

  it("queues for review below the confidence threshold", () => {
    expect(routeProposal({ ...baseInput, confidence: 0.5 })).toBe("queueForReview");
  });

  it("queues for review with no corroborating source", () => {
    expect(routeProposal({ ...baseInput, corroboratingSourceCount: 0 })).toBe("queueForReview");
  });
});
