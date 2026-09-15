import { describe, expect, it } from "vitest";
import { bursaryScamModelMetadata, scoreBursaryScamRisk } from "./classify";

/**
 * These examples are deliberately NOT copies of anything in
 * trainingData.ts -- new phrasing, to sanity-check the model generalises
 * a little beyond memorising its exact training sentences, not just that
 * it can reproduce the held-out split scripts/train-bursary-scam-model.mts
 * already reports on.
 */
describe("scoreBursaryScamRisk", () => {
  it("scores a clearly legitimate, well-described bursary low", () => {
    const score = scoreBursaryScamRisk(
      "The ABC Foundation bursary covers tuition and accommodation for engineering students who achieve at least 70% for Mathematics in matric. Apply through the official ABC Foundation website; there is no cost to apply and selection is based on academic merit."
    );
    expect(score).toBeLessThan(0.5);
  });

  it("scores a clearly scammy, urgency-and-payment listing high", () => {
    const score = scoreBursaryScamRisk(
      "Amazing news, you have been chosen for a guaranteed cash bursary! To unlock your funds today, just send a quick refundable fee via EFT before midnight or you will lose this exclusive opportunity forever."
    );
    expect(score).toBeGreaterThan(0.5);
  });

  it("returns a value in the valid probability range for arbitrary text", () => {
    const score = scoreBursaryScamRisk("");
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it("exposes the metrics the model was actually evaluated at, for anything that wants to display them", () => {
    expect(bursaryScamModelMetadata.metrics.testSize).toBeGreaterThan(0);
    expect(bursaryScamModelMetadata.metrics.accuracy).toBeGreaterThanOrEqual(0);
    expect(bursaryScamModelMetadata.metrics.accuracy).toBeLessThanOrEqual(1);
  });
});
