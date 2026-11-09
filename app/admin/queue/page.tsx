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
    <div className="flex w-full flex-col gap-5">
      <header className="rounded-2xl bg-brand-navy p-5 text-white sm:p-7">
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Course approvals</h1>
        <p className="mt-2 text-sm leading-6 text-white/80">
          {items.length} pending {items.length === 1 ? "change" : "changes"} waiting for approval.
        </p>
      </header>
      {error && (
        <p className="rounded-xl border border-mark-red bg-mark-red-soft p-3 text-sm text-mark-red">
          {error}
        </p>
      )}
      {loading && <p className="rounded-xl border border-line p-4 text-sm text-ink-soft">Loading...</p>}
      {!loading && items.length === 0 && (
        <p className="rounded-xl border border-line p-4 text-sm text-ink-soft">
          Nothing pending right now.
        </p>
      )}
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-2 rounded-xl border border-line bg-paper-raised p-3 text-sm"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-mono text-xs text-ink-faint">
                {item.collection}/{item.docId} · {item.field}
              </span>
              <span className="font-mono text-xs text-ink-faint">
                confidence {(item.confidence * 100).toFixed(0)}% · {item.corroboratingSources.length}{" "}
                corroborating source{item.corroboratingSources.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <div className="text-xs font-bold text-ink-soft">Current</div>
                <pre className="overflow-x-auto rounded-xl border border-line bg-paper p-2 text-xs text-ink">
                  {formatValue(item.currentValue)}
                </pre>
              </div>
              <div>
                <div className="text-xs font-bold text-ink-soft">Proposed</div>
                <pre className="overflow-x-auto rounded-xl border border-mark-gold/30 bg-mark-gold-soft p-2 text-xs text-ink">
                  {formatValue(item.proposedValue)}
                </pre>
              </div>
            </div>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-mark-green hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Source
            </a>

            {editingId === item.id ? (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-ink" htmlFor={`edit-draft-${item.id}`}>
                  Edited value (JSON)
                </label>
                <textarea
                  id={`edit-draft-${item.id}`}
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  rows={3}
                  className="rounded-xl border border-line bg-paper px-3.5 py-2.5 text-base font-mono text-ink focus:border-brand-teal focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => submitEdit(item.id)}
                    className="min-h-11 rounded-xl bg-mark-green px-4 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    Save edited value
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold text-ink-soft hover:bg-slate-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
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
                  className="rounded-xl bg-mark-green px-2.5 py-1 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
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
                  className="rounded-xl border border-line px-2.5 py-1 text-xs font-semibold text-ink-soft hover:bg-slate-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => act(item.id, "reject")}
                  className="rounded-xl border border-mark-red px-2.5 py-1 text-xs font-semibold text-mark-red hover:bg-mark-red-soft disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
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
