import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveApplicationCta, deriveApplicationWindowStatus } from "@/lib/applicationStatus";
import { LABELS } from "@/config/labels";
import { getRealProgrammeDetail } from "@/lib/catalog/getRealProgrammeDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const detail = await getRealProgrammeDetail(id);
  if (!detail) return { title: `Programme not found -- ${LABELS.app.name}`, robots: { index: false } };

  const { programme, institution } = detail;
  return {
    title: `${programme.name} -- ${institution.name} -- ${LABELS.app.name}`,
    description: `${programme.qualificationType} at ${institution.name}, ${programme.duration}. Check your APS against this programme's requirements on ${LABELS.app.name}.`,
    alternates: { canonical: `/programmes/${id}` },
  };
}

export default async function ProgrammePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getRealProgrammeDetail(id);
  if (!detail) notFound();

  const { programme, institution, faculty, school, applicationWindow } = detail;
  const campuses = programme.campuses ?? [];
  const careerOutcomes = programme.careerOutcomes ?? [];
  const status = applicationWindow?.status ?? deriveApplicationWindowStatus(
    { opensOn: applicationWindow?.opensOn ?? null, closesOn: applicationWindow?.closesOn ?? null, lateClosesOn: applicationWindow?.lateClosesOn ?? null },
    new Date()
  );
  const cta = resolveApplicationCta(
    status,
    { applyUrl: programme.applyUrl, statusCheckUrl: institution.statusCheckUrl, websiteUrl: institution.websiteUrl },
    applicationWindow?.opensOn ?? null
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: programme.name,
    description: careerOutcomes.length ? `Prepares graduates for: ${careerOutcomes.join(", ")}.` : undefined,
    provider: { "@type": "CollegeOrUniversity", name: institution.name, url: institution.websiteUrl },
    educationalProgramMode: programme.modeOfDelivery ?? undefined,
    programType: programme.qualificationType,
    timeToComplete: programme.duration,
    occupationalCategory: careerOutcomes,
  };

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-6 sm:p-8">
        <Link href="/programmes" className="inline-flex min-h-11 w-fit items-center text-sm font-semibold text-brand-teal hover:underline focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2">
          ← Back to programme explorer
        </Link>

        <article className="card-learner overflow-hidden rounded-2xl border border-line">
          <header className="bg-brand-navy p-5 text-white sm:p-7">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{programme.qualificationType}</span>
              {programme.nqfLevel !== null && <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">NQF {programme.nqfLevel}</span>}
              {programme.duration && <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{programme.duration}</span>}
            </div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">{programme.name}</h1>
            <p className="mt-2 text-sm text-white/80">{institution.name} · {faculty.name} · {school.name}</p>
            {(campuses.length > 0 || programme.modeOfDelivery) && (
              <p className="mt-2 text-xs text-white/70">{[campuses.length ? campuses.join(", ") : null, programme.modeOfDelivery].filter(Boolean).join(" · ")}</p>
            )}
          </header>

          <div className="flex flex-col gap-5 p-5 sm:p-7">
            <section aria-labelledby="requirements-heading" className="rounded-2xl border border-line bg-paper p-4 sm:p-5">
              <div className="flex flex-col gap-1">
                <h2 id="requirements-heading" className="text-lg font-bold text-ink">What you need</h2>
                <p className="text-sm text-ink-soft">These are the verified requirements currently recorded for this programme.</p>
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {programme.minAps !== null && (
                  <li className="rounded-xl border border-line bg-paper-raised p-3 text-sm text-ink">
                    <span className="block text-xs font-semibold uppercase tracking-wide text-ink-faint">Minimum APS</span>
                    <span className="mt-1 block text-2xl font-extrabold text-brand-teal">{programme.minAps}</span>
                  </li>
                )}
                {programme.subjectRequirements.map((req) => (
                  <li key={req.subjectCode} className="rounded-xl border border-line bg-paper-raised p-3 text-sm text-ink">
                    <span className="block font-bold">{req.subjectCode}</span>
                    <span className="text-ink-soft">
                      {req.minLevel !== undefined ? `Level ${req.minLevel}+` : ""}
                      {req.minLevel !== undefined && req.minPercent !== undefined ? " · " : ""}
                      {req.minPercent !== undefined ? `${req.minPercent}%+` : ""}
                    </span>
                  </li>
                ))}
                {programme.additionalRequirements.map((req, i) => (
                  <li key={i} className="rounded-xl border border-line bg-paper-raised p-3 text-sm text-ink">{req}</li>
                ))}
              </ul>
              {programme.minAps === null && programme.subjectRequirements.length === 0 && programme.additionalRequirements.length === 0 && (
                <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">No verified entry requirements are currently recorded. Check the official source before applying.</p>
              )}
            </section>

            <section aria-labelledby="apply-heading" className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 sm:p-5">
              <h2 id="apply-heading" className="text-lg font-bold text-teal-950">Application</h2>
              <p className="mt-1 text-sm leading-relaxed text-teal-950/80">
                {cta.kind === "apply" ? "Applications can be started through the official application link below." :
                  cta.kind === "openingSoon" ? "Applications are not open yet. Use this time to prepare and confirm the official requirements." :
                  cta.kind === "statusCheck" ? "This application window is closed. Review the programme and prepare for the next cycle." :
                  "Application dates are still being verified. Use the official institution site for the current information."}
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                {cta.kind === "apply" && (
                  <a href={cta.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-teal px-5 text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2">
                    {cta.label} ↗
                  </a>
                )}
                {cta.kind === "openingSoon" && <span className="inline-flex min-h-11 items-center rounded-xl border border-emerald-300 bg-emerald-100 px-4 text-sm font-bold text-emerald-800">{cta.label}</span>}
                {(cta.kind === "statusCheck" || cta.kind === "datesBeingVerified") && (
                  <>
                    <span className="inline-flex min-h-11 items-center rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700">{cta.label}</span>
                    {cta.url && <a href={cta.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center px-2 text-sm font-bold text-brand-teal hover:underline">Visit official site ↗</a>}
                  </>
                )}
              </div>
            </section>

            {careerOutcomes.length > 0 && (
              <section aria-labelledby="careers-heading">
                <h2 id="careers-heading" className="text-lg font-bold text-ink">Possible career directions</h2>
                <p className="mt-1 text-xs text-ink-faint">These are recorded programme outcomes, not a prediction of your career.</p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {careerOutcomes.map((outcome, i) => <li key={i} className="rounded-xl border border-line bg-paper-raised p-3 text-sm text-ink">{outcome}</li>)}
                </ul>
              </section>
            )}

            <section className="border-t border-line pt-4">
              <p className="text-xs leading-relaxed text-ink-faint">
                Verified {programme.verifiedOn} ·{" "}
                <a href={programme.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-ink">Official source ↗</a>
              </p>
            </section>

            <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line px-4 text-sm font-bold text-ink hover:border-brand-teal hover:text-brand-teal">
              Check my APS for this programme →
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
