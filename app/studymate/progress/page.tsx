"use client";

import { useEffect, useState } from "react";
import { StudyMateNav } from "@/components/studymate/StudyMateNav";
import { loadStudyProfile, loadQuizAttempts, loadMockExamAttempts } from "@/lib/studymate/storage";
import type { StudentStudyProfile, QuizAttempt, MockExamAttempt } from "@/lib/studymate/types";

export default function StudyMateProgressPage() {
  const [profile, setProfile] = useState<StudentStudyProfile | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [mockAttempts, setMockAttempts] = useState<MockExamAttempt[]>([]);

  useEffect(() => {
    setProfile(loadStudyProfile());
    setQuizAttempts(loadQuizAttempts());
    setMockAttempts(loadMockExamAttempts());
  }, []);

  if (!profile) return null;

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <StudyMateNav />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Academic Progress & Analytics</h1>
          <p className="text-xs text-ink-soft mt-1">
            Track mark improvements over time, review quiz scores, and target identified weak areas.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card-learner rounded-2xl p-5 flex flex-col justify-between">
            <span className="text-xs font-bold text-ink-faint uppercase">Quizzes Completed</span>
            <span className="text-3xl font-black text-brand-teal mt-2">{quizAttempts.length}</span>
            <span className="text-[10px] text-ink-soft mt-1">Total completed interactive quizzes</span>
          </div>

          <div className="card-learner rounded-2xl p-5 flex flex-col justify-between">
            <span className="text-xs font-bold text-ink-faint uppercase">Mock Exams Completed</span>
            <span className="text-3xl font-black text-brand-violet mt-2">{mockAttempts.length}</span>
            <span className="text-[10px] text-ink-soft mt-1">Full 150-mark exam simulations</span>
          </div>

          <div className="card-learner rounded-2xl p-5 flex flex-col justify-between">
            <span className="text-xs font-bold text-ink-faint uppercase">Weak Subjects Identified</span>
            <span className="text-3xl font-black text-mark-red mt-2">
              {profile.subjects.filter((s) => s.isWeakArea || s.currentPercent < 55).length}
            </span>
            <span className="text-[10px] text-ink-soft mt-1">Requires dedicated timetable sessions</span>
          </div>
        </div>

        {/* Subject Progress Bars */}
        <section aria-labelledby="progress-bars-heading" className="card-learner rounded-2xl p-6">
          <h2 id="progress-bars-heading" className="text-base font-bold text-ink mb-4">
            Subject Mark Trajectories
          </h2>
          <div className="flex flex-col gap-5 text-xs">
            {profile.subjects.map((sub) => {
              const diff = sub.targetPercent - sub.currentPercent;
              return (
                <div key={sub.code} className="flex flex-col gap-1.5">
                  <div className="flex justify-between font-bold text-ink">
                    <span>{sub.name} ({sub.code})</span>
                    <span>{sub.currentPercent}% → <strong className="text-brand-teal">{sub.targetPercent}%</strong> (+{diff}%)</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-soft overflow-hidden relative">
                    <div
                      className="h-full bg-brand-teal transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(sub.currentPercent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Quiz History */}
        <section aria-labelledby="history-heading" className="card-learner rounded-2xl p-6">
          <h2 id="history-heading" className="text-base font-bold text-ink mb-4">
            Recent Assessment History
          </h2>

          {quizAttempts.length === 0 && mockAttempts.length === 0 ? (
            <p className="text-xs text-ink-faint">No quiz or exam history recorded yet. Complete a quiz to view your score history.</p>
          ) : (
            <div className="flex flex-col gap-3 text-xs">
              {quizAttempts.map((attempt) => (
                <div key={attempt.id} className="rounded-xl border border-line p-3 bg-paper-raised flex items-center justify-between">
                  <div>
                    <span className="font-bold text-ink">{attempt.subjectCode} Practice Quiz</span>
                    <span className="block text-[10px] text-ink-faint">{attempt.completedAt.split("T")[0]}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-brand-teal">{attempt.percentage}%</span>
                    <span className="block text-[10px] text-ink-soft">{attempt.score}/{attempt.total} Correct</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
