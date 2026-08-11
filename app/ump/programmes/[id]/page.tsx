import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LABELS } from "@/config/labels";
import { getRealProgrammeDetail } from "@/lib/catalog/getRealProgrammeDetail";
import { deriveApplicationWindowStatus, resolveApplicationCta } from "@/lib/applicationStatus";

/**
 * UMP-specific programme detail page (app/ump/programmes/[id]/page.tsx).
 *
 * Distinct from app/programmes/[id]/page.tsx:
 *  - Uses the UMP-branded nav context (breadcrumb back to /ump/programmes).
 *  - Shows the UMP Application Checklist inline.
 *  - Has a "Check my APS" deeplink that pre-selects UMP in the calculator.
 *
 * Both pages share the same getRealProgrammeDetail() data layer and the
 * same isFactVerified() provenance gate -- no separate fetch needed.
 */
export const dynamic = "force-dynamic";

const QUALIFICATION_LABELS: Record<string, string> = {
  higherCertificate: "Higher Certificate",
  diploma: "Diploma",
  advancedDiploma: "Advanced Diploma",
  bachelorsDegree: "Bachelor's Degree",
  bachelorsDegreeExtended: "Bachelor's Degree (Extended)",
  postgraduateDiploma: "Postgraduate Diploma",
  honoursDegree: "Honours Degree",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const detail = await getRealProgrammeDetail(id);
  if (!detail) return { title: `Programme not found -- ${LABELS.app.name}` };

  const { programme } = detail;
  return {
    title: `${programme.name} -- UMP -- ${LABELS.app.name}`,
    description: `${QUALIFICATION_LABELS[programme.qualificationType] ?? programme.qualificationType} at the University of Mpumalanga. ${programme.duration}. Minimum APS: ${programme.minAps ?? "see requirements"}.`,
  };
}

