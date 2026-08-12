"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/studymate", label: "Dashboard", emoji: "📊" },
  { href: "/studymate/profile", label: "Profile", emoji: "👤" },
  { href: "/studymate/timetable", label: "Timetable", emoji: "📅" },
  { href: "/studymate/plan", label: "Study Plan", emoji: "🎯" },
  { href: "/studymate/materials", label: "Materials", emoji: "📁" },
  { href: "/studymate/tutor", label: "AI Tutor", emoji: "🤖" },
  { href: "/studymate/quiz", label: "Quizzes", emoji: "⚡" },
  { href: "/studymate/mock-exam", label: "Mock Exams", emoji: "📝" },
  { href: "/studymate/progress", label: "Progress", emoji: "📈" },
];

export function StudyMateNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="VarsityPath AI Navigation"
      className="w-full overflow-x-auto border-b border-line bg-paper-raised"
    >
      <div className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-2 text-xs font-semibold scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-none items-center gap-1.5 rounded-lg px-3 py-2 transition ${
                isActive
                  ? "bg-brand-teal text-white shadow-sm"
                  : "text-ink-soft hover:bg-slate-soft hover:text-ink"
              }`}
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
