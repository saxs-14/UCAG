"use client";

import { useState } from "react";
import { INTEREST_QUIZ } from "@/config/interestQuiz";
import { recommendProgrammes } from "@/lib/recommendations";
import type { FieldTag, Programme } from "@/lib/firestore/types";
import type { MatchResult } from "@/lib/matching/types";

interface InterestQuizProps {
  entries: { programme: Programme; matchResult: MatchResult }[];
}

export function InterestQuiz({ entries }: InterestQuizProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const allAnswered = INTEREST_QUIZ.every((q) => answers[q.id] !== undefined);

  function handleAnswer(questionId: string, optionIndex: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  const interestTags: FieldTag[] = INTEREST_QUIZ.flatMap((q) => {
    const idx = answers[q.id];
    return idx !== undefined ? INTEREST_QUIZ.find((qq) => qq.id === q.id)!.options[idx]!.tags : [];
  });

  const recommendations = submitted ? recommendProgrammes(entries, interestTags) : [];

  return (
    <div className="no-print overflow-hidden rounded-3xl border border-brand-teal/20 bg-gradient-to-br from-brand-teal/5 to-white shadow-sm transition-all">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-6 focus:outline-none"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal/10 text-2xl">
            🎯
          </div>
          <div className="text-left">
            <h3 className="font-display text-lg font-black text-ink">Not sure what to study?</h3>
            <p className="text-sm font-medium text-ink-soft">Take the 1-minute interest quiz</p>
          </div>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-paper-raised text-ink shadow-sm transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
          ▼
        </div>
      </button>

      {expanded && (
        <div className="border-t border-line/50 p-6 pt-2">
          {!submitted ? (
            <div className="mt-4 flex flex-col gap-6">
              {INTEREST_QUIZ.map((q) => (
                <fieldset key={q.id} className="flex flex-col gap-3 rounded-2xl bg-paper-raised p-5 border border-line/60 shadow-sm">
                  <legend className="font-bold text-ink text-base">{q.question}</legend>
                  <div className="mt-2 flex flex-col gap-2">
                    {q.options.map((opt, i) => (
                      <label key={i} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm font-medium transition-colors ${answers[q.id] === i ? "border-brand-teal bg-brand-teal/5 text-brand-teal" : "border-line/60 hover:border-brand-teal/30"}`}>
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers[q.id] === i}
                          onChange={() => handleAnswer(q.id, i)}
                          className="h-4 w-4 text-brand-teal focus:ring-brand-teal"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
              <button
                type="button"
                disabled={!allAnswered}
                onClick={() => setSubmitted(true)}
                className="mt-2 inline-flex h-14 items-center justify-center rounded-xl bg-brand-teal px-8 text-base font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                See My Suggestions ✨
              </button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-lg font-bold text-ink">Your Top Matches</h4>
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setAnswers({}); }}
                  className="text-xs font-bold text-brand-teal transition-colors hover:text-teal-600 hover:underline"
                >
                  Retake Quiz
                </button>
              </div>

              {recommendations.length === 0 ? (
                <div className="rounded-2xl border border-line/60 bg-paper-raised p-6 text-center shadow-sm">
                  <span className="text-3xl mb-2">🤔</span>
                  <p className="font-medium text-ink-soft">
                    None of the programmes you qualify for perfectly match these specific interests. Check the full list below instead!
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {recommendations.map(({ programme, overlapScore }) => (
                    <div key={programme.id} className="rounded-2xl border border-brand-teal/30 bg-paper-raised p-4 shadow-sm transition-transform hover:-translate-y-0.5">
                      <p className="font-bold text-ink">{programme.name}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-bold text-brand-teal">
                        <span>⭐</span>
                        {overlapScore > 0 ? `${overlapScore} matching interests` : "Eligible alternative"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}