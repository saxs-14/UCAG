import { afterEach, describe, expect, it } from "vitest";
import { __resetTrackRateLimiterForTests, checkTrackRateLimit } from "./trackRateLimiter";

describe("checkTrackRateLimit", () => {
  afterEach(() => {
    __resetTrackRateLimiterForTests();
  });

  it("allows requests under the limit", () => {
    const now = Date.now();
    for (let i = 0; i < 30; i++) {
      expect(checkTrackRateLimit("1.2.3.4", now + i).allowed).toBe(true);
    }
  });

  it("blocks the request once the limit is exceeded within the window", () => {
    const now = Date.now();
    for (let i = 0; i < 30; i++) {
      checkTrackRateLimit("1.2.3.4", now + i);
    }
    const result = checkTrackRateLimit("1.2.3.4", now + 31);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks separate clients independently", () => {
    const now = Date.now();
    for (let i = 0; i < 30; i++) {
      checkTrackRateLimit("client-a", now + i);
    }
    expect(checkTrackRateLimit("client-a", now + 31).allowed).toBe(false);
    expect(checkTrackRateLimit("client-b", now + 31).allowed).toBe(true);
  });

  it("allows requests again once the window has passed", () => {
    const now = Date.now();
    for (let i = 0; i < 30; i++) {
      checkTrackRateLimit("1.2.3.4", now + i);
    }
    expect(checkTrackRateLimit("1.2.3.4", now + 31).allowed).toBe(false);
    expect(checkTrackRateLimit("1.2.3.4", now + 5 * 60 * 1000 + 100).allowed).toBe(true);
  });
});
