"use client";

import { useState } from "react";
import { adminFetch } from "@/lib/admin/apiClient";
import { EDITABLE_FACT_COLLECTIONS } from "@/lib/admin/allowlist";

export default function ContentEditorPage() {
  const [collectionName, setCollectionName] = useState<string>(EDITABLE_FACT_COLLECTIONS[0]);
  const [docId, setDocId] = useState("");
  const [patchDraft, setPatchDraft] = useState("{\n  \n}");
  const [sourceUrl, setSourceUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setSuccess(null);

    let patch: Record<string, unknown>;
    try {
      patch = JSON.parse(patchDraft);
    } catch {
      setError('Patch must be valid JSON, e.g. { "name": "New name" }.');
      return;
    }
    if (!docId.trim()) {
      setError("Document ID is required.");
      return;
    }
    if (!sourceUrl.trim()) {
      setError("Source URL is required -- every fact needs one (CLAUDE.md).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminFetch("/api/admin/content", {
        method: "POST",
        body: JSON.stringify({ collection: collectionName, docId, patch, sourceUrl }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status}).`);
      setSuccess(`Saved ${collectionName}/${docId}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <header className="rounded-2xl bg-brand-navy p-5 text-white sm:p-7"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-teal-soft">Manual override</p><h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">Content editor</h1><p className="mt-2 text-sm leading-6 text-white/80">Patch any fact directly, one JSON edit at a time.</p></header>
      <p className="rounded-xl border border-line bg-paper-raised p-4 text-sm leading-6 text-ink-soft">
        Manual override for any fact, one JSON patch at a time (a bespoke form per entity type is
        future work, not built this phase). Source URL is required on every save -- this route
        stamps it and today&apos;s date onto the document itself; it never lets you skip or
        backdate either.
      </p>
      {error && (
        <p className="rounded-xl border border-mark-red bg-mark-red-soft p-3 text-sm text-mark-red">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl border border-mark-green bg-mark-green-soft p-3 text-sm text-mark-green">
          {success}
        </p>
      )}

      <div className="flex max-w-xl flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-xs font-bold text-ink">Collection</span>
          <select
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            className="min-h-11 rounded-xl border border-line bg-paper px-3.5 text-base text-ink focus:border-brand-teal focus:outline-none"
          >
            {EDITABLE_FACT_COLLECTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-xs font-bold text-ink">Document ID</span>
          <input
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
            placeholder="e.g. ump-bsc-computer-science"
            className="min-h-11 rounded-xl border border-line bg-paper px-3.5 text-base text-ink focus:border-brand-teal focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-xs font-bold text-ink">Patch (JSON -- only the fields you&apos;re changing)</span>
          <textarea
            value={patchDraft}
            onChange={(e) => setPatchDraft(e.target.value)}
            rows={8}
            className="rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono text-base text-ink focus:border-brand-teal focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-xs font-bold text-ink">Source URL (required)</span>
          <input
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://..."
            className="min-h-11 rounded-xl border border-line bg-paper px-3.5 text-base text-ink focus:border-brand-teal focus:outline-none"
          />
        </label>
        <button
          type="button"
          disabled={submitting}
          onClick={submit}
          className="self-start min-h-11 rounded-xl bg-mark-green px-4 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Save
        </button>
      </div>
    </div>
  );
}
