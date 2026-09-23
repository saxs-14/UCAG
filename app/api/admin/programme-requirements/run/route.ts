import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/admin/auth";
import { adminErrorResponse } from "@/lib/admin/respond";
import { getAdminDb } from "@/lib/firebase/admin";
import { getLlmClient } from "@/lib/ingestion/llm/getLlmClient";
import { runProgrammeRequirementsIngestion } from "@/lib/ingestion/programmeRequirementsPipeline";
import { acquireIngestionLock, completeIngestionRun, createIngestionRun, failIngestionRun, getExistingProgramme, persistVerificationQueueItem, releaseIngestionLock } from "@/lib/ingestion/persistProposal";
import { checkBudgetLive } from "@/lib/ingestion/budgetTracker";
import { INGESTION_KILL_SWITCH } from "@/config/ingestion";
import type { Source } from "@/lib/firestore/types";

/**
 * Admin-triggered, on-demand run of the programmeRequirements
 * orchestrator -- same shape as application-windows/run: not a Vercel
 * cron entry, gated by requireAdmin, an honest 501 if no LLM_API_KEY is
 * configured rather than a fabricated success.
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
  if (!(await acquireIngestionLock("programmeRequirements", lockOwner))) return NextResponse.json({ error: "An ingestion run is already in progress." }, { status: 409 });
  const snapshot = await db.collection("sources").where("enabled", "==", true).get();
  const sources = snapshot.docs
    .map((doc) => doc.data() as Source)
    .filter((source) => source.institutionId !== null);

  let runId: string | null = null;
  try {
    runId = await createIngestionRun(sources.map((s) => s.id));
    const summary = await runProgrammeRequirementsIngestion(sources, {
      llmClient,
      getExistingProgramme,
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
      fieldsQueued: [],
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
      costEstimate: 0, // see application-windows/run -- per-provider pricing not wired up, not guessed
      itemsProposed: summary.itemsQueued,
      itemsAutoPublished: 0, // programmeRequirements never auto-publishes, see config/ingestion.ts
      itemsQueued: summary.itemsQueued,
      errors,
      sourceResults,
    });
    await Promise.all(summary.results.map(async (result) => {
      const source = sources.find((item) => item.id === result.sourceId);
      if (!source) return;
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
      await db.collection("sources").doc(source.id).update(patch);
    }));

    return NextResponse.json({ runId, ...summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (runId) await failIngestionRun(runId, message).catch(() => undefined);
    return NextResponse.json({ error: message, runId }, { status: 500 });
  } finally {
    await releaseIngestionLock("programmeRequirements", lockOwner).catch(() => undefined);
  }
}
