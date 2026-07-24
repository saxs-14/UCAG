import { DeadlineBadge } from "./DeadlineBadge";
import type { Internship } from "@/lib/firestore/types";

export function InternshipCard({ internship }: { internship: Internship }) {
  return (
    <article className="flex flex-col gap-2 rounded-lg bg-paper-raised border border-line p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-ink">{internship.title}</h3>
        <DeadlineBadge closesOn={internship.closesOn} />
      </div>
      <p className="text-sm text-ink-soft">{internship.provider}</p>
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
          className="rounded bg-mark-green px-3 py-1.5 font-medium text-white hover:opacity-90"
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
