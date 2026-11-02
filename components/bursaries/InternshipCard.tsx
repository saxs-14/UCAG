import { DeadlineBadge } from "./DeadlineBadge";
import { StampBadge } from "@/components/StampBadge";
import { TiltCard } from "@/components/TiltCard";
import { FieldTag } from "@/components/FieldTag";
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
    <div className={`stagger-${stagger} animate-rise-in h-full`}>
      <TiltCard>
        <article className="flex h-full flex-col rounded-3xl border border-line bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <StampBadge variant="coral" />
              <h3 className="font-display text-lg font-bold text-ink leading-tight">{internship.title}</h3>
            </div>
            <DeadlineBadge closesOn={internship.closesOn} />
          </div>
          
          <div className="mt-4 flex-grow">
            <div className="flex items-center gap-2">
              <span className="inline-flex rounded-md bg-brand-coral/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-brand-coral">
                {internship.type === "learnership" ? "Learnership" : "Internship"}
              </span>
            </div>
            <p className="mt-2 text-sm font-bold text-brand-coral">{internship.provider}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
              <span>📅</span> {formatApplicationWindow(internship.opensOn, internship.closesOn)}
            </p>
            
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-ink-soft">
                {internship.matricOnly ? "Matric only" : internship.minQualification}
                {internship.province ? ` · ${internship.province}` : ""}
              </span>
              {internship.fieldsOfStudy.map((field) => (
                <FieldTag key={field} field={field} />
              ))}
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-4">
            <a
              href={internship.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-mark-green px-6 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-mark-green/30"
            >
              Apply Officially
            </a>
            <a
              href={internship.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-ink-soft transition-colors hover:text-brand-coral hover:underline"
            >
              Source verified {internship.verifiedOn} ↗
            </a>
          </div>
        </article>
      </TiltCard>
    </div>
  );
}