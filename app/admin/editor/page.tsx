"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/firestoreClient";
import { adminFetch } from "@/lib/admin/apiClient";
import { EDITABLE_FACT_COLLECTIONS, getEditableFactFields, type EditableFactCollection } from "@/lib/admin/allowlist";

type DocRecord = Record<string, unknown> & { id: string };

// A short, human label per collection for the record picker -- the
// alternative is making the admin recognise a raw Firestore document ID,
// which is exactly the "collection / document ID" friction this editor
// used to require.
function displayLabel(collectionName: EditableFactCollection, doc: DocRecord): string {
  switch (collectionName) {
    case "institutions":
    case "subjects":
    case "bursaries":
      return String(doc.name ?? doc.id);
    case "internships":
      return String(doc.title ?? doc.id);
    case "faculties":
    case "schools":
      return `${String(doc.name ?? doc.id)} (${String(doc.institutionId ?? doc.facultyId ?? "")})`;
    case "programmes":
      return `${String(doc.name ?? doc.id)} -- ${String(doc.institutionId ?? "")}`;
    case "apsRules":
      return `${String(doc.institutionId ?? doc.id)} -- ${String(doc.scaleName ?? "")}`;
    case "applicationWindows":
      return `${String(doc.institutionId ?? "")} / ${doc.programmeId ? String(doc.programmeId) : "institution-wide"}`;
    case "statistics":
      return `${String(doc.dataset ?? "")} -- ${String(doc.dimension ?? "")}: ${String(doc.metric ?? doc.id)}`;
    default:
      return doc.id;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Every field renders as a plain input matched to its current value's own
// type -- a short list of strings becomes a comma-separated text field, a
// number stays a number input, a boolean a checkbox. Only a field that's
// itself an array of objects (apsRules.bands, programmes.subjectRequirements,
// etc.) falls back to a JSON box, and even then it's pre-filled with the
// record's real current value, never a blank "write this from scratch."
type FieldKind = "string" | "number" | "boolean" | "stringList" | "json";

function kindOf(value: unknown): FieldKind {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (Array.isArray(value)) {
    return value.every((v) => typeof v === "string" || typeof v === "number") ? "stringList" : "json";
  }
  if (isPlainObject(value)) return "json";
  return "string";
}

function toFormText(kind: FieldKind, value: unknown): string {
  if (value === undefined || value === null) return "";
  if (kind === "stringList" && Array.isArray(value)) return value.join(", ");
  if (kind === "json") return JSON.stringify(value, null, 2);
  return String(value);
}

function parseFormValue(kind: FieldKind, text: string): unknown {
  if (kind === "number") return text.trim() === "" ? null : Number(text);
  if (kind === "stringList") {
    return text.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  }
  if (kind === "json") return JSON.parse(text);
  return text;
}

export default function ContentEditorPage() {
  const [collectionName, setCollectionName] = useState<EditableFactCollection>(EDITABLE_FACT_COLLECTIONS[0]);
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [fieldText, setFieldText] = useState<Record<string, string>>({});
  const [sourceUrl, setSourceUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLoadingDocs(true);
    setSelectedId("");
    const unsubscribe = onSnapshot(
      collection(getFirebaseDb(), collectionName),
      (snap) => {
        const rows = snap.docs.map((d) => ({ ...(d.data() as Record<string, unknown>), id: d.id }));
        rows.sort((a, b) => displayLabel(collectionName, a).localeCompare(displayLabel(collectionName, b)));
        setDocs(rows);
        setLoadingDocs(false);
      },
      (err) => {
        setError(err.message);
        setLoadingDocs(false);
      }
    );
    return unsubscribe;
  }, [collectionName]);

  const selectedDoc = useMemo(() => docs.find((d) => d.id === selectedId) ?? null, [docs, selectedId]);
  const fields = getEditableFactFields(collectionName);

  function selectDoc(id: string) {
    setSelectedId(id);
    setSuccess(null);
    setError(null);
    const doc = docs.find((d) => d.id === id);
    if (!doc) {
      setFieldText({});
      setSourceUrl("");
      return;
    }
    const nextText: Record<string, string> = {};
    for (const field of fields) nextText[field] = toFormText(kindOf(doc[field]), doc[field]);
    setFieldText(nextText);
    // Pre-filled with the record's own existing source, so updating it is
    // "confirm or correct this," not "find and type a URL from nothing."
    setSourceUrl(typeof doc.sourceUrl === "string" ? doc.sourceUrl : "");
  }

  async function submit() {
    if (!selectedDoc) return;
    setError(null);
    setSuccess(null);

    const patch: Record<string, unknown> = {};
    try {
      for (const field of fields) {
        const kind = kindOf(selectedDoc[field]);
        const parsed = parseFormValue(kind, fieldText[field] ?? "");
        const original = toFormText(kind, selectedDoc[field]);
        if ((fieldText[field] ?? "") !== original) patch[field] = parsed;
      }
    } catch {
      setError("One of the fields isn't valid -- check it and try again.");
      return;
    }

    if (Object.keys(patch).length === 0) {
      setError("Nothing was changed.");
      return;
    }
    if (!sourceUrl.trim()) {
      setError("A source link is required for every change.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminFetch("/api/admin/content", {
        method: "POST",
        body: JSON.stringify({ collection: collectionName, docId: selectedDoc.id, patch, sourceUrl }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status}).`);
      setSuccess(`Saved ${displayLabel(collectionName, selectedDoc)}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <header className="rounded-2xl bg-brand-navy p-5 text-white sm:p-7">
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Course editor</h1>
        <p className="mt-2 text-sm leading-6 text-white/80">Pick a record, change what needs changing, save.</p>
      </header>

      {error && (
        <p className="rounded-xl border border-mark-red bg-mark-red-soft p-3 text-sm text-mark-red">{error}</p>
      )}
      {success && (
        <p className="rounded-xl border border-mark-green bg-mark-green-soft p-3 text-sm text-mark-green">{success}</p>
      )}

      <div className="flex max-w-xl flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-xs font-bold text-ink">What are you editing?</span>
          <select
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value as EditableFactCollection)}
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
          <span className="text-xs font-bold text-ink">Record</span>
          <select
            value={selectedId}
            onChange={(e) => selectDoc(e.target.value)}
            disabled={loadingDocs}
            className="min-h-11 rounded-xl border border-line bg-paper px-3.5 text-base text-ink focus:border-brand-teal focus:outline-none disabled:opacity-50"
          >
            <option value="">{loadingDocs ? "Loading..." : "Choose one..."}</option>
            {docs.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {displayLabel(collectionName, doc)}
              </option>
            ))}
          </select>
        </label>

        {selectedDoc && (
          <>
            {fields.map((field) => {
              const kind = kindOf(selectedDoc[field]);
              if (kind === "boolean") {
                return (
                  <div key={field} className="flex items-center gap-2">
                    <input
                      id={`field-${field}`}
                      type="checkbox"
                      checked={fieldText[field] === "true"}
                      onChange={(e) => setFieldText({ ...fieldText, [field]: String(e.target.checked) })}
                      className="h-4 w-4 rounded border-line text-brand-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    />
                    <label htmlFor={`field-${field}`} className="text-sm font-bold text-ink">
                      {field}
                    </label>
                  </div>
                );
              }
              if (kind === "json") {
                return (
                  <label key={field} className="flex flex-col gap-1.5 text-sm">
                    <span className="text-xs font-bold text-ink">{field} (structured -- edit carefully)</span>
                    <textarea
                      value={fieldText[field] ?? ""}
                      onChange={(e) => setFieldText({ ...fieldText, [field]: e.target.value })}
                      rows={6}
                      className="rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono text-sm text-ink focus:border-brand-teal focus:outline-none"
                    />
                  </label>
                );
              }
              return (
                <label key={field} className="flex flex-col gap-1.5 text-sm">
                  <span className="text-xs font-bold text-ink">
                    {field}
                    {kind === "stringList" && <span className="ml-1 font-normal text-ink-faint">(comma-separated)</span>}
                  </span>
                  <input
                    type={kind === "number" ? "number" : "text"}
                    value={fieldText[field] ?? ""}
                    onChange={(e) => setFieldText({ ...fieldText, [field]: e.target.value })}
                    className="min-h-11 rounded-xl border border-line bg-paper px-3.5 text-base text-ink focus:border-brand-teal focus:outline-none"
                  />
                </label>
              );
            })}

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-xs font-bold text-ink">Where did this come from?</span>
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
              {submitting ? "Saving..." : "Save"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
