"use client";

import { useState } from "react";
import { StudyMateNav } from "@/components/studymate/StudyMateNav";
import { generateLocalStudyPlan } from "@/lib/ai/studymate/studyPlan";
import type { SmartStudyPlan } from "@/lib/studymate/types";

export default function SmartStudyPlanPage() {
  const [subjectCode, setSubjectCode] = useState("MATH");
  const [startingPercent, setStartingPercent] = useState(55);
  const [targetPercent, setTargetPercent] = useState(70);
  const [plan, setPlan] = useState<SmartStudyPlan>(() =>
    generateLocalStudyPlan("MATH", 55, 70)
  );

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setPlan(generateLocalStudyPlan(subjectCode, startingPercent, targetPercent));
  };

  const toggleTask = (phaseIdx: number, taskIdx: number) => {
    const updated = { ...plan };
    const task = updated.phases[phaseIdx].tasks[taskIdx];
    task.completed = !task.completed;
    setPlan(updated);
  };

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <StudyMateNav />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6 sm:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Smart Study Plan</h1>
          <p className="text-xs text-ink-soft mt-1">
            Choose a subject and target mark improvement to generate a structured 4-week study plan.
          </p>
        </div>

        {/* Goal Selector Form */}
        <form onSubmit={handleGenerate} className="card-learner rounded-2xl p-5 flex flex-wrap items-end gap-4 text-xs">
          <div>
            <label htmlFor="plan-subject" className="block font-semibold text-ink-faint uppercase mb-1">Subject</label>
            <select
              id="plan-subject"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              className="rounded-xl border border-line p-2 text-ink bg-paper-raised"
            >
              <option value="MATH">Mathematics</option>
              <option value="PHS">Physical Sciences</option>
              <option value="ENG">English Home Language</option>
              <option value="LIFE">Life Sciences</option>
            </select>
          </div>

          <div>
            <label htmlFor="plan-start" className="block font-semibold text-ink-faint uppercase mb-1">Starting %</label>
            <input
              id="plan-start"
              type="number"
              min="0"
              max="100"
              value={startingPercent}
              onChange={(e) => setStartingPercent(Number(e.target.value))}
              className="w-20 rounded-xl border border-line p-2 font-bold text-center bg-paper-raised"
            />
          </div>

          <div>
            <label htmlFor="plan-target" className="block font-semibold text-ink-faint uppercase mb-1">Target %</label>
            <input
              id="plan-target"
              type="number"
              min="0"
              max="100"
              value={targetPercent}
              onChange={(e) => setTargetPercent(Number(e.target.value))}
              className="w-20 rounded-xl border border-line p-2 font-bold text-center text-brand-teal bg-paper-raised"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-brand-teal px-4 py-2 font-bold text-white shadow hover:opacity-90 transition"
          >
            Generate Plan →
          </button>
        </form>

        {/* Plan Header */}
        <div className="hero-atmosphere rounded-2xl p-6 text-white flex flex-wrap justify-between items-center gap-3">
          <div>
            <span className="text-xs font-bold text-teal-200 uppercase">4-Week Revision Goal</span>
            <h2 className="text-xl font-extrabold mt-1">
              Improve {plan.subjectCode} from {plan.startingPercent}% to {plan.targetPercent}%
            </h2>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-2 border border-white/20 text-center">
            <span className="text-2xl font-black">{plan.targetPercent - plan.startingPercent}%</span>
            <span className="block text-[10px] text-teal-100 uppercase">Target Gain</span>
          </div>
        </div>

        {/* Weeks Breakdown */}
        <div className="flex flex-col gap-4">
          {plan.phases.map((phase, pIdx) => (
            <div key={phase.weekNumber} className="card-learner rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="rounded-full bg-brand-teal-soft text-brand-teal border border-brand-teal/30 px-3 py-0.5 text-xs font-bold">
                  Week {phase.weekNumber}
                </span>
                <span className="text-xs font-bold text-ink">{phase.mainFocusTopic}</span>
              </div>

              <p className="text-xs text-ink-soft italic">{phase.targetOutcome}</p>

              <div className="flex flex-col gap-2">
                {phase.tasks.map((task, tIdx) => (
                  <label key={task.id} className="flex items-start gap-2.5 text-xs text-ink cursor-pointer p-2 rounded-xl hover:bg-slate-soft transition">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(pIdx, tIdx)}
                      className="mt-0.5 size-4 text-brand-teal rounded"
                    />
                    <span className={task.completed ? "line-through text-ink-faint" : "font-medium"}>
                      {task.description}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
