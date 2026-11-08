"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { APPLICATION_CHECKLIST_ITEMS } from "@/config/applicationDocuments";
import { deriveApplicationWindowStatus } from "@/lib/applicationStatus";
import { useApplicationChecklist } from "@/lib/useApplicationChecklist";
import type { RealCatalog } from "@/lib/catalog/getRealCatalog";
import type { UserProfile } from "@/lib/firestore/types";

function dateLabel(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
}

export function LearnerApplicationJourney({ profile }: { profile: UserProfile }) {
  const { checked, toggle } = useApplicationChecklist(profile.uid);
  const [catalog, setCatalog] = useState<RealCatalog | null>(null);
  const [catalogFailed, setCatalogFailed] = useState(false);

  useEffect(() => {
    if (!profile.shortlist.length) return;
    let cancelled = false;

    import("@/lib/catalog/getRealCatalog")
      .then(({ fetchRealCatalog }) => fetchRealCatalog())
      .then((data) => {
        if (!cancelled) setCatalog(data);
      })
      .catch(() => {
        if (!cancelled) setCatalogFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [profile.shortlist]);

  const saved = useMemo(() => {
    if (!catalog) return [];

    const programmes = new Map(catalog.programmes.map((p) => [p.id, p]));
    const institutions = new Map(catalog.institutions.map((i) => [i.id, i]));

    return profile.shortlist
      .map((id) => {
        const programme = programmes.get(id);
        if (!programme) return null;

        const institution = institutions.get(programme.institutionId);
        const window = catalog.applicationWindows.find(
          (item) =>
            item.institutionId === programme.institutionId &&
            (item.programmeId === programme.id || item.programmeId === null)
        );
        const status = deriveApplicationWindowStatus(
          {
            opensOn: window?.opensOn ?? null,
            closesOn: window?.closesOn ?? null,
            lateClosesOn: window?.lateClosesOn ?? null,
          },
          new Date()
        );

        return { programme, institution, window, status };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [catalog, profile.shortlist]);

  const checkedCount = APPLICATION_CHECKLIST_ITEMS.filter((item) =>
    checked.has(item.id)
  ).length;
  const documents = APPLICATION_CHECKLIST_ITEMS.filter(
    (item) => item.category === "documents"
  );
  const timeline = APPLICATION_CHECKLIST_ITEMS.filter(
    (item) => item.category === "timeline"
  );
  const progressPercent = Math.round((checkedCount / APPLICATION_CHECKLIST_ITEMS.length) * 100);

  const nextAction = useMemo(() => {
    if (profile.shortlist.length === 0) {
      return {
        title: "Get Started",
        detail: "Use the APS Calculator to find programmes you qualify for, then save the ones you're interested in to track them here.",
        href: "/",
        label: "Open Calculator",
        icon: "🧭"
      };
    }

    const open = saved.find((item) => item.status === "open");
    if (open) {
      return {
        title: "Ready, Set, Apply!",
        detail: open.window?.closesOn
          ? `One of your saved programmes is open right now. Be sure to submit before ${dateLabel(open.window.closesOn)}.`
          : "One of your saved programmes has an open application window! Check their page for the final deadline.",
        href: `/programmes/${open.programme.id}`,
        label: "View Open Programme",
        icon: "🚀"
      };
    }

    const soon = saved.find((item) => item.status === "openingSoon");
    if (soon) {
      return {
        title: "Get Your Documents Ready",
        detail: soon.window?.opensOn
          ? `Applications are recorded as opening on ${dateLabel(soon.window.opensOn)}. Stay prepared.`
          : "Applications for one of your choices are opening very soon.",
        href: "/application/documents",
        label: "Prepare Documents",
        icon: "📂"
      };
    }

    if (saved.some((item) => item.status === "closed")) {
      return {
        title: "Prepare for the Next Cycle",
        detail: "A saved programme's window has closed. Use this time to gather everything you need for next time.",
        href: "/application/documents",
        label: "View Preparation List",
        icon: "⏳"
      };
    }

    return {
      title: "Review Your Saved Choices",
      detail: "We are currently verifying the application dates for your saved programmes.",
      href: "/programmes",
      label: "Review Programmes",
      icon: "🔍"
    };
  }, [saved, profile.shortlist.length]);

  return (
    <section className="glass-blur rounded-3xl border border-glass-border bg-glass-surface p-6 shadow-sm transition-all hover:shadow-md sm:p-8">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-brand-teal">
          Your Journey
        </p>
        <h2 className="mt-2 font-display text-2xl font-black text-ink">Next Steps Dashboard</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Track your progress, manage requirements, and stay on top of application windows all in one place.
        </p>
      </div>

      <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand-teal to-teal-700 p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl backdrop-blur-sm">
            {nextAction.icon}
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-teal-100">Recommended Action</p>
            <h3 className="mt-1 text-lg font-black">{nextAction.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-teal-50">{nextAction.detail}</p>
            <Link
              href={nextAction.href}
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-bold text-brand-teal transition-transform hover:-translate-y-0.5 hover:shadow-md"
            >
              {nextAction.label}
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line/70 bg-paper p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-ink">Preparation Progress</h3>
            <p className="text-sm font-medium text-ink-soft">
              {checkedCount} of {APPLICATION_CHECKLIST_ITEMS.length} general tasks completed.
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-teal/10">
            <span className="text-sm font-bold text-brand-teal">{progressPercent}%</span>
          </div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 shadow-inner" aria-hidden>
          <div
            className="h-full rounded-full bg-brand-teal transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <details className="group mt-5">
          <summary className="cursor-pointer min-h-11 flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 text-sm font-bold text-ink transition-colors hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-teal/20">
            <span>View your full checklist</span>
            <span className="text-brand-teal transition-transform group-open:rotate-180">▼</span>
          </summary>
          <div className="pt-4">
            <p className="text-xs font-medium leading-relaxed text-ink-soft">
              * Note: This is general guidance to help you stay organized. Always confirm the exact document requirements on the official institution website.
            </p>

            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {[{ title: "Required Documents", items: documents, icon: "📄" }, { title: "Timeline Tasks", items: timeline, icon: "🗓️" }].map(
                (group) => (
                  <fieldset key={group.title} className="flex flex-col gap-3 rounded-2xl bg-paper-raised p-4 border border-line/50">
                    <legend className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-ink">
                      <span>{group.icon}</span>
                      {group.title}
                    </legend>
                    {group.items.map((item) => (
                      <label
                        key={item.id}
                        className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${checked.has(item.id) ? 'border-brand-teal/30 bg-brand-teal/5' : 'border-line/60 bg-paper hover:border-brand-teal/30'}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked.has(item.id)}
                          onChange={() => toggle(item.id)}
                          className="mt-0.5 h-5 w-5 rounded border-line text-brand-teal focus:ring-brand-teal/30 cursor-pointer accent-brand-teal"
                        />
                        <span className={`font-medium ${checked.has(item.id) ? 'text-brand-teal line-through opacity-80' : 'text-ink'}`}>{item.label}</span>
                      </label>
                    ))}
                  </fieldset>
                )
              )}
            </div>
          </div>
        </details>
      </div>

      <p className="mt-5 text-center text-xs font-medium leading-relaxed text-ink-soft">
        UCAG is a planning aid. Official decisions, requirements, and submissions remain directly with the institutions.
      </p>
    </section>
  );
}