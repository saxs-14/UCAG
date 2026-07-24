import Link from "next/link";
import { resolveApplicationCta } from "@/lib/applicationStatus";
import { LABELS } from "@/config/labels";
import { reasonText } from "./reasonText";
import { CircledMark } from "@/components/CircledMark";
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
  /** Only set when a learner is signed in -- "a shortlist" is a Phase 6
   * signed-in feature (docs/MASTER_PROMPT_v2.md), not shown at all to an
   * anonymous visitor rather than shown-but-disabled. */
  isShortlisted?: boolean;
  onToggleShortlist?: () => void;
}

const BUCKET_SPINE: Record<MatchResult["bucket"], string> = {
  qualify: "border-l-4 border-mark-green",
  almostQualify: "border-l-4 border-mark-gold",
  notYet: "border-l-4 border-slate",
};

const BUCKET_LABEL_COLOR: Record<MatchResult["bucket"], string> = {
  qualify: "text-mark-green",
  almostQualify: "text-mark-gold",
  notYet: "text-slate",
};

/** The APS gap, only when the aps-total reason is what's actually unmet --
 * a subject-level/variant mismatch has its own gap, not an APS gap, and
 * showing an APS number in that case would misrepresent why the card is
 * "almost." No fabricated number beats a missing one. */
function findApsGap(matchResult: MatchResult): number | null {
  const apsReason = matchResult.reasons.find((r) => r.type === "aps");
  if (apsReason && apsReason.type === "aps" && !apsReason.met) return apsReason.gap;
  return null;
}

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
  isShortlisted,
  onToggleShortlist,
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

  const apsGap = matchResult.bucket === "almostQualify" ? findApsGap(matchResult) : null;

  return (
    <article className={`flex flex-col gap-3 rounded-lg bg-paper-raised p-4 ${BUCKET_SPINE[matchResult.bucket]}`}>
      <header className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <span className={`text-xs font-semibold uppercase tracking-wide ${BUCKET_LABEL_COLOR[matchResult.bucket]}`}>
            {LABELS.resultBuckets[matchResult.bucket]}
          </span>
          {matchResult.bucket === "qualify" && (
            <CircledMark
              value={matchResult.apsResult.score}
              variant="qualify"
              size="sm"
              label={`Your score for this programme: ${matchResult.apsResult.score}`}
            />
          )}
          {apsGap !== null && (
            <CircledMark
              value={`-${apsGap}`}
              variant="almost"
              size="sm"
              label={`${apsGap} points short of this programme's minimum`}
            />
          )}
        </div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-ink">
            <Link href={`/programmes/${programme.id}`} className="hover:underline">
              {programme.name}
            </Link>
          </h3>
          {onToggleShortlist && (
            <button
              type="button"
              onClick={onToggleShortlist}
              aria-pressed={isShortlisted}
              className={`no-print shrink-0 rounded border px-2 py-1 text-xs font-medium ${
                isShortlisted
                  ? "border-mark-green bg-mark-green text-white"
                  : "border-line text-ink-soft hover:bg-slate-soft"
              }`}
            >
              {isShortlisted ? "★ Shortlisted" : "☆ Shortlist"}
            </button>
          )}
        </div>
        <p className="text-sm text-ink-soft">
          {programme.qualificationType} · NQF {programme.nqfLevel} · {programme.duration}
        </p>
        <p className="text-sm text-ink-soft">
          {faculty.name} &middot; {school.name}
        </p>
        <p className="text-sm text-ink-faint">
          {programme.campuses.join(", ")} · {programme.modeOfDelivery}
        </p>
      </header>

      <ul className="flex flex-col gap-1 text-sm">
        {matchResult.reasons.map((reason, i) => {
          const met = "met" in reason ? reason.met : false;
          return (
            <li key={i} className="flex items-start gap-2">
              <span aria-hidden className={met ? "text-mark-green" : "text-mark-gold"}>
                {met ? "✓" : "✗"}
              </span>
              <span className="text-ink">{reasonText(reason)}</span>
            </li>
          );
        })}
        {matchResult.reasons.length === 0 && (
          <li className="text-ink-faint">No specific requirements on record for this programme.</li>
        )}
      </ul>

      {matchResult.suggestedNextStep && (
        <p className="rounded bg-mark-gold-soft p-2 text-sm text-ink">
          <strong>Next step: </strong>
          {matchResult.suggestedNextStep}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-3 text-sm">
        {cta.kind === "apply" && (
          <a
            href={cta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-mark-green px-3 py-1.5 font-medium text-white hover:opacity-90"
          >
            {cta.label}
          </a>
        )}
        {cta.kind === "openingSoon" && (
          <span className="rounded bg-mark-green-soft px-3 py-1.5 font-medium text-mark-green">
            {cta.label}
          </span>
        )}
        {cta.kind === "statusCheck" && (
          <>
            <span className="rounded bg-slate-soft px-3 py-1.5 font-medium text-ink-soft">
              {LABELS.applicationStatus.closed}
            </span>
            {cta.url && (
              <a href={cta.url} target="_blank" rel="noopener noreferrer" className="text-mark-green hover:underline">
                {cta.label}
              </a>
            )}
          </>
        )}
        {cta.kind === "datesBeingVerified" && (
          <>
            <span className="rounded bg-slate-soft px-3 py-1.5 font-medium text-ink-soft">
              {cta.label}
            </span>
            {cta.url && (
              <a href={cta.url} target="_blank" rel="noopener noreferrer" className="text-mark-green hover:underline">
                Visit institution site
              </a>
            )}
          </>
        )}
      </div>

      <p className="text-xs font-mono tabular-nums text-ink-faint">
        Verified {programme.verifiedOn} ·{" "}
        <a href={programme.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
          Source
        </a>
      </p>
    </article>
  );
}
