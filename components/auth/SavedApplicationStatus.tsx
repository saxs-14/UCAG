"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { deriveApplicationWindowStatus } from "@/lib/applicationStatus";
import type { RealCatalog } from "@/lib/catalog/getRealCatalog";
import type { UserProfile } from "@/lib/firestore/types";

function dateLabel(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", year: "numeric" }).format(d);
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
    <section className="rounded-2xl border border-line bg-paper-raised p-5 shadow-sm">
      <p className="text-xs font-extrabold uppercase tracking-wide text-brand-coral">Application watchlist</p>
      <h2 className="mt-1 text-lg font-black text-ink">Nothing to track yet</h2>
      <p className="mt-1 text-sm leading-6 text-ink-soft">Shortlist programmes you are considering and UCAG will show their verified application status here.</p>
      <Link href="/programmes" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-brand-teal px-4 text-sm font-bold text-white">Browse programmes</Link>
    </section>
  );

  if (failed) return (
    <section className="rounded-2xl border border-line bg-paper-raised p-5 shadow-sm">
      <p className="text-xs font-extrabold uppercase tracking-wide text-brand-coral">Application watchlist</p>
      <h2 className="mt-1 text-lg font-black text-ink">Your shortlist is safe</h2>
      <p className="mt-1 text-sm leading-6 text-ink-soft">The verified catalogue could not be loaded. Your saved programmes remain stored in your profile.</p>
    </section>
  );

  if (!catalog) return <section className="rounded-2xl border border-line bg-paper-raised p-5 shadow-sm"><p className="text-sm text-ink-faint">Loading application status...</p></section>;

  return (
    <section className="rounded-2xl border border-line bg-paper-raised p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-brand-coral">Application watchlist</p>
          <h2 className="mt-1 text-lg font-black text-ink">What needs your attention?</h2>
          <p className="mt-1 text-sm leading-6 text-ink-soft">Only verified application-window dates are used. UCAG does not submit applications or guarantee availability.</p>
        </div>
        <Link href="/programmes" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line px-4 text-sm font-bold text-ink hover:bg-slate-soft">Add programmes</Link>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        {saved.map(({ programme, institution, window, status }) => {
          const open = status === "open";
          const soon = status === "openingSoon";
          const closed = status === "closed";
          const label = open ? "Applications open" : soon ? "Opening soon" : closed ? "Application window closed" : "Dates being verified";
          const detail = open ? (window?.closesOn ? `Check the deadline: ${dateLabel(window.closesOn)}.` : "Check the official programme page for the current deadline.")
            : soon ? (window?.opensOn ? `Opens ${dateLabel(window.opensOn)}.` : "Prepare your documents before applications open.")
            : closed ? "Keep the programme saved and prepare for the next cycle." : "Use the official institution page for the current application date.";
          return (
            <article key={programme.id} className="rounded-xl border border-line/70 bg-paper p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <Link href={`/programmes/${programme.id}`} className="font-bold text-ink hover:text-brand-teal hover:underline">{programme.name}</Link>
                  <p className="mt-1 text-xs text-ink-soft">{institution?.shortName ?? institution?.name ?? "Institution"} · {programme.qualificationType}</p>
                </div>
                <span className={`inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-bold ${open ? "border-emerald-300 bg-emerald-50 text-emerald-800" : soon ? "border-amber-300 bg-amber-50 text-amber-900" : closed ? "border-slate-300 bg-slate-100 text-slate-700" : "border-line bg-paper-raised text-ink-soft"}`}>{label}</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-ink-soft">{detail}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/programmes/${programme.id}`} className="inline-flex min-h-10 items-center rounded-lg border border-line px-3 text-xs font-bold text-ink">View programme</Link>
                {open && programme.applyUrl && <a href={programme.applyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-lg bg-brand-teal px-3 text-xs font-bold text-white">Apply on official site</a>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
