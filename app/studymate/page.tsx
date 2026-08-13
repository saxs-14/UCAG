// cSpell:words VarsityPath StudyMate
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StudyMateNav } from "@/components/studymate/StudyMateNav";
import { loadStudyProfile } from "@/lib/studymate/storage";
import { generateLocalDiagnosis } from "@/lib/ai/studymate/studyDiagnosis";
import type { StudentStudyProfile, StudyDiagnosisResult } from "@/lib/studymate/types";

// ── Onboarding screen shown to brand-new users ────────────────────────────────
function VarsityPathOnboarding() {
  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <StudyMateNav />

      {/* Hero */}
      <div
        className="w-full py-20 px-6 text-white text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0b192c 0%, #0f2d4a 55%, #0d9488 100%)",
        }}
      >
        {/* Subtle geometric accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #0d9488 0px, transparent 50%), radial-gradient(circle at 80% 20%, #14b8a6 0px, transparent 40%)",
          }}
        />

        <div className="relative mx-auto max-w-2xl flex flex-col items-center gap-5">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-teal-200 backdrop-blur-sm">
            🚀 VarsityPath AI
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl leading-tight">
            Your Personal<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #5eead4, #34d399)" }}>
              Academic Coach
            </span>
          </h1>
          <p className="max-w-lg text-sm sm:text-base text-slate-300 leading-relaxed">
            AI-powered study planning, smart quizzes, timetables and mock exams — built for Grade 10–12 learners and first-year UMP students.
          </p>
          <Link
            href="/studymate/profile"
            className="mt-2 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-extrabold shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0"
            style={{ background: "linear-gradient(135deg, #0d9488, #14b8a6)", color: "white" }}
          >
            Set Up My Study Profile →
          </Link>
          <p className="text-xs text-slate-400">Free · No account required · Takes 2 minutes</p>
        </div>
      </div>

      {/* Feature grid */}
      <div className="mx-auto w-full max-w-5xl grid gap-5 p-6 sm:p-10 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: "🤖",
            title: "AI Tutor",
            desc: "Get step-by-step explanations for any Maths, Science or English problem.",
            href: "/studymate/tutor",
          },
          {
            icon: "⚡",
            title: "Smart Quizzes",
            desc: "AI-generated topic quizzes that adapt to your weak areas instantly.",
            href: "/studymate/quiz",
          },
          {
            icon: "📅",
            title: "Study Timetable",
            desc: "Auto-built weekly revision timetable based on your subjects and goals.",
            href: "/studymate/timetable",
          },
          {
            icon: "📝",
            title: "Mock Exams",
            desc: "Full 150-mark exam simulations with model answers and mark schemes.",
            href: "/studymate/mock-exam",
          },
        ].map((f) => (
          <Link
            key={f.href}
            href="/studymate/profile"
            className="card-learner group flex flex-col gap-3 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="text-3xl" aria-hidden>{f.icon}</span>
            <p className="font-bold text-ink group-hover:text-brand-teal transition-colors">{f.title}</p>
            <p className="text-xs text-ink-soft leading-relaxed">{f.desc}</p>
            <span className="mt-auto text-xs font-bold text-brand-teal">Get started →</span>
          </Link>
        ))}
      </div>
    </main>
  );
}

// ── Dashboard shown to users who have a saved profile ────────────────────────
interface DashboardProps {
  profile: StudentStudyProfile;
}

