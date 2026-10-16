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
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Learner activity</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Daily aggregate counts of the three activities this report tracks: calculator
        completions, programme searches (applying a filter or search term on /programmes), and
        funding-discovery views (loading /bursaries). This is intentionally aggregate-only --
        one running total per calendar day, no per-user or per-session data of any kind,
        matching the project&apos;s POPIA data-minimisation rule. See
        lib/activity/trackUsage.ts and docs/DATABASE.md for the full design.
      </p>

      {error && (
        <p className="rounded border border-mark-red bg-mark-red-soft p-2 text-sm text-mark-red">
          {error}
        </p>
      )}
      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {!loading && rows.length === 0 && (
        <p className="text-sm text-gray-500">
          No activity recorded yet -- expected on a fresh deployment or local emulator with no
          real traffic.
        </p>
      )}

      <div className="rounded border p-3 text-sm dark:border-gray-700">
        <p className="font-medium">All-time totals (from recorded days)</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {USAGE_STAT_FIELDS.map((field) => (
            <div key={field} className="rounded bg-gray-50 p-2 dark:bg-gray-900">
              <div className="text-xs text-gray-500">{FIELD_LABELS[field]}</div>
              <div className="text-lg font-semibold">{totals[field].toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-left text-sm">
          <thead>
            <tr className="border-b text-xs text-gray-500 dark:border-gray-700">
              <th className="py-1 pr-3">Date</th>
              {USAGE_STAT_FIELDS.map((field) => (
                <th key={field} className="py-1 pr-3">
                  {FIELD_LABELS[field]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-0 dark:border-gray-800">
                <td className="py-1.5 pr-3 text-xs font-medium">{row.date}</td>
                {USAGE_STAT_FIELDS.map((field) => (
                  <td key={field} className="py-1.5 pr-3 text-xs">
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
