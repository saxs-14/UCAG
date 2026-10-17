"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/firestoreClient";
import { USAGE_STAT_FIELDS, type UsageStatField } from "@/lib/activity/usageStatFields";

type UsageStatRow = { id: string; date: string } & Partial<Record<UsageStatField, number>>;

const FIELD_LABELS: Record<UsageStatField, string> = {
  calculatorCompletions: "Calculator completions",
  programmeSearches: "Programme searches",
  fundingDiscoveryViews: "Funding (bursary) page views",
};

export default function ActivityReportPage() {
  const [rows, setRows] = useState<UsageStatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(getFirebaseDb(), "usageStats"),
      (snap) => {
        const docs = snap.docs.map((d) => ({ ...(d.data() as Record<string, number>), id: d.id, date: d.id }));
        docs.sort((a, b) => b.date.localeCompare(a.date));
        setRows(docs as UsageStatRow[]);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const totals = USAGE_STAT_FIELDS.reduce<Record<UsageStatField, number>>(
    (acc, field) => {
      acc[field] = rows.reduce((sum, row) => sum + (row[field] ?? 0), 0);
      return acc;
    },
    { calculatorCompletions: 0, programmeSearches: 0, fundingDiscoveryViews: 0 }
  );

  return (
    <div className="flex w-full flex-col gap-5">
      <header className="rounded-2xl bg-brand-navy p-5 text-white sm:p-7"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-teal-soft">Analytics &amp; reports</p><h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">Learner activity</h1><p className="mt-2 text-sm leading-6 text-white/80">Daily aggregate usage only. This report does not display per-user or per-session histories.</p></header>
      <p className="rounded-xl border border-line bg-paper-raised p-4 text-sm leading-6 text-ink-soft">
        Daily aggregate counts of the three activities this report tracks: calculator
        completions, programme searches (applying a filter or search term on /programmes), and
        funding-discovery views (loading /bursaries). This is intentionally aggregate-only --
        one running total per calendar day, no per-user or per-session data of any kind,
        matching the project&apos;s POPIA data-minimisation rule. See
        lib/activity/trackUsage.ts and docs/DATABASE.md for the full design.
      </p>

      {error && (
        <p className="rounded-xl border border-mark-red bg-mark-red-soft p-3 text-sm text-mark-red">
          {error}
        </p>
      )}
      {loading && <p className="rounded-xl border border-line p-4 text-sm text-ink-soft">Loading...</p>}
      {!loading && rows.length === 0 && (
        <p className="text-sm text-gray-500">
          No activity recorded yet -- expected on a fresh deployment or local emulator with no
          real traffic.
        </p>
      )}

      <div className="rounded-2xl border border-line bg-paper-raised p-4 text-sm">
        <p className="font-display font-bold text-ink">All-time totals (from recorded days)</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {USAGE_STAT_FIELDS.map((field) => (
            <div key={field} className="rounded-xl border border-line bg-paper p-3">
              <div className="text-xs leading-5 text-ink-soft">{FIELD_LABELS[field]}</div>
              <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">{totals[field].toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-paper-raised">
        <table className="w-full min-w-max text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper px-3 text-xs font-bold uppercase tracking-wide text-ink-soft">
              <th className="px-3 py-3 pr-4">Date</th>
              {USAGE_STAT_FIELDS.map((field) => (
                <th key={field} className="py-1 pr-3">
                  {FIELD_LABELS[field]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-0">
                <td className="px-3 py-3 pr-4 text-xs font-semibold tabular-nums text-ink">{row.date}</td>
                {USAGE_STAT_FIELDS.map((field) => (
                  <td key={field} className="px-3 py-3 pr-4 text-xs tabular-nums text-ink-soft">
                    {(row[field] ?? 0).toLocaleString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
