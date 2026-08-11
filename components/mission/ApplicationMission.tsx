"use client";

import { useMemo } from "react";
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
        description: "NSC subjects and percentages captured",
        completed: marks.length >= 7,
      },
      {
        id: "programmes",
        label: "Explore Programmes",
        description: "Qualified and near-miss options matched",
        completed: marks.length > 0,
      },
      {
        id: "shortlist",
        label: "Shortlist Options",
        description: "Save top programme choices",
        completed: shortlistCount > 0,
      },
      {
        id: "documents",
        label: "Prepare Documents",
        description: "ID, results, and proof of residence ready",
        completed: checkedChecklistCount >= 3,
      },
      {
        id: "account",
        label: "Save & Lock Profile",
        description: "Sign in to keep profile and track deadlines",
        completed: signedIn,
      },
    ];
  }, [marks.length, shortlistCount, checkedChecklistCount, signedIn]);

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="no-print w-full rounded-lg border border-line bg-paper-raised p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div>
          <h3 className="font-display text-base font-bold text-ink">
            Application Mission
          </h3>
          <p className="text-xs text-ink-faint">
            Step-by-step milestone checklist from NSC marks to university submission.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-ink">{progressPercent}%</span>
          <div className="h-2 w-20 overflow-hidden rounded-full bg-paper-overlay">
            <div
              className="h-full bg-mark-green transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-5">
        {steps.map((step, i) => (
          <div
            key={step.id}
            className={`flex flex-col gap-1 rounded-md p-2.5 border transition ${
              step.completed
                ? "border-mark-green/40 bg-mark-green-soft/40 text-ink"
                : "border-line bg-paper text-ink-faint"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xs font-bold text-ink-faint">STEP 0{i + 1}</span>
              {step.completed ? (
                <span className="font-bold text-mark-green">&check;</span>
              ) : (
                <span className="h-2 w-2 rounded-full bg-line" />
              )}
            </div>
            <span className="font-semibold text-xs text-ink">{step.label}</span>
            <span className="text-2xs text-ink-faint leading-tight">{step.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
