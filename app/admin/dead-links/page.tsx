"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { adminFetch } from "@/lib/admin/apiClient";
import type { LinkHealthCheckRecord } from "@/lib/firestore/types";

export default function DeadLinksPage() {
  const [checks, setChecks] = useState<LinkHealthCheckRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [runSummary, setRunSummary] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(getFirebaseDb(), "linkHealthChecks"),
      (snap) => {
        const rows = snap.docs.map((d) => d.data() as LinkHealthCheckRecord);
        rows.sort((a, b) => Number(a.alive) - Number(b.alive) || a.url.localeCompare(b.url));
        setChecks(rows);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  async function runNow() {
    setRunning(true);
    setError(null);
    setRunSummary(null);
    try {
      const res = await adminFetch("/api/admin/link-health/run", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status}).`);
      setRunSummary(
        `Checked ${body.checkedCount} links, ${body.deadCount} dead, ${body.firestoreWritesPerformed} saved.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }

  const deadCount = checks.filter((c) => !c.alive).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Dead link report</h1>
        <button
          type="button"
          disabled={running}
          onClick={runNow}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {running ? "Running..." : "Run now"}
        </button>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Every institution website/portal/status-check URL, checked by the same task the 6-hourly
        cron runs (dry-run only in production until vercel.json is deliberately flipped -- see
        app/api/cron/link-health/route.ts). {deadCount} of {checks.length} currently unreachable.
      </p>
      {error && (
        <p className="rounded border border-red-300 bg-red-50 p-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      )}
      {runSummary && (
        <p className="rounded border border-green-300 bg-green-50 p-2 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          {runSummary}
        </p>
      )}
      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {!loading && checks.length === 0 && (
        <p className="text-sm text-gray-500">No checks on record yet -- click &quot;Run now&quot; to run one.</p>
      )}
      <ul className="flex flex-col gap-1 text-sm">
        {checks.map((check) => (
          <li
            key={check.url}
            className={`flex flex-wrap items-center gap-2 rounded border p-2 dark:border-gray-800 ${
              check.alive ? "" : "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950"
            }`}
          >
            <span aria-hidden>{check.alive ? "✓" : "✗"}</span>
            <a
              href={check.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              {check.url}
            </a>
            <span className="text-xs text-gray-500">
              {check.statusCode ?? "no response"} {check.error ? `-- ${check.error}` : ""} · checked{" "}
              {check.checkedAt}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
