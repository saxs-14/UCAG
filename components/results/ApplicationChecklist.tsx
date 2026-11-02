"use client";

import { APPLICATION_CHECKLIST_ITEMS } from "@/config/applicationDocuments";
import { CheckIcon, ICON_SIZE } from "@/components/icons/Icon";
import { useState } from "react";

interface ApplicationChecklistProps {
  checked: ReadonlySet<string>;
  onToggle: (id: string) => void;
  signedIn: boolean;
}

export function ApplicationChecklist({ checked, onToggle, signedIn }: ApplicationChecklistProps) {
  const documents = APPLICATION_CHECKLIST_ITEMS.filter((item) => item.category === "documents");
  const timeline = APPLICATION_CHECKLIST_ITEMS.filter((item) => item.category === "timeline");
  const checkedCount = APPLICATION_CHECKLIST_ITEMS.filter((item) => checked.has(item.id)).length;
  const progressPercent = Math.round((checkedCount / APPLICATION_CHECKLIST_ITEMS.length) * 100);
  
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="no-print overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition-all hover:shadow-md">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between bg-gradient-to-r from-slate-50 to-white p-6 focus:outline-none focus:ring-4 focus:ring-brand-teal/20"
      >
        <div className="flex items-center gap-4 text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-teal/10 text-2xl shadow-sm">
            📝
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-ink">Prepare to apply</h3>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-sm font-medium text-ink-soft">
                {checkedCount} of {APPLICATION_CHECKLIST_ITEMS.length} tasks ready
              </span>
              <div className="hidden h-2 w-24 overflow-hidden rounded-full bg-slate-200 sm:block">
                <div className="h-full bg-brand-teal transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm transition-transform duration-300 border border-line/50 ${expanded ? "rotate-180 bg-brand-teal/5 text-brand-teal" : ""}`}>
          ▼
        </div>
      </button>

      {expanded && (
        <div className="border-t border-line/60 bg-paper-raised p-6 pt-5">
          <div className="mb-5 flex items-start gap-3 rounded-2xl bg-brand-teal/5 p-4 border border-brand-teal/10">
            <span className="text-xl">💡</span>
            <p className="text-xs font-medium leading-relaxed text-ink-soft">
              This is general guidance to get you started! Always confirm exact requirements on the institution&apos;s official website.
              {signedIn ? " (Saved to your account automatically.)" : " (Progress is saved on this device only.)"}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-brand-teal">
                <span>📁</span> Documents
              </legend>
              {documents.map((item) => {
                const isChecked = checked.has(item.id);
                return (
                  <label key={item.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${isChecked ? "border-brand-teal/40 bg-brand-teal/5 shadow-sm" : "border-line/60 bg-white hover:border-brand-teal/30"}`}>
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors ${isChecked ? "bg-brand-teal text-white" : "border-2 border-line/80"}`}>
                      {isChecked && <CheckIcon size={ICON_SIZE.sm} />}
                    </div>
                    <input type="checkbox" id={item.id} name={item.id} checked={isChecked} onChange={() => onToggle(item.id)} className="sr-only" />
                    <span className={`text-sm font-medium leading-tight ${isChecked ? "text-ink" : "text-ink-soft"}`}>{item.label}</span>
                  </label>
                );
              })}
            </fieldset>

            <fieldset className="flex flex-col gap-3">
              <legend className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-brand-coral">
                <span>⏳</span> Timeline
              </legend>
              {timeline.map((item) => {
                const isChecked = checked.has(item.id);
                return (
                  <label key={item.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${isChecked ? "border-brand-coral/40 bg-brand-coral/5 shadow-sm" : "border-line/60 bg-white hover:border-brand-coral/30"}`}>
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors ${isChecked ? "bg-brand-coral text-white" : "border-2 border-line/80"}`}>
                      {isChecked && <CheckIcon size={ICON_SIZE.sm} />}
                    </div>
                    <input type="checkbox" id={item.id} name={item.id} checked={isChecked} onChange={() => onToggle(item.id)} className="sr-only" />
                    <span className={`text-sm font-medium leading-tight ${isChecked ? "text-ink" : "text-ink-soft"}`}>{item.label}</span>
                  </label>
                );
              })}
            </fieldset>
          </div>
        </div>
      )}
    </div>
  );
}