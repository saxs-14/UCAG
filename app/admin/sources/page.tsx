"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/firestoreClient";
import { adminFetch } from "@/lib/admin/apiClient";
import type { Source, SourceType } from "@/lib/firestore/types";

type SourceRow = Source & { id: string };

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
      const res = await adminFetch("/api/admin/sources", { method: "POST", body: JSON.stringify(form) });
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
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Source register</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Every URL the ingestion pipeline is allowed to read. Disabling a source stops it being
        fetched regardless of cadence -- for one that&apos;s gone stale or needs re-verifying by hand.
      </p>
      {error && (
        <p className="rounded border border-mark-red bg-mark-red-soft p-2 text-sm text-mark-red">
          {error}
        </p>
      )}

      <details className="rounded border p-3 text-sm dark:border-gray-700">
        <summary className="cursor-pointer font-medium">Add a source</summary>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            placeholder="id (e.g. some-university-admissions)"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            className="rounded border p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
          <input
            placeholder="publisher"
            value={form.publisher}
            onChange={(e) => setForm({ ...form, publisher: e.target.value })}
            className="rounded border p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
          <input
            placeholder="https://..."
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="rounded border p-2 text-sm sm:col-span-2 dark:border-gray-700 dark:bg-gray-900"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as SourceType })}
            className="rounded border p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {SOURCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.robotsAllowed}
              onChange={(e) => setForm({ ...form, robotsAllowed: e.target.checked })}
            />
            robots.txt allows fetching
          </label>
          <label className="flex items-center gap-2 text-sm">
            Fetch interval (hours)
            <input
              type="number"
              min={1}
              value={form.fetchIntervalHours}
              onChange={(e) => setForm({ ...form, fetchIntervalHours: Number(e.target.value) })}
              className="w-24 rounded border p-1 dark:border-gray-700 dark:bg-gray-900"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            Reliability (0-1)
            <input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={form.reliabilityScore}
              onChange={(e) => setForm({ ...form, reliabilityScore: Number(e.target.value) })}
              className="w-24 rounded border p-1 dark:border-gray-700 dark:bg-gray-900"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={creating || !form.id || !form.url || !form.publisher}
          onClick={submitNewSource}
          className="mt-3 rounded bg-mark-green px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          Add source
        </button>
      </details>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-left text-sm">
          <thead>
            <tr className="border-b text-xs text-gray-500 dark:border-gray-700">
              <th className="py-1 pr-3">Publisher</th>
              <th className="py-1 pr-3">Type</th>
              <th className="py-1 pr-3">robots.txt</th>
              <th className="py-1 pr-3">Cadence (h)</th>
              <th className="py-1 pr-3">Reliability</th>
              <th className="py-1 pr-3">Last fetched</th>
              <th className="py-1 pr-3">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.id} className="border-b last:border-0 dark:border-gray-800">
                <td className="py-1.5 pr-3">
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-mark-green hover:underline">
                    {source.publisher}
                  </a>
                  {source.notes && <div className="text-xs text-gray-500">{source.notes}</div>}
                </td>
                <td className="py-1.5 pr-3 text-xs">{source.type}</td>
                <td className="py-1.5 pr-3 text-xs">{source.robotsAllowed ? "allowed" : "blocked"}</td>
                <td className="py-1.5 pr-3 text-xs">{source.fetchIntervalHours}</td>
                <td className="py-1.5 pr-3 text-xs">{source.reliabilityScore}</td>
                <td className="py-1.5 pr-3 text-xs">{source.lastFetchedAt ?? "never"}</td>
                <td className="py-1.5 pr-3">
                  <button
                    type="button"
                    disabled={busyId === source.id}
                    onClick={() => toggleEnabled(source)}
                    className={`rounded px-2 py-0.5 text-xs font-medium disabled:opacity-50 ${
                      source.enabled
                        ? "bg-mark-green-soft text-mark-green"
                        : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
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
