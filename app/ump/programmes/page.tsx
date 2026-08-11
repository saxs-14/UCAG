import type { Metadata } from "next";
import Link from "next/link";
import { LABELS } from "@/config/labels";
import { fetchUmpData } from "@/lib/catalog/getUmpData";
import { PageHero } from "@/components/PageHero";
import type { FieldTag } from "@/lib/firestore/types";

export const metadata: Metadata = {
  title: `${LABELS.ump.programmesPageTitle} -- ${LABELS.app.name}`,
  description: LABELS.ump.programmesPageSubtitle,
};

// Live Firestore data -- always current, never a stale build snapshot.
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

const FIELD_LABELS: Record<string, string> = {
  technology: "Technology & Computing",
  science: "Science & Agriculture",
  business: "Business & Economics",
  people: "Education & Social",
  creative: "Creative Arts",
  practical: "Practical & Vocational",
};

interface PageProps {
  searchParams: Promise<{ faculty?: string; qualification?: string; field?: string }>;
}

export default async function UmpProgrammesPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const { faculties, programmes } = await fetchUmpData();

  // ── Apply URL-param filters ──────────────────────────────────────────────
  const filtered = programmes.filter((p) => {
    if (filters.faculty && p.facultyId !== filters.faculty) return false;
    if (
      filters.qualification &&
      p.qualificationType !== filters.qualification
    )
      return false;
    if (
      filters.field &&
      !(p.fieldTags ?? []).includes(filters.field as FieldTag)
    )
      return false;
    return true;
  });

  // Derive unique filter option sets from the full unfiltered programme list.
  const qualificationTypes = [
    ...new Set(programmes.map((p) => p.qualificationType)),
  ];
  const fieldTags = [...new Set(programmes.flatMap((p) => p.fieldTags ?? []))];

  // Helpers to build filter hrefs without clobbering sibling params.
  function filterHref(key: string, value: string | null) {
    const params = new URLSearchParams();
    if (filters.faculty) params.set("faculty", filters.faculty);
    if (filters.qualification) params.set("qualification", filters.qualification);
    if (filters.field) params.set("field", filters.field);
    if (value === null) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    return `/ump/programmes${qs ? `?${qs}` : ""}`;
  }

  const activeFaculty = faculties.find((f) => f.id === filters.faculty);

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <PageHero
        title={LABELS.ump.programmesPageTitle}
        subtitle={LABELS.ump.programmesPageSubtitle}
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">
        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-faint">
          <Link href="/ump" className="hover:text-brand-teal hover:underline">
            UMP Hub
          </Link>
          <span>›</span>
          <span className="text-ink-soft font-medium">Programmes</span>
          {activeFaculty && (
            <>
              <span>›</span>
              <span className="text-ink-soft font-medium">{activeFaculty.name}</span>
            </>
          )}
        </nav>

        {/* ── Filter bar ── */}
        <section aria-label="Filters" className="flex flex-col gap-4">
          {/* Faculty filter */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Faculty
            </span>
            <div className="flex flex-wrap gap-2">
              <Link
                href={filterHref("faculty", null)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  !filters.faculty
                    ? "bg-brand-teal text-white shadow-sm"
                    : "bg-slate-soft text-ink-soft hover:bg-line"
                }`}
              >
                {LABELS.ump.filterAllFaculties}
              </Link>
              {faculties.map((f) => (
                <Link
                  key={f.id}
                  href={filterHref("faculty", f.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    filters.faculty === f.id
                      ? "bg-brand-teal text-white shadow-sm"
                      : "bg-slate-soft text-ink-soft hover:bg-line"
                  }`}
                >
                  {f.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Qualification type filter */}
          {qualificationTypes.length > 1 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Qualification
              </span>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={filterHref("qualification", null)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    !filters.qualification
                      ? "bg-brand-violet text-white shadow-sm"
                      : "bg-slate-soft text-ink-soft hover:bg-line"
                  }`}
                >
                  {LABELS.ump.filterAllQualifications}
                </Link>
                {qualificationTypes.map((qt) => (
                  <Link
                    key={qt}
                    href={filterHref("qualification", qt)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      filters.qualification === qt
                        ? "bg-brand-violet text-white shadow-sm"
                        : "bg-slate-soft text-ink-soft hover:bg-line"
                    }`}
                  >
                    {QUALIFICATION_LABELS[qt] ?? qt}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Field of study filter */}
          {fieldTags.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Field of study
              </span>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={filterHref("field", null)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    !filters.field
                      ? "bg-brand-amber text-white shadow-sm"
                      : "bg-slate-soft text-ink-soft hover:bg-line"
                  }`}
                >
                  {LABELS.ump.filterAllFields}
                </Link>
                {fieldTags.map((tag) => (
                  <Link
                    key={tag}
                    href={filterHref("field", tag)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      filters.field === tag
                        ? "bg-brand-amber text-white shadow-sm"
                        : "bg-slate-soft text-ink-soft hover:bg-line"
                    }`}
                  >
                    {FIELD_LABELS[tag] ?? tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Result count */}
          <p className="text-xs text-ink-faint">
            Showing{" "}
            <strong className="text-ink">
              {filtered.length}
            </strong>{" "}
            of{" "}
            <strong className="text-ink">{programmes.length}</strong> programmes
          </p>
        </section>

        {/* ── Programme grid ── */}
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-soft">
            {LABELS.ump.noResults}
          </p>
        ) : (
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 list-none">
            {filtered.map((programme, i) => {
              const faculty = faculties.find((f) => f.id === programme.facultyId);
              const stagger = [`stagger-1`, `stagger-2`, `stagger-3`, `stagger-4`, `stagger-5`, `stagger-6`][i % 6];
              return (
                <li key={programme.id}>
                  <Link
                    href={`/ump/programmes/${programme.id}`}
                    className={`card-learner animate-rise-in ${stagger} group flex h-full flex-col gap-3 rounded-2xl p-5 transition hover:-translate-y-0.5`}
                  >
                    {/* Qualification badge */}
                    <span className="inline-flex w-fit items-center rounded-full bg-brand-teal/10 px-2.5 py-0.5 text-xs font-semibold text-brand-teal border border-brand-teal/20">
                      {QUALIFICATION_LABELS[programme.qualificationType] ??
                        programme.qualificationType}
                    </span>

                    <h2 className="text-sm font-bold text-ink leading-snug group-hover:text-brand-teal transition-colors">
                      {programme.name}
                    </h2>

                    <p className="text-xs text-ink-faint">
                      {faculty?.name}
                      {programme.duration ? ` · ${programme.duration}` : ""}
                      {programme.minAps !== null
                        ? ` · Min APS: ${programme.minAps}`
                        : ""}
                    </p>

                    {/* Field tags */}
                    {(programme.fieldTags ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-auto">
                        {(programme.fieldTags ?? []).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-brand-amber/10 px-1.5 py-0.5 text-xs text-brand-amber font-medium"
                          >
                            {FIELD_LABELS[tag] ?? tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <span className="text-xs font-semibold text-brand-teal group-hover:underline">
                      View requirements →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </main>
  );
}
