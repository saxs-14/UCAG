import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import type { UsageStatField } from "./usageStatFields";

/**
 * Category E ("Generate useful reports to support business case") was a
 * confirmed, codebase-wide-searched gap: no learner-activity analytics
 * existed anywhere. This fills it with the minimum viable, genuinely
 * useful report -- daily aggregate counts of the three activities named
 * in the rubric criterion itself (calculator completions, programme
 * search volume, funding-discovery activity) -- not an event log, a
 * session tracker, or anything that records what any individual learner
 * did. One Firestore document per calendar day, holding nothing but
 * running totals. See firestore.rules' usageStats match block and
 * docs/DATABASE.md for the full reasoning.
 *
 * The field list/type itself lives in ./usageStatFields, a plain module
 * with no "server-only" guard -- a Client Component (app/admin/activity/
 * page.tsx) needs it just to render the report's table headers, and
 * importing anything at all from this file would otherwise pull the
 * Admin SDK into the browser bundle. Import field names from there
 * directly, not through here.
 */
export type { UsageStatField };

function todayDateString(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Fire-and-forget by design -- a usage counter failing to increment must
 * never break or slow down the actual learner-facing feature it's
 * attached to. Errors are logged, not thrown.
 */
export async function incrementUsageStat(field: UsageStatField, now: Date = new Date()): Promise<void> {
  try {
    const date = todayDateString(now);
    await getAdminDb()
      .collection("usageStats")
      .doc(date)
      .set({ date, [field]: FieldValue.increment(1) }, { merge: true });
  } catch (err) {
    console.warn(`incrementUsageStat: failed to record "${field}" -- continuing without it:`, err);
  }
}
