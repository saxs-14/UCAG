import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { adminErrorResponse } from "@/lib/admin/respond";
import { runLinkHealthCheck } from "@/lib/ingestion/pipeline";
import { SEED_INSTITUTIONS } from "@/config/institutions.seed";
import { INGESTION_KILL_SWITCH } from "@/config/ingestion";
import type { Institution } from "@/lib/firestore/types";

/**
 * A deliberately-broken URL, checked alongside every real institution, so
 * the Dead Link Report always has exactly one guaranteed failure to show
 * -- a fixed, known test case for exercising the report's error handling,
 * requested explicitly rather than relying on a real institution's own
 * (temporary, and therefore unreliable as a test fixture) outage.
 * Appended here, at this one call site, not added to SEED_INSTITUTIONS --
 * it never reaches the real catalogue, the calculator, or any
 * learner-facing page; it only ever shows up on this admin report.
 */
const QA_TEST_BROKEN_LINK: Institution = {
  id: "__qa-test-broken-link",
  name: "QA test -- intentionally broken link",
  shortName: "QA-TEST",
  type: "traditionalUniversity",
  province: "N/A",
  tier: 3,
  campuses: [],
  websiteUrl: "https://this-url-is-deliberately-broken.ucag-qa-test.invalid/",
  applicationPortalUrl: null,
  appliesThroughThirdParty: null,
  statusCheckUrl: null,
  nbtRequired: false,
  logoUrl: null,
  phone: null,
  email: null,
  sourceUrl: "https://www.ucag.co.za/",
  verifiedOn: "2026-11-09",
  academicYear: 2027,
};

/**
 * Admin-triggered, on-demand, non-dry-run link health check -- what the
 * Dead Link Report page's "Run now" button calls. Independent of the
 * 6-hourly cron (app/api/cron/link-health/route.ts, CRON_SECRET-gated,
 * still dry-run only in vercel.json); this one is gated by requireAdmin
 * instead, since a human is triggering it, not a schedule.
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

  try {
    const summary = await runLinkHealthCheck([...SEED_INSTITUTIONS, QA_TEST_BROKEN_LINK], { dryRun: false });
    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
