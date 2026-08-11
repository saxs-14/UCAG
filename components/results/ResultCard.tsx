import Link from "next/link";
import { deriveApplicationWindowStatus, resolveApplicationCta } from "@/lib/applicationStatus";
import { calculateReadiness } from "@/lib/readiness";
import { LABELS } from "@/config/labels";
import { reasonText } from "./reasonText";
import { CircledMark } from "@/components/CircledMark";
import { ReadinessBar } from "./ReadinessBar";
import { ReadinessScorecard } from "@/components/readiness/ReadinessScorecard";
import { SmartBackupPlan } from "./SmartBackupPlan";
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
  isShortlisted?: boolean;
  onToggleShortlist?: () => void;
  checkedChecklistIds: ReadonlySet<string>;
  isComparing: boolean;
  onToggleCompare: () => void;
  compareDisabled: boolean;
  staggerIndex?: number;
  allProgrammes?: Programme[];
}

const BUCKET_SPINE: Record<MatchResult["bucket"], string> = {
  qualify: "border-l-4 border-emerald-500",
  almostQualify: "border-l-4 border-amber-500",
  notYet: "border-l-4 border-slate-400",
};

const BUCKET_LABEL_STYLE: Record<MatchResult["bucket"], string> = {
  qualify: "bg-emerald-100 text-emerald-800 font-bold border-emerald-300",
  almostQualify: "bg-amber-100 text-amber-900 font-bold border-amber-300",
  notYet: "bg-slate-100 text-slate-700 font-semibold border-slate-300",
};

function findApsGap(matchResult: MatchResult): number | null {
  const apsReason = matchResult.reasons.find((r) => r.type === "aps");
  if (apsReason && apsReason.type === "aps" && !apsReason.met) return apsReason.gap;
  return null;
}

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
  allProgrammes = [],
}: ResultCardProps) {
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
    <div className={`stagger-${stagger} animate-rise-in`}>
      <article className={`flex flex-col gap-4 rounded-2xl border border-line bg-paper-raised p-5 shadow-sm transition-all hover:shadow-md ${BUCKET_SPINE[matchResult.bucket]}`}>
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/40 pb-2.5">
            <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${BUCKET_LABEL_STYLE[matchResult.bucket]}`}>
              {LABELS.resultBuckets[matchResult.bucket]}
            </span>
            <div className="flex items-center gap-2">
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
          </div>

          {/* Institution APS Formula Callout */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-lg bg-teal-950/80 px-2.5 py-1 font-semibold text-teal-200 border border-teal-500/30 text-2xs">
              <span>📐 {institution.shortName || institution.name} Formula:</span>
              <span>{matchResult.apsResult.loTreatmentMessage}</span>
            </span>
            {matchResult.apsResult.appliedBonuses.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-purple-100 px-2.5 py-1 font-semibold text-purple-800 border border-purple-300 text-2xs">
                <span>★ Bonus:</span>
                <span>{matchResult.apsResult.appliedBonuses.map((b) => b.description).join(", ")}</span>
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-ink">
                <Link href={`/programmes/${programme.id}`} className="hover:underline hover:text-brand-teal transition-colors">
                  {programme.name}
                </Link>
              </h3>
              <p className="text-xs font-semibold text-ink-soft">
                {programme.qualificationType} · NQF Level {programme.nqfLevel} · {programme.duration}
              </p>
              <p className="text-xs text-ink-faint">
                {faculty.name} · {school.name}
              </p>
            </div>
            <div className="no-print flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink-soft cursor-pointer hover:bg-slate-soft shadow-2xs">
                <input
                  type="checkbox"
                  id={`compare-${programme.id}`}
                  name={`compare-${programme.id}`}
                  checked={isComparing}
                  disabled={!isComparing && compareDisabled}
                  onChange={onToggleCompare}
                  className="h-3.5 w-3.5 cursor-pointer accent-brand-teal"
                />
                Compare
              </label>
              {onToggleShortlist && (
                <button
                  type="button"
                  onClick={onToggleShortlist}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 shadow-2xs ${
                    isShortlisted
                      ? "border-rose-500 bg-rose-600 text-white"
                      : "border-line bg-paper text-ink-soft hover:bg-slate-soft hover:text-ink"
                  }`}
                >
                  {isShortlisted ? "★ Shortlisted" : "☆ Shortlist"}
                </button>
              )}
            </div>
          </div>
          {(programme.campuses?.length > 0 || programme.modeOfDelivery) && (
            <p className="text-xs text-ink-faint font-medium">
              📍 {[programme.campuses?.length > 0 ? programme.campuses.join(", ") : null, programme.modeOfDelivery]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </header>

        <ul className="flex flex-col gap-2 rounded-xl border border-line/60 bg-paper p-3.5 text-xs">
          {matchResult.reasons.map((reason, i) => {
            const met = "met" in reason ? reason.met : false;
            return (
              <li key={i} className="flex items-start gap-2.5">
                <span aria-hidden className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-2xs font-bold ${met ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"}`}>
                  {met ? "✓" : "✗"}
                </span>
                <span className="text-ink font-medium leading-relaxed">{reasonText(reason)}</span>
              </li>
            );
          })}
          {matchResult.reasons.length === 0 && (
            <li className="text-ink-faint">No specific requirements on record for this programme.</li>
          )}
        </ul>

        {matchResult.suggestedNextStep && (
          <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200/80 font-medium">
            💡 <strong>Next step: </strong>
            {matchResult.suggestedNextStep}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-2.5 text-xs">
          {cta.kind === "apply" && (
            <a
              href={cta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center rounded-xl bg-teal-600 px-4 font-bold text-white transition-all hover:bg-teal-500 shadow-sm active:scale-95"
            >
              🚀 {cta.label}
            </a>
          )}
          {cta.kind === "openingSoon" && (
            <span className="inline-flex min-h-10 items-center rounded-xl bg-emerald-100 px-3.5 font-bold text-emerald-800 border border-emerald-300">
              ⏳ {cta.label}
            </span>
          )}
          {cta.kind === "statusCheck" && (
            <>
              <span className="inline-flex min-h-10 items-center rounded-xl bg-slate-100 px-3.5 font-semibold text-slate-700">
                {LABELS.applicationStatus.closed}
              </span>
              {cta.url && (
                <a
                  href={cta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center px-2 text-teal-700 font-bold hover:underline"
                >
                  {cta.label}
                </a>
              )}
            </>
          )}
          {cta.kind === "datesBeingVerified" && (
            <>
              <span className="inline-flex min-h-10 items-center rounded-xl bg-slate-100 px-3.5 font-semibold text-slate-700">
                {cta.label}
              </span>
              {cta.url && (
                <a
                  href={cta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center px-2 text-teal-700 font-bold hover:underline"
                >
                  Visit institution site
                </a>
              )}
            </>
          )}
        </div>

        <ReadinessBar readiness={readiness} />

        <ReadinessScorecard
          matchResult={matchResult}
          checkedItemIds={checkedChecklistIds}
          applicationWindow={applicationWindow}
        />

        {matchResult.bucket !== "qualify" && (
          <SmartBackupPlan
            programme={programme}
            institution={institution}
            matchResult={matchResult}
            allProgrammes={allProgrammes}
          />
        )}

        <p className="text-2xs font-mono tabular-nums text-ink-faint border-t border-line/40 pt-2">
          Verified {programme.verifiedOn} ·{" "}
          <a href={programme.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
            Official Source
          </a>
        </p>
      </article>
    </div>
  );
}
