import { DeadlineBadge } from "./DeadlineBadge";
import type { Bursary } from "@/lib/firestore/types";

const LEVEL_LABELS: Record<Bursary["levelRequired"], string> = {
  matricOnly: "Matric only",
  currentlyEnrolled: "Currently enrolled",
  completedQualification: "Completed a qualification",
};

export function BursaryCard({ bursary }: { bursary: Bursary }) {
  return (
    <article className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold">{bursary.name}</h3>
        <DeadlineBadge closesOn={bursary.closesOn} />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{bursary.provider}</p>
      <p className="text-sm">{bursary.value}</p>
      <p className="text-xs text-gray-500">
        {LEVEL_LABELS[bursary.levelRequired]} · {bursary.fieldsOfStudy.join(", ")}
      </p>
      {bursary.criteria.length > 0 && (
        <ul className="list-inside list-disc text-xs text-gray-600 dark:text-gray-400">
          {bursary.criteria.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      )}
      <div className="flex items-center justify-between border-t pt-2 text-xs">
        <a
          href={bursary.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-700"
        >
          Apply
        </a>
        <a href={bursary.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 underline">
          Verified {bursary.verifiedOn} · Source
        </a>
      </div>
    </article>
  );
}
