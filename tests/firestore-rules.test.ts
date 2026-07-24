/**
 * Runs against the real Firebase Firestore emulator (firebase
 * emulators:start --only firestore,auth --project demo-ucag must be
 * running -- see README.md "Local development" for the command). This
 * is not a mock of Firestore rules evaluation; it's the actual rules
 * engine Firebase ships, loading the real firestore.rules file and
 * genuinely rejecting/accepting real reads and writes. If the emulator
 * isn't running, every test here fails with a connection error, not a
 * false pass.
 */

import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RULES_PATH = path.resolve(__dirname, "../firestore.rules");

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-ucag-rules-test",
    firestore: {
      rules: readFileSync(RULES_PATH, "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
}, 30000);

afterAll(async () => {
  await testEnv?.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

function validMajorProfile(uid: string) {
  return {
    uid,
    marks: [],
    shortlist: [],
    consentRecord: null,
    isMinor: false,
    guardianConsentAt: null,
    createdAt: "2026-07-23T00:00:00.000Z",
  };
}

function validMinorProfileWithConsent(uid: string) {
  return {
    uid,
    marks: [],
    shortlist: [],
    consentRecord: {
      consentedAt: "2026-07-23T00:00:00.000Z",
      consentedBy: "guardian",
      guardianName: "Jane Doe",
      guardianEmail: "jane@example.test",
    },
    isMinor: true,
    guardianConsentAt: "2026-07-23T00:00:00.000Z",
    createdAt: "2026-07-23T00:00:00.000Z",
  };
}

describe("userProfiles security rules", () => {
  it("an unauthenticated user cannot read or write any profile", async () => {
    const unauth = testEnv.unauthenticatedContext();
    await assertFails(unauth.firestore().doc("userProfiles/user-a").get());
    await assertFails(unauth.firestore().doc("userProfiles/user-a").set(validMajorProfile("user-a")));
  });

  it("a user can create their own profile", async () => {
    const alice = testEnv.authenticatedContext("user-a");
    await assertSucceeds(alice.firestore().doc("userProfiles/user-a").set(validMajorProfile("user-a")));
  });

  it("a user cannot create a profile at someone else's uid path", async () => {
    const alice = testEnv.authenticatedContext("user-a");
    await assertFails(alice.firestore().doc("userProfiles/user-b").set(validMajorProfile("user-b")));
  });

  it("a document whose internal uid field doesn't match its path is rejected", async () => {
    const alice = testEnv.authenticatedContext("user-a");
    await assertFails(
      alice.firestore().doc("userProfiles/user-a").set(validMajorProfile("someone-else"))
    );
  });

  it("a user cannot read another user's profile", async () => {
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      await adminCtx.firestore().doc("userProfiles/user-a").set(validMajorProfile("user-a"));
    });

    const bob = testEnv.authenticatedContext("user-b");
    await assertFails(bob.firestore().doc("userProfiles/user-a").get());
  });

  it("a minor's profile with no consent record is rejected", async () => {
    const alice = testEnv.authenticatedContext("user-a");
    const noConsent = { ...validMajorProfile("user-a"), isMinor: true };
    await assertFails(alice.firestore().doc("userProfiles/user-a").set(noConsent));
  });

  it("a minor's profile with self-consent (not guardian) is rejected", async () => {
    const alice = testEnv.authenticatedContext("user-a");
    const selfConsent = {
      ...validMajorProfile("user-a"),
      isMinor: true,
      consentRecord: { consentedAt: "2026-07-23T00:00:00.000Z", consentedBy: "self" },
      guardianConsentAt: null,
    };
    await assertFails(alice.firestore().doc("userProfiles/user-a").set(selfConsent));
  });

  it("a minor's profile WITH guardian consent is accepted -- the actual POPIA enforcement", async () => {
    const alice = testEnv.authenticatedContext("user-a");
    await assertSucceeds(
      alice.firestore().doc("userProfiles/user-a").set(validMinorProfileWithConsent("user-a"))
    );
  });

  it("a client cannot null out an existing consent record via update", async () => {
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      await adminCtx.firestore().doc("userProfiles/user-a").set(validMinorProfileWithConsent("user-a"));
    });

    const alice = testEnv.authenticatedContext("user-a");
    await assertFails(
      alice
        .firestore()
        .doc("userProfiles/user-a")
        .set({ ...validMinorProfileWithConsent("user-a"), consentRecord: null }, { merge: false })
    );
  });

  it("a user can update just their shortlist via a partial updateDoc (SaveMarksButton/shortlist toggle's real write pattern)", async () => {
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      await adminCtx.firestore().doc("userProfiles/user-a").set(validMajorProfile("user-a"));
    });

    const alice = testEnv.authenticatedContext("user-a");
    await assertSucceeds(
      alice.firestore().doc("userProfiles/user-a").update({ shortlist: ["sample-bsc-cs"] })
    );
  });

  it("a user cannot update another user's shortlist via partial updateDoc", async () => {
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      await adminCtx.firestore().doc("userProfiles/user-a").set(validMajorProfile("user-a"));
    });

    const bob = testEnv.authenticatedContext("user-b");
    await assertFails(
      bob.firestore().doc("userProfiles/user-a").update({ shortlist: ["hijacked"] })
    );
  });

  it("a client cannot change createdAt after the fact", async () => {
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      await adminCtx.firestore().doc("userProfiles/user-a").set(validMajorProfile("user-a"));
    });

    const alice = testEnv.authenticatedContext("user-a");
    await assertFails(
      alice
        .firestore()
        .doc("userProfiles/user-a")
        .set({ ...validMajorProfile("user-a"), createdAt: "2020-01-01T00:00:00.000Z" })
    );
  });

  it("a user can delete their own profile (account deletion flow)", async () => {
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      await adminCtx.firestore().doc("userProfiles/user-a").set(validMajorProfile("user-a"));
    });

    const alice = testEnv.authenticatedContext("user-a");
    await assertSucceeds(alice.firestore().doc("userProfiles/user-a").delete());
  });

  it("a user cannot delete another user's profile", async () => {
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      await adminCtx.firestore().doc("userProfiles/user-a").set(validMajorProfile("user-a"));
    });

    const bob = testEnv.authenticatedContext("user-b");
    await assertFails(bob.firestore().doc("userProfiles/user-a").delete());
  });
});

