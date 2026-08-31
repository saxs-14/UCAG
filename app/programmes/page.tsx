import type { Metadata } from "next";
import Link from "next/link";
import { LABELS } from "@/config/labels";
import { fetchRealCatalog } from "@/lib/catalog/getRealCatalog";
import type { FieldTag, QualificationType } from "@/lib/firestore/types";

export const metadata: Metadata = {
  title: `${LABELS.programmes.pageTitle} -- ${LABELS.app.name}`,
  description: LABELS.programmes.pageSubtitle,
};

// Real, cross-institution catalogue -- the calculator's Institution
// Directory equivalent for programmes. Not statically generated: the
// verified catalogue grows independently of deploys (same reasoning as
// app/programmes/[id]/page.tsx).
export const dynamic = "force-dynamic";

const QUALIFICATION_LABELS: Record<QualificationType, string> = {
  higherCertificate: "Higher Certificate",
  diploma: "Diploma",
  advancedDiploma: "Advanced Diploma",
  bachelorsDegree: "Bachelor's Degree",
  bachelorsDegreeExtended: "Bachelor's Degree (Extended)",
  postgraduateDiploma: "Postgraduate Diploma",
  honoursDegree: "Honours Degree",
};

const FIELD_LABELS: Record<FieldTag, string> = {
  technology: "Technology & Computing",
  science: "Science & Agriculture",
  business: "Business & Economics",
  people: "Education & Social",
  creative: "Creative Arts",
  practical: "Practical & Vocational",
};

interface PageProps {
  searchParams: Promise<{ institution?: string; qualification?: string; field?: string; q?: string }>;
}

