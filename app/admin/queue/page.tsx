"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/firestoreClient";
import { adminFetch } from "@/lib/admin/apiClient";
import type { VerificationQueueItem } from "@/lib/firestore/types";

type QueueRow = VerificationQueueItem & { id: string };

function formatValue(value: unknown): string {
  if (value === undefined) return "(none)";
  return JSON.stringify(value, null, 2);
}

export default function QueuePage() {
  const [items, setItems] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  useEffect(() => {
    const q = query(collection(getFirebaseDb(), "verificationQueue"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ ...(d.data() as VerificationQueueItem), id: d.id }));
        rows.sort((a, b) => a.extractedAt.localeCompare(b.extractedAt));
        setItems(rows);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  async function act(id: string, action: "approve" | "reject" | "edit", editedValue?: unknown) {
    setBusyId(id);
    setError(null);
    try {
      const res = await adminFetch(`/api/admin/queue/${id}`, {
        method: "POST",
        body: JSON.stringify(action === "edit" ? { action, editedValue } : { action }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status}).`);
      }
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  }

  function submitEdit(id: string) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(editDraft);
    } catch {
      setError("Edited value must be valid JSON (e.g. a quoted string, a number, or an array).");
      return;
    }
    void act(id, "edit", parsed);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Verification queue</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Every proposed change waits here until a human approves, edits, or rejects it -- nothing
        below has been auto-published. {items.length} pending.
      </p>
      {error && (
        <p className="rounded border border-mark-red bg-mark-red-soft p-2 text-sm text-mark-red">
          {error}
        </p>
      )}
      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {!loading && items.length === 0 && (
        <p className="text-sm text-gray-500">
          Nothing pending. Queue items appear here once a live ingestion run proposes a change
          with confidence or corroboration below the auto-publish threshold (see
          lib/ingestion/route.ts routeProposal).
        </p>
      )}
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-2 rounded border p-3 text-sm dark:border-gray-700">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-mono text-xs text-gray-500">
                {item.collection}/{item.docId} · {item.field}
              </span>
              <span className="text-xs text-gray-500">
                confidence {(item.confidence * 100).toFixed(0)}% · {item.corroboratingSources.length}{" "}
                corroborating source{item.corroboratingSources.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <div className="text-xs font-medium text-gray-500">Current</div>
                <pre className="overflow-x-auto rounded bg-gray-50 p-2 text-xs dark:bg-gray-900">
                  {formatValue(item.currentValue)}
                </pre>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500">Proposed</div>
                <pre className="overflow-x-auto rounded bg-mark-gold-soft p-2 text-xs">
                  {formatValue(item.proposedValue)}
                </pre>
              </div>
            </div>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-mark-green hover:underline"
            >
              Source
            </a>

            {editingId === item.id ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  rows={3}
                  className="rounded border p-2 font-mono text-xs dark:border-gray-700 dark:bg-gray-900"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => submitEdit(item.id)}
                    className="rounded bg-mark-green px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                  >
                    Save edited value
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded border px-3 py-1 text-xs dark:border-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => act(item.id, "approve")}
                  className="rounded bg-mark-green px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => {
                    setEditingId(item.id);
                    setEditDraft(formatValue(item.proposedValue));
                  }}
                  className="rounded border px-3 py-1 text-xs dark:border-gray-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => act(item.id, "reject")}
                  className="rounded border border-mark-red px-3 py-1 text-xs text-mark-red disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
