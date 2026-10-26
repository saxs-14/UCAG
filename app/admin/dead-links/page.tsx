"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/firestoreClient";
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
    <div className="flex w-full flex-col gap-5">
      <header className="rounded-2xl bg-brand-navy p-5 text-white sm:p-7"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-teal-soft">Link health</p><h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">Dead link report</h1><p className="mt-2 text-sm leading-6 text-white/80">Tracks whether every institution link on the site is still reachable.</p></header>
      <p className="rounded-xl border border-line bg-paper-raised p-4 text-sm leading-6 text-ink-soft">
        Every institution website/portal/status-check URL, checked by the same task the 6-hourly
        cron runs (dry-run only in production until vercel.json is deliberately flipped -- see
        app/api/cron/link-health/route.ts). {deadCount} of {checks.length} currently unreachable.
      </p>
      <div>
        <button
          type="button"
          disabled={running}
          onClick={runNow}
          className="min-h-11 rounded-xl bg-mark-green px-4 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {running ? "Running..." : "Run now"}
        </button>
      </div>
      {error && (
        <p className="rounded-xl border border-mark-red bg-mark-red-soft p-3 text-sm text-mark-red">
          {error}
        </p>
      )}
      {runSummary && (
        <p className="rounded-xl border border-mark-green bg-mark-green-soft p-3 text-sm text-mark-green">
          {runSummary}
        </p>
      )}
      {loading && <p className="rounded-xl border border-line p-4 text-sm text-ink-soft">Loading...</p>}
      {!loading && checks.length === 0 && (
        <p className="rounded-xl border border-line p-4 text-sm text-ink-soft">
          No checks on record yet -- click &quot;Run now&quot; to run one.
        </p>
      )}
      <ul className="flex flex-col gap-2 text-sm">
        {checks.map((check) => (
          <li
            key={check.url}
            className={`flex flex-wrap items-center gap-2 rounded-xl border border-line bg-paper-raised p-3 ${
              check.alive ? "" : "border-mark-red/40 bg-mark-red-soft"
            }`}
          >
            <span aria-hidden className={check.alive ? "text-mark-green" : "text-mark-red"}>
              {check.alive ? "✓" : "✗"}
            </span>
            <a
              href={check.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-teal hover:underline"
            >
              {check.url}
            </a>
            <span className="text-xs text-ink-faint">
              {check.statusCode ?? "no response"} {check.error ? `-- ${check.error}` : ""} · checked{" "}
              {check.checkedAt}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
