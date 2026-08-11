"use client";

import { useEffect, useState } from "react";
import { StudyMateNav } from "@/components/studymate/StudyMateNav";
import { loadStudyProfile } from "@/lib/studymate/storage";
import { generateLocalTimetable } from "@/lib/ai/studymate/studyTimetable";
import type { WeeklyStudyTimetable, TimetableSlot } from "@/lib/studymate/types";

const DAYS: TimetableSlot["day"][] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function StudyMateTimetablePage() {
  const [timetable, setTimetable] = useState<WeeklyStudyTimetable | null>(null);

  useEffect(() => {
    const profile = loadStudyProfile();
    setTimetable(generateLocalTimetable(profile));
  }, []);

  if (!timetable) return null;

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <StudyMateNav />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">Personalised Study Timetable</h1>
            <p className="text-xs text-ink-soft mt-1">
              Weekly schedule based on your available study time ({timetable.totalWeeklyHours} hrs/week) and weak subjects.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTimetable(generateLocalTimetable(loadStudyProfile()))}
            className="rounded-xl border border-line bg-paper-raised px-4 py-2 text-xs font-bold text-ink hover:bg-slate-soft transition"
          >
            🔄 Regenerate Timetable
          </button>
        </div>

        {/* Timetable Tips */}
        <div className="rounded-2xl border border-brand-teal/30 bg-brand-teal/5 p-4 text-xs text-ink-soft">
          <p className="font-bold text-brand-teal mb-1">💡 Timetable Tips:</p>
          <ul className="flex flex-col gap-1">
            {timetable.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="text-brand-teal">›</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Weekly Grid */}
        <div className="grid gap-4 md:grid-cols-7">
          {DAYS.map((day) => {
            const daySlots = timetable.slots.filter((s) => s.day === day);
            return (
              <div key={day} className="card-learner rounded-2xl p-4 flex flex-col gap-2">
                <h2 className="text-xs font-extrabold uppercase tracking-wide text-brand-teal border-b border-line pb-1.5">
                  {day}
                </h2>
                {daySlots.length === 0 ? (
                  <p className="text-[11px] text-ink-faint">Rest day</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {daySlots.map((slot) => {
                      const isBreak = slot.activityType === "break";
                      return (
                        <div
                          key={slot.id}
                          className={`rounded-xl border p-2.5 text-[11px] flex flex-col gap-0.5 ${
                            isBreak
                              ? "bg-slate-soft border-line text-ink-faint"
                              : "bg-paper-raised border-line text-ink shadow-xs"
                          }`}
                        >
                          <span className="font-mono text-[10px] text-ink-faint">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <p className="font-bold leading-tight">{slot.subjectCode}: {slot.topic}</p>
                          <span className="text-[9px] uppercase font-semibold text-brand-teal mt-0.5">
                            {slot.activityType}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
