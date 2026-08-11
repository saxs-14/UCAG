"use client";

import { useState } from "react";
import Link from "next/link";
import { validateDocumentFile, evaluateDocumentCompleteness } from "@/lib/ai/documentAssistant";
import type { DocumentFileMeta } from "@/lib/ai/documentAssistant";

export default function DocumentAssistantPage() {
  const [files, setFiles] = useState<DocumentFileMeta[]>([]);

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const added = Array.from(e.target.files).map((f) => {
      const val = validateDocumentFile(f);
      return {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: f.name,
        category: val.category,
        sizeBytes: f.size,
        mimeType: f.type,
        isValidType: val.isValidType,
        isValidSize: val.isValidSize,
      };
    });
    setFiles((prev) => [...prev, ...added]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const evalResult = evaluateDocumentCompleteness(files);

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6 sm:p-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-faint">
          <Link href="/ump" className="hover:text-brand-teal hover:underline">UMP Hub</Link>
          <span>›</span>
          <span className="text-ink-soft font-medium">Document Assistant</span>
        </nav>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Application Document Assistant</h1>
          <p className="text-xs text-ink-soft mt-1">
            Check your application document completeness before submitting to UMP or other SA universities.
          </p>
        </div>

        {/* POPIA Privacy Shield Callout */}
        <div className="rounded-2xl border border-mark-green/30 bg-mark-green-soft p-4 text-xs text-ink-soft flex items-center gap-3">
          <span className="text-2xl" aria-hidden>🔒</span>
          <div>
            <p className="font-bold text-mark-green">POPIA Compliant Privacy Guarantee</p>
            <p className="text-[11px] leading-relaxed">
              Your files are verified in your browser only — zero identity documents or personal data are uploaded or stored on external servers.
            </p>
          </div>
        </div>

        {/* Completeness Summary Banner */}
        <div className="card-learner rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wide text-ink-faint">Required Documents Status</span>
            <h2 className="text-xl font-extrabold text-ink mt-0.5">
              {evalResult.totalUploaded} of {evalResult.totalRequired} Core Documents Ready
            </h2>
            {evalResult.isComplete ? (
              <p className="text-xs font-bold text-mark-green mt-1">✅ All required application documents verified!</p>
            ) : (
              <p className="text-xs font-bold text-mark-red mt-1">⚠️ Missing: {evalResult.missingCategories.join(", ")}</p>
            )}
          </div>

          <div className="flex gap-2 text-xs">
            <span className={`px-3 py-1.5 rounded-xl border font-bold ${evalResult.hasId ? "bg-mark-green-soft text-mark-green border-mark-green/30" : "bg-slate-soft text-ink-faint border-line"}`}>
              {evalResult.hasId ? "✓ ID Document" : "✕ ID Missing"}
            </span>
            <span className={`px-3 py-1.5 rounded-xl border font-bold ${evalResult.hasResults ? "bg-mark-green-soft text-mark-green border-mark-green/30" : "bg-slate-soft text-ink-faint border-line"}`}>
              {evalResult.hasResults ? "✓ Results" : "✕ Results Missing"}
            </span>
            <span className={`px-3 py-1.5 rounded-xl border font-bold ${evalResult.hasProofOfAddress ? "bg-mark-green-soft text-mark-green border-mark-green/30" : "bg-slate-soft text-ink-faint border-line"}`}>
              {evalResult.hasProofOfAddress ? "✓ Proof of Address" : "✕ Address Missing"}
            </span>
          </div>
        </div>

        {/* Upload Interface */}
        <div className="card-learner rounded-2xl p-6 flex flex-col gap-4 text-xs">
          <h3 className="font-bold text-ink text-sm">Add Application Files to Check</h3>
          <label className="border-2 border-dashed border-line rounded-2xl p-8 text-center cursor-pointer hover:bg-slate-soft transition flex flex-col items-center gap-2">
            <span className="text-3xl">📄</span>
            <span className="font-bold text-brand-teal text-sm">Click to select files</span>
            <span className="text-[11px] text-ink-faint">Supports PDF, JPEG, PNG (Max 5MB per file)</span>
            <input type="file" multiple accept=".pdf,.jpeg,.jpg,.png" onChange={handleFileAdd} className="hidden" />
          </label>

          {/* Uploaded File Listing */}
          {files.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              <h4 className="font-bold text-ink text-xs uppercase tracking-wide">Checked Documents ({files.length})</h4>
              {files.map((f) => (
                <div key={f.id} className="rounded-xl border border-line p-3 bg-paper-raised flex items-center justify-between">
                  <div>
                    <span className="font-bold text-ink">{f.name}</span>
                    <span className="block text-[10px] text-ink-faint">Category: {f.category} · {(f.sizeBytes / 1024).toFixed(0)} KB</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {!f.isValidType && <span className="text-mark-red font-bold text-[10px]">Invalid Type</span>}
                    {!f.isValidSize && <span className="text-mark-red font-bold text-[10px]">Exceeds 5MB</span>}
                    {f.isValidType && f.isValidSize && <span className="text-mark-green font-bold text-[10px]">✅ Verified</span>}
                    <button type="button" onClick={() => removeFile(f.id)} className="text-ink-faint hover:text-mark-red text-sm font-bold">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
