// cSpell:words ucag firestore
/**
 * Integration test against the real Firestore emulator for
 * lib/ingestion/persistProposal.ts's recoverStaleIngestionRuns() -- real
 * logic that existed and was exercised indirectly through 3 pipeline test
 * files (applicationWindowPipeline.test.ts, bursaryPipeline.test.ts,
 * programmeRequirementsPipeline.test.ts via their shared orchestrator),
 * but had no isolated test of its own for the recovery-threshold logic
 * itself -- see docs/RUBRIC_COMPLIANCE_MATRIX.md's Category D findings.
 *
 * Same prerequisite as tests/firestore-rules.test.ts and
 * tests/auth-integration.test.ts: the Firestore emulator must be running
 * (`firebase emulators:start --only firestore,auth --project demo-ucag`).
 * Skips cleanly (not a false failure) when it isn't.
 */

import { initializeApp as initializeAdminApp, deleteApp, getApps } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { recoverStaleIngestionRuns } from "@/lib/ingestion/persistProposal";

let db: Firestore;
let emulatorAvailable = false;
let testRunCounter = 0;
// recoverStaleIngestionRuns() sweeps the whole ingestionRuns collection with
// no per-test scoping (matching real production usage -- there's genuinely
// only one collection). Tests share the emulator sequentially, so every doc
// a test creates must be cleaned up afterward, or a later test asserting an
// exact "nothing was recovered" count can be thrown off by an earlier test's
// leftover "running" doc aging past the threshold in the meantime.
let createdIds: string[] = [];

async function seedRun(
  overrides: Partial<{
    status: "running" | "completed" | "failed";
    startedAt: string;
    errors: string[];
  }> = {}
): Promise<string> {
  testRunCounter += 1;
  const id = `stale-run-test-${Date.now()}-${testRunCounter}`;
  createdIds.push(id);
  await db
    .collection("ingestionRuns")
    .doc(id)
    .set({
      id,
      status: overrides.status ?? "running",
      startedAt: overrides.startedAt ?? new Date().toISOString(),
      finishedAt: null,
      sourceIds: [],
      tokensUsed: 0,
      costEstimate: 0,
      itemsProposed: 0,
      itemsAutoPublished: 0,
      itemsQueued: 0,
      errors: overrides.errors ?? [],
      sourceResults: [],
    });
  return id;
}

async function getRun(id: string) {
  const snap = await db.collection("ingestionRuns").doc(id).get();
  return snap.data()!;
}

beforeAll(async () => {
  process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
  try {
    const res = await fetch("http://127.0.0.1:8080/").catch(() => null);
    if (res) emulatorAvailable = true;
  } catch {
    emulatorAvailable = false;
  }
  if (emulatorAvailable) {
    const existing = getApps();
    const app = existing.length > 0 ? existing[0]! : initializeAdminApp({ projectId: "demo-ucag" });
    db = getFirestore(app);
  }
});

beforeEach((ctx) => {
  if (!emulatorAvailable) {
    ctx.skip();
  }
});

afterEach(async () => {
  if (!emulatorAvailable) return;
  await Promise.all(createdIds.map((id) => db.collection("ingestionRuns").doc(id).delete()));
  createdIds = [];
});

afterAll(async () => {
  const app = getApps()[0];
  if (app) await deleteApp(app).catch(() => {});
});

const ONE_HOUR_MS = 60 * 60 * 1000;

describe("recoverStaleIngestionRuns", () => {
  it("marks a run older than the threshold and still running as failed", async () => {
    const now = new Date();
    const staleStart = new Date(now.getTime() - 2 * ONE_HOUR_MS).toISOString();
    const id = await seedRun({ status: "running", startedAt: staleStart });

    const recovered = await recoverStaleIngestionRuns(ONE_HOUR_MS, now);

    expect(recovered).toBeGreaterThanOrEqual(1);
    const run = await getRun(id);
    expect(run.status).toBe("failed");
    expect(run.finishedAt).toBe(now.toISOString());
    expect(run.errors).toContain(
      "Run marked failed by stale-run recovery after exceeding the recovery threshold."
    );
  });

  it("leaves a run younger than the threshold untouched", async () => {
    const now = new Date();
    const freshStart = new Date(now.getTime() - 10 * 60 * 1000).toISOString(); // 10 min ago
    const id = await seedRun({ status: "running", startedAt: freshStart });

    await recoverStaleIngestionRuns(ONE_HOUR_MS, now);

    const run = await getRun(id);
    expect(run.status).toBe("running");
    expect(run.finishedAt).toBeNull();
  });

  it("does not touch a run at exactly the threshold boundary (boundary is exclusive)", async () => {
    const now = new Date();
    const exactBoundaryStart = new Date(now.getTime() - ONE_HOUR_MS).toISOString();
    const id = await seedRun({ status: "running", startedAt: exactBoundaryStart });

    await recoverStaleIngestionRuns(ONE_HOUR_MS, now);

    // Source: `if (!Number.isFinite(startedMs) || startedMs >= cutoff) continue;`
    // -- a run exactly at the cutoff is skipped, not recovered. A run must be
    // STRICTLY older than maxAgeMs to be recovered.
    const run = await getRun(id);
    expect(run.status).toBe("running");
  });

  it("never touches a run that isn't status 'running', no matter how old", async () => {
    const now = new Date();
    const ancientStart = new Date(now.getTime() - 100 * ONE_HOUR_MS).toISOString();
    const completedId = await seedRun({ status: "completed", startedAt: ancientStart });
    const failedId = await seedRun({ status: "failed", startedAt: ancientStart });

    const recovered = await recoverStaleIngestionRuns(ONE_HOUR_MS, now);

    expect(recovered).toBe(0);
    expect((await getRun(completedId)).status).toBe("completed");
    expect((await getRun(failedId)).status).toBe("failed");
  });

  it("appends to existing errors rather than replacing them", async () => {
    const now = new Date();
    const staleStart = new Date(now.getTime() - 2 * ONE_HOUR_MS).toISOString();
    const id = await seedRun({
      status: "running",
      startedAt: staleStart,
      errors: ["a pre-existing error from earlier in the run"],
    });

    await recoverStaleIngestionRuns(ONE_HOUR_MS, now);

    const run = await getRun(id);
    expect(run.errors).toHaveLength(2);
    expect(run.errors[0]).toBe("a pre-existing error from earlier in the run");
    expect(run.errors[1]).toBe(
      "Run marked failed by stale-run recovery after exceeding the recovery threshold."
    );
  });

  it("recovers multiple stale runs in a single call and reports the correct count", async () => {
    const now = new Date();
    const staleStart = new Date(now.getTime() - 5 * ONE_HOUR_MS).toISOString();
    const id1 = await seedRun({ status: "running", startedAt: staleStart });
    const id2 = await seedRun({ status: "running", startedAt: staleStart });
    const id3 = await seedRun({ status: "running", startedAt: staleStart });

    const recovered = await recoverStaleIngestionRuns(ONE_HOUR_MS, now);

    expect(recovered).toBeGreaterThanOrEqual(3);
    for (const id of [id1, id2, id3]) {
      expect((await getRun(id)).status).toBe("failed");
    }
  });
});
