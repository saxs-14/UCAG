import { resolveApplicationCta } from "@/lib/applicationStatus";
import { LABELS } from "@/config/labels";
import { reasonText } from "./reasonText";
import type { MatchResult } from "@/lib/matching/types";
import type {
  ApplicationWindow,
  Faculty,
  Institution,
  Programme,
  School,
} from "@/lib/firestore/types";

interface ResultCardProps {
  programme: Programme;
  institution: Institution;
  faculty: Faculty;
  school: School;
  matchResult: MatchResult;
  applicationWindow: ApplicationWindow | undefined;
}

const BUCKET_STYLES: Record<MatchResult["bucket"], string> = {
  qualify: "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950",
  almostQualify: "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950",
  notYet: "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900",
};

/**
 * One programme's full result -- every field the brief requires (sect.
 * 3): programme name/qualification/NQF/duration, faculty AND school
 * explicitly, campus/mode, itemised requirements, the correct
 * application CTA (never an apply link on a closed window), and the
 * verification line with a real source link.
 */
export function ResultCard({
  programme,
  institution,
  faculty,
  school,
  matchResult,
  applicationWindow,
}: ResultCardProps) {
  const status = applicationWindow?.status ?? "unknown";
  const cta = resolveApplicationCta(
    status,
    {
      applyUrl: programme.applyUrl,
      statusCheckUrl: institution.statusCheckUrl,
      websiteUrl: institution.websiteUrl,
    },
    applicationWindow?.opensOn ?? null
  );

  return (
    <article className={`flex flex-col gap-3 rounded-lg border p-4 ${BUCKET_STYLES[matchResult.bucket]}`}>
      <header className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {LABELS.resultBuckets[matchResult.bucket]}
        </span>
        <h3 className="text-lg font-semibold">{programme.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {programme.qualificationType} · NQF {programme.nqfLevel} · {programme.duration}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {faculty.name} &middot; {school.name}
        </p>
        <p className="text-sm text-gray-500">
          {programme.campuses.join(", ")} · {programme.modeOfDelivery}
        </p>
      </header>

      <ul className="flex flex-col gap-1 text-sm">
        {matchResult.reasons.map((reason, i) => {
          const met = "met" in reason ? reason.met : false;
          return (
            <li key={i} className="flex items-start gap-2">
              <span aria-hidden className={met ? "text-green-600" : "text-amber-600"}>
                {met ? "✓" : "✗"}
              </span>
              <span>{reasonText(reason)}</span>
            </li>
          );
        })}
        {matchResult.reasons.length === 0 && (
          <li className="text-gray-500">No specific requirements on record for this programme.</li>
        )}
      </ul>

      {matchResult.suggestedNextStep && (
        <p className="rounded bg-white/60 p-2 text-sm dark:bg-black/20">
          <strong>Next step: </strong>
          {matchResult.suggestedNextStep}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t pt-3 text-sm">
        {cta.kind === "apply" && (
          <a
            href={cta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-700"
          >
            {cta.label}
          </a>
        )}
        {cta.kind === "openingSoon" && (
          <span className="rounded bg-blue-100 px-3 py-1.5 font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {cta.label}
          </span>
        )}
        {cta.kind === "statusCheck" && (
          <>
            <span className="rounded bg-gray-200 px-3 py-1.5 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {LABELS.applicationStatus.closed}
            </span>
            {cta.url && (
              <a href={cta.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                {cta.label}
              </a>
            )}
          </>
        )}
        {cta.kind === "datesBeingVerified" && (
          <>
            <span className="rounded bg-gray-200 px-3 py-1.5 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {cta.label}
            </span>
            {cta.url && (
              <a href={cta.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                Visit institution site
              </a>
            )}
          </>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Verified {programme.verifiedOn} ·{" "}
        <a href={programme.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
          Source
        </a>
      </p>
    </article>
  );
}
