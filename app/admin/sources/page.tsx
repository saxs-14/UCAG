"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/firestoreClient";
import { adminFetch } from "@/lib/admin/apiClient";
import type { Source, SourceType } from "@/lib/firestore/types";

type SourceRow = Source & { id: string };

function nextDue(source: SourceRow): string {
  if (!source.lastFetchedAt) return "due now";
  const last = Date.parse(source.lastFetchedAt);
  if (!Number.isFinite(last)) return "due now";
  const due = last + source.fetchIntervalHours * 60 * 60 * 1000;
  return due <= Date.now() ? "due now" : new Date(due).toISOString();
}

function healthLabel(source: SourceRow): string {
  if (!source.enabled) return "disabled";
  if (!source.robotsAllowed) return "robots blocked";
  if (source.lastFetchError) return "fetch error";
  if (!source.lastFetchedAt) return "never fetched";
  return "healthy";
}

const SOURCE_TYPES: SourceType[] = [
  "governmentStatistics",
  "governmentRegister",
  "institutionAdmissions",
  "institutionPortal",
  "bursaryProvider",
];

const emptyForm = {
  id: "",
  url: "",
  publisher: "",
  type: "institutionAdmissions" as SourceType,
  institutionId: "",
  robotsAllowed: true,
  fetchIntervalHours: 720,
  reliabilityScore: 0.8,
};

