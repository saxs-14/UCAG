"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { deriveApplicationWindowStatus } from "@/lib/applicationStatus";
import type { RealCatalog } from "@/lib/catalog/getRealCatalog";
import type { UserProfile } from "@/lib/firestore/types";

function dateLabel(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

export function SavedApplicationStatus({ profile }: { profile: UserProfile }) {
  const [catalog, setCatalog] = useState<RealCatalog | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!profile.shortlist.length) return;
    let cancelled = false;
    import("@/lib/catalog/getRealCatalog").then(({ fetchRealCatalog }) => fetchRealCatalog())
      .then((data) => { if (!cancelled) setCatalog(data); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [profile.shortlist]);

  const saved = useMemo(() => {
    if (!catalog) return [];
    const programmes = new Map(catalog.programmes.map((p) => [p.id, p]));
    const institutions = new Map(catalog.institutions.map((i) => [i.id, i]));
    return profile.shortlist.map((id) => {
      const programme = programmes.get(id);
      if (!programme) return null;
      const institution = institutions.get(programme.institutionId);
      const window = catalog.applicationWindows.find((w) => w.institutionId === programme.institutionId && (w.programmeId === programme.id || w.programmeId === null));
      const status = deriveApplicationWindowStatus(
        { opensOn: window?.opensOn ?? null, closesOn: window?.closesOn ?? null, lateClosesOn: window?.lateClosesOn ?? null },
        new Date()
      );
      return { programme, institution, window, status };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
  }, [catalog, profile.shortlist]);

  if (!profile.shortlist.length) return (
    <section className="rounded-3xl border border-line bg-paper-raised p-6 text-center shadow-sm sm:p-10">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-coral/10 text-3xl">🎯</div>
      <h2 className="font-display text-2xl font-black text-ink">Nothing to track yet</h2>
      <p className="mt-2 text-sm font-medium text-ink-soft mx-auto max-w-md">Add programmes to your shortlist and UCAG will organize their verified application statuses right here.</p>
      <Link href="/programmes" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-teal px-8 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-brand-teal/30">Browse Programmes</Link>
    </section>
  );

  if (failed) return (
    <section className="rounded-3xl border-2 border-brand-coral/20 bg-paper-raised p-6 shadow-sm sm:p-8">
      <h2 className="font-display text-xl font-black text-ink">Your shortlist is safe</h2>
      <p className="mt-2 text-sm font-medium text-ink-soft">The catalogue is taking a moment to load. Your saved choices are securely stored in your profile.</p>
    </section>
  );

  if (!catalog) return (
    <section className="rounded-3xl border border-line bg-paper-raised p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-teal border-t-transparent"></div>
        <p className="text-sm font-bold text-ink-soft">Loading your application timeline...</p>
      </div>
    </section>
  );

  return (
    <section className="rounded-3xl border border-line bg-paper-raised p-6 shadow-sm transition-all hover:shadow-md sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand-coral">Your Watchlist</p>
          <h2 className="mt-2 font-display text-2xl font-black text-ink">Application Timeline</h2>
          <p className="mt-1 text-sm font-medium leading-relaxed text-ink-soft">Track critical dates for the programmes you want most.</p>
        </div>
        <Link href="/programmes" className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-line bg-white px-5 text-sm font-bold text-ink transition-colors hover:border-brand-teal hover:text-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20">Add Choices</Link>
      </div>
      
      <div className="mt-6 flex flex-col gap-4">
        {saved.map(({ programme, institution, window, status }) => {
          const open = status === "open";
          const soon = status === "openingSoon";
          const closed = status === "closed";
          
          const statusStyles = open 
            ? "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-emerald-100/50" 
            : soon 
            ? "border-amber-200 bg-amber-50 text-amber-900 shadow-amber-100/50" 
            : closed 
            ? "border-slate-200 bg-slate-50 text-slate-600" 
            : "border-line bg-paper-raised text-ink-soft";

          const label = open ? "● Applications Open" : soon ? "Opening Soon" : closed ? "Window Closed" : "Dates Verifying";
          
          const detail = open ? (window?.closesOn ? `Closes: ${dateLabel(window.closesOn)}` : "Check official site for deadline")
            : soon ? (window?.opensOn ? `Opens: ${dateLabel(window.opensOn)}` : "Prepare documents now")
            : closed ? "Prepare for the next cycle" : "Use official site for dates";
            
          return (
            <article key={programme.id} className="group rounded-2xl border border-line/70 bg-paper p-5 transition-all hover:shadow-md">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <Link href={`/programmes/${programme.id}`} className="font-bold text-lg text-ink transition-colors hover:text-brand-teal">
                    {programme.name}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 text-sm font-medium text-ink-soft">
                    <span>🏢 {institution?.shortName ?? institution?.name ?? "Institution"}</span>
                    <span>•</span>
                    <span>🎓 {programme.qualificationType}</span>
                  </div>
                </div>
                <div className={`inline-flex shrink-0 items-center rounded-xl border px-4 py-1.5 text-xs font-bold shadow-sm ${statusStyles}`}>
                  {label}
                </div>
              </div>
              
              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-medium text-ink-soft border border-line/40">
                📅 {detail}
              </div>
              
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={`/programmes/${programme.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-paper-raised px-4 text-xs font-bold text-ink border border-line transition-colors hover:bg-slate-100">
                  Programme Info
                </Link>
                {open && programme.applyUrl && (
                  <a href={programme.applyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-teal px-5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 hover:shadow-md">
                    Apply Officially
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}