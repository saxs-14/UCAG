import type { Metadata } from "next";
import Link from "next/link";
import { TIER_1_INSTITUTIONS, TIER_2_INSTITUTIONS } from "@/config/institutions.seed";

export const metadata: Metadata = {
  title: "South African Universities Directory -- UCAG",
  description:
    "Explore South African public universities, admission requirements, application portals, and verified degree programmes.",
};

export const dynamic = "force-dynamic";

export default function InstitutionsDirectoryPage() {
  const allInstitutions = [...TIER_1_INSTITUTIONS, ...TIER_2_INSTITUTIONS];

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      {/* Directory Hero */}
      <div className="hero-atmosphere w-full border-b border-white/10 py-12 shadow-md">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-3.5 py-1 text-xs font-semibold text-teal-200 border border-teal-400/30 w-fit">
            <span>🏛️ South African Higher Education Directory</span>
          </div>
          <h1 className="animate-rise-in text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
            Explore Institutions & Admission Pathways
          </h1>
          <p className="animate-rise-in stagger-1 max-w-2xl text-sm sm:text-base text-teal-100/90 leading-relaxed">
            Discover verified public universities across South Africa, check admission requirements, APS scoring rules, and direct application portals.
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 sm:p-8">
        <section aria-labelledby="institutions-heading">
          <h2 id="institutions-heading" className="text-xl font-bold tracking-tight text-ink mb-4">
            All Universities ({allInstitutions.length})
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allInstitutions.map((inst) => {
              const isUmp = inst.id === "ump";

              return (
                <div
                  key={inst.id}
                  className="card-learner rounded-2xl p-6 flex flex-col justify-between gap-4 border border-line hover:border-brand-teal/40 transition shadow-xs"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-brand-navy-soft px-3 py-1 text-[11px] font-bold text-brand-navy border border-brand-navy/20">
                        {inst.province}
                      </span>
                      {isUmp ? (
                        <span className="rounded-full bg-emerald-500/10 text-emerald-700 px-2.5 py-0.5 text-[10px] font-bold border border-emerald-500/30">
                          ✨ Full Smart Admission
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[10px] font-bold">
                          Tier {inst.tier} Institution
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-ink leading-snug">
                        {inst.name} ({inst.shortName})
                      </h3>
                      <p className="text-xs text-ink-soft mt-1">
                        {inst.type === "traditionalUniversity"
                          ? "Traditional University"
                          : inst.type === "universityOfTechnology"
                          ? "University of Technology"
                          : "Distance Education University"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[11px] text-ink-soft">
                      <span>📍 Campuses: {inst.campuses.length > 0 ? inst.campuses.join(", ") : "Main Campus"}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-line/60 flex items-center justify-between gap-2">
                    <Link
                      href={isUmp ? "/ump" : `/institutions/${inst.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-teal hover:underline"
                    >
                      View Profile & Programmes →
                    </Link>
                    {inst.websiteUrl && (
                      <a
                        href={inst.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-medium text-ink-faint hover:text-ink"
                      >
                        Official Site ↗
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
