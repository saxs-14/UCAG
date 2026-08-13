"use client";

import { useEffect, useState } from "react";
import { StudyMateNav } from "@/components/studymate/StudyMateNav";
import { loadStudyProfile, saveStudyProfile } from "@/lib/studymate/storage";
import type { StudentStudyProfile, StudyGrade, StudyStyle } from "@/lib/studymate/types";

const GRADES: StudyGrade[] = ["Grade 10", "Grade 11", "Grade 12", "1st Year UMP", "2nd Year UMP", "3rd Year UMP"];
const STYLES: { value: StudyStyle; label: string }[] = [
  { value: "visual", label: "Visual (Diagrams & Charts)" },
  { value: "auditory", label: "Auditory (Listening & Discussion)" },
  { value: "reading", label: "Reading / Writing Notes" },
  { value: "practice", label: "Practice Problems & Past Papers" },
  { value: "group", label: "Group Study" },
];

const BLANK_PROFILE: StudentStudyProfile = {
  grade: "Grade 12",
  subjects: [],
  availableHoursPerWeek: 10,
  preferredStyle: "practice",
  upcomingAssessments: [],
  updatedAt: new Date().toISOString(),
};

export default function StudyMateProfilePage() {
  const [profile, setProfile] = useState<StudentStudyProfile | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    const loaded = loadStudyProfile();
    setProfile(loaded ?? { ...BLANK_PROFILE, updatedAt: new Date().toISOString() });
  }, []);

  if (!profile) return null;

  const handleSubjectChange = (index: number, field: "currentPercent" | "targetPercent", val: number) => {
    const updated = [...profile.subjects];
    updated[index] = { ...updated[index], [field]: val };
    setProfile({ ...profile, subjects: updated });
  };

  const toggleWeakArea = (index: number) => {
    const updated = [...profile.subjects];
    updated[index] = { ...updated[index], isWeakArea: !updated[index].isWeakArea };
    setProfile({ ...profile, subjects: updated });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStudyProfile({ ...profile, updatedAt: new Date().toISOString() });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <StudyMateNav />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 sm:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Study Profile Setup</h1>
          <p className="text-xs text-ink-soft mt-1">
            Personalise your study plan, AI diagnosis, and timetable recommendations.
          </p>
        </div>

        {savedMessage && (
          <div className="rounded-xl bg-mark-green-soft p-4 text-xs font-bold text-mark-green border border-mark-green/30">
            ✅ Study profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* Grade & Hours */}
          <div className="card-learner rounded-2xl p-5 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-ink">Academic Level & Time</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="grade-select" className="block text-xs font-semibold text-ink-faint uppercase mb-1">
                  Grade / Year
                </label>
                <select
                  id="grade-select"
                  value={profile.grade}
                  onChange={(e) => setProfile({ ...profile, grade: e.target.value as StudyGrade })}
                  className="w-full rounded-xl border border-line p-2.5 text-xs text-ink bg-paper-raised"
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="hours-input" className="block text-xs font-semibold text-ink-faint uppercase mb-1">
                  Available Study Hours / Week
                </label>
                <input
                  id="hours-input"
                  type="number"
                  min="2"
                  max="40"
                  value={profile.availableHoursPerWeek}
                  onChange={(e) => setProfile({ ...profile, availableHoursPerWeek: Number(e.target.value) })}
                  className="w-full rounded-xl border border-line p-2.5 text-xs text-ink bg-paper-raised"
                />
              </div>
            </div>

            <div>
              <label htmlFor="style-select" className="block text-xs font-semibold text-ink-faint uppercase mb-1">
                Preferred Study Style
              </label>
              <select
                id="style-select"
                value={profile.preferredStyle}
                onChange={(e) => setProfile({ ...profile, preferredStyle: e.target.value as StudyStyle })}
                className="w-full rounded-xl border border-line p-2.5 text-xs text-ink bg-paper-raised"
              >
                {STYLES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject Marks & Targets */}
          <div className="card-learner rounded-2xl p-5 flex flex-col gap-4">
            <h2 className="text-sm font-bold text-ink">Subjects & Mark Targets</h2>
            <div className="flex flex-col gap-3">
              {profile.subjects.map((sub, idx) => (
                <div key={sub.code} className="rounded-xl border border-line p-3 bg-paper-raised flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-ink min-w-[140px]">
                    <span>{sub.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] text-ink-faint block">Current %</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        aria-label={`${sub.name} Current Percentage`}
                        value={sub.currentPercent}
                        onChange={(e) => handleSubjectChange(idx, "currentPercent", Number(e.target.value))}
                        className="w-16 rounded-lg border border-line p-1.5 text-center font-bold"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-ink-faint block">Target %</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        aria-label={`${sub.name} Target Percentage`}
                        value={sub.targetPercent}
                        onChange={(e) => handleSubjectChange(idx, "targetPercent", Number(e.target.value))}
                        className="w-16 rounded-lg border border-line p-1.5 text-center font-bold text-brand-teal"
                      />
                    </div>

                    <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sub.isWeakArea}
                        onChange={() => toggleWeakArea(idx)}
                        className="rounded text-mark-red"
                      />
                      <span>Weak Area</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-brand-teal p-3 text-xs font-bold text-white shadow hover:opacity-90 transition"
          >
            Save Study Profile →
          </button>
        </form>
      </div>
    </main>
  );
}
