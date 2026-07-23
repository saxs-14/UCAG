import { DeadlineBadge } from "./DeadlineBadge";
import type { Internship } from "@/lib/firestore/types";

export function InternshipCard({ internship }: { internship: Internship }) {
  return (
    <article className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold">{internship.title}</h3>
        <DeadlineBadge closesOn={internship.closesOn} />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{internship.provider}</p>
      <p className="text-xs text-gray-500">
        {internship.matricOnly ? "Matric only" : internship.minQualification} ·{" "}
        {internship.fieldsOfStudy.join(", ")}
        {internship.province ? ` · ${internship.province}` : ""}
      </p>
      <div className="flex items-center justify-between border-t pt-2 text-xs">
        <a
          href={internship.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-700"
        >
          Apply
        </a>
        <a
          href={internship.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 underline"
        >
          Verified {internship.verifiedOn} · Source
        </a>
      </div>
    </article>
  );
}
