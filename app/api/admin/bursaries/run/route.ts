import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/admin/auth";
import { adminErrorResponse } from "@/lib/admin/respond";
import { getAdminDb } from "@/lib/firebase/admin";
import { getLlmClient } from "@/lib/ingestion/llm/getLlmClient";
import { runBursaryIngestion } from "@/lib/ingestion/bursaryPipeline";
import { acquireIngestionLock, completeIngestionRun, createIngestionRun, failIngestionRun, getExistingBursary, persistVerificationQueueItem, releaseIngestionLock } from "@/lib/ingestion/persistProposal";
import { checkBudgetLive } from "@/lib/ingestion/budgetTracker";
import { INGESTION_KILL_SWITCH } from "@/config/ingestion";
import type { Source } from "@/lib/firestore/types";

/**
 * Admin-triggered, on-demand run of the bursaries orchestrator -- same
 * shape as app/api/admin/application-windows/run/route.ts (a human
 * clicking a button, gated by requireAdmin, not a Vercel cron entry --
 * see that route's own comment on the Hobby-plan cron-count limit).
 *
 * Filters to sourceType "bursaryProvider" rather than applicationWindows'
 * institutionId-not-null filter -- bursary sources are institution-
 * agnostic by design (NSFAS, corporate bursary schemes), so
 * institutionId isn't the relevant filter here; the source register's
 * own type classification is.
 *
 * If no LLM_API_KEY is configured yet, this returns a clear 501 rather
 * than a fabricated success -- consistent with every other "not wired up
 * yet" surface in this app.
 */
export async function POST(request: NextRequest) {
  let admin;
  try {
    admin = await requireAdmin(request);
  } catch (err) {
    return adminErrorResponse(err);
  }

  if (INGESTION_KILL_SWITCH) {
    return NextResponse.json({ error: "Ingestion kill switch is enabled." }, { status: 503 });
  }

  let llmClient;
  try {
    llmClient = getLlmClient();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 501 }
    );
  }

  const db = getAdminDb();
  const lockOwner = admin.uid + ":" + randomUUID();
  if (!(await acquireIngestionLock("bursaries", lockOwner))) return NextResponse.json({ error: "An ingestion run is already in progress." }, { status: 409 });
  const snapshot = await db
    .collection("sources")
    .where("enabled", "==", true)
    .where("type", "==", "bursaryProvider")
    .get();
  const sources = snapshot.docs.map((doc) => doc.data() as Source);

  let runId: string | null = null;
  try {
    runId = await createIngestionRun(sources.map((s) => s.id));
    const summary = await runBursaryIngestion(sources, {
      llmClient,
      getExistingBursary,
      persistProposal: persistVerificationQueueItem,
      checkBudgetLive,
    });

    const errors = summary.results
      .filter((r) => r.outcome === "fetchError" || r.outcome === "extractionError")
      .map((r) => `${r.sourceId}: ${r.detail ?? r.outcome}`);

    const sourceResults = summary.results.map((r) => ({ sourceId: r.sourceId, outcome: r.outcome, detail: r.detail, tokensUsed: r.tokensUsed, fieldsQueued: [] }));
    await completeIngestionRun(runId, {
      startedAt: summary.startedAt,
      finishedAt: summary.finishedAt,
      sourceIds: sources.map((s) => s.id),
      tokensUsed: summary.totalTokensUsed,
      // Per-provider token pricing isn't wired up yet -- see the
      // application-windows route's identical comment on why this is 0,
      // not a guess.
      costEstimate: 0,
      itemsProposed: summary.itemsQueued,
      itemsAutoPublished: 0, // bursaries never auto-publish, see config/ingestion.ts
      itemsQueued: summary.itemsQueued,
      errors,
      sourceResults,
    });

    return NextResponse.json({ runId, ...summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (runId) await failIngestionRun(runId, message).catch(() => undefined);
    return NextResponse.json({ error: message, runId }, { status: 500 });
  } finally {
    await releaseIngestionLock("bursaries", lockOwner).catch(() => undefined);
  }
}
