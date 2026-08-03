import Link from "next/link";
import { deriveApplicationWindowStatus, resolveApplicationCta } from "@/lib/applicationStatus";
import { calculateReadiness } from "@/lib/readiness";
import { LABELS } from "@/config/labels";
import { reasonText } from "./reasonText";
import { CircledMark } from "@/components/CircledMark";
import { ReadinessBar } from "./ReadinessBar";
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
  /** The shared "prepare to apply" checklist state -- generic, not
   * per-programme (see config/applicationDocuments.ts), so every card
   * reads the same Set. */
  checkedChecklistIds: ReadonlySet<string>;
  /** Course comparison (up to 3 at once) -- unlike shortlisting, needs no
   * account, since it's transient session state, not saved data. */
  isComparing: boolean;
  onToggleCompare: () => void;
  compareDisabled: boolean;
  staggerIndex?: number;
}

const BUCKET_SPINE: Record<MatchResult["bucket"], string> = {
  qualify: "border-l-4 border-mark-green shadow-[0_1px_16px_-4px_var(--color-mark-green)]",
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
  checkedChecklistIds,
  isComparing,
  onToggleCompare,
  compareDisabled,
  staggerIndex = 0,
}: ResultCardProps) {
  // The ingestion pipeline (lib/ingestion/applicationWindowPipeline.ts)
  // only ever proposes opensOn/closesOn/lateClosesOn -- never a status
  // enum directly, since "open"/"closed"/"openingSoon" is a fact that
  // changes on its own every day a real date passes, not something worth
  // re-extracting. `.status` is only ever populated when an admin has
  // out-of-band knowledge (e.g. an announced early closure) worth
  // overriding the derived value with; otherwise derive it live from the
  // real dates, per this function's own doc comment.
  const status = applicationWindow?.status ?? deriveApplicationWindowStatus(
    {
      opensOn: applicationWindow?.opensOn ?? null,
      closesOn: applicationWindow?.closesOn ?? null,
      lateClosesOn: applicationWindow?.lateClosesOn ?? null,
    },
    new Date()
  );
  const readiness = calculateReadiness(matchResult, checkedChecklistIds);
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
  const stagger = Math.min(staggerIndex + 1, 6);

  return (
    // Entrance animation and the hover lift both animate `transform`,
    // so they're split across two elements: an animation's held
    // end-state (fill-mode both) outranks a plain :hover rule on the
    // same property in the cascade, which silently no-ops the hover
    // effect if both live on one node.
    <div className={`stagger-${stagger} animate-rise-in`}>
      <article className={`flex flex-col gap-3 rounded-xl bg-paper-raised p-4 transition-transform hover:-translate-y-0.5 ${BUCKET_SPINE[matchResult.bucket]}`}>
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
          <div className="no-print flex shrink-0 items-center gap-2">
            <label className="flex min-h-11 cursor-pointer items-center gap-1.5 px-1 text-xs text-ink-soft">
              <input
                type="checkbox"
                id={`compare-${programme.id}`}
                name={`compare-${programme.id}`}
                checked={isComparing}
                disabled={!isComparing && compareDisabled}
                onChange={onToggleCompare}
                className="h-4 w-4 cursor-pointer"
              />
              Compare
            </label>
            {onToggleShortlist && (
              <button
                type="button"
                onClick={onToggleShortlist}
                aria-pressed={isShortlisted}
                className={`min-h-11 cursor-pointer rounded-full border px-3 text-xs font-medium transition-transform active:scale-95 ${
                  isShortlisted
                    ? "border-brand-coral bg-brand-coral text-white"
                    : "border-line text-ink-soft hover:bg-slate-soft"
                }`}
              >
                {isShortlisted ? "★ Shortlisted" : "☆ Shortlist"}
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-ink-soft">
          {programme.qualificationType} · NQF {programme.nqfLevel} · {programme.duration}
        </p>
        <p className="text-sm text-ink-soft">
          {faculty.name} &middot; {school.name}
        </p>
        {(programme.campuses?.length > 0 || programme.modeOfDelivery) && (
          <p className="text-sm text-ink-faint">
            {[programme.campuses?.length > 0 ? programme.campuses.join(", ") : null, programme.modeOfDelivery]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
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
            className="inline-flex min-h-11 items-center rounded-full bg-brand-teal px-4 font-medium text-white transition-transform hover:scale-[1.03] active:scale-[0.97]"
          >
            {cta.label}
          </a>
        )}
        {cta.kind === "openingSoon" && (
          <span className="inline-flex min-h-11 items-center rounded-full bg-mark-green-soft px-3 font-medium text-mark-green">
            {cta.label}
          </span>
        )}
        {cta.kind === "statusCheck" && (
          <>
            <span className="inline-flex min-h-11 items-center rounded-full bg-slate-soft px-3 font-medium text-ink-soft">
              {LABELS.applicationStatus.closed}
            </span>
            {cta.url && (
              <a
                href={cta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center px-1 text-brand-teal hover:underline"
              >
                {cta.label}
              </a>
            )}
          </>
        )}
        {cta.kind === "datesBeingVerified" && (
          <>
            <span className="inline-flex min-h-11 items-center rounded-full bg-slate-soft px-3 font-medium text-ink-soft">
              {cta.label}
            </span>
            {cta.url && (
              <a
                href={cta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center px-1 text-brand-teal hover:underline"
              >
                Visit institution site
              </a>
            )}
          </>
        )}
      </div>

      <ReadinessBar readiness={readiness} />

      <p className="text-xs font-mono tabular-nums text-ink-faint">
        Verified {programme.verifiedOn} ·{" "}
        <a href={programme.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
          Source
        </a>
      </p>
      </article>
    </div>
  );
}
