"use client";

import { useState, useEffect } from "react";
import { StudyMateNav } from "@/components/studymate/StudyMateNav";
import { generateLocalMockExam } from "@/lib/ai/studymate/mockExamGenerator";
import { saveMockExamAttempt } from "@/lib/studymate/storage";
import type { MockExam, MockExamAttempt } from "@/lib/studymate/types";

export default function MockExamPage() {
  const [subjectCode, setSubjectCode] = useState("MATH");
  const [exam, setExam] = useState<MockExam | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(180 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [submittedAttempt, setSubmittedAttempt] = useState<MockExamAttempt | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (timerActive && secondsRemaining > 0) {
      interval = setInterval(() => setSecondsRemaining((prev) => Math.max(prev - 1, 0)), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, secondsRemaining]);

  const handleStartExam = () => {
    const generated = generateLocalMockExam(subjectCode);
    setExam(generated);
    setStudentAnswers({});
    setSecondsRemaining(generated.durationMinutes * 60);
    setTimerActive(true);
    setSubmittedAttempt(null);
  };

  const handleAnswerChange = (qId: string, text: string) => {
    setStudentAnswers((prev) => ({ ...prev, [qId]: text }));
  };

  const handleSubmitExam = () => {
    if (!exam) return;
    setTimerActive(false);

    // Calculate score based on completed answers length vs total marks
    let totalScore = 0;
    const strongAreas: string[] = [];
    const weakAreas: string[] = [];

    exam.sections.forEach((sec) => {
      let secAnsweredCount = 0;
      sec.questions.forEach((q) => {
        const ans = studentAnswers[q.id]?.trim();
        if (ans && ans.length > 5) {
          secAnsweredCount += q.marks * 0.7; // Simulating self-grading ratio for text answers
        }
      });

      totalScore += Math.round(secAnsweredCount);
      if (secAnsweredCount > sec.totalMarks * 0.6) {
        strongAreas.push(sec.title);
      } else {
        weakAreas.push(sec.title);
      }
    });

    const percentage = Math.round((totalScore / exam.totalMarks) * 100);

    const attempt: MockExamAttempt = {
      id: `mock-attempt-${Date.now()}`,
      examId: exam.id,
      score: totalScore,
      totalMarks: exam.totalMarks,
      percentage,
      strongAreas: strongAreas.length > 0 ? strongAreas : ["General Concept Awareness"],
      weakAreas: weakAreas.length > 0 ? weakAreas : ["Speed & Calculation Depth"],
      revisionRecommendations: [
        "Review model solutions for Section B Geometry questions.",
        "Practice 3D Trigonometry elevation problems under timed conditions.",
      ],
      completedAt: new Date().toISOString(),
    };

    saveMockExamAttempt(attempt);
    setSubmittedAttempt(attempt);
  };

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <StudyMateNav />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6 sm:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">AI Mock Exam Simulator</h1>
          <p className="text-xs text-ink-soft mt-1">
            Simulate a full 3-hour / 150-mark matric examination paper under timed exam conditions.
          </p>
        </div>

        {/* Start Launcher */}
        {!exam && (
          <div className="card-learner rounded-2xl p-6 flex flex-col gap-4 text-xs">
            <h2 className="text-base font-bold text-ink">Select Examination Paper</h2>
            <div className="flex items-center gap-3">
              <label htmlFor="mock-subject" className="font-semibold text-ink-faint uppercase">Subject:</label>
              <select
                id="mock-subject"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="rounded-xl border border-line p-2 text-ink bg-paper-raised"
              >
                <option value="MATH">Mathematics (Paper 1 & 2)</option>
                <option value="PHS">Physical Sciences</option>
                <option value="ENG">English Home Language</option>
              </select>
            </div>

            <div className="rounded-xl bg-slate-soft p-4 text-ink-soft leading-relaxed">
              <p className="font-bold text-ink mb-1">📝 Exam Rules & Structure:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Duration: 180 Minutes (3 Hours).</li>
                <li>Total Marks: 150 Marks.</li>
                <li>Includes detailed memorandum key for self-assessment.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={handleStartExam}
              className="rounded-xl bg-brand-teal p-3 font-bold text-white shadow hover:opacity-90 transition text-sm"
            >
              Start Full Mock Exam ⏱️
            </button>
          </div>
        )}

        {/* Active Exam Interface */}
        {exam && !submittedAttempt && (
          <div className="flex flex-col gap-6">
            {/* Exam Header Bar */}
            <div className="sticky top-0 z-30 card-learner rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div>
                <h2 className="font-bold text-ink text-sm">{exam.title}</h2>
                <span className="text-xs text-ink-faint">{exam.totalMarks} Marks · {exam.durationMinutes} Mins</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="font-mono text-sm font-black text-brand-coral bg-brand-coral/10 border border-brand-coral/30 px-3 py-1 rounded-xl">
                  ⏱️ {formatTimer(secondsRemaining)}
                </div>
                <button
                  type="button"
                  onClick={handleSubmitExam}
                  className="rounded-xl bg-mark-green px-4 py-2 text-xs font-bold text-white shadow hover:opacity-90"
                >
                  Submit Exam →
                </button>
              </div>
            </div>

            {/* Exam Paper Instructions */}
            <div className="rounded-2xl border border-line bg-paper-raised p-5 text-xs text-ink-soft">
              <h3 className="font-bold text-ink uppercase tracking-wide mb-2">Instructions to Candidates:</h3>
              <ol className="list-decimal list-inside space-y-1">
                {exam.instructions.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ol>
            </div>

            {/* Questions by Section */}
            {exam.sections.map((section, sIdx) => (
              <div key={sIdx} className="card-learner rounded-2xl p-6 flex flex-col gap-5">
                <h3 className="text-base font-extrabold text-brand-teal border-b border-line pb-2">
                  {section.title} ({section.totalMarks} Marks)
                </h3>

                {section.questions.map((q) => (
                  <div key={q.id} className="flex flex-col gap-2.5 border-b border-line/40 pb-4 last:border-0 text-xs">
                    <div className="flex justify-between font-bold text-ink">
                      <span>{q.questionNumber}</span>
                      <span className="font-mono text-ink-faint">[{q.marks} Marks]</span>
                    </div>

                    <p className="whitespace-pre-wrap font-medium text-ink leading-relaxed bg-slate-soft/50 p-3 rounded-xl">
                      {q.text}
                    </p>

                    <textarea
                      rows={4}
                      placeholder="Write your answer and working here..."
                      value={studentAnswers[q.id] ?? ""}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="w-full rounded-xl border border-line p-3 text-xs bg-paper-raised text-ink font-mono"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Exam Memorandum & Results */}
        {submittedAttempt && exam && (
          <div className="card-learner rounded-2xl p-6 flex flex-col gap-6 animate-rise-in">
            <div className="flex flex-wrap items-center justify-between border-b border-line pb-4">
              <div>
                <span className="text-xs font-bold text-mark-green uppercase">Exam Submitted!</span>
                <h2 className="text-xl font-bold text-ink">Assessment Memorandum & Analysis</h2>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-brand-teal">{submittedAttempt.percentage}%</span>
                <span className="block text-xs text-ink-faint">{submittedAttempt.score} / {submittedAttempt.totalMarks} Marks</span>
              </div>
            </div>

            {/* Memorandum Key */}
            <div className="flex flex-col gap-4 text-xs">
              <h3 className="font-bold text-ink text-sm">Official Model Answer Memorandum:</h3>
              {exam.sections.map((sec, sIdx) => (
                <div key={sIdx} className="flex flex-col gap-3">
                  <h4 className="font-bold text-brand-teal">{sec.title}</h4>
                  {sec.questions.map((q) => (
                    <div key={q.id} className="rounded-xl border border-line p-4 bg-paper-raised flex flex-col gap-2">
                      <p className="font-bold text-ink">{q.questionNumber} [{q.marks} Marks]</p>
                      <p className="text-ink-soft">Your answer: <span className="font-mono text-ink">{studentAnswers[q.id] || "(no response)"}</span></p>
                      <p className="font-semibold text-mark-green bg-mark-green-soft p-2.5 rounded-lg border border-mark-green/30 font-mono">
                        Model Solution: {q.modelAnswer}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => { setExam(null); setSubmittedAttempt(null); }}
              className="self-start rounded-xl bg-brand-teal px-4 py-2 text-xs font-bold text-white shadow hover:opacity-90"
            >
              Start New Mock Exam →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
