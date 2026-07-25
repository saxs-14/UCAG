import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { adminErrorResponse } from "@/lib/admin/respond";
import { getAdminDb } from "@/lib/firebase/admin";
import { getLlmClient } from "@/lib/ingestion/llm/getLlmClient";
import { runApplicationWindowIngestion } from "@/lib/ingestion/applicationWindowPipeline";
import { getCurrentApplicationWindow, persistIngestionRun, persistVerificationQueueItem } from "@/lib/ingestion/persistProposal";
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
  try {
    await requireAdmin(request);
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
  const snapshot = await db.collection("sources").where("enabled", "==", true).get();
  // institutionId != null filtered in JS, not a Firestore inequality --
  // source count is small (Tier 1 scale) and this avoids a composite index.
  const sources = snapshot.docs
    .map((doc) => doc.data() as Source)
    .filter((source) => source.institutionId !== null);

  try {
    const summary = await runApplicationWindowIngestion(sources, {
      llmClient,
      getCurrentWindow: getCurrentApplicationWindow,
      persistProposal: persistVerificationQueueItem,
      checkBudgetLive,
    });

    const errors = summary.results
      .filter((r) => r.outcome === "fetchError" || r.outcome === "extractionError")
      .map((r) => `${r.sourceId}: ${r.detail ?? r.outcome}`);

    const runId = await persistIngestionRun({
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
    });

    return NextResponse.json({ runId, ...summary });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
