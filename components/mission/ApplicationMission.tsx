"use client";

import { useMemo } from "react";
import { CheckIcon, ICON_SIZE } from "@/components/icons/Icon";
import type { SubjectMarkInput } from "@/lib/aps/types";

interface ApplicationMissionProps {
  marks: SubjectMarkInput[];
  shortlistCount: number;
  checkedChecklistCount: number;
  signedIn: boolean;
}

interface MissionStep {
  id: string;
  label: string;
  description: string;
  completed: boolean;
}

export function ApplicationMission({
  marks,
  shortlistCount,
  checkedChecklistCount,
  signedIn,
}: ApplicationMissionProps) {
  const steps = useMemo<MissionStep[]>(() => {
    return [
      {
        id: "marks",
        label: "Enter Marks",
        description: "Add NSC subjects",
        completed: marks.length >= 7,
      },
      {
        id: "programmes",
        label: "Explore Options",
        description: "Find matched degrees",
        completed: marks.length > 0,
      },
      {
        id: "shortlist",
        label: "Build Shortlist",
        description: "Save top choices",
        completed: shortlistCount > 0,
      },
      {
        id: "documents",
        label: "Docs Ready",
        description: "ID & results sorted",
        completed: checkedChecklistCount >= 3,
      },
      {
        id: "account",
        label: "Secure Profile",
        description: "Create an account",
        completed: signedIn,
      },
    ];
  }, [marks.length, shortlistCount, checkedChecklistCount, signedIn]);

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="no-print w-full rounded-3xl border-2 border-brand-teal/20 bg-paper-raised p-6 shadow-md transition-all hover:shadow-lg sm:p-8">
      <div className="flex flex-col gap-4 border-b border-line/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-teal text-2xl text-white shadow-lg shadow-brand-teal/20">
            🚀
          </div>
          <div>
            <h3 className="font-display text-2xl font-black text-ink">Application Mission</h3>
            <p className="text-sm font-medium text-ink-soft">Your journey from NSC marks to final submission.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <span className="font-display text-3xl font-black text-brand-teal">{progressPercent}%</span>
          <div className="h-3 w-40 overflow-hidden rounded-full bg-slate-100 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-teal to-teal-500 transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-5">
        {steps.map((step, i) => (
          <div
            key={step.id}
            className={`flex flex-col gap-2 rounded-2xl p-4 border-2 transition-all duration-300 ${
              step.completed
                ? "border-brand-teal bg-brand-teal/5 text-ink shadow-sm -translate-y-1"
                : "border-line/60 bg-paper text-ink-soft"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider ${step.completed ? "bg-brand-teal/20 text-brand-teal" : "bg-slate-100 text-ink-faint"}`}>
                Phase {i + 1}
              </span>
              {step.completed ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-teal text-white shadow-sm">
                  <CheckIcon size={ICON_SIZE.sm} />
                </div>
              ) : (
                <span className="h-3 w-3 rounded-full bg-slate-200" />
              )}
            </div>
            <span className={`mt-1 text-sm font-bold ${step.completed ? "text-ink" : "text-ink-soft"}`}>{step.label}</span>
            <span className="text-xs font-medium leading-relaxed opacity-80">{step.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}