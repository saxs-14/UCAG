import type { Metadata } from "next";
import Link from "next/link";
import { LABELS } from "@/config/labels";
import { fetchRealCatalog } from "@/lib/catalog/getRealCatalog";
import type { FieldTag, QualificationType } from "@/lib/firestore/types";

export const metadata: Metadata = {
  title: `${LABELS.programmes.pageTitle} -- ${LABELS.app.name}`,
  description: LABELS.programmes.pageSubtitle,
  alternates: { canonical: "/programmes" },
};

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
  searchParams: Promise<{
    institution?: string;
    qualification?: string;
    field?: string;
    q?: string;
  }>;
}

export default async function ProgrammeExplorerPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const { institutions, programmes } = await fetchRealCatalog();
  const institutionById = new Map(institutions.map((inst) => [inst.id, inst]));
  const search = (filters.q ?? "").trim().toLowerCase();

  const filtered = programmes.filter((programme) => {
    if (filters.institution && programme.institutionId !== filters.institution) return false;
    if (filters.qualification && programme.qualificationType !== filters.qualification) return false;
    if (filters.field && !(programme.fieldTags ?? []).includes(filters.field as FieldTag)) return false;
    if (
      search &&
      !`${programme.name} ${institutionById.get(programme.institutionId)?.shortName ?? ""}`
        .toLowerCase()
        .includes(search)
    ) {
      return false;
    }
    return true;
  });

  const institutionIds = [...new Set(programmes.map((programme) => programme.institutionId))];
  const qualificationTypes = [...new Set(programmes.map((programme) => programme.qualificationType))];
  const fieldTags = [...new Set(programmes.flatMap((programme) => programme.fieldTags ?? []))];

  function filterHref(
    key: "institution" | "qualification" | "field",
    value: string | null,
  ) {
    const params = new URLSearchParams();
    if (filters.institution) params.set("institution", filters.institution);
    if (filters.qualification) params.set("qualification", filters.qualification);
    if (filters.field) params.set("field", filters.field);
    if (filters.q) params.set("q", filters.q);
    if (value === null) params.delete(key);
    else params.set(key, value);
    const query = params.toString();
    return `/programmes${query ? `?${query}` : ""}`;
  }

  const hasFilters = Boolean(filters.q || filters.institution || filters.qualification || filters.field);

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <section className="hero-atmosphere w-full border-b border-white/10 py-10 shadow-md">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 sm:px-8">
          <span className="w-fit rounded-full border border-teal-400/30 bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-100">
            📚 Programmes
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Find a programme
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-teal-100/90 sm:text-base">
            Browse verified programmes first. When you have your NSC marks, use the APS
            calculator to check which options match your recorded results.
          </p>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">
        <section className="card-learner rounded-2xl border border-line p-5 sm:p-6" aria-labelledby="programme-search-heading">
          <div>
            <h2 id="programme-search-heading" className="text-lg font-bold text-ink">
              Start with what you know
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Search a course name, university, qualification, or field. You do not need an account.
            </p>
          </div>

          <form action="/programmes" method="get" className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            {filters.institution && <input type="hidden" name="institution" value={filters.institution} />}
            {filters.qualification && <input type="hidden" name="qualification" value={filters.qualification} />}
            {filters.field && <input type="hidden" name="field" value={filters.field} />}
            <div>
              <label htmlFor="programme-search" className="text-xs font-semibold text-ink-soft">
                Search programmes
              </label>
              <input
                id="programme-search"
                name="q"
                type="search"
                defaultValue={filters.q ?? ""}
                placeholder="e.g. computer science, UMP..."
                className="mt-1 min-h-11 w-full rounded-xl border border-line bg-paper-raised px-3 text-base text-ink focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
              />
            </div>
            <button
              type="submit"
              className="min-h-11 rounded-xl bg-brand-navy px-5 text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2"
            >
              Search
            </button>
          </form>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <FilterGroup
              label={LABELS.programmes.filterInstitutionLabel}
              value={filters.institution}
              options={institutionIds.map((id) => ({
                value: id,
                label: institutionById.get(id)?.shortName ?? institutionById.get(id)?.name ?? id,
              }))}
              allLabel={LABELS.programmes.filterAllInstitutions}
              href={(value) => filterHref("institution", value)}
            />
            <FilterGroup
              label={LABELS.programmes.filterQualificationLabel}
              value={filters.qualification}
              options={qualificationTypes.map((type) => ({
                value: type,
                label: QUALIFICATION_LABELS[type],
              }))}
              allLabel={LABELS.programmes.filterAllQualifications}
              href={(value) => filterHref("qualification", value)}
            />
            <FilterGroup
              label={LABELS.programmes.filterFieldLabel}
              value={filters.field}
              options={fieldTags.map((tag) => ({
                value: tag,
                label: FIELD_LABELS[tag],
              }))}
              allLabel={LABELS.programmes.filterAllFields}
              href={(value) => filterHref("field", value)}
            />
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink">Programmes</h2>
            <p className="text-sm text-ink-soft">
              {filtered.length} of {programmes.length} programmes shown
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {hasFilters && (
              <Link
                href="/programmes"
                className="inline-flex min-h-11 items-center rounded-xl border border-line px-4 text-sm font-semibold text-ink hover:border-brand-teal hover:text-brand-teal"
              >
                Clear filters
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-xl bg-brand-teal px-4 text-sm font-bold text-white hover:opacity-90"
            >
              Check my APS →
            </Link>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card-learner rounded-2xl border border-line p-8 text-center">
            <h2 className="font-bold text-ink">No programmes found</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Try a broader search or remove one of the filters.
            </p>
            <Link
              href="/programmes"
              className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-brand-teal px-4 text-sm font-bold text-white"
            >
              Show all programmes
            </Link>
          </div>
        ) : (
          <ol className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((programme) => {
              const institution = institutionById.get(programme.institutionId);
              return (
                <li key={programme.id}>
                  <Link
                    href={`/programmes/${programme.id}`}
                    className="card-learner group flex h-full flex-col gap-3 rounded-2xl border border-line p-5 transition hover:-translate-y-0.5 hover:border-brand-teal/40 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="w-fit rounded-full border border-brand-teal/20 bg-brand-teal/10 px-2.5 py-1 text-xs font-semibold text-brand-teal">
                        {QUALIFICATION_LABELS[programme.qualificationType]}
                      </span>
                      {programme.minAps !== null && (
                        <span className="rounded-full bg-brand-navy-soft px-2.5 py-1 text-xs font-bold text-brand-navy">
                          APS {programme.minAps}+
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-base font-bold leading-snug text-ink group-hover:text-brand-teal">
                        {programme.name}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-ink-soft">
                        {institution?.shortName ?? institution?.name}
                      </p>
                      {programme.duration && (
                        <p className="mt-2 text-xs text-ink-faint">
                          Duration: {programme.duration}
                        </p>
                      )}
                    </div>

                    {(programme.fieldTags ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {(programme.fieldTags ?? []).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-brand-amber/10 px-1.5 py-1 text-xs font-medium text-brand-amber"
                          >
                            {FIELD_LABELS[tag]}
                          </span>
                        ))}
                      </div>
                    )}

                    <span className="border-t border-line/60 pt-3 text-sm font-bold text-brand-teal">
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

function FilterGroup({
  label,
  value,
  options,
  allLabel,
  href,
}: {
  label: string;
  value?: string;
  options: { value: string; label: string }[];
  allLabel: string;
  href: (value: string | null) => string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link
          href={href(null)}
          aria-current={!value ? "page" : undefined}
          className={`min-h-11 rounded-full px-3.5 py-2 text-sm font-semibold ${!value ? "bg-brand-teal text-white" : "bg-slate-soft text-ink-soft hover:bg-line"}`}
        >
          {allLabel}
        </Link>
        {options.map((option) => (
          <Link
            key={option.value}
            href={href(option.value)}
            aria-current={value === option.value ? "page" : undefined}
            className={`min-h-11 rounded-full px-3.5 py-2 text-sm font-semibold ${value === option.value ? "bg-brand-teal text-white" : "bg-slate-soft text-ink-soft hover:bg-line"}`}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