export default function SourcesPage() {
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(getFirebaseDb(), "sources"),
      (snap) => {
        const rows = snap.docs.map((d) => ({ ...(d.data() as Source), id: d.id }));
        rows.sort((a, b) => a.publisher.localeCompare(b.publisher));
        setSources(rows);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  async function toggleEnabled(source: SourceRow) {
    setBusyId(source.id);
    setError(null);
    try {
      const res = await adminFetch(`/api/admin/sources/${source.id}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled: !source.enabled }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status}).`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  }

  async function submitNewSource() {
    setCreating(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/sources", {
        method: "POST",
        body: JSON.stringify({ ...form, institutionId: form.institutionId.trim() || null }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status}).`);
      }
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <header className="rounded-2xl bg-brand-navy p-5 text-white sm:p-7"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-teal-soft">Ingestion pipeline</p><h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">Source register</h1><p className="mt-2 text-sm leading-6 text-white/80">Every URL the ingestion pipeline is allowed to read.</p></header>
      <p className="rounded-xl border border-line bg-paper-raised p-4 text-sm leading-6 text-ink-soft">
        Disabling a source stops it being fetched regardless of cadence -- for one that&apos;s gone
        stale or needs re-verifying by hand.
      </p>

      {error && (
        <p className="rounded-xl border border-mark-red bg-mark-red-soft p-3 text-sm text-mark-red">
          {error}
        </p>
      )}

      <details className="rounded-2xl border border-line bg-paper-raised p-4 sm:p-5">
        <summary className="cursor-pointer font-bold text-ink">Add a source</summary>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="source-id" className="text-xs font-bold text-ink">
              Source ID
            </label>
            <input
              id="source-id"
              placeholder="id (e.g. some-university-admissions)"
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              className="min-h-11 rounded-xl border border-line bg-paper px-3.5 text-base text-ink focus:border-brand-teal focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="source-publisher" className="text-xs font-bold text-ink">
              Publisher
            </label>
            <input
              id="source-publisher"
              placeholder="publisher"
              value={form.publisher}
              onChange={(e) => setForm({ ...form, publisher: e.target.value })}
              className="min-h-11 rounded-xl border border-line bg-paper px-3.5 text-base text-ink focus:border-brand-teal focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label htmlFor="source-url" className="text-xs font-bold text-ink">
              Source URL
            </label>
            <input
              id="source-url"
              placeholder="https://..."
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="min-h-11 rounded-xl border border-line bg-paper px-3.5 text-base text-ink focus:border-brand-teal focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="source-type" className="text-xs font-bold text-ink">
              Source type
            </label>
            <select
              id="source-type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as SourceType })}
              className="min-h-11 rounded-xl border border-line bg-paper px-3.5 text-base text-ink focus:border-brand-teal focus:outline-none"
            >
              {SOURCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="source-institution" className="text-xs font-bold text-ink">
              Institution ID
            </label>
            <input
              id="source-institution"
              placeholder="institution id (e.g. ump) -- blank if not institution-specific"
              value={form.institutionId}
              onChange={(e) => setForm({ ...form, institutionId: e.target.value })}
              className="min-h-11 rounded-xl border border-line bg-paper px-3.5 text-base text-ink focus:border-brand-teal focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              id="source-robots-allowed"
              type="checkbox"
              checked={form.robotsAllowed}
              onChange={(e) => setForm({ ...form, robotsAllowed: e.target.checked })}
              className="h-4 w-4 rounded border-line text-brand-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            />
            <label htmlFor="source-robots-allowed" className="text-sm text-ink-soft">
              robots.txt allows fetching
            </label>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="source-fetch-interval" className="text-xs font-bold text-ink">
              Fetch interval (hours)
            </label>
            <input
              id="source-fetch-interval"
              type="number"
              min={1}
              value={form.fetchIntervalHours}
              onChange={(e) => setForm({ ...form, fetchIntervalHours: Number(e.target.value) })}
              className="min-h-11 w-32 rounded-xl border border-line bg-paper px-3.5 text-base text-ink focus:border-brand-teal focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="source-reliability" className="text-xs font-bold text-ink">
              Reliability (0-1)
            </label>
            <input
              id="source-reliability"
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={form.reliabilityScore}
              onChange={(e) => setForm({ ...form, reliabilityScore: Number(e.target.value) })}
              className="min-h-11 w-32 rounded-xl border border-line bg-paper px-3.5 text-base text-ink focus:border-brand-teal focus:outline-none"
            />
          </div>
        </div>
        <button
          type="button"
          disabled={creating || !form.id || !form.url || !form.publisher}
          onClick={submitNewSource}
          className="mt-4 min-h-11 rounded-xl bg-mark-green px-4 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Add source
        </button>
      </details>

      {loading && <p className="rounded-xl border border-line p-4 text-sm text-ink-soft">Loading...</p>}
      <div className="overflow-x-auto rounded-2xl border border-line bg-paper-raised">
        <table className="w-full min-w-max text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-paper">
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Publisher</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Type</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Institution</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">robots.txt</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Cadence (h)</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Reliability</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Last fetched</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Next due</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Health</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">HTTP</th>
              <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.id} className="border-b border-line last:border-0">
                <td className="px-3 py-3 text-xs">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand-teal hover:underline"
                  >
                    {source.publisher}
                  </a>
                  {source.notes && <div className="mt-0.5 text-xs text-ink-faint">{source.notes}</div>}
                </td>
                <td className="px-3 py-3 text-xs text-ink-soft">{source.type}</td>
                <td className="px-3 py-3 font-mono text-xs text-ink-soft">{source.institutionId ?? "--"}</td>
                <td className="px-3 py-3 text-xs text-ink-soft">{source.robotsAllowed ? "allowed" : "blocked"}</td>
                <td className="px-3 py-3 text-xs tabular-nums text-ink-soft">{source.fetchIntervalHours}</td>
                <td className="px-3 py-3 text-xs tabular-nums text-ink-soft">{source.reliabilityScore}</td>
                <td className="px-3 py-3 text-xs tabular-nums text-ink-soft">{source.lastFetchedAt ?? "never"}</td>
                <td className="px-3 py-3 text-xs tabular-nums text-ink-soft">{nextDue(source)}</td>
                <td className="px-3 py-3 text-xs font-semibold text-ink">
                  <span title={source.lastFetchError ?? undefined}>{healthLabel(source)}</span>
                </td>
                <td className="px-3 py-3 text-xs tabular-nums text-ink-soft">{source.lastFetchStatusCode ?? "--"}</td>
                <td className="px-3 py-3 text-xs">
                  <button
                    type="button"
                    disabled={busyId === source.id}
                    onClick={() => toggleEnabled(source)}
                    className={`min-h-8 rounded-lg px-2.5 py-1 text-xs font-bold disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                      source.enabled
                        ? "bg-mark-green-soft text-mark-green"
                        : "bg-slate-soft text-ink-faint"
                    }`}
                  >
                    {source.enabled ? "enabled" : "disabled"}
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
