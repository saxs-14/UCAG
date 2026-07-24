import { afterEach, describe, expect, it, vi } from "vitest";
import { assertCronSecret, getFirebaseAdminEnv, getLlmEnv } from "./server";

describe("assertCronSecret", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws when CRON_SECRET is not configured at all", () => {
    vi.stubEnv("CRON_SECRET", "");
    expect(() => assertCronSecret("anything")).toThrow(/Unauthorized/);
  });

  it("throws when the provided secret doesn't match", () => {
    vi.stubEnv("CRON_SECRET", "real-secret");
    expect(() => assertCronSecret("wrong-secret")).toThrow(/Unauthorized/);
  });

  it("does not throw when the provided secret matches", () => {
    vi.stubEnv("CRON_SECRET", "real-secret");
    expect(() => assertCronSecret("real-secret")).not.toThrow();
  });

  it("works with no Firebase Admin credentials configured at all -- CRON_SECRET is independent", () => {
    vi.stubEnv("CRON_SECRET", "real-secret");
    vi.stubEnv("FIREBASE_ADMIN_PROJECT_ID", "");
    vi.stubEnv("FIREBASE_ADMIN_CLIENT_EMAIL", "");
    vi.stubEnv("FIREBASE_ADMIN_PRIVATE_KEY", "");
    expect(() => assertCronSecret("real-secret")).not.toThrow();
  });
});

describe("getFirebaseAdminEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws a clear, actionable error when credentials are missing", () => {
    vi.stubEnv("FIREBASE_ADMIN_PROJECT_ID", "");
    vi.stubEnv("FIREBASE_ADMIN_CLIENT_EMAIL", "");
    vi.stubEnv("FIREBASE_ADMIN_PRIVATE_KEY", "");
    expect(() => getFirebaseAdminEnv()).toThrow(/Missing\/invalid Firebase Admin/);
  });

  it("un-escapes literal \\n sequences in the private key (the Vercel/most-hosts convention)", () => {
    vi.stubEnv("FIREBASE_ADMIN_PROJECT_ID", "ucag-prod");
    vi.stubEnv("FIREBASE_ADMIN_CLIENT_EMAIL", "admin@ucag-prod.iam.gserviceaccount.com");
    vi.stubEnv("FIREBASE_ADMIN_PRIVATE_KEY", "-----BEGIN KEY-----\\nabc123\\n-----END KEY-----");
    const env = getFirebaseAdminEnv();
    expect(env.FIREBASE_ADMIN_PRIVATE_KEY).toBe("-----BEGIN KEY-----\nabc123\n-----END KEY-----");
  });
});

describe("getLlmEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("never throws -- both fields are optional since no LLM_API_KEY is configured for v2 yet", () => {
    delete process.env.LLM_PROVIDER;
    delete process.env.LLM_API_KEY;
    expect(() => getLlmEnv()).not.toThrow();
    expect(getLlmEnv()).toEqual({ LLM_PROVIDER: undefined, LLM_API_KEY: undefined });
  });

  it("returns whatever is actually configured", () => {
    vi.stubEnv("LLM_PROVIDER", "anthropic");
    vi.stubEnv("LLM_API_KEY", "sk-fake-key-for-test");
    expect(getLlmEnv()).toEqual({ LLM_PROVIDER: "anthropic", LLM_API_KEY: "sk-fake-key-for-test" });
  });
});
