import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { adminErrorResponse } from "@/lib/admin/respond";
import { getAdminDb } from "@/lib/firebase/admin";
import { getLlmClient } from "@/lib/ingestion/llm/getLlmClient";
import { runProgrammeRequirementsIngestion } from "@/lib/ingestion/programmeRequirementsPipeline";
import { getExistingProgramme, persistIngestionRun, persistVerificationQueueItem } from "@/lib/ingestion/persistProposal";
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
  const sources = snapshot.docs
    .map((doc) => doc.data() as Source)
    .filter((source) => source.institutionId !== null);

  try {
    const summary = await runProgrammeRequirementsIngestion(sources, {
      llmClient,
      getExistingProgramme,
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
      costEstimate: 0, // see application-windows/run -- per-provider pricing not wired up, not guessed
      itemsProposed: summary.itemsQueued,
      itemsAutoPublished: 0, // programmeRequirements never auto-publishes, see config/ingestion.ts
      itemsQueued: summary.itemsQueued,
      errors,
    });

    return NextResponse.json({ runId, ...summary });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
