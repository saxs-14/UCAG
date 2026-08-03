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
    // See BursaryCard for why entrance animation and the 3D tilt/
    // hover-lift are split across separate elements.
    <div className={`stagger-${stagger} animate-rise-in`}>
      <TiltCard>
        <article className="elevate rounded-xl border border-line bg-paper-raised p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <StampBadge variant="coral" />
              <h3 className="text-base font-semibold text-ink">{internship.title}</h3>
            </div>
            <DeadlineBadge closesOn={internship.closesOn} />
          </div>
          <p className="mt-2 text-sm text-ink-soft">{internship.provider}</p>
          <p className="mt-1 font-mono text-xs tabular-nums text-ink-soft">
            {formatApplicationWindow(internship.opensOn, internship.closesOn)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-ink-faint">
              {internship.matricOnly ? "Matric only" : internship.minQualification}
              {internship.province ? ` · ${internship.province}` : ""}
            </span>
            {internship.fieldsOfStudy.map((field) => (
              <FieldTag key={field} field={field} />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-xs">
            <a
              href={internship.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-11 rounded-full bg-mark-green px-4 py-1.5 font-medium text-white transition-transform hover-fine:scale-[1.03] active:scale-[0.97]"
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
      </TiltCard>
    </div>
  );
}
