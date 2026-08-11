"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StudyMateNav } from "@/components/studymate/StudyMateNav";
import { loadStudyProfile } from "@/lib/studymate/storage";
import { generateLocalDiagnosis } from "@/lib/ai/studymate/studyDiagnosis";
import type { StudentStudyProfile, StudyDiagnosisResult } from "@/lib/studymate/types";

export default function StudyMateDashboardPage() {
  const [profile, setProfile] = useState<StudentStudyProfile | null>(null);
  const [diagnosis, setDiagnosis] = useState<StudyDiagnosisResult | null>(null);
  const [tasks, setTasks] = useState<Array<{ id: string; text: string; done: boolean }>>([
    { id: "t1", text: "Mathematics Algebra Expressions Practice", done: false },
    { id: "t2", text: "Physical Sciences Mechanics Theory Review", done: true },
    { id: "t3", text: "English Essay Structure Practice", done: false },
  ]);

  useEffect(() => {
    const loaded = loadStudyProfile();
    setProfile(loaded);
    setDiagnosis(generateLocalDiagnosis(loaded));
  }, []);

  if (!profile) return null;

  const currentAvg = Math.round(
    profile.subjects.reduce((sum, s) => sum + s.currentPercent, 0) / (profile.subjects.length || 1)
  );

  const targetAvg = Math.round(
    profile.subjects.reduce((sum, s) => sum + s.targetPercent, 0) / (profile.subjects.length || 1)
  );

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <StudyMateNav />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">
        {/* Welcome Hero */}
        <div className="hero-atmosphere rounded-3xl p-6 sm:p-8 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-teal-100">
                StudyMate AI Companion
              </span>
              <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl tracking-tight">
                Welcome back 👋
              </h1>
              <p className="mt-1 text-sm text-teal-100/90">
                {profile.grade} Student Progress & Study Overview
              </p>
            </div>
            <Link
              href="/studymate/profile"
              className="rounded-xl bg-brand-teal px-4 py-2 text-xs font-bold text-white shadow hover:opacity-90 transition"
            >
              ⚙️ Edit Study Profile
            </Link>
          </div>

          {/* Average progress bar */}
          <div className="mt-6 rounded-2xl bg-white/10 p-5 backdrop-blur-sm border border-white/10">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span>Current Average: <strong className="text-white text-sm">{currentAvg}%</strong></span>
              <span>Target Average: <strong className="text-teal-200 text-sm">{targetAvg}%</strong></span>
            </div>
            <div className="h-3 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-300 to-mark-green transition-all duration-500"
                style={{ width: `${Math.min(currentAvg, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* AI Diagnosis Callout */}
        {diagnosis && (
          <section aria-labelledby="ai-diagnosis-heading" className="card-learner rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl" aria-hidden>🤖</span>
              <h2 id="ai-diagnosis-heading" className="text-base font-bold text-ink">
                AI Academic Diagnosis
              </h2>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed mb-4">
              {diagnosis.overallSummary}
            </p>
            <div className="rounded-xl bg-mark-gold-soft p-4 border border-mark-gold/30">
              <p className="text-xs font-bold text-mark-gold mb-1">💡 Recommended Focus Areas:</p>
              <ul className="flex flex-col gap-1 text-xs text-ink-soft">
                {diagnosis.recommendedFocusTopics.map((rec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-mark-gold font-bold">›</span>
                    <span><strong>{rec.subjectCode}</strong>: {rec.topic} ({rec.reason})</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-3 text-[11px] text-ink-faint italic">{diagnosis.disclaimer}</p>
          </section>
        )}

        {/* Subjects Needing Attention */}
        <section aria-labelledby="subjects-heading">
          <h2 id="subjects-heading" className="text-lg font-bold tracking-tight text-ink mb-3">
            Subjects & Progress
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {profile.subjects.map((sub) => {
              const statusColor =
                sub.currentPercent < 55
                  ? "bg-mark-red/10 text-mark-red border-mark-red/30"
                  : sub.currentPercent < 65
                  ? "bg-brand-amber/10 text-brand-amber border-brand-amber/30"
                  : "bg-mark-green/10 text-mark-green border-mark-green/30";

              const dotColor =
                sub.currentPercent < 55
                  ? "bg-mark-red"
                  : sub.currentPercent < 65
                  ? "bg-brand-amber"
                  : "bg-mark-green";

              return (
                <div key={sub.code} className="card-learner rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className={`size-2.5 rounded-full ${dotColor}`} />
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusColor}`}>
                      {sub.currentPercent}% (Target: {sub.targetPercent}%)
                    </span>
                  </div>
                  <p className="font-bold text-sm text-ink">{sub.name}</p>
                  <div className="h-1.5 w-full rounded-full bg-slate-soft overflow-hidden mt-1">
                    <div
                      className={`h-full ${dotColor}`}
                      style={{ width: `${Math.min(sub.currentPercent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Split Section: Upcoming & Today's Tasks */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Assessments */}
          <section aria-labelledby="assessments-heading" className="card-learner rounded-2xl p-5">
            <h2 id="assessments-heading" className="text-base font-bold text-ink mb-3">
              📅 Upcoming Tests & Exams
            </h2>
            {profile.upcomingAssessments.length === 0 ? (
              <p className="text-xs text-ink-faint">No upcoming assessments added yet.</p>
            ) : (
              <ul className="flex flex-col gap-2.5 text-xs">
                {profile.upcomingAssessments.map((a) => (
                  <li key={a.id} className="rounded-xl border border-line p-3 flex flex-col gap-1 bg-paper-raised">
                    <div className="flex justify-between font-bold text-ink">
                      <span>{a.title}</span>
                      <span className="text-brand-teal font-mono">{a.date}</span>
                    </div>
                    <p className="text-ink-soft">Subject: {a.subjectCode} · Topics: {a.topics.join(", ")}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Today's Tasks */}
          <section aria-labelledby="tasks-heading" className="card-learner rounded-2xl p-5">
            <h2 id="tasks-heading" className="text-base font-bold text-ink mb-3">
              ✅ Today&apos;s Study Tasks
            </h2>
            <ul className="flex flex-col gap-2 text-xs">
              {tasks.map((task) => (
                <label key={task.id} className="flex items-center gap-2 cursor-pointer text-ink p-2 rounded-lg hover:bg-slate-soft transition">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task.id)}
                    className="size-4 text-brand-teal rounded"
                  />
                  <span className={task.done ? "line-through text-ink-faint" : "font-medium"}>
                    {task.text}
                  </span>
                </label>
              ))}
            </ul>
          </section>
        </div>

        {/* Quick Launch Tools */}
        <section aria-labelledby="tools-heading">
          <h2 id="tools-heading" className="text-base font-bold text-ink mb-3">
            ⚡ StudyMate AI Tools
          </h2>
          <div className="grid gap-3 sm:grid-cols-4 text-xs">
            <Link href="/studymate/tutor" className="card-learner rounded-xl p-4 flex flex-col gap-1 hover:-translate-y-0.5 transition">
              <span className="text-2xl mb-1">🤖</span>
              <p className="font-bold text-ink">AI Tutor</p>
              <p className="text-ink-soft">Step-by-step problem solver.</p>
            </Link>
            <Link href="/studymate/quiz" className="card-learner rounded-xl p-4 flex flex-col gap-1 hover:-translate-y-0.5 transition">
              <span className="text-2xl mb-1">⚡</span>
              <p className="font-bold text-ink">Quiz Generator</p>
              <p className="text-ink-soft">Test your knowledge fast.</p>
            </Link>
            <Link href="/studymate/timetable" className="card-learner rounded-xl p-4 flex flex-col gap-1 hover:-translate-y-0.5 transition">
              <span className="text-2xl mb-1">📅</span>
              <p className="font-bold text-ink">Study Timetable</p>
              <p className="text-ink-soft">Weekly scheduled revision.</p>
            </Link>
            <Link href="/studymate/mock-exam" className="card-learner rounded-xl p-4 flex flex-col gap-1 hover:-translate-y-0.5 transition">
              <span className="text-2xl mb-1">📝</span>
              <p className="font-bold text-ink">Mock Exams</p>
              <p className="text-ink-soft">150-mark full test simulator.</p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
