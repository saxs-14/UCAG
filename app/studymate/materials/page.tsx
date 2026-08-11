"use client";

import { useEffect, useState } from "react";
import { StudyMateNav } from "@/components/studymate/StudyMateNav";
import { loadStudyMaterials, saveStudyMaterial } from "@/lib/studymate/storage";
import type { StudyMaterial, MaterialType } from "@/lib/studymate/types";

export default function StudyMaterialsPage() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [subjectCode, setSubjectCode] = useState("MATH");
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<MaterialType>("summary");
  const [content, setContent] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);

  useEffect(() => {
    setMaterials(loadStudyMaterials());
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newMaterial: StudyMaterial = {
      id: `mat-${Date.now()}`,
      title: title.trim(),
      subjectCode,
      topic: topic.trim() || "General",
      grade: "Grade 12",
      type,
      content: content.trim(),
      tags: [subjectCode, type],
      createdAt: new Date().toISOString().split("T")[0],
    };

    saveStudyMaterial(newMaterial);
    setMaterials(loadStudyMaterials());
    setTitle("");
    setContent("");
    setTopic("");
    setShowAddModal(false);
  };

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <StudyMateNav />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">Study Material Organiser</h1>
            <p className="text-xs text-ink-soft mt-1">
              Organise notes, summaries, formulas, and past papers by subject and topic.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="rounded-xl bg-brand-teal px-4 py-2 text-xs font-bold text-white shadow hover:opacity-90 transition"
          >
            + Add Study Material
          </button>
        </div>

        {/* Add Material Modal / Panel */}
        {showAddModal && (
          <form onSubmit={handleCreate} className="card-learner rounded-2xl p-5 flex flex-col gap-4 text-xs">
            <div className="flex justify-between items-center border-b border-line pb-2">
              <h2 className="font-bold text-ink text-sm">Add New Material</h2>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-ink-faint text-lg">✕</button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block font-semibold text-ink-faint uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Algebra Quadratic Equations Summary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-line p-2 text-ink bg-paper-raised"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-faint uppercase mb-1">Subject</label>
                <select
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full rounded-xl border border-line p-2 text-ink bg-paper-raised"
                >
                  <option value="MATH">Mathematics</option>
                  <option value="PHS">Physical Sciences</option>
                  <option value="ENG">English Home Language</option>
                  <option value="LIFE">Life Sciences</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ink-faint uppercase mb-1">Material Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as MaterialType)}
                  className="w-full rounded-xl border border-line p-2 text-ink bg-paper-raised"
                >
                  <option value="summary">Summary Notes</option>
                  <option value="flashcard">Flashcards</option>
                  <option value="notes">Lecture Notes</option>
                  <option value="past-paper">Past Paper</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink-faint uppercase mb-1">Topic</label>
              <input
                type="text"
                placeholder="e.g. Algebra"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full rounded-xl border border-line p-2 text-ink bg-paper-raised"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink-faint uppercase mb-1">Notes / Content</label>
              <textarea
                rows={4}
                required
                placeholder="Paste your study notes or summary content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-xl border border-line p-2.5 text-ink bg-paper-raised font-mono text-xs"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="rounded-xl bg-brand-teal px-4 py-2 font-bold text-white shadow hover:opacity-90">
                Save Material
              </button>
              <button type="button" onClick={() => setShowAddModal(false)} className="rounded-xl border border-line px-4 py-2 font-semibold">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Material List */}
        {materials.length === 0 ? (
          <div className="card-learner rounded-2xl p-8 text-center text-xs text-ink-faint">
            📁 No study materials added yet. Click &quot;+ Add Study Material&quot; to organize notes or past papers.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {materials.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMaterial(m)}
                className="card-learner rounded-2xl p-4 flex flex-col justify-between gap-3 cursor-pointer hover:-translate-y-0.5 transition"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-brand-teal mb-1">
                    <span>{m.subjectCode}</span>
                    <span className="uppercase bg-brand-teal-soft px-2 py-0.5 rounded-full border border-brand-teal/30">{m.type}</span>
                  </div>
                  <h3 className="font-bold text-sm text-ink leading-snug">{m.title}</h3>
                  <p className="text-xs text-ink-soft mt-1">Topic: {m.topic}</p>
                </div>

                <div className="flex items-center justify-between border-t border-line pt-2 text-[10px] text-ink-faint">
                  <span>{m.createdAt}</span>
                  <span className="font-bold text-brand-teal">View Notes →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Material Modal */}
        {selectedMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="card-learner max-w-2xl w-full rounded-2xl p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-line pb-3">
                <div>
                  <span className="text-xs font-bold text-brand-teal uppercase">{selectedMaterial.subjectCode} · {selectedMaterial.topic}</span>
                  <h2 className="text-lg font-bold text-ink">{selectedMaterial.title}</h2>
                </div>
                <button type="button" onClick={() => setSelectedMaterial(null)} className="text-ink-faint text-xl">✕</button>
              </div>

              <div className="rounded-xl bg-slate-soft p-4 text-xs font-mono whitespace-pre-wrap text-ink leading-relaxed">
                {selectedMaterial.content}
              </div>

              <button
                type="button"
                onClick={() => setSelectedMaterial(null)}
                className="self-end rounded-xl bg-brand-teal px-4 py-2 text-xs font-bold text-white shadow hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
