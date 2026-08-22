import { Users } from "lucide-react";
import { getUmpMentors } from "@/lib/mentors/getMentors";

/**
 * Shows UMP's 2 hardcoded, verified mentors as-is -- per the owner's
 * 2026-08-21 decision, no cross-institution filtering or matching logic
 * (getUmpMentors() has none to call). Rendered by ResultsSection.tsx only
 * when the learner's results include a University of Mpumalanga
 * programme, since these mentors can only speak to UMP's programmes.
 */
export function MentorSnippet() {
  const mentors = getUmpMentors();
  if (mentors.length === 0) return null;

  return (
    <div className="no-print flex flex-col gap-3 rounded-2xl border border-line bg-paper-raised p-4 card-learner">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-brand-teal shrink-0" aria-hidden="true" />
        <h3 className="font-bold text-sm text-ink">Talk to a current UMP student</h3>
      </div>
      <p className="text-xs text-ink-soft">
        These verified UMP mentors have volunteered to answer questions from prospective
        students. Mentor coverage is UMP-only for now.
      </p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {mentors.map((mentor) => (
          <div key={mentor.id} className="rounded-xl border border-line/60 bg-paper p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-ink">{mentor.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-2xs font-bold uppercase tracking-wide ${
                  mentor.availability === "Available"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-900"
                }`}
              >
                {mentor.availability}
              </span>
            </div>
            <p className="mt-1 text-ink-soft">
              {mentor.programme} · {mentor.yearOfStudy}
            </p>
            <p className="mt-1 text-ink-faint">{mentor.expertise.join(", ")}</p>
            <a
              href={`mailto:${mentor.contactEmail}`}
              className="mt-2 inline-block font-semibold text-brand-teal hover:underline"
            >
              Email {mentor.name.split(" ")[0]}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
