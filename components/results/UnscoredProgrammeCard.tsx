import Link from "next/link";
import { LABELS } from "@/config/labels";
import type { Faculty, Institution, Programme, School } from "@/lib/firestore/types";

interface UnscoredProgrammeCardProps {
  programme: Programme;
  institution: Institution;
  faculty: Faculty;
  school: School;
  staggerIndex?: number;
}

/**
 * A real, verified, sourced programme -- name, minAps, subject
 * requirements, all confirmed against the institution's own page -- shown
 * WITHOUT a computed qualify/almost/not-yet verdict, because no verified
 * ApsRule (lib/firestore/types.ts) exists yet for this institution. See
 * components/results/ResultsSection.tsx for why that's a hard line, not a
 * shortcut: matchProgramme() converts a learner's raw percentages into
 * APS points using the institution's own formula (how many subjects
 * count, how Life Orientation is treated, etc.) -- without a verified
 * formula there is no honest number to compute, only a guess wearing the
 * same UI as a fact. This card is the deliberate alternative to that
 * guess: show everything that IS verified, say plainly what isn't yet.
 */
export function UnscoredProgrammeCard({
  programme,
  institution,
  faculty,
  school,
  staggerIndex = 0,
}: UnscoredProgrammeCardProps) {
  const stagger = Math.min(staggerIndex + 1, 6);
  return (
    <article className={`stagger-${stagger} animate-pop-in flex flex-col gap-4 rounded-[32px] border border-line bg-paper-raised p-5 shadow-sm transition-transform duration-200 hover-fine:-translate-y-1 hover-fine:shadow-[0_26px_72px_-40px_rgba(17,72,88,0.18)]`}>
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-coral-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-coral">
            {LABELS.verification.apsRulesBeingVerified}
          </span>
          <span className="rounded-full bg-slate-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate">
            Verified programme
          </span>
        </div>
        <h3 className="text-lg font-semibold text-ink">
          <Link href={`/programmes/${programme.id}`} className="hover:underline">
            {programme.name}
          </Link>
        </h3>
        <p className="text-sm text-ink-soft">
          {institution.name} · {faculty.name} · {school.name}
        </p>
      </header>

      <ul className="flex flex-col gap-1 text-sm text-ink">
        {programme.minAps !== null && <li>Minimum APS: {programme.minAps}</li>}
        {programme.subjectRequirements.map((req, i) => (
          <li key={i}>
            {req.subjectCode}
            {req.minLevel !== undefined ? ` -- level ${req.minLevel}` : ""}
            {req.minPercent !== undefined ? ` -- ${req.minPercent}%` : ""}
          </li>
        ))}
        {programme.additionalRequirements.map((req, i) => (
          <li key={`extra-${i}`} className="text-ink-soft">
            {req}
          </li>
        ))}
      </ul>

      <p className="rounded bg-slate-soft p-2 text-sm text-ink-soft">
        We can&apos;t yet calculate your personal APS score for {institution.shortName} -- their exact APS
        formula (how many subjects count, how Life Orientation is weighted) hasn&apos;t been confirmed
        against an official source yet. The requirements above are real and verified; the score comparison
        is what&apos;s still pending.
      </p>

      <p className="text-xs font-mono tabular-nums text-ink-faint">
        Verified {programme.verifiedOn} ·{" "}
        <a href={programme.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
          Source
        </a>
      </p>
    </article>
  );
}
