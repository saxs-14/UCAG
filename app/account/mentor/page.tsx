// cSpell:words Sipho Nomvula Mpumalanga Mbombela
"use client";

import { useState } from "react";
import Link from "next/link";

interface MentoringRequest {
  id: string;
  studentName: string;
  grade: string;
  topic: string;
  date: string;
  status: "pending" | "accepted" | "completed";
}

export default function PeerMentorDashboard() {
  const [requests, setRequests] = useState<MentoringRequest[]>([
    {
      id: "req-1",
      studentName: "Sipho M.",
      grade: "Grade 12",
      topic: "BSc Agriculture Application Requirements at UMP",
      date: "2026-08-14",
      status: "pending",
    },
    {
      id: "req-2",
      studentName: "Nomvula K.",
      grade: "Grade 11",
      topic: "Physical Sciences Revision Techniques",
      date: "2026-08-16",
      status: "accepted",
    },
  ]);

  const updateRequestStatus = (id: string, newStatus: "accepted" | "completed") => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <div className="hero-atmosphere w-full border-b border-white/10 py-10 shadow-md">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-3.5 py-1 text-xs font-semibold text-teal-200 border border-teal-400/30 w-fit">
            <span>🤝 Peer Mentor & Advisor Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Peer Mentor & Campus Advisor Dashboard
          </h1>
          <p className="max-w-2xl text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Manage student mentoring requests, share university transition guidance, and maintain moderated campus support contacts.
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">
        {/* Mentor Profile Overview */}
        <section aria-labelledby="mentor-profile-heading" className="card-learner rounded-2xl p-6 border border-line">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="rounded-full bg-emerald-500/10 text-emerald-700 px-2.5 py-0.5 text-[10px] font-bold border border-emerald-500/30">
                Verified Peer Mentor
              </span>
              <h2 id="mentor-profile-heading" className="text-lg font-bold text-ink mt-1">
                University of Mpumalanga (UMP) -- Mbombela Campus
              </h2>
              <p className="text-xs text-ink-soft mt-0.5">
                Specialties: BSc Agriculture, Faculty of Agriculture & Natural Sciences
              </p>
            </div>

            <Link
              href="/ump/mentors"
              className="rounded-xl bg-brand-teal px-4 py-2 text-xs font-bold text-white shadow hover:opacity-90 transition"
            >
              Public Mentor Directory →
            </Link>
          </div>
        </section>

        {/* Mentoring Requests */}
        <section aria-labelledby="requests-heading" className="card-learner rounded-2xl p-6 border border-line">
          <h2 id="requests-heading" className="text-base font-bold text-ink mb-3">
            📥 Student Mentoring Requests ({requests.length})
          </h2>

          <div className="flex flex-col gap-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-paper p-4 border border-line/60"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-ink">{req.studentName} ({req.grade})</span>
                    <span className="rounded-full bg-brand-teal-soft px-2 py-0.5 text-[10px] font-bold text-brand-teal">
                      {req.date}
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft mt-1">{req.topic}</p>
                </div>

                <div className="flex items-center gap-2">
                  {req.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => updateRequestStatus(req.id, "accepted")}
                      className="rounded-lg bg-brand-teal px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition"
                    >
                      Accept Request
                    </button>
                  )}
                  {req.status === "accepted" && (
                    <button
                      type="button"
                      onClick={() => updateRequestStatus(req.id, "completed")}
                      className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition"
                    >
                      Mark Completed
                    </button>
                  )}
                  {req.status === "completed" && (
                    <span className="text-xs font-bold text-emerald-600">Completed ✅</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Moderation & Communication Policy */}
        <section aria-labelledby="policy-heading" className="rounded-2xl border border-mark-gold/30 bg-mark-gold-soft p-5 text-xs text-ink-soft">
          <h2 id="policy-heading" className="font-bold text-mark-gold text-sm mb-1">
            🔒 Moderation & Safe Communication Guidelines
          </h2>
          <p className="leading-relaxed">
            All peer mentor interactions are monitored under UCAG academic conduct guidelines. Personal contact information (phone numbers/passwords) must never be requested or shared.
          </p>
        </section>
      </div>
    </main>
  );
}
