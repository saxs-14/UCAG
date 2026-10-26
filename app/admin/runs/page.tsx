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

  async function recoverStaleRuns() {
    setBusyId("stale-recovery");
    setMessage(null);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/runs/recover", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status}).`);
      setMessage(`${body.recovered ?? 0} stale run${body.recovered === 1 ? "" : "s"} recovered.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
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
    <div className="flex w-full flex-col gap-5">
      <header className="rounded-2xl bg-brand-navy p-5 text-white sm:p-7">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-teal-soft">Ingestion pipeline</p>
        <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">Ingestion runs</h1>
        <p className="mt-2 text-sm leading-6 text-white/80">
          History of every ingestion pipeline run: token spend, cost, errors.
        </p>
      </header>
      <p className="rounded-xl border border-line bg-paper-raised p-4 text-sm leading-6 text-ink-soft">
        Application dates are never auto-published -- every proposed change lands in the
        Verification Queue for a human to approve, no matter how confident the extraction.
        Re-running a specific historical run by id (the per-row &quot;Re-run&quot; button) isn&apos;t
        implemented -- use the buttons below to trigger a fresh run instead. Programme
        requirements feed the APS engine directly, so proposals there matter even more than
        most -- review carefully.
      </p>

      <div className="rounded-2xl border border-line bg-paper-raised p-4 sm:p-5">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busyId !== null}
            onClick={recoverStaleRuns}
            className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold text-ink-soft hover:bg-slate-soft disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {busyId === "stale-recovery" ? "Recovering..." : "Recover stale runs"}
          </button>
          <button
            type="button"
            disabled={runningTask !== null}
            onClick={() => runIngestionTask("/api/admin/application-windows/run")}
            className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold text-ink-soft hover:bg-slate-soft disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {runningTask === "/api/admin/application-windows/run" ? "Running..." : "Run application windows now"}
          </button>
          <button
            type="button"
            disabled={runningTask !== null}
            onClick={() => runIngestionTask("/api/admin/programme-requirements/run")}
            className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold text-ink-soft hover:bg-slate-soft disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {runningTask === "/api/admin/programme-requirements/run" ? "Running..." : "Run programme requirements now"}
          </button>
          <button
            type="button"
            disabled={runningTask !== null}
            onClick={() => runIngestionTask("/api/admin/bursaries/run")}
            className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold text-ink-soft hover:bg-slate-soft disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {runningTask === "/api/admin/bursaries/run" ? "Running..." : "Run bursaries now"}
          </button>
        </div>
        <p className="mt-3 text-xs leading-6 text-ink-faint">
          All three require LLM_PROVIDER + LLM_API_KEY to be configured (see .env.example) --
          return a clear error instead of a fake success if they aren&apos;t set. Bursaries are
          additionally screened for scam patterns (keyword checks + a trained classifier,
          lib/ingestion/bursaryScamModel/) before queuing -- every proposal, including a flagged
          one, still lands in the Verification Queue for a human to see and decide on, never
          auto-rejected silently.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-mark-red bg-mark-red-soft p-3 text-sm text-mark-red">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-xl border border-mark-gold bg-mark-gold-soft p-3 text-sm text-mark-gold">
          {message}
        </p>
      )}
      {loading && <p className="rounded-xl border border-line p-4 text-sm text-ink-soft">Loading...</p>}
      {!loading && runs.length === 0 && (
        <p className="rounded-xl border border-line p-4 text-sm text-ink-soft">
          No ingestion runs on record yet -- expected until a live run happens (see README.md
          Phase 4 status).
        </p>
      )}

      <div className="rounded-2xl border border-line bg-paper-raised p-4 text-sm">
        <p className="font-display font-bold text-ink">Source monitor</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          {["processed", "skipped", "noChange", "fetchError"].map((outcome) => {
            const count = runs.reduce((total, run) => total + (run.sourceResults?.filter((r) => r.outcome === outcome).length ?? 0), 0);
            return (
              <div key={outcome} className="rounded-xl border border-line bg-paper p-3">
                <div className="text-xs text-ink-soft">{outcome}</div>
                <div className="font-display text-2xl font-extrabold tabular-nums text-ink">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-paper-raised">
        <table className="w-full min-w-max text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper">
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Started</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Finished</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Status</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Sources</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Tokens</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Cost (USD)</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Proposed</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Auto-published</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Queued</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Retries</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Errors</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id} className="border-b border-line align-top last:border-0">
                <td className="px-3 py-3 text-xs font-semibold text-ink">{run.startedAt}</td>
                <td className="px-3 py-3 text-xs text-ink-soft">{run.finishedAt ?? "in progress"}</td>
                <td className="px-3 py-3 text-xs font-semibold text-ink">{run.status ?? (run.finishedAt ? "completed" : "running")}</td>
                <td className="px-3 py-3 text-xs tabular-nums text-ink-soft">{run.sourceIds.length}</td>
                <td className="px-3 py-3 text-xs tabular-nums text-ink-soft">{run.tokensUsed.toLocaleString()}</td>
                <td className="px-3 py-3 text-xs tabular-nums text-ink-soft">${run.costEstimate.toFixed(2)}</td>
                <td className="px-3 py-3 text-xs tabular-nums text-ink-soft">{run.itemsProposed}</td>
                <td className="px-3 py-3 text-xs tabular-nums text-ink-soft">{run.itemsAutoPublished}</td>
                <td className="px-3 py-3 text-xs tabular-nums text-ink-soft">{run.itemsQueued}</td>
                <td className="px-3 py-3 text-xs tabular-nums text-ink-soft">{(run.sourceResults ?? []).reduce((n, r) => n + (r.retryCount ?? 0), 0)}</td>
                <td className="px-3 py-3 text-xs text-mark-red">
                  {run.errors.length > 0 ? run.errors.join("; ") : "-"}
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    disabled={busyId === run.id}
                    onClick={() => rerun(run.id)}
                    className="rounded-xl border border-line px-2.5 py-1 text-xs font-semibold text-ink-soft hover:bg-slate-soft disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
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
