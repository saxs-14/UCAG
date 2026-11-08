import Link from "next/link";
import { resolveEffectiveApplicationWindowStatus, resolveApplicationCta } from "@/lib/applicationStatus";
import { calculateReadiness } from "@/lib/readiness";
import { LABELS } from "@/config/labels";
import { reasonText } from "./reasonText";
import { gapCloserText } from "./gapCloserText";
import { academicUnitLabel } from "@/lib/academicUnitLabel";
import { ApsBreakdown } from "./ApsBreakdown";
import { DeadlineCountdown } from "./DeadlineCountdown";
import { CircledMark } from "@/components/CircledMark";
import { CheckIcon, HourglassIcon, ICON_SIZE, LightbulbIcon, MapPinIcon, RocketIcon, RulerIcon, StarIcon, XIcon } from "@/components/icons/Icon";
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
  qualify: "border-l-8 border-l-emerald-500 border-y-glass-border border-r-glass-border",
  almostQualify: "border-l-8 border-l-amber-400 border-y-glass-border border-r-glass-border",
  notYet: "border-l-8 border-l-slate-300 border-y-glass-border border-r-glass-border",
};

const BUCKET_LABEL_STYLE: Record<MatchResult["bucket"], string> = {
  qualify: "bg-emerald-100 text-emerald-800 border-emerald-200",
  almostQualify: "bg-amber-100 text-amber-800 border-amber-200",
  notYet: "bg-slate-100 text-slate-700 border-slate-200",
};

