// @vitest-environment node
//
// getBaseUrl()'s server-side branches (VERCEL_URL, localhost fallback) are
// only reachable when `window` is genuinely undefined -- the project's
// default jsdom environment would make every branch resolve to
// window.location.origin instead, silently skipping the code this file
// exists to test.
import { afterEach, describe, expect, it, vi } from "vitest";
import { getBaseUrl, getFirebaseClientConfig, isFirebaseEmulatorEnabled } from "./client";

describe("getBaseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses NEXT_PUBLIC_BASE_URL when it's set", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://www.ucag.co.za");
    expect(getBaseUrl()).toBe("https://www.ucag.co.za");
  });

  it("rejects a malformed NEXT_PUBLIC_BASE_URL rather than silently using it", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "not-a-url");
    expect(() => getBaseUrl()).toThrow(/Invalid NEXT_PUBLIC_BASE_URL/);
  });

  it("falls back to VERCEL_URL (server-side) when NEXT_PUBLIC_BASE_URL is unset", () => {
    // Genuinely unset, not stubbed to "" -- the schema field is optional()
    // for undefined, not for an empty string, so an explicit "" would
    // (correctly) fail URL validation rather than mean "not set".
    delete process.env.NEXT_PUBLIC_BASE_URL;
    vi.stubEnv("VERCEL_URL", "ucag-git-preview.vercel.app");
    expect(getBaseUrl()).toBe("https://ucag-git-preview.vercel.app");
  });

  it("falls back to localhost when neither is set (no Firebase config required)", () => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    delete process.env.VERCEL_URL;
    expect(getBaseUrl()).toBe("http://localhost:3000");
  });
});

describe("getFirebaseClientConfig", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const REQUIRED_VARS = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ] as const;

  function stubAllRequired() {
    for (const key of REQUIRED_VARS) vi.stubEnv(key, `fake-${key}`);
  }

  it("returns the parsed config when every required var is set", () => {
    stubAllRequired();
    const config = getFirebaseClientConfig();
    expect(config.NEXT_PUBLIC_FIREBASE_PROJECT_ID).toBe("fake-NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  });

  it.each(REQUIRED_VARS)("throws a clear error when %s is missing", (missingVar) => {
    stubAllRequired();
    vi.stubEnv(missingVar, "");
    expect(() => getFirebaseClientConfig()).toThrow(new RegExp(missingVar));
  });
});

describe("isFirebaseEmulatorEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is true only for the exact string \"true\"", () => {
    vi.stubEnv("NEXT_PUBLIC_USE_FIREBASE_EMULATOR", "true");
    expect(isFirebaseEmulatorEnabled()).toBe(true);
  });

  it("is false for anything else, including truthy-looking values", () => {
    vi.stubEnv("NEXT_PUBLIC_USE_FIREBASE_EMULATOR", "1");
    expect(isFirebaseEmulatorEnabled()).toBe(false);
  });

  it("is false when unset", () => {
    vi.stubEnv("NEXT_PUBLIC_USE_FIREBASE_EMULATOR", "");
    expect(isFirebaseEmulatorEnabled()).toBe(false);
  });
});
