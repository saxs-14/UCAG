import { NextResponse, type NextRequest } from "next/server";
import { assertCronSecret } from "@/lib/env/server";
import { runLinkHealthCheck } from "@/lib/ingestion/pipeline";
import { SEED_INSTITUTIONS } from "@/config/institutions.seed";
import { INGESTION_KILL_SWITCH } from "@/config/ingestion";

/**
 * Link health check -- every 6 hours per config/ingestion.ts CADENCE_RULES,
 * wired here and in vercel.json. Protected by CRON_SECRET (CLAUDE.md
 * non-negotiable #4: a public cron endpoint is a free way to run up the
 * bill -- true even for this task, which costs no LLM tokens, since it
 * still makes outbound HTTP requests on a schedule an attacker could abuse).
 *
 * Auth: Vercel Cron automatically sends `Authorization: Bearer
 * $CRON_SECRET` on every invocation when a CRON_SECRET env var exists on
 * the project -- that's the real mechanism this checks. The `x-cron-secret`
 * header is also accepted purely as a local-dev/manual-curl convenience
 * (see the Phase 4 checkpoint's live dry-run, which used it); don't rely
 * on it in production.
 *
 * dryRun defaults to true and is the only mode implemented right now --
 * see lib/ingestion/pipeline.ts for why (no live Firestore project
 * connected for v2 yet).
 */
export async function GET(request: NextRequest) {
  const bearerSecret = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  const providedSecret = bearerSecret ?? request.headers.get("x-cron-secret");

  try {
    assertCronSecret(providedSecret);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (INGESTION_KILL_SWITCH) {
    return NextResponse.json({ error: "Ingestion kill switch is enabled" }, { status: 503 });
  }

  const dryRun = request.nextUrl.searchParams.get("dryRun") !== "false";

  try {
    const summary = await runLinkHealthCheck(SEED_INSTITUTIONS, { dryRun });
    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 501 }
    );
  }
}