const BUCKET_EXPLANATION: Record<MatchResult["bucket"], string> = {
  qualify: "Your recorded marks meet the verified requirements currently on file.",
  almostQualify: "You are close. Check the requirements below to see what is missing.",
  notYet: "At least one verified requirement is not met yet. You can still review the pathway.",
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
  const status = resolveEffectiveApplicationWindowStatus(applicationWindow, new Date());
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

  const gapClosers =
    matchResult.bucket === "almostQualify"
      ? matchResult.unmetReasons
          .map((reason) => gapCloserText(reason))
          .filter((text): text is string => text !== null)
      : [];

  return (
    <div className={`stagger-${stagger} animate-rise-in`}>
      <article className={`glass-blur flex flex-col gap-5 rounded-3xl border bg-glass-surface p-5 shadow-sm transition-all hover:shadow-md sm:p-7 ${BUCKET_SPINE[matchResult.bucket]}`}>
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/50 pb-4">
            <span className={`rounded-xl border px-3 py-1 text-xs font-black uppercase tracking-widest shadow-sm ${BUCKET_LABEL_STYLE[matchResult.bucket]}`}>
              {LABELS.resultBuckets[matchResult.bucket]}
            </span>
            <div className="flex items-center gap-3">
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
                  label={`${apsGap} points short`}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h3 className="font-display text-xl font-black leading-tight text-ink">
                <Link href={`/programmes/${programme.id}`} className="transition-colors hover:text-brand-teal hover:underline">
                  {programme.name}
                </Link>
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-ink-soft">
                <span className="rounded-md bg-slate-100 px-2 py-1">{programme.qualificationType}</span>
                <span className="rounded-md bg-slate-100 px-2 py-1">NQF {programme.nqfLevel}</span>
                <span className="rounded-md bg-slate-100 px-2 py-1">{programme.duration}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-ink-soft">
                {academicUnitLabel(faculty, school)}
              </p>
            </div>
            <div className="no-print flex shrink-0 flex-wrap items-center gap-2">
              <label className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 border-line/60 bg-white px-4 py-2 text-sm font-bold text-ink transition-colors hover:border-brand-teal/50 hover:bg-slate-50 focus-within:ring-4 focus-within:ring-brand-teal/20 shadow-sm">
                <input
                  type="checkbox"
                  id={`compare-${programme.id}`}
                  name={`compare-${programme.id}`}
                  checked={isComparing}
                  disabled={!isComparing && compareDisabled}
                  onChange={onToggleCompare}
                  className="h-4 w-4 cursor-pointer accent-brand-teal"
                />
                Compare
              </label>
              {onToggleShortlist && (
                <button
                  type="button"
                  onClick={onToggleShortlist}
                  className={`inline-flex min-h-12 items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all shadow-sm active:scale-95 ${
                    isShortlisted
                      ? "border-brand-teal bg-brand-teal text-white hover:bg-brand-teal/90"
                      : "border-line/60 bg-white text-ink hover:border-brand-teal/50 hover:bg-slate-50"
                  }`}
                >
                  <StarIcon size={ICON_SIZE.sm} filled={isShortlisted} />
                  {isShortlisted ? "Saved" : "Save"}
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-line/40 bg-slate-50 p-4 text-sm font-medium text-ink-soft">
            <p>{BUCKET_EXPLANATION[matchResult.bucket]}</p>
            {matchResult.bucket === "almostQualify" && apsGap !== null && (
              <p className="mt-1.5 font-bold text-amber-600">APS gap: {apsGap} point{apsGap === 1 ? "" : "s"}</p>
            )}
          </div>

          {(programme.campuses?.length > 0 || programme.modeOfDelivery) && (
            <p className="flex items-center gap-2 text-sm font-bold text-ink-soft">
              <MapPinIcon size={ICON_SIZE.md} className="shrink-0 text-brand-teal" />
              {[programme.campuses?.length > 0 ? programme.campuses.join(", ") : null, programme.modeOfDelivery]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          <DeadlineCountdown applicationWindow={applicationWindow} status={status} />
        </header>

        <ul className="flex flex-col gap-3 rounded-2xl border border-line/60 bg-white p-5 text-sm shadow-sm">
          {matchResult.reasons.map((reason, i) => {
            const met = "met" in reason ? reason.met : false;
            return (
              <li key={i} className="flex items-start gap-3">
                <span aria-hidden className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${met ? "bg-emerald-500" : "bg-amber-400"}`}>
                  {met ? <CheckIcon size={ICON_SIZE.xs} /> : <XIcon size={ICON_SIZE.xs} />}
                </span>
                <span className="font-semibold text-ink leading-relaxed">{reasonText(reason)}</span>
              </li>
            );
          })}
          {matchResult.reasons.length === 0 && (
            <li className="font-medium text-ink-soft">No specific requirements on record for this programme.</li>
          )}
        </ul>

        {gapClosers.length > 0 && (
          <div className="flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 shadow-sm">
            <p className="flex items-center gap-2 font-display font-black uppercase tracking-widest text-amber-700 text-xs">
              <span>🎯</span> How to close the gap
            </p>
            <ul className="flex flex-col gap-2">
              {gapClosers.map((text, i) => (
                <li key={i} className="font-medium leading-relaxed">
                  {text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {matchResult.suggestedNextStep && (
          <div className="flex items-start gap-3 rounded-2xl border border-brand-teal/20 bg-brand-teal/5 p-4 text-sm font-medium text-brand-teal shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-teal text-white shadow-sm">
              <LightbulbIcon size={ICON_SIZE.sm} />
            </div>
            <p className="mt-1"><strong>Next step: </strong>{matchResult.suggestedNextStep}</p>
          </div>
        )}

        <ApsBreakdown apsResult={matchResult.apsResult} institutionName={institution.shortName || institution.name} />

        <div className="flex flex-col gap-3 border-t border-line/60 pt-5 sm:flex-row sm:flex-wrap sm:items-center">
          {cta.kind === "apply" && (
            <a
              href={cta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-teal px-6 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 active:scale-95 sm:w-auto"
            >
              <RocketIcon size={ICON_SIZE.sm} />
              {cta.label}
            </a>
          )}
          {cta.kind === "openingSoon" && (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <span className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-100 px-5 text-sm font-bold text-emerald-800 shadow-sm">
                <HourglassIcon size={ICON_SIZE.sm} />
                {cta.label}
              </span>
              <div className="rounded-xl border border-line/40 bg-slate-50 p-3 text-sm font-medium text-ink-soft flex-1">
                <p className="font-bold text-ink">Prepare before applications open</p>
                <p className="mt-1">Use this time to gather documents and check the official page.</p>
              </div>
            </div>
          )}
          {cta.kind === "statusCheck" && (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <span className="inline-flex min-h-12 shrink-0 items-center rounded-xl border border-line bg-slate-100 px-5 text-sm font-bold text-ink-soft shadow-sm">
                {LABELS.applicationStatus.closed}
              </span>
              <div className="rounded-xl border border-line/40 bg-slate-50 p-3 text-sm font-medium text-ink-soft flex-1">
                <p className="font-bold text-ink">This application window is closed</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span>Prepare for the next cycle, or</span>
                  {cta.url && (
                    <a href={cta.url} target="_blank" rel="noopener noreferrer" className="font-bold text-brand-teal hover:underline">
                      {cta.label}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
          {cta.kind === "datesBeingVerified" && (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
               <span className="inline-flex min-h-12 shrink-0 items-center rounded-xl border border-line bg-slate-100 px-5 text-sm font-bold text-ink-soft shadow-sm">
                {cta.label}
              </span>
              <div className="rounded-xl border border-line/40 bg-slate-50 p-3 text-sm font-medium text-ink-soft flex-1">
                <p className="font-bold text-ink">Dates need verification</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span>UCAG is verifying dates. In the meantime,</span>
                  {cta.url && (
                    <a href={cta.url} target="_blank" rel="noopener noreferrer" className="font-bold text-brand-teal hover:underline">
                      visit the institution site.
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-2 overflow-hidden rounded-2xl border border-line/60 bg-white shadow-sm transition-all">
          <details className="group">
            <summary className="flex min-h-14 cursor-pointer items-center justify-between bg-slate-50/50 p-5 font-display text-lg font-bold text-ink focus:outline-none focus:ring-4 focus:ring-brand-teal/20">
              Readiness & Planning
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink-soft shadow-sm transition-transform duration-300 group-open:rotate-180 group-open:bg-brand-teal/10 group-open:text-brand-teal">
                ▼
              </span>
            </summary>

            <div className="border-t border-line/50 p-5 flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-xl border border-brand-teal/20 bg-brand-teal/5 px-3 py-1.5 text-xs font-bold text-brand-teal">
                  <RulerIcon size={ICON_SIZE.sm} className="shrink-0" />
                  <span>{institution.shortName || institution.name} Formula: {matchResult.apsResult.loTreatmentMessage}</span>
                </span>
                {matchResult.apsResult.appliedBonuses.length > 0 && (
                  <span className="inline-flex items-center gap-2 rounded-xl border border-brand-violet/20 bg-brand-violet/5 px-3 py-1.5 text-xs font-bold text-brand-violet">
                    <StarIcon size={ICON_SIZE.sm} filled className="shrink-0" />
                    <span>Bonus: {matchResult.apsResult.appliedBonuses.map((b) => b.description).join(", ")}</span>
                  </span>
                )}
              </div>

              <div className="rounded-2xl border border-brand-teal/20 bg-brand-teal/5 p-5 text-sm font-medium text-ink-soft">
                <p className="font-bold text-ink text-base">Before you apply</p>
                <p className="mt-1.5 leading-relaxed">
                  Have your ID and latest results ready, then check the official programme page for specific required documents.
                </p>
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
            </div>
          </details>
        </div>

        <p className="mt-2 text-xs font-bold text-ink-faint text-center">
          Verified {programme.verifiedOn} ·{" "}
          <a href={programme.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline transition-colors">
            Official Source ↗
          </a>
        </p>
      </article>
    </div>
  );
}