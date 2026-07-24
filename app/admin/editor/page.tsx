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
    <div className="flex max-w-xl flex-col gap-4">
      <h1 className="text-xl font-semibold">Content editor</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Manual override for any fact, one JSON patch at a time (a bespoke form per entity type is
        future work, not built this phase). Source URL is required on every save -- this route
        stamps it and today&apos;s date onto the document itself; it never lets you skip or
        backdate either.
      </p>
      {error && (
        <p className="rounded border border-mark-red bg-mark-red-soft p-2 text-sm text-mark-red">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded border border-mark-green bg-mark-green-soft p-2 text-sm text-mark-green">
          {success}
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        Collection
        <select
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
          className="rounded border p-2 dark:border-gray-700 dark:bg-gray-900"
        >
          {EDITABLE_FACT_COLLECTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Document ID
        <input
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
          placeholder="e.g. ump-bsc-computer-science"
          className="rounded border p-2 dark:border-gray-700 dark:bg-gray-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Patch (JSON -- only the fields you&apos;re changing)
        <textarea
          value={patchDraft}
          onChange={(e) => setPatchDraft(e.target.value)}
          rows={8}
          className="rounded border p-2 font-mono text-xs dark:border-gray-700 dark:bg-gray-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Source URL (required)
        <input
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://..."
          className="rounded border p-2 dark:border-gray-700 dark:bg-gray-900"
        />
      </label>
      <button
        type="button"
        disabled={submitting}
        onClick={submit}
        className="self-start rounded bg-mark-green px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Save
      </button>
    </div>
  );
}
