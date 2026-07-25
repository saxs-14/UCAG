"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/firestoreClient";
import { adminFetch } from "@/lib/admin/apiClient";
import type { IngestionRun } from "@/lib/firestore/types";

type RunRow = IngestionRun & { id: string };

export default function RunsPage() {
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [runningTask, setRunningTask] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(getFirebaseDb(), "ingestionRuns"),
      (snap) => {
        const rows = snap.docs.map((d) => ({ ...(d.data() as IngestionRun), id: d.id }));
        rows.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
        setRuns(rows);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  async function runIngestionTask(endpoint: string) {
    setRunningTask(endpoint);
    setMessage(null);
    setError(null);
    try {
      const res = await adminFetch(endpoint, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage(
          `Run complete: ${body.itemsQueued} field${body.itemsQueued === 1 ? "" : "s"} queued for review, ` +
            `${body.totalTokensUsed} tokens used. Check the Verification Queue page to review.`
        );
      } else {
        setMessage(null);
        setError(body.error ?? `Request failed (${res.status}).`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunningTask(null);
    }
  }

  async function rerun(id: string) {
    setBusyId(id);
    setMessage(null);
    setError(null);
    try {
      const res = await adminFetch(`/api/admin/runs/${id}/rerun`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      setMessage(res.ok ? "Re-run triggered." : (body.error ?? `Request failed (${res.status}).`));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Ingestion runs</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        History of every ingestion pipeline run: token spend, cost, errors. Application dates are
        never auto-published -- every proposed change lands in the Verification Queue for a human
        to approve, no matter how confident the extraction. Re-running a specific historical run
        by id (the per-row &quot;Re-run&quot; button) isn&apos;t implemented -- use the buttons
        below to trigger a fresh run instead. Programme requirements feed the APS engine
        directly, so proposals there matter even more than most -- review carefully.
      </p>
      <div className="flex flex-wrap gap-4">
        <div>
          <button
            type="button"
            disabled={runningTask !== null}
            onClick={() => runIngestionTask("/api/admin/application-windows/run")}
            className="rounded border px-3 py-1.5 text-sm font-medium disabled:opacity-50 dark:border-gray-700"
          >
            {runningTask === "/api/admin/application-windows/run" ? "Running..." : "Run application windows now"}
          </button>
        </div>
        <div>
          <button
            type="button"
            disabled={runningTask !== null}
            onClick={() => runIngestionTask("/api/admin/programme-requirements/run")}
            className="rounded border px-3 py-1.5 text-sm font-medium disabled:opacity-50 dark:border-gray-700"
          >
            {runningTask === "/api/admin/programme-requirements/run" ? "Running..." : "Run programme requirements now"}
          </button>
        </div>
      </div>
      <p className="-mt-2 text-xs text-gray-500">
        Both require LLM_PROVIDER + LLM_API_KEY to be configured (see .env.example) -- return a
        clear error instead of a fake success if they aren&apos;t set.
      </p>
      {error && (
        <p className="rounded border border-mark-red bg-mark-red-soft p-2 text-sm text-mark-red">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded border border-mark-gold bg-mark-gold-soft p-2 text-sm text-mark-gold">
          {message}
        </p>
      )}
      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {!loading && runs.length === 0 && (
        <p className="text-sm text-gray-500">
          No ingestion runs on record yet -- expected until a live run happens (see README.md
          Phase 4 status).
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-left text-sm">
          <thead>
            <tr className="border-b text-xs text-gray-500 dark:border-gray-700">
              <th className="py-1 pr-3">Started</th>
              <th className="py-1 pr-3">Finished</th>
              <th className="py-1 pr-3">Sources</th>
              <th className="py-1 pr-3">Tokens</th>
              <th className="py-1 pr-3">Cost (USD)</th>
              <th className="py-1 pr-3">Proposed</th>
              <th className="py-1 pr-3">Auto-published</th>
              <th className="py-1 pr-3">Queued</th>
              <th className="py-1 pr-3">Errors</th>
              <th className="py-1 pr-3" />
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id} className="border-b align-top last:border-0 dark:border-gray-800">
                <td className="py-1.5 pr-3 text-xs">{run.startedAt}</td>
                <td className="py-1.5 pr-3 text-xs">{run.finishedAt ?? "in progress"}</td>
                <td className="py-1.5 pr-3 text-xs">{run.sourceIds.length}</td>
                <td className="py-1.5 pr-3 text-xs">{run.tokensUsed.toLocaleString()}</td>
                <td className="py-1.5 pr-3 text-xs">${run.costEstimate.toFixed(2)}</td>
                <td className="py-1.5 pr-3 text-xs">{run.itemsProposed}</td>
                <td className="py-1.5 pr-3 text-xs">{run.itemsAutoPublished}</td>
                <td className="py-1.5 pr-3 text-xs">{run.itemsQueued}</td>
                <td className="py-1.5 pr-3 text-xs text-mark-red">
                  {run.errors.length > 0 ? run.errors.join("; ") : "-"}
                </td>
                <td className="py-1.5 pr-3">
                  <button
                    type="button"
                    disabled={busyId === run.id}
                    onClick={() => rerun(run.id)}
                    className="rounded border px-2 py-0.5 text-xs disabled:opacity-50 dark:border-gray-700"
                  >
                    Re-run
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
