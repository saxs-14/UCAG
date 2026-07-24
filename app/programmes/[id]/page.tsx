import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveApplicationCta } from "@/lib/applicationStatus";
import { LABELS } from "@/config/labels";
import {
  SAMPLE_APPLICATION_WINDOWS,
  SAMPLE_FACULTY,
  SAMPLE_INSTITUTION,
  SAMPLE_PROGRAMMES,
  SAMPLE_SCHOOL,
} from "@/config/sampleData";
import type { Programme } from "@/lib/firestore/types";

/**
 * Server-rendered programme detail page (docs/MASTER_PROMPT_v2.md Phase
 * 9: "server-rendered programme pages, structured data, sitemap --
 * learners find this through search"). Backed by SAMPLE_PROGRAMMES only
 * -- config/sampleData.ts, explicitly fictional -- since no real,
 * verified programme catalogue exists yet (Phase 4 ingestion isn't
 * connected to a live Firestore project). The page structure (route
 * shape, metadata, JSON-LD) is real and ready for real data; only the
 * data source is a placeholder, flagged on the page itself.
 */

function findProgramme(id: string): Programme | undefined {
  return SAMPLE_PROGRAMMES.find((p) => p.id === id);
}

export function generateStaticParams() {
  return SAMPLE_PROGRAMMES.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const programme = findProgramme(id);
  if (!programme) return { title: `Programme not found -- ${LABELS.app.name}` };

  return {
    title: `${programme.name} -- ${SAMPLE_INSTITUTION.name} -- ${LABELS.app.name}`,
    description: `${programme.qualificationType} at ${SAMPLE_INSTITUTION.name}, NQF ${programme.nqfLevel}, ${programme.duration}. Check your APS against this programme's requirements on ${LABELS.app.name}.`,
  };
}

export default async function ProgrammePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const programme = findProgramme(id);
  if (!programme) notFound();

  const applicationWindow = SAMPLE_APPLICATION_WINDOWS.find((w) => w.programmeId === programme.id);
  const status = applicationWindow?.status ?? "unknown";
  const cta = resolveApplicationCta(
    status,
    {
      applyUrl: programme.applyUrl,
      statusCheckUrl: SAMPLE_INSTITUTION.statusCheckUrl,
      websiteUrl: SAMPLE_INSTITUTION.websiteUrl,
    },
    applicationWindow?.opensOn ?? null
  );

  // schema.org EducationalOccupationalProgram -- the type built for
  // exactly this (a degree/certificate program with entry requirements
  // and occupational outcomes), so search engines can render this as a
  // rich result. sourceUrl/verifiedOn are attached as-is; a program page
  // is a fact-bearing page like any other, subject to the same
  // provenance rule (CLAUDE.md).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: programme.name,
    description: programme.careerOutcomes.length
      ? `Prepares graduates for: ${programme.careerOutcomes.join(", ")}.`
      : undefined,
    provider: {
      "@type": "CollegeOrUniversity",
      name: SAMPLE_INSTITUTION.name,
      url: SAMPLE_INSTITUTION.websiteUrl,
    },
    educationalProgramMode: programme.modeOfDelivery,
    programType: programme.qualificationType,
    timeToComplete: programme.duration,
    occupationalCategory: programme.careerOutcomes,
  };

  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center gap-6 p-6 sm:p-8">
      <script
        type="application/ld+json"
        // Static JSON built entirely from our own sample data above, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="flex w-full max-w-xl flex-col gap-4">
        <div className="rounded border border-dashed border-mark-gold bg-mark-gold-soft p-3 text-sm text-ink">
          This programme is <strong>sample/fictional data</strong>, not a real institution or
          qualification -- see config/sampleData.ts. Real, verified programme pages land once
          Phase 4 ingestion is connected to a live Firestore project.
        </div>

        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {programme.name}
          </h1>
          <p className="text-sm text-ink-soft">
            {programme.qualificationType} &middot; NQF {programme.nqfLevel} &middot;{" "}
            {programme.duration}
          </p>
          <p className="text-sm text-ink-soft">
            {SAMPLE_FACULTY.name} &middot; {SAMPLE_SCHOOL.name} &middot; {SAMPLE_INSTITUTION.name}
          </p>
          <p className="text-sm text-ink-faint">
            {programme.campuses.join(", ")} &middot; {programme.modeOfDelivery}
          </p>
        </header>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold tracking-tight text-ink">Entry requirements</h2>
          <ul className="flex flex-col gap-1 text-sm text-ink">
            {programme.minAps !== null && (
              <li>
                Minimum APS:{" "}
                <span className="font-mono tabular-nums">{programme.minAps}</span>
              </li>
            )}
            {programme.subjectRequirements.map((req) => (
              <li key={req.subjectCode}>
                {req.subjectCode}
                {req.minLevel !== undefined && (
                  <>
                    {" "}
                    &mdash; level <span className="font-mono tabular-nums">{req.minLevel}</span>+
                  </>
                )}
                {req.minPercent !== undefined && (
                  <>
                    {" "}
                    &mdash; <span className="font-mono tabular-nums">{req.minPercent}</span>%+
                  </>
                )}
              </li>
            ))}
            {programme.additionalRequirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </section>

        {programme.careerOutcomes.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold tracking-tight text-ink">Career outcomes</h2>
            <ul className="list-inside list-disc text-sm text-ink-soft">
              {programme.careerOutcomes.map((outcome, i) => (
                <li key={i}>{outcome}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="flex flex-wrap items-center gap-3 border-t border-line pt-3 text-sm">
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
          {(cta.kind === "statusCheck" || cta.kind === "datesBeingVerified") && (
            <>
              <span className="rounded bg-slate-soft px-3 py-1.5 font-medium text-ink-soft">
                {cta.label}
              </span>
              {cta.url && (
                <a
                  href={cta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mark-green hover:underline"
                >
                  Visit institution site
                </a>
              )}
            </>
          )}
        </section>

        <p className="font-mono text-xs tabular-nums text-ink-faint">
          Verified {programme.verifiedOn} &middot;{" "}
          <a href={programme.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
            Source
          </a>
        </p>

        <Link href="/" className="text-sm font-medium text-mark-green hover:underline">
          &larr; Back to the calculator
        </Link>
      </article>
    </main>
  );
}
