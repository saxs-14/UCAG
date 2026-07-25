"use client";

import { useState } from "react";
import { INTEREST_QUIZ } from "@/config/interestQuiz";
import { recommendProgrammes } from "@/lib/recommendations";
import type { FieldTag, Programme } from "@/lib/firestore/types";
import type { MatchResult } from "@/lib/matching/types";

interface InterestQuizProps {
  entries: { programme: Programme; matchResult: MatchResult }[];
}

/**
 * "Not sure what to study?" -- re-ranks programmes the learner already
 * qualifies or almost-qualifies for by interest overlap (lib/recommendations.ts).
 * Never suggests something outside real eligibility.
 */
export function InterestQuiz({ entries }: InterestQuizProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

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
    <details className="no-print rounded border border-line bg-paper-raised p-3 text-sm">
      <summary className="cursor-pointer font-semibold text-ink">
        Not sure what to study? Take the 1-minute interest quiz
      </summary>

      {!submitted ? (
        <div className="mt-3 flex flex-col gap-4">
          {INTEREST_QUIZ.map((q) => (
            <fieldset key={q.id} className="flex flex-col gap-1.5">
              <legend className="mb-1 font-medium text-ink">{q.question}</legend>
              {q.options.map((opt, i) => (
                <label key={i} className="flex items-center gap-2 text-ink-soft">
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === i}
                    onChange={() => handleAnswer(q.id, i)}
                  />
                  {opt.label}
                </label>
              ))}
            </fieldset>
          ))}
          <button
            type="button"
            disabled={!allAnswered}
            onClick={() => setSubmitted(true)}
            className="self-start rounded bg-mark-green px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            See suggestions
          </button>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {recommendations.length === 0 ? (
            <p className="text-ink-faint">
              None of the programmes you currently qualify or almost-qualify for match these
              interests closely -- see the full results below instead.
            </p>
          ) : (
            recommendations.map(({ programme, overlapScore }) => (
              <div key={programme.id} className="rounded border border-line p-2">
                <p className="font-medium text-ink">{programme.name}</p>
                <p className="text-xs text-ink-faint">
                  {overlapScore > 0
                    ? `Matches ${overlapScore} of your interests`
                    : "Also eligible, though it didn't match your interests closely"}
                </p>
              </div>
            ))
          )}
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="self-start text-xs font-medium text-mark-green hover:underline"
          >
            Retake the quiz
          </button>
        </div>
      )}
    </details>
  );
}
