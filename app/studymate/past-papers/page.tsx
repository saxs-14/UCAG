"use client";

import { useState } from "react";
import { StudyMateNav } from "@/components/studymate/StudyMateNav";

interface PastPaperItem {
  id: string;
  subjectCode: string;
  subjectName: string;
  year: number;
  paperNumber: number;
  hasMemo: boolean;
  downloadUrl: string;
}

const SAMPLE_PAST_PAPERS: PastPaperItem[] = [
  { id: "pp-m-2025-p1", subjectCode: "MATH", subjectName: "Mathematics", year: 2025, paperNumber: 1, hasMemo: true, downloadUrl: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx" },
  { id: "pp-m-2025-p2", subjectCode: "MATH", subjectName: "Mathematics", year: 2025, paperNumber: 2, hasMemo: true, downloadUrl: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx" },
  { id: "pp-p-2025-p1", subjectCode: "PHS", subjectName: "Physical Sciences", year: 2025, paperNumber: 1, hasMemo: true, downloadUrl: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx" },
  { id: "pp-p-2025-p2", subjectCode: "PHS", subjectName: "Physical Sciences", year: 2025, paperNumber: 2, hasMemo: true, downloadUrl: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations.aspx" },
];

export default function PastPapersPage() {
  const [subjectFilter, setSubjectFilter] = useState("all");

  const filtered = subjectFilter === "all"
    ? SAMPLE_PAST_PAPERS
    : SAMPLE_PAST_PAPERS.filter((p) => p.subjectCode === subjectFilter);

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <StudyMateNav />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">Matric Past Papers & Memos</h1>
            <p className="text-xs text-ink-soft mt-1">
              Official Department of Basic Education (DBE) past NSC examination papers and marking guidelines.
            </p>
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-xl border border-line p-2 text-xs font-bold text-ink bg-paper-raised"
          >
            <option value="all">All Subjects</option>
            <option value="MATH">Mathematics</option>
            <option value="PHS">Physical Sciences</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((pp) => (
            <div key={pp.id} className="card-learner rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-brand-teal-soft text-brand-teal border border-brand-teal/30 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                  {pp.subjectCode} · Paper {pp.paperNumber}
                </span>
                <span className="font-mono text-xs font-bold text-ink-faint">{pp.year} NSC</span>
              </div>

              <h2 className="font-bold text-sm text-ink">{pp.subjectName} Paper {pp.paperNumber}</h2>

              <div className="flex items-center justify-between border-t border-line pt-3 text-xs">
                <span className="text-ink-soft">{pp.hasMemo ? "✅ Includes Memorandum" : "No memo"}</span>
                <a
                  href={pp.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-brand-teal hover:underline"
                >
                  Official DBE Portal ↗
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-line bg-slate-soft p-5 text-xs text-ink-soft leading-relaxed">
          <p className="font-bold text-ink mb-1">ℹ️ Copyright & Provenance Notice:</p>
          <p>
            Past examination papers are published by the South African Department of Basic Education (DBE).
            UCAG provides direct links to official public repositories and respects intellectual property rights.
          </p>
        </div>
      </div>
    </main>
  );
}
