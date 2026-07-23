import { afterEach, describe, expect, it, vi } from "vitest";
import { assertCronSecret } from "./server";

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
