"use client";

import { useState } from "react";
import { StudyMateNav } from "@/components/studymate/StudyMateNav";
import { generateTutorResponse } from "@/lib/ai/studymate/tutor";
import type { TutorMessage } from "@/lib/studymate/types";

export default function StudyMateTutorPage() {
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: "t-init",
      sender: "tutor",
      text: "Hello! 👋 I am your StudyMate AI Tutor. What subject or concept are you working on today? (e.g. 'I don't understand quadratic equations' or 'Explain Pythagoras').",
      timestamp: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState("");
  const [subjectCode, setSubjectCode] = useState("MATH");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: TutorMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");

    // Generate AI tutor response
    setTimeout(() => {
      const tutorMsg = generateTutorResponse(userMsg.text, newHistory, subjectCode);
      setMessages((prev) => [...prev, tutorMsg]);
    }, 400);
  };

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <StudyMateNav />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 sm:p-8 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">AI Study Tutor</h1>
            <p className="text-xs text-ink-soft mt-1">
              Socratic step-by-step problem solver: Explain → Example → Try → Feedback → Retry.
            </p>
          </div>

          <select
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
            className="rounded-xl border border-line p-2 text-xs font-bold text-ink bg-paper-raised"
          >
            <option value="MATH">Mathematics</option>
            <option value="PHS">Physical Sciences</option>
            <option value="ENG">English</option>
            <option value="LIFE">Life Sciences</option>
          </select>
        </div>

        {/* Chat History Box */}
        <div className="card-learner rounded-2xl p-4 sm:p-6 flex flex-col gap-4 min-h-[400px] max-h-[550px] overflow-y-auto">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col gap-1 max-w-[85%] text-xs ${
                m.sender === "user"
                  ? "self-end items-end"
                  : "self-start items-start"
              }`}
            >
              <span className="text-[10px] font-bold text-ink-faint px-1">
                {m.sender === "user" ? "You" : "StudyMate Tutor 🤖"}
              </span>
              <div
                className={`rounded-2xl p-4 leading-relaxed whitespace-pre-wrap ${
                  m.sender === "user"
                    ? "bg-brand-teal text-white rounded-br-none shadow-xs"
                    : "bg-slate-soft text-ink rounded-bl-none border border-line"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask a question or request step-by-step help..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-xl border border-line p-3 text-xs text-ink bg-paper-raised font-medium shadow-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-teal"
          />
          <button
            type="submit"
            className="rounded-xl bg-brand-teal px-5 py-3 text-xs font-bold text-white shadow hover:opacity-90 transition"
          >
            Send →
          </button>
        </form>
      </div>
    </main>
  );
}
