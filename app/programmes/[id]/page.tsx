import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveApplicationCta, deriveApplicationWindowStatus } from "@/lib/applicationStatus";
import { LABELS } from "@/config/labels";
import { getRealProgrammeDetail } from "@/lib/catalog/getRealProgrammeDetail";

/**
 * Server-rendered programme detail page (docs/MASTER_PROMPT_v2.md Phase
 * 9: "server-rendered programme pages, structured data, sitemap --
 * learners find this through search"). Backed by real Firestore data
 * (lib/catalog/getRealProgrammeDetail.ts) -- config/sampleData.ts's
 * fictional SAMPLE_PROGRAMMES is gone from this page entirely. Not
 * statically generated at build time (no generateStaticParams): the
 * verified catalogue grows independently of deploys, and a hardcoded id
 * list would 404 every real programme added after the last build.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const detail = await getRealProgrammeDetail(id);
  if (!detail) return { title: `Programme not found -- ${LABELS.app.name}` };

  const { programme, institution } = detail;
  return {
    title: `${programme.name} -- ${institution.name} -- ${LABELS.app.name}`,
    description: `${programme.qualificationType} at ${institution.name}, ${programme.duration}. Check your APS against this programme's requirements on ${LABELS.app.name}.`,
  };
}

export default async function ProgrammePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getRealProgrammeDetail(id);
  if (!detail) notFound();

  const { programme, institution, faculty, school, applicationWindow } = detail;
  // lib/ingestion/schemas/programmeRequirements.ts deliberately only
  // extracts the fields that drive APS matching -- campuses/
  // modeOfDelivery/careerOutcomes are real Programme fields with no
  // extraction/queue path to ever populate them, so a real approved
  // programme document simply won't have them. Guard here rather than
  // trust the type (which says these are always arrays/strings) --
  // Programme.campuses.length crashed the page outright on the first
  // real programme before this fix.
  const campuses = programme.campuses ?? [];
  const careerOutcomes = programme.careerOutcomes ?? [];
  const status = applicationWindow?.status ?? deriveApplicationWindowStatus(
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
    description: careerOutcomes.length
      ? `Prepares graduates for: ${careerOutcomes.join(", ")}.`
      : undefined,
    provider: {
      "@type": "CollegeOrUniversity",
      name: institution.name,
      url: institution.websiteUrl,
    },
    educationalProgramMode: programme.modeOfDelivery ?? undefined,
    programType: programme.qualificationType,
    timeToComplete: programme.duration,
    occupationalCategory: careerOutcomes,
  };

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center gap-6 p-6 sm:p-8">
      <script
        type="application/ld+json"
        // Built entirely from our own verified Firestore data above, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="flex w-full max-w-xl flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {programme.name}
          </h1>
          <p className="text-sm text-ink-soft">
            {programme.qualificationType}
            {programme.nqfLevel !== null ? ` · NQF ${programme.nqfLevel}` : ""}
            {programme.duration ? ` · ${programme.duration}` : ""}
          </p>
          <p className="text-sm text-ink-soft">
            {faculty.name} &middot; {school.name} &middot; {institution.name}
          </p>
          {(campuses.length > 0 || programme.modeOfDelivery) && (
            <p className="text-sm text-ink-faint">
              {[campuses.length > 0 ? campuses.join(", ") : null, programme.modeOfDelivery]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
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

        {careerOutcomes.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold tracking-tight text-ink">Career outcomes</h2>
            <ul className="list-inside list-disc text-sm text-ink-soft">
              {careerOutcomes.map((outcome, i) => (
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
