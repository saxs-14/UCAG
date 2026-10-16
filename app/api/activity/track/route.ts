import { NextResponse, type NextRequest } from "next/server";
import { checkTrackRateLimit } from "@/lib/activity/trackRateLimiter";
import { validateTrackRequest } from "@/lib/activity/validateTrackRequest";
import { incrementUsageStat } from "@/lib/activity/trackUsage";
import type { UsageStatField } from "@/lib/activity/usageStatFields";

/**
 * Public, unauthenticated by design -- same reasoning as app/api/chat/route.ts:
 * the calculator itself needs no account, so this must work for a signed-out
 * learner too. Only one of the three event types this session's compliance
 * audit named (calculator completions, programme search, funding-discovery
 * activity) is tracked client-side through this route -- the other two
 * (programme search, funding-discovery views) happen server-side already
 * (app/programmes/page.tsx, app/bursaries/page.tsx are both server
 * components), so they call lib/activity/trackUsage.ts directly and never
 * touch this endpoint at all.
 */
const EVENT_TO_FIELD: Record<string, UsageStatField> = {
  calculator_completed: "calculatorCompletions",
  programme_search: "programmeSearches",
  funding_discovery_view: "fundingDiscoveryViews",
};

export async function POST(request: NextRequest) {
  const clientId =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  const rateLimit = checkTrackRateLimit(clientId);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const validation = validateTrackRequest(body);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  await incrementUsageStat(EVENT_TO_FIELD[validation.event]!);
  return NextResponse.json({ ok: true });
}