describe("public catalogue collections", () => {
  it("anyone, even unauthenticated, can read institutions", async () => {
    const unauth = testEnv.unauthenticatedContext();
    await assertSucceeds(unauth.firestore().doc("institutions/ump").get());
  });

  it("no client -- authenticated or not -- can write to institutions", async () => {
    const alice = testEnv.authenticatedContext("user-a");
    await assertFails(alice.firestore().doc("institutions/ump").set({ name: "hacked" }));
  });

  it("no client can write to bursaries either", async () => {
    const alice = testEnv.authenticatedContext("user-a");
    await assertFails(alice.firestore().doc("bursaries/fake").set({ name: "scam" }));
  });
});

describe("internal ingestion collections", () => {
  it("a non-admin, even authenticated, cannot read sources", async () => {
    const alice = testEnv.authenticatedContext("user-a");
    await assertFails(alice.firestore().doc("sources/dhet").get());
  });

  it("a non-admin cannot read the verification queue", async () => {
    const alice = testEnv.authenticatedContext("user-a");
    await assertFails(alice.firestore().doc("verificationQueue/item-1").get());
  });

  it("a non-admin cannot read ingestion runs", async () => {
    const alice = testEnv.authenticatedContext("user-a");
    await assertFails(alice.firestore().doc("ingestionRuns/run-1").get());
  });

  it("a non-admin cannot read the dead-link report", async () => {
    const alice = testEnv.authenticatedContext("user-a");
    await assertFails(alice.firestore().doc("linkHealthChecks/some-url").get());
  });

  it("an unauthenticated user cannot read sources even by guessing a role claim doesn't apply", async () => {
    const unauth = testEnv.unauthenticatedContext();
    await assertFails(unauth.firestore().doc("sources/dhet").get());
  });

  it("an admin (role=admin custom claim) CAN read sources, the verification queue, ingestion runs, and the dead-link report", async () => {
    const admin = testEnv.authenticatedContext("admin-1", { role: "admin" });
    await assertSucceeds(admin.firestore().doc("sources/dhet").get());
    await assertSucceeds(admin.firestore().doc("verificationQueue/item-1").get());
    await assertSucceeds(admin.firestore().doc("ingestionRuns/run-1").get());
    await assertSucceeds(admin.firestore().doc("linkHealthChecks/some-url").get());
  });

  it("even an admin cannot write to these collections via the client SDK -- writes are Admin-SDK-only", async () => {
    const admin = testEnv.authenticatedContext("admin-1", { role: "admin" });
    await assertFails(admin.firestore().doc("sources/dhet").set({ url: "hacked" }));
    await assertFails(
      admin.firestore().doc("verificationQueue/item-1").update({ status: "approved" })
    );
    await assertFails(admin.firestore().doc("ingestionRuns/run-1").set({ tokensUsed: 0 }));
    await assertFails(admin.firestore().doc("linkHealthChecks/some-url").set({ alive: true }));
  });

  it("an admin cannot write to public catalogue collections via the client SDK either", async () => {
    const admin = testEnv.authenticatedContext("admin-1", { role: "admin" });
    await assertFails(admin.firestore().doc("institutions/ump").set({ name: "hacked" }));
  });
});
