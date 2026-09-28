import Link from "next/link";
import { deriveApplicationWindowStatus, resolveApplicationCta } from "@/lib/applicationStatus";
import { calculateReadiness } from "@/lib/readiness";
import { LABELS } from "@/config/labels";
import { reasonText } from "./reasonText";
import { CircledMark } from "@/components/CircledMark";
import { CheckIcon, HourglassIcon, LightbulbIcon, MapPinIcon, RocketIcon, RulerIcon, StarIcon, XIcon } from "@/components/icons/Icon";
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
  qualify: "border-l-4 border-mark-green",
  almostQualify: "border-l-4 border-mark-gold",
  notYet: "border-l-4 border-slate",
};

const BUCKET_LABEL_STYLE: Record<MatchResult["bucket"], string> = {
  qualify: "bg-mark-green-soft text-mark-green border-mark-green/30",
  almostQualify: "bg-mark-gold-soft text-mark-gold border-mark-gold/30",
  notYet: "bg-slate-soft text-ink-soft border-line",
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
      <article className={`flex flex-col gap-4 rounded-2xl border border-line bg-paper-raised p-4 shadow-sm transition-all hover:shadow-md sm:p-5 ${BUCKET_SPINE[matchResult.bucket]}`}>
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
              <label className="min-h-11 flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink-soft cursor-pointer hover:bg-slate-soft shadow-2xs">
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
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 shadow-2xs ${
                    isShortlisted
                      ? "border-mark-red bg-mark-red text-white"
                      : "border-line bg-paper text-ink-soft hover:bg-slate-soft hover:text-ink"
                  }`}
                >
                  <StarIcon size={13} filled={isShortlisted} />
                  {isShortlisted ? "Shortlisted" : "Shortlist"}
                </button>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-slate-soft p-3 text-sm text-ink-soft border border-line/60">
            <p className="font-semibold text-ink">{BUCKET_EXPLANATION[matchResult.bucket]}</p>
            {matchResult.bucket === "almostQualify" && apsGap !== null && (
              <p className="mt-1 font-bold text-mark-gold">APS gap: {apsGap} point{apsGap === 1 ? "" : "s"}</p>
            )}
          </div>

          {(programme.campuses?.length > 0 || programme.modeOfDelivery) && (
            <p className="flex items-center gap-1.5 text-xs text-ink-faint font-medium">
              <MapPinIcon size={13} className="shrink-0" />
              {[programme.campuses?.length > 0 ? programme.campuses.join(", ") : null, programme.modeOfDelivery]
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
                <span aria-hidden className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white ${met ? "bg-mark-green" : "bg-mark-gold"}`}>
                  {met ? <CheckIcon size={11} /> : <XIcon size={11} />}
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
          <p className="flex items-start gap-1.5 rounded-xl bg-mark-gold-soft p-3 text-xs text-mark-gold border border-mark-gold/30 font-medium">
            <LightbulbIcon size={14} className="mt-0.5 shrink-0" />
            <span><strong>Next step: </strong>{matchResult.suggestedNextStep}</span>
          </p>
        )}

        <div className="flex flex-col gap-2 border-t border-line pt-3 text-xs sm:flex-row sm:flex-wrap sm:items-center">
          {cta.kind === "apply" && (
            <a
              href={cta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-brand-teal sm:w-auto px-4 font-bold text-white transition-all hover:opacity-90 shadow-sm active:scale-95"
            >
              <RocketIcon size={14} />
              {cta.label}
            </a>
          )}
          {cta.kind === "openingSoon" && (
            <>
              <div className="w-full rounded-xl bg-mark-green-soft p-3 text-xs text-mark-green border border-mark-green/30">
                <p className="font-bold">Prepare before applications open</p>
                <p className="mt-1">Use this time to prepare your documents and check the official programme page.</p>
              </div>
              <span className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-mark-green-soft px-3.5 font-bold text-mark-green border border-mark-green/30">
                <HourglassIcon size={13} />
                {cta.label}
              </span>
            </>
          )}
          {cta.kind === "statusCheck" && (
            <>
              <div className="w-full rounded-xl bg-slate-soft p-3 text-xs text-ink-soft border border-line">
                <p className="font-bold">This application window is closed</p>
                <p className="mt-1">You can still review the programme and prepare for the next application cycle.</p>
              </div>
              <span className="inline-flex min-h-10 items-center rounded-xl bg-paper-overlay px-3.5 font-semibold text-ink-soft">
                {LABELS.applicationStatus.closed}
              </span>
              {cta.url && (
                <a
                  href={cta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center px-2 text-brand-teal font-bold hover:underline"
                >
                  {cta.label}
                </a>
              )}
            </>
          )}
          {cta.kind === "datesBeingVerified" && (
            <>
              <div className="w-full rounded-xl bg-slate-soft p-3 text-xs text-ink-soft border border-line">
                <p className="font-bold">Dates need verification</p>
                <p className="mt-1">UCAG has not verified this application window yet. Use the official institution site for the current deadline.</p>
              </div>
              <span className="inline-flex min-h-10 items-center rounded-xl bg-paper-overlay px-3.5 font-semibold text-ink-soft">
                {cta.label}
              </span>
              {cta.url && (
                <a
                  href={cta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center px-2 text-brand-teal font-bold hover:underline"
                >
                  Visit institution site
                </a>
              )}
            </>
          )}
        </div>

        <details className="no-print rounded-xl border border-line/60 bg-paper p-3.5 text-xs">
          <summary className="cursor-pointer min-h-11 flex items-center font-bold text-ink">
            Readiness & planning
          </summary>

          <div className="mt-3 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-teal-soft px-2.5 py-1 font-semibold text-brand-teal border border-brand-teal/30 text-2xs">
                <RulerIcon size={12} className="shrink-0" />
                <span>{institution.shortName || institution.name} Formula:</span>
                <span>{matchResult.apsResult.loTreatmentMessage}</span>
              </span>
              {matchResult.apsResult.appliedBonuses.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-violet-soft px-2.5 py-1 font-semibold text-brand-violet border border-brand-violet/30 text-2xs">
                  <StarIcon size={12} filled className="shrink-0" />
                  <span>Bonus:</span>
                  <span>{matchResult.apsResult.appliedBonuses.map((b) => b.description).join(", ")}</span>
                </span>
              )}
            </div>

            <div className="rounded-xl border border-brand-teal/30 bg-brand-teal-soft/70 p-3 text-ink">
              <p className="font-bold">Before you apply</p>
              <p className="mt-1 leading-relaxed">
                General preparation: have your ID and latest results ready, then check the official programme page for any documents or steps this institution requires.
              </p>
              <p className="mt-1 text-2xs font-medium text-brand-teal">UCAG guidance only — this is not the institution&apos;s official document list.</p>
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