export default async function UmpProgrammeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getRealProgrammeDetail(id);
  if (!detail) notFound();

  const { programme, institution, faculty, school, applicationWindow } = detail;

  // Guard against sparse real docs (same pattern as app/programmes/[id]/page.tsx).
  const campuses = programme.campuses ?? [];
  const careerOutcomes = programme.careerOutcomes ?? [];
  const additionalRequirements = programme.additionalRequirements ?? [];

  const status =
    applicationWindow?.status ??
    deriveApplicationWindowStatus(
      {
        opensOn: applicationWindow?.opensOn ?? null,
        closesOn: applicationWindow?.closesOn ?? null,
        lateClosesOn: applicationWindow?.lateClosesOn ?? null,
      },
      new Date()
    );

  const cta = resolveApplicationCta(
    status,
    {
      applyUrl: programme.applyUrl,
      statusCheckUrl: institution.statusCheckUrl,
      websiteUrl: institution.websiteUrl,
    },
    applicationWindow?.opensOn ?? null
  );

  // JSON-LD structured data for rich search results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: programme.name,
    description: careerOutcomes.length
      ? `Prepares graduates for: ${careerOutcomes.join(", ")}.`
      : undefined,
    provider: {
      "@type": "CollegeOrUniversity",
      name: institution.name,
      url: institution.websiteUrl,
    },
    educationalProgramMode: programme.modeOfDelivery ?? undefined,
    programType: QUALIFICATION_LABELS[programme.qualificationType] ?? programme.qualificationType,
    timeToComplete: programme.duration,
    occupationalCategory: careerOutcomes,
  };

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── UMP Hero band ── */}
      <div className="hero-atmosphere w-full border-b border-white/10 py-8 shadow-md">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-6 sm:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-teal-200/80">
            <Link href="/ump" className="hover:text-white hover:underline">UMP Hub</Link>
            <span>›</span>
            <Link href="/ump/programmes" className="hover:text-white hover:underline">Programmes</Link>
            <span>›</span>
            <span className="text-white/70">{programme.name}</span>
          </nav>

          <h1 className="animate-rise-in text-2xl font-extrabold tracking-tight text-white sm:text-3xl leading-tight">
            {programme.name}
          </h1>
          <p className="text-sm text-teal-100/90">
            {QUALIFICATION_LABELS[programme.qualificationType] ?? programme.qualificationType}
            {programme.nqfLevel ? ` · NQF ${programme.nqfLevel}` : ""}
            {programme.duration ? ` · ${programme.duration}` : ""}
          </p>
          <p className="text-xs text-teal-100/70">
            {faculty.name} &middot; {school.name} &middot; {institution.name}
          </p>

          {/* Application status pill */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {status === "open" && (
              <span className="rounded-full bg-mark-green/20 px-3 py-1 text-xs font-bold text-green-200 border border-green-400/30">
                ✅ Applications open
              </span>
            )}
            {status === "openingSoon" && (
              <span className="rounded-full bg-mark-gold/20 px-3 py-1 text-xs font-bold text-amber-200 border border-amber-400/30">
                🕐 Opening soon
              </span>
            )}
            {(status === "closed" || status === "unknown") && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/60 border border-white/20">
                Dates being verified
              </span>
            )}
            {cta.kind === "apply" && (
              <a
                href={cta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-brand-teal px-4 py-1.5 text-xs font-bold text-white shadow transition hover:opacity-90"
              >
                {cta.label} ↗
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 sm:p-8">

        {/* ── Entry requirements ── */}
        <section aria-labelledby="ump-entry-heading" className="card-learner rounded-2xl p-6">
          <h2 id="ump-entry-heading" className="mb-4 text-lg font-bold tracking-tight text-ink">
            Entry Requirements
          </h2>

          {programme.minAps !== null && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-xl bg-brand-teal/10 px-4 py-2 border border-brand-teal/20">
              <span className="text-3xl font-extrabold tabular-nums text-brand-teal">
                {programme.minAps}
              </span>
              <span className="text-sm font-medium text-ink-soft">Minimum APS</span>
            </div>
          )}

          {programme.subjectRequirements.length > 0 && (
            <div className="mt-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Subject Requirements
              </h3>
              <ul className="flex flex-col gap-1.5">
                {programme.subjectRequirements.map((req) => (
                  <li key={req.subjectCode} className="flex items-center gap-2 text-sm text-ink">
                    <span className="size-1.5 flex-none rounded-full bg-brand-teal" />
                    <span className="font-medium">{req.subjectCode}</span>
                    {req.minLevel !== undefined && (
                      <span className="text-ink-faint">
                        — minimum level{" "}
                        <span className="font-mono font-bold text-ink">{req.minLevel}</span>
                      </span>
                    )}
                    {req.minPercent !== undefined && (
                      <span className="text-ink-faint">
                        — minimum{" "}
                        <span className="font-mono font-bold text-ink">{req.minPercent}%</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {additionalRequirements.length > 0 && (
            <div className="mt-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Additional Requirements
              </h3>
              <ul className="flex flex-col gap-1 text-sm text-ink-soft">
                {additionalRequirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 size-1 flex-none rounded-full bg-ink-faint" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* APS calculator CTA */}
          <div className="mt-5 border-t border-line pt-4">
            <p className="text-xs text-ink-faint mb-2">
              Enter your subject marks to check if you qualify for this programme.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand-navy-soft"
            >
              🎓 Check my APS →
            </Link>
          </div>
        </section>

        {/* ── Career outcomes ── */}
        {careerOutcomes.length > 0 && (
          <section aria-labelledby="ump-careers-heading" className="card-learner rounded-2xl p-6">
            <h2 id="ump-careers-heading" className="mb-3 text-lg font-bold tracking-tight text-ink">
              Career Outcomes
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {careerOutcomes.map((outcome, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-ink-soft">
                  <span className="text-brand-teal">›</span>
                  {outcome}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Logistics ── */}
        {(campuses.length > 0 || programme.modeOfDelivery) && (
          <section aria-labelledby="ump-logistics-heading" className="card-learner rounded-2xl p-6">
            <h2 id="ump-logistics-heading" className="mb-3 text-lg font-bold tracking-tight text-ink">
              Study Details
            </h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {campuses.length > 0 && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-0.5">
                    Campus
                  </dt>
                  <dd className="text-ink">{campuses.join(", ")}</dd>
                </div>
              )}
              {programme.modeOfDelivery && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-0.5">
                    Mode
                  </dt>
                  <dd className="text-ink capitalize">{programme.modeOfDelivery}</dd>
                </div>
              )}
              {programme.duration && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-0.5">
                    Duration
                  </dt>
                  <dd className="text-ink">{programme.duration}</dd>
                </div>
              )}
              {programme.nqfLevel && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-0.5">
                    NQF Level
                  </dt>
                  <dd className="text-ink">{programme.nqfLevel}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {/* ── Application window detail ── */}
        {applicationWindow && (
          <section aria-labelledby="ump-appwindow-heading" className="card-learner rounded-2xl p-5">
            <h2 id="ump-appwindow-heading" className="mb-3 text-base font-bold tracking-tight text-ink">
              Application Window
            </h2>
            <div className="flex flex-wrap gap-4 text-sm">
              {applicationWindow.opensOn && (
                <div>
                  <span className="text-ink-faint">Opens: </span>
                  <span className="font-medium text-ink">
                    {new Date(applicationWindow.opensOn).toLocaleDateString("en-ZA", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              {applicationWindow.closesOn && (
                <div>
                  <span className="text-ink-faint">Closes: </span>
                  <span className="font-medium text-ink">
                    {new Date(applicationWindow.closesOn).toLocaleDateString("en-ZA", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Funding shortcut ── */}
        <div className="rounded-2xl border border-brand-amber/30 bg-brand-amber/5 p-5">
          <p className="text-sm font-semibold text-ink mb-1">💰 Need funding?</p>
          <p className="text-xs text-ink-soft mb-3">
            Explore NSFAS, UMP merit bursaries, and Mpumalanga provincial funding options.
          </p>
          <Link
            href="/ump/funding"
            className="text-xs font-bold text-brand-amber hover:underline"
          >
            View UMP Funding Options →
          </Link>
        </div>

        {/* ── Provenance footer ── */}
        <p className="font-mono text-xs tabular-nums text-ink-faint">
          Verified {programme.verifiedOn} ·{" "}
          <a
            href={programme.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Source
          </a>
        </p>

        <Link
          href="/ump/programmes"
          className="text-sm font-medium text-brand-teal hover:underline"
        >
          ← Back to all UMP programmes
        </Link>
      </div>
    </main>
  );
}