export default async function ProgrammeExplorerPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const { institutions, programmes } = await fetchRealCatalog();
  const institutionById = new Map(institutions.map((inst) => [inst.id, inst]));
  const search = (filters.q ?? "").trim().toLowerCase();

  const filtered = programmes.filter((p) => {
    if (filters.institution && p.institutionId !== filters.institution) return false;
    if (filters.qualification && p.qualificationType !== filters.qualification) return false;
    if (filters.field && !(p.fieldTags ?? []).includes(filters.field as FieldTag)) return false;
    if (search && !p.name.toLowerCase().includes(search)) return false;
    return true;
  });

  // Derive option sets from the real, unfiltered catalogue -- a dropdown
  // can never offer a value nothing on the page actually has.
  const institutionIds = [...new Set(programmes.map((p) => p.institutionId))];
  const qualificationTypes = [...new Set(programmes.map((p) => p.qualificationType))];
  const fieldTags = [...new Set(programmes.flatMap((p) => p.fieldTags ?? []))];

  function filterHref(key: "institution" | "qualification" | "field", value: string | null) {
    const params = new URLSearchParams();
    if (filters.institution) params.set("institution", filters.institution);
    if (filters.qualification) params.set("qualification", filters.qualification);
    if (filters.field) params.set("field", filters.field);
    if (filters.q) params.set("q", filters.q);
    if (value === null) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    return `/programmes${qs ? `?${qs}` : ""}`;
  }

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <div className="hero-atmosphere w-full border-b border-white/10 py-12 shadow-md">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-3.5 py-1 text-xs font-semibold text-teal-200 border border-teal-400/30 w-fit">
            <span>📚 {LABELS.programmes.pageTitle}</span>
          </div>
          <h1 className="animate-rise-in text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
            {LABELS.programmes.pageTitle}
          </h1>
          <p className="animate-rise-in stagger-1 max-w-2xl text-sm sm:text-base text-teal-100/90 leading-relaxed">
            {LABELS.programmes.pageSubtitle}
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">
        <section aria-label="Filters" className="flex flex-col gap-4">
          <form action="/programmes" method="get" className="flex flex-col gap-1">
            {filters.institution && <input type="hidden" name="institution" value={filters.institution} />}
            {filters.qualification && <input type="hidden" name="qualification" value={filters.qualification} />}
            {filters.field && <input type="hidden" name="field" value={filters.field} />}
            <label htmlFor="programme-search" className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              {LABELS.programmes.searchLabel}
            </label>
            <input
              id="programme-search"
              name="q"
              type="search"
              defaultValue={filters.q ?? ""}
              placeholder={LABELS.programmes.searchPlaceholder}
              className="w-full max-w-sm rounded-lg border border-line bg-paper-raised px-3 py-1.5 text-sm text-ink transition-colors hover:border-brand-teal focus:border-brand-teal focus:outline-none"
            />
          </form>

          {institutionIds.length > 1 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                {LABELS.programmes.filterInstitutionLabel}
              </span>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={filterHref("institution", null)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    !filters.institution ? "bg-brand-teal text-white shadow-sm" : "bg-slate-soft text-ink-soft hover:bg-line"
                  }`}
                >
                  {LABELS.programmes.filterAllInstitutions}
                </Link>
                {institutionIds.map((id) => (
                  <Link
                    key={id}
                    href={filterHref("institution", id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      filters.institution === id ? "bg-brand-teal text-white shadow-sm" : "bg-slate-soft text-ink-soft hover:bg-line"
                    }`}
                  >
                    {institutionById.get(id)?.shortName ?? institutionById.get(id)?.name ?? id}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {qualificationTypes.length > 1 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                {LABELS.programmes.filterQualificationLabel}
              </span>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={filterHref("qualification", null)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    !filters.qualification ? "bg-brand-violet text-white shadow-sm" : "bg-slate-soft text-ink-soft hover:bg-line"
                  }`}
                >
                  {LABELS.programmes.filterAllQualifications}
                </Link>
                {qualificationTypes.map((qt) => (
                  <Link
                    key={qt}
                    href={filterHref("qualification", qt)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      filters.qualification === qt ? "bg-brand-violet text-white shadow-sm" : "bg-slate-soft text-ink-soft hover:bg-line"
                    }`}
                  >
                    {QUALIFICATION_LABELS[qt]}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {fieldTags.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                {LABELS.programmes.filterFieldLabel}
              </span>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={filterHref("field", null)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    !filters.field ? "bg-brand-amber text-white shadow-sm" : "bg-slate-soft text-ink-soft hover:bg-line"
                  }`}
                >
                  {LABELS.programmes.filterAllFields}
                </Link>
                {fieldTags.map((tag) => (
                  <Link
                    key={tag}
                    href={filterHref("field", tag)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      filters.field === tag ? "bg-brand-amber text-white shadow-sm" : "bg-slate-soft text-ink-soft hover:bg-line"
                    }`}
                  >
                    {FIELD_LABELS[tag]}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-ink-faint">
            Showing <strong className="text-ink">{filtered.length}</strong> of{" "}
            <strong className="text-ink">{programmes.length}</strong> programmes
          </p>
        </section>

        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-soft">{LABELS.programmes.noResults}</p>
        ) : (
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 list-none">
            {filtered.map((programme, i) => {
              const institution = institutionById.get(programme.institutionId);
              const stagger = [`stagger-1`, `stagger-2`, `stagger-3`, `stagger-4`, `stagger-5`, `stagger-6`][i % 6];
              return (
                <li key={programme.id}>
                  <Link
                    href={`/programmes/${programme.id}`}
                    className={`card-learner animate-rise-in ${stagger} group flex h-full flex-col gap-3 rounded-2xl p-5 transition hover:-translate-y-0.5`}
                  >
                    <span className="inline-flex w-fit items-center rounded-full bg-brand-teal/10 px-2.5 py-0.5 text-xs font-semibold text-brand-teal border border-brand-teal/20">
                      {QUALIFICATION_LABELS[programme.qualificationType]}
                    </span>

                    <h2 className="text-sm font-bold text-ink leading-snug group-hover:text-brand-teal transition-colors">
                      {programme.name}
                    </h2>

                    <p className="text-xs text-ink-faint">
                      {institution?.shortName ?? institution?.name}
                      {programme.duration ? ` · ${programme.duration}` : ""}
                      {programme.minAps !== null ? ` · Min APS: ${programme.minAps}` : ""}
                    </p>

                    {(programme.fieldTags ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-auto">
                        {(programme.fieldTags ?? []).map((tag) => (
                          <span key={tag} className="rounded bg-brand-amber/10 px-1.5 py-0.5 text-xs text-brand-amber font-medium">
                            {FIELD_LABELS[tag]}
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
