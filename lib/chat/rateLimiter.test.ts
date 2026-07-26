import { afterEach, describe, expect, it } from "vitest";
import { __resetChatRateLimiterForTests, checkChatRateLimit } from "./rateLimiter";

describe("checkChatRateLimit", () => {
  afterEach(() => {
    __resetChatRateLimiterForTests();
  });

  it("allows requests under the limit", () => {
    const now = Date.now();
    for (let i = 0; i < 8; i++) {
      expect(checkChatRateLimit("1.2.3.4", now + i).allowed).toBe(true);
    }
  });

  it("blocks the request once the limit is exceeded within the window", () => {
    const now = Date.now();
    for (let i = 0; i < 8; i++) {
      checkChatRateLimit("1.2.3.4", now + i);
    }
    const result = checkChatRateLimit("1.2.3.4", now + 9);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks separate clients independently", () => {
    const now = Date.now();
    for (let i = 0; i < 8; i++) {
      checkChatRateLimit("client-a", now + i);
    }
    expect(checkChatRateLimit("client-a", now + 9).allowed).toBe(false);
    expect(checkChatRateLimit("client-b", now + 9).allowed).toBe(true);
  });

  it("allows requests again once the window has passed", () => {
    const now = Date.now();
    for (let i = 0; i < 8; i++) {
      checkChatRateLimit("1.2.3.4", now + i);
    }
    expect(checkChatRateLimit("1.2.3.4", now + 9).allowed).toBe(false);
    // 5 minutes + a bit later, the earliest requests have aged out.
    expect(checkChatRateLimit("1.2.3.4", now + 5 * 60 * 1000 + 100).allowed).toBe(true);
  });
});
