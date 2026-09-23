import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/admin/auth";
import { adminErrorResponse } from "@/lib/admin/respond";
import { getAdminDb } from "@/lib/firebase/admin";
import type { DecodedIdToken } from "firebase-admin/auth";
import { getLlmClient } from "@/lib/ingestion/llm/getLlmClient";
import { runApplicationWindowIngestion } from "@/lib/ingestion/applicationWindowPipeline";
import { acquireIngestionLock, completeIngestionRun, createIngestionRun, failIngestionRun, getCurrentApplicationWindow, persistVerificationQueueItem, releaseIngestionLock } from "@/lib/ingestion/persistProposal";
import { checkBudgetLive } from "@/lib/ingestion/budgetTracker";
import { INGESTION_KILL_SWITCH } from "@/config/ingestion";
import type { Source } from "@/lib/firestore/types";

/**
 * Admin-triggered, on-demand run of the applicationWindows orchestrator --
 * what the Ingestion Runs page's "Run application windows now" button
 * calls. Deliberately not a Vercel cron entry (Phase 9 already hit the
 * Hobby-plan cron-count limit once; see README status) -- a human clicking
 * a button, gated by requireAdmin, same shape as the existing
 * link-health/run route.
 *
 * If no LLM_API_KEY is configured yet, this returns a clear 501 rather
 * than a fabricated success -- consistent with every other "not wired up
 * yet" surface in this app (see runs/[id]/rerun).
 */
export async function POST(request: NextRequest) {
  let admin: DecodedIdToken;
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
  if (!(await acquireIngestionLock("applicationWindows", lockOwner))) {
    return NextResponse.json({ error: "An application-window ingestion run is already in progress." }, { status: 409 });
  }
  const snapshot = await db.collection("sources").where("enabled", "==", true).get();
  // institutionId != null filtered in JS, not a Firestore inequality --
  // source count is small (Tier 1 scale) and this avoids a composite index.
  const sources = snapshot.docs
    .map((doc) => doc.data() as Source)
    .filter((source) => source.institutionId !== null);

  let runId: string | null = null;
  try {
    runId = await createIngestionRun(sources.map((s) => s.id));
    const summary = await runApplicationWindowIngestion(sources, {
      llmClient,
      getCurrentWindow: getCurrentApplicationWindow,
      persistProposal: persistVerificationQueueItem,
      checkBudgetLive,
    });

    const errors = summary.results
      .filter((r) => r.outcome === "fetchError" || r.outcome === "extractionError")
      .map((r) => `${r.sourceId}: ${r.detail ?? r.outcome}`);

    const sourceResults = summary.results.map((r) => ({
      sourceId: r.sourceId,
      outcome: r.outcome,
      detail: r.detail,
      tokensUsed: r.tokensUsed,
      fieldsQueued: r.fieldsQueued,
      fetchedAt: r.fetchedAt,
      statusCode: r.statusCode,
      etag: r.etag,
      lastModified: r.lastModified,
      contentHash: r.contentHash,
      retryCount: r.retryCount,
    }));
    await completeIngestionRun(runId, {
      startedAt: summary.startedAt,
      finishedAt: summary.finishedAt,
      sourceIds: sources.map((s) => s.id),
      tokensUsed: summary.totalTokensUsed,
      // Per-provider token pricing isn't wired up yet -- Gemini's free
      // tier is $0 in practice, but this field should not fabricate a
      // number for a paid provider. Left at 0 rather than guessed.
      costEstimate: 0,
      itemsProposed: summary.itemsQueued,
      itemsAutoPublished: 0, // applicationWindows never auto-publishes, see config/ingestion.ts
      itemsQueued: summary.itemsQueued,
      errors,
      sourceResults,
    });
    await Promise.all(summary.results.map(async (result) => {
      const source = sources.find((item) => item.id === result.sourceId);
      if (!source) return;
      const ref = db.collection("sources").doc(source.id);
      const patch: Record<string, unknown> = {
        lastFetchError: result.outcome === "fetchError" ? (result.detail ?? "Source fetch failed.") : null,
        updatedAt: new Date().toISOString(),
        updatedBy: admin.uid,
      };
      if (result.fetchedAt) patch.lastFetchedAt = result.fetchedAt;
      if (result.statusCode !== undefined) patch.lastFetchStatusCode = result.statusCode;
      if (result.etag !== undefined) patch.etag = result.etag;
      if (result.lastModified !== undefined) patch.lastModified = result.lastModified;
      if (result.contentHash !== undefined) patch.contentHash = result.contentHash;
      await ref.update(patch);
    }));
    return NextResponse.json({ runId, ...summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (runId) await failIngestionRun(runId, message).catch(() => undefined);
    return NextResponse.json({ error: message, runId }, { status: 500 });
  } finally {
    await releaseIngestionLock("applicationWindows", lockOwner).catch(() => undefined);
  }
}