function VarsityPathDashboard({ profile }: DashboardProps) {
  const [diagnosis, setDiagnosis] = useState<StudyDiagnosisResult | null>(null);
  const [tasks, setTasks] = useState([
    { id: "t1", text: "Review your weakest subject today", done: false },
    { id: "t2", text: "Complete one quiz in a strong subject", done: false },
    { id: "t3", text: "Update any upcoming assessment dates", done: false },
  ]);

  useEffect(() => {
    setDiagnosis(generateLocalDiagnosis(profile));
  }, [profile]);

  const currentAvg = Math.round(
    profile.subjects.reduce((sum, s) => sum + s.currentPercent, 0) / (profile.subjects.length || 1)
  );
  const targetAvg = Math.round(
    profile.subjects.reduce((sum, s) => sum + s.targetPercent, 0) / (profile.subjects.length || 1)
  );

  const toggleTask = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <StudyMateNav />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">

        {/* ── Welcome Hero ── */}
        <div
          className="rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0b192c 0%, #0f2d4a 55%, #0d9488 100%)" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 10% 80%, #14b8a6 0px, transparent 40%), radial-gradient(circle at 90% 10%, #0d9488 0px, transparent 40%)",
            }}
          />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-white/15 border border-white/20 px-3 py-1 text-xs font-bold text-teal-200 backdrop-blur-sm">
                🎓 VarsityPath AI Companion
              </span>
              <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl tracking-tight">
                Welcome back 👋
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                {profile.grade} · {profile.subjects.length} subjects tracked
              </p>
            </div>
            <Link
              href="/studymate/profile"
              className="rounded-xl bg-white/15 border border-white/25 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm hover:bg-white/25 transition"
            >
              ⚙️ Edit Profile
            </Link>
          </div>

          {/* Average progress */}
          <div className="relative mt-6 rounded-2xl bg-white/10 border border-white/10 p-5 backdrop-blur-sm">
            <div className="flex justify-between text-xs font-semibold mb-2.5">
              <span>Current Average: <strong className="text-lg text-white">{currentAvg}%</strong></span>
              <span>Target: <strong className="text-lg text-teal-300">{targetAvg}%</strong></span>
            </div>
            <div className="h-3 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(currentAvg, 100)}%`,
                  background: "linear-gradient(90deg, #5eead4, #34d399)",
                }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              {targetAvg - currentAvg > 0
                ? `${targetAvg - currentAvg}% improvement needed across all subjects`
                : "You're meeting your targets! 🎉"}
            </p>
          </div>
        </div>

        {/* ── AI Diagnosis ── */}
        {diagnosis && (
          <section aria-labelledby="ai-diagnosis-heading" className="card-learner rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-brand-teal/10 text-xl">🤖</div>
              <div>
                <h2 id="ai-diagnosis-heading" className="text-sm font-bold text-ink">AI Academic Diagnosis</h2>
                <p className="text-[10px] text-ink-faint">Based on your current subject marks</p>
              </div>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed mb-4">{diagnosis.overallSummary}</p>
            <div className="rounded-xl bg-mark-gold-soft border border-mark-gold/25 p-4">
              <p className="text-xs font-bold text-mark-gold mb-2">💡 Priority Focus Areas</p>
              <ul className="flex flex-col gap-1.5 text-xs text-ink-soft">
                {diagnosis.recommendedFocusTopics.map((rec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-mark-gold font-bold mt-0.5">›</span>
                    <span><strong>{rec.subjectCode}</strong>: {rec.topic} — {rec.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-3 text-[11px] text-ink-faint italic">{diagnosis.disclaimer}</p>
          </section>
        )}

        {/* ── Subject Cards ── */}
        <section aria-labelledby="subjects-heading">
          <h2 id="subjects-heading" className="text-lg font-bold tracking-tight text-ink mb-3">
            Subjects & Progress
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {profile.subjects.map((sub) => {
              const pct = sub.currentPercent;
              const isWeak = pct < 55;
              const isMid = pct >= 55 && pct < 65;
              const color = isWeak ? "#dc2626" : isMid ? "#d97706" : "#059669";
              const bg = isWeak ? "#fef2f2" : isMid ? "#fffbeb" : "#ecfdf5";
              const border = isWeak ? "#fca5a5" : isMid ? "#fcd34d" : "#6ee7b7";

              return (
                <div key={sub.code} className="card-learner rounded-2xl p-4 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: color }}
                    />
                    <span
                      className="rounded-full border px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: bg, borderColor: border, color }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-ink leading-snug">{sub.name}</p>
                    <p className="text-[10px] text-ink-faint">Target: {sub.targetPercent}%</p>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-soft overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(pct, 100)}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Upcoming & Tasks ── */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Upcoming assessments */}
          <section aria-labelledby="assessments-heading" className="card-learner rounded-2xl p-5">
            <h2 id="assessments-heading" className="text-sm font-bold text-ink mb-3 flex items-center gap-1.5">
              <span>📅</span> Upcoming Tests & Exams
            </h2>
            {profile.upcomingAssessments.length === 0 ? (
              <div className="rounded-xl bg-slate-soft p-4 text-center">
                <p className="text-xs text-ink-faint">No upcoming assessments added yet.</p>
                <Link href="/studymate/profile" className="mt-2 inline-block text-xs font-bold text-brand-teal hover:underline">
                  Add in Profile →
                </Link>
              </div>
            ) : (
              <ul className="flex flex-col gap-2.5 text-xs">
                {profile.upcomingAssessments.map((a) => (
                  <li key={a.id} className="rounded-xl border border-line p-3 flex flex-col gap-1 bg-paper-raised">
                    <div className="flex justify-between font-bold text-ink">
                      <span>{a.title}</span>
                      <span className="text-brand-teal font-mono">{a.date}</span>
                    </div>
                    <p className="text-ink-faint">{a.subjectCode} · {a.topics.join(", ")}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Today's tasks */}
          <section aria-labelledby="tasks-heading" className="card-learner rounded-2xl p-5">
            <h2 id="tasks-heading" className="text-sm font-bold text-ink mb-3 flex items-center gap-1.5">
              <span>✅</span> Today&apos;s Study Tasks
            </h2>
            <ul className="flex flex-col gap-1.5 text-xs">
              {tasks.map((task) => (
                <label
                  key={task.id}
                  className="flex items-center gap-2.5 cursor-pointer rounded-xl p-2.5 hover:bg-slate-soft transition"
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task.id)}
                    className="size-4 rounded accent-brand-teal"
                  />
                  <span className={task.done ? "line-through text-ink-faint" : "font-medium text-ink"}>
                    {task.text}
                  </span>
                </label>
              ))}
            </ul>
          </section>
        </div>

        {/* ── Quick Launch Tools ── */}
        <section aria-labelledby="tools-heading">
          <h2 id="tools-heading" className="text-sm font-bold text-ink mb-3">⚡ AI Tools</h2>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { href: "/studymate/tutor", icon: "🤖", label: "AI Tutor", sub: "Step-by-step solver" },
              { href: "/studymate/quiz", icon: "⚡", label: "Quiz", sub: "Test your knowledge" },
              { href: "/studymate/timetable", icon: "📅", label: "Timetable", sub: "Weekly schedule" },
              { href: "/studymate/mock-exam", icon: "📝", label: "Mock Exam", sub: "Full 150-mark test" },
            ].map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="card-learner group flex flex-col gap-1.5 rounded-xl p-4 text-xs transition hover:-translate-y-0.5"
              >
                <span className="text-2xl">{t.icon}</span>
                <p className="font-bold text-ink group-hover:text-brand-teal transition-colors">{t.label}</p>
                <p className="text-ink-faint">{t.sub}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

// ── Root page component ────────────────────────────────────────────────────────
export default function StudyMateDashboardPage() {
  const [profile, setProfile] = useState<StudentStudyProfile | null | undefined>(undefined);

  useEffect(() => {
    setProfile(loadStudyProfile());
  }, []);

  // undefined = still hydrating (avoid flash)
  if (profile === undefined) return null;
  if (profile === null) return <VarsityPathOnboarding />;
  return <VarsityPathDashboard profile={profile} />;
}
