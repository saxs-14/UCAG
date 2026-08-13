import type { Metadata } from "next";
import Link from "next/link";
import { LABELS } from "@/config/labels";
import { UmpHeader } from "@/components/ump/UmpHeader";
import { getUmpMentors } from "@/lib/mentors/getMentors";

const UMP_NAVY = "#003b5c";


export const metadata: Metadata = {
  title: `UMP Student Mentors -- ${LABELS.app.name}`,
  description: "Connect with verified senior University of Mpumalanga peer mentors for academic guidance, course advice, and student life orientation.",
};

export default function UmpMentorsPage() {
  const mentors = getUmpMentors();

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <UmpHeader />

      {/* Hero */}
      <div
        className="w-full py-10 px-6 sm:px-10 text-white"
        style={{ background: `linear-gradient(135deg, ${UMP_NAVY} 0%, #004f7c 60%, #003348 100%)` }}
      >
        <div className="mx-auto max-w-5xl flex flex-col gap-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs opacity-70">
            <Link href="/ump" className="hover:opacity-100 hover:underline">UMP Hub</Link>
            <span>›</span>
            <span>Mentors</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight">👥 Student Peer Mentors</h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            Connect with verified senior UMP students for academic advice, study tips, and first-year guidance.
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">

        <div className="grid gap-4 sm:grid-cols-2">
          {mentors.map((mentor) => (
            <div key={mentor.id} className="card-learner rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-mark-green-soft text-mark-green border border-mark-green/30 px-2.5 py-0.5 text-[10px] font-bold">
                    ✓ Verified UMP Mentor
                  </span>
                  <h2 className="text-lg font-bold text-ink mt-1">{mentor.name}</h2>
                  <p className="text-xs font-semibold text-brand-teal">{mentor.programme}</p>
                  <p className="text-[11px] text-ink-faint">{mentor.yearOfStudy} · {mentor.campus} Campus</p>
                </div>
              </div>

              <p className="text-xs text-ink-soft leading-relaxed">{mentor.bio}</p>

              <div>
                <p className="text-[10px] font-bold text-ink-faint uppercase mb-1">Expertise:</p>
                <div className="flex flex-wrap gap-1.5">
                  {mentor.expertise.map((exp, idx) => (
                    <span key={idx} className="rounded-lg bg-slate-soft px-2 py-1 text-[11px] text-ink font-medium">
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-line pt-3 flex items-center justify-between text-xs">
                <span className="font-bold text-mark-green">● {mentor.availability}</span>
                <a href={`mailto:${mentor.contactEmail}`} className="font-bold text-brand-teal hover:underline">
                  Contact Mentor ✉
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
