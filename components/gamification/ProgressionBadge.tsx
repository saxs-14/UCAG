"use client";

import { useEffect, useState } from "react";
import { loadAchievements } from "@/lib/gamification/achievements";
import type { Achievement } from "@/lib/gamification/achievements";

export function ProgressionBadge() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    setAchievements(loadAchievements());
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const level = Math.min(Math.floor(unlockedCount / 2) + 1, 5);

  const levelTitles = ["Level 1: Explorer", "Level 2: Learner", "Level 3: Scholar", "Level 4: High Achiever", "Level 5: University Ready"];

  return (
    <div className="card-learner rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wide text-brand-teal">
            Student Journey Level {level}
          </span>
          <h3 className="text-sm font-bold text-ink">{levelTitles[level - 1]}</h3>
        </div>
        <span className="text-2xl" aria-hidden>🏆</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 rounded-full bg-slate-soft overflow-hidden">
          <div
            className="h-full bg-brand-teal transition-all duration-500 rounded-full"
            style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
          />
        </div>
        <span className="text-[11px] font-bold text-ink-faint">{unlockedCount}/{achievements.length} Unlocked</span>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-1">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            title={`${ach.title}: ${ach.description}`}
            className={`flex flex-col items-center justify-center rounded-xl p-2 text-center border transition ${
              ach.unlocked
                ? "bg-brand-teal-soft border-brand-teal/30 text-ink shadow-xs"
                : "bg-slate-soft/50 border-line text-ink-faint opacity-50 grayscale"
            }`}
          >
            <span className="text-lg">{ach.icon}</span>
            <span className="text-[9px] font-bold truncate max-w-full mt-0.5">{ach.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
