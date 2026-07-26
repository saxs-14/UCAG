import { DeadlineBadge } from "./DeadlineBadge";
import { formatApplicationWindow } from "@/lib/bursaries/deadline";
import type { Internship } from "@/lib/firestore/types";

export function InternshipCard({
  internship,
  staggerIndex = 0,
}: {
  internship: Internship;
  staggerIndex?: number;
}) {
  const stagger = Math.min(staggerIndex + 1, 6);
  return (
    <article
      className={`stagger-${stagger} animate-rise-in flex flex-col gap-2 rounded-xl border-l-4 border-brand-coral bg-paper-raised p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="hover-wiggle text-base font-semibold text-ink">{internship.title}</h3>
        <DeadlineBadge closesOn={internship.closesOn} />
      </div>
      <p className="text-sm text-ink-soft">{internship.provider}</p>
      <p className="font-mono text-xs tabular-nums text-ink-soft">
        {formatApplicationWindow(internship.opensOn, internship.closesOn)}
      </p>
      <p className="text-xs text-ink-faint">
        {internship.matricOnly ? "Matric only" : internship.minQualification} ·{" "}
        {internship.fieldsOfStudy.join(", ")}
        {internship.province ? ` · ${internship.province}` : ""}
      </p>
      <div className="flex items-center justify-between border-t border-line pt-2 text-xs">
        <a
          href={internship.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-11 rounded-full bg-mark-green px-4 py-1.5 font-medium text-white transition-transform hover:scale-[1.03] active:scale-[0.97]"
        >
          Apply
        </a>
        <a
          href={internship.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-ink-faint underline"
        >
          Verified {internship.verifiedOn} · Source
        </a>
      </div>
    </article>
  );
}
