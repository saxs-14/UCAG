import type { Metadata } from "next";
import Link from "next/link";
import { TIER_1_INSTITUTIONS, TIER_2_INSTITUTIONS } from "@/config/institutions.seed";

export const metadata: Metadata = {
  title: "South African Universities Directory -- UCAG",
  description:
    "Explore South African public universities, admission pathways, and verified programmes.",
  alternates: { canonical: "/institutions" },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; province?: string }>;
}

export default async function InstitutionsDirectoryPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const allInstitutions = [...TIER_1_INSTITUTIONS, ...TIER_2_INSTITUTIONS];
  const search = (filters.q ?? "").trim().toLowerCase();

  const provinces = [...new Set(allInstitutions.map((inst) => inst.province))].sort();
  const filtered = allInstitutions.filter((inst) => {
    if (filters.province && inst.province !== filters.province) return false;
    if (
      search &&
      ![inst.name, inst.shortName, inst.province]
        .join(" ")
        .toLowerCase()
        .includes(search)
    ) {
      return false;
    }
    return true;
  });

  function filterHref(province: string | null) {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (province) params.set("province", province);
    const query = params.toString();
    return `/institutions${query ? `?${query}` : ""}`;
  }

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <section className="hero-atmosphere w-full border-b border-white/10 py-10 shadow-md">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 sm:px-8">
          <span className="w-fit rounded-full border border-teal-400/30 bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-100">
            🏛️ Universities
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Find a university
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-teal-100/90 sm:text-base">
            Explore institutions first, then open a university profile or use the APS
            calculator when you are ready to check a programme.
          </p>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">
        <section
          aria-labelledby="browse-heading"
          className="card-learner rounded-2xl border border-line p-5 sm:p-6"
        >
          <div className="flex flex-col gap-1">
            <h2 id="browse-heading" className="text-lg font-bold text-ink">
              What are you looking for?
            </h2>
            <p className="text-sm text-ink-soft">
              Search by university name or province. You can browse without entering
              your marks.
            </p>
          </div>

          <form action="/institutions" method="get" className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="institution-search" className="text-xs font-semibold text-ink-soft">
                Search universities
              </label>
              <input
                id="institution-search"
                name="q"
                type="search"
                defaultValue={filters.q ?? ""}
                placeholder="e.g. Mpumalanga, UMP, Pretoria..."
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

          {provinces.length > 1 && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Province
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href={filterHref(null)}
                  className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold ${!filters.province ? "bg-brand-teal text-white" : "bg-slate-soft text-ink-soft hover:bg-line"}`}
                >
                  All provinces
                </Link>
                {provinces.map((province) => (
                  <Link
                    key={province}
                    href={filterHref(province)}
                    aria-current={filters.province === province ? "page" : undefined}
                    className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold ${filters.province === province ? "bg-brand-teal text-white" : "bg-slate-soft text-ink-soft hover:bg-line"}`}
                  >
                    {province}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink">Universities</h2>
            <p className="text-sm text-ink-soft">
              {filtered.length} of {allInstitutions.length} institutions shown
            </p>
          </div>
          <Link
            href="/programmes"
            className="hidden min-h-11 items-center rounded-xl border border-line px-4 text-sm font-semibold text-ink hover:border-brand-teal hover:text-brand-teal sm:inline-flex"
          >
            Browse programmes →
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="card-learner rounded-2xl border border-line p-8 text-center">
            <h2 className="font-bold text-ink">No universities found</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Try a different name or remove the province filter.
            </p>
            <Link
              href="/institutions"
              className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-brand-teal px-4 text-sm font-bold text-white"
            >
              Show all universities
            </Link>
          </div>
        ) : (
          <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((inst) => {
              const isUmp = inst.id === "ump";
              return (
                <li key={inst.id}>
                  <article className="card-learner flex h-full flex-col gap-4 rounded-2xl border border-line p-5 transition hover:-translate-y-0.5 hover:border-brand-teal/40">
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full border border-brand-navy/20 bg-brand-navy-soft px-3 py-1 text-xs font-bold text-brand-navy">
                        {inst.province}
                      </span>
                      {isUmp && (
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          UMP
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-bold leading-snug text-ink">
                        {inst.name}
                      </h3>
                      <p className="mt-1 text-sm text-ink-soft">
                        {inst.shortName} ·{" "}
                        {inst.type === "traditionalUniversity"
                          ? "Traditional university"
                          : inst.type === "universityOfTechnology"
                            ? "University of technology"
                            : "Distance education"}
                      </p>
                      <p className="mt-3 text-xs leading-relaxed text-ink-faint">
                        {inst.campuses.length > 0
                          ? `${inst.campuses.length} campus${inst.campuses.length === 1 ? "" : "es"} listed`
                          : "Campus information available on the profile"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 border-t border-line/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
                      <Link
                        href={isUmp ? "/ump" : `/institutions/${inst.id}`}
                        className="inline-flex min-h-11 items-center font-bold text-sm text-brand-teal hover:underline"
                      >
                        Explore university →
                      </Link>
                      {inst.websiteUrl && (
                        <a
                          href={inst.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center text-xs font-semibold text-ink-faint hover:text-ink"
                        >
                          Official site ↗
                        </a>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}

        <Link
          href="/programmes"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-teal px-5 text-sm font-bold text-white sm:hidden"
        >
          Browse programmes →
        </Link>
      </div>
    </main>
  );
}
