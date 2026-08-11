"use client";

import { useState } from "react";
import { StudyMateNav } from "@/components/studymate/StudyMateNav";
import { generateLocalQuiz } from "@/lib/ai/studymate/quizGenerator";
import { saveQuizAttempt } from "@/lib/studymate/storage";
import type { Quiz, QuizAttempt } from "@/lib/studymate/types";

export default function StudyMateQuizPage() {
  const [subjectCode, setSubjectCode] = useState("MATH");
  const [topic, setTopic] = useState("Algebra");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedAttempt, setSubmittedAttempt] = useState<QuizAttempt | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const generated = generateLocalQuiz(subjectCode, topic, difficulty);
    setQuiz(generated);
    setAnswers({});
    setSubmittedAttempt(null);
  };

  const handleSelectOption = (qId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz) return;

    let score = 0;
    const topicsToRevise: string[] = [];

    quiz.questions.forEach((q) => {
      const chosen = answers[q.id]?.trim().toLowerCase();
      const correct = q.correctAnswer.trim().toLowerCase();
      if (chosen === correct) {
        score++;
      } else {
        topicsToRevise.push(quiz.topic);
      }
    });

    const percentage = Math.round((score / quiz.questions.length) * 100);

    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      quizId: quiz.id,
      subjectCode: quiz.subjectCode,
      score,
      total: quiz.questions.length,
      percentage,
      answers,
      topicsToRevise: Array.from(new Set(topicsToRevise)),
      completedAt: new Date().toISOString(),
    };

    saveQuizAttempt(attempt);
    setSubmittedAttempt(attempt);
  };

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <StudyMateNav />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 sm:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">AI Quiz Generator</h1>
          <p className="text-xs text-ink-soft mt-1">
            Generate custom multiple-choice and short-answer quizzes to test your understanding.
          </p>
        </div>

        {/* Generator Form */}
        <form onSubmit={handleGenerate} className="card-learner rounded-2xl p-5 flex flex-wrap items-end gap-4 text-xs">
          <div>
            <label htmlFor="quiz-subject" className="block font-semibold text-ink-faint uppercase mb-1">Subject</label>
            <select
              id="quiz-subject"
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
            <label htmlFor="quiz-topic" className="block font-semibold text-ink-faint uppercase mb-1">Topic</label>
            <input
              id="quiz-topic"
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="rounded-xl border border-line p-2 text-ink bg-paper-raised"
            />
          </div>

          <div>
            <label htmlFor="quiz-diff" className="block font-semibold text-ink-faint uppercase mb-1">Difficulty</label>
            <select
              id="quiz-diff"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
              className="rounded-xl border border-line p-2 text-ink bg-paper-raised"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-brand-teal px-4 py-2 font-bold text-white shadow hover:opacity-90 transition"
          >
            Generate Quiz ⚡
          </button>
        </form>

        {/* Active Quiz Runner */}
        {quiz && !submittedAttempt && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="hero-atmosphere rounded-2xl p-5 text-white flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-teal-200 uppercase">{quiz.subjectCode} · {quiz.difficulty}</span>
                <h2 className="text-lg font-bold">{quiz.title}</h2>
              </div>
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">{quiz.questions.length} Questions</span>
            </div>

            <div className="flex flex-col gap-5">
              {quiz.questions.map((q, idx) => (
                <div key={q.id} className="card-learner rounded-2xl p-5 flex flex-col gap-3">
                  <p className="font-bold text-sm text-ink">
                    {idx + 1}. {q.question}
                  </p>

                  {q.type === "multiple-choice" || q.type === "true-false" ? (
                    <div className="flex flex-col gap-2 text-xs">
                      {q.options?.map((opt) => (
                        <label
                          key={opt}
                          className={`flex items-center gap-2.5 rounded-xl border p-3 cursor-pointer transition ${
                            answers[q.id] === opt
                              ? "border-brand-teal bg-brand-teal-soft font-bold text-brand-teal"
                              : "border-line bg-paper-raised hover:bg-slate-soft text-ink"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() => handleSelectOption(q.id, opt)}
                            className="size-4 text-brand-teal"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Type your answer..."
                      value={answers[q.id] ?? ""}
                      onChange={(e) => handleSelectOption(q.id, e.target.value)}
                      className="w-full rounded-xl border border-line p-3 text-xs bg-paper-raised text-ink font-medium"
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-mark-green p-3 text-xs font-bold text-white shadow hover:opacity-90 transition"
            >
              Submit Quiz Answers →
            </button>
          </form>
        )}

        {/* Results Screen */}
        {submittedAttempt && quiz && (
          <div className="card-learner rounded-2xl p-6 flex flex-col gap-6 animate-rise-in">
            <div className="flex flex-wrap items-center justify-between border-b border-line pb-4">
              <div>
                <span className="text-xs font-bold text-mark-green uppercase">Quiz Completed!</span>
                <h2 className="text-xl font-bold text-ink">Your Result</h2>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-brand-teal">{submittedAttempt.percentage}%</span>
                <span className="block text-xs text-ink-faint">{submittedAttempt.score} / {submittedAttempt.total} Correct</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <h3 className="font-bold text-ink text-sm">Question Breakdown & Explanations:</h3>
              {quiz.questions.map((q, idx) => {
                const userAns = submittedAttempt.answers[q.id];
                const isCorrect = userAns?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

                return (
                  <div key={q.id} className={`rounded-xl border p-4 flex flex-col gap-2 ${isCorrect ? "bg-mark-green-soft border-mark-green/30" : "bg-mark-red-soft border-mark-red/30"}`}>
                    <div className="flex justify-between font-bold">
                      <span>{idx + 1}. {q.question}</span>
                      <span>{isCorrect ? "✅ Correct" : "❌ Incorrect"}</span>
                    </div>
                    <p className="text-ink-soft">Your answer: <strong>{userAns ?? "(none)"}</strong></p>
                    {!isCorrect && <p className="text-ink font-semibold">Correct answer: <strong>{q.correctAnswer}</strong></p>}
                    <p className="text-ink-faint italic border-t border-line/40 pt-2">💡 Explanation: {q.explanation}</p>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => { setQuiz(null); setSubmittedAttempt(null); }}
              className="self-start rounded-xl bg-brand-teal px-4 py-2 text-xs font-bold text-white shadow hover:opacity-90"
            >
              Take Another Quiz →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
