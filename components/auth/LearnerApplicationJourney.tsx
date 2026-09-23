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
        month: "short",
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

  const nextAction = useMemo(() => {
    const open = saved.find((item) => item.status === "open");
    if (open) {
      return {
        title: "Your next step: prepare and apply",
        detail: open.window?.closesOn
          ? `Your saved programme has an open application window. Check the verified deadline: ${dateLabel(open.window.closesOn)}.`
          : "Your saved programme has an open application window. Check the official programme page for the current deadline.",
        href: `/programmes/${open.programme.id}`,
        label: "Open programme",
      };
    }

    const soon = saved.find((item) => item.status === "openingSoon");
    if (soon) {
      return {
        title: "Your next step: get your documents ready",
        detail: soon.window?.opensOn
          ? `Applications are recorded as opening ${dateLabel(soon.window.opensOn)}.`
          : "Applications are recorded as opening soon.",
        href: "/application/documents",
        label: "Prepare documents",
      };
    }

    if (saved.some((item) => item.status === "closed")) {
      return {
        title: "Your next step: prepare for the next cycle",
        detail: "A saved programme has a closed application window. Keep it saved and use the time to prepare.",
        href: "/application/documents",
        label: "Prepare documents",
      };
    }

    return {
      title: "Your next step: check your saved programmes",
      detail: "Application dates are still being verified for your saved programmes.",
      href: "/programmes",
      label: "Review programmes",
    };
  }, [saved]);

  return (
    <section className="rounded-2xl border border-line bg-paper-raised p-5 shadow-sm">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wide text-brand-teal">
          Your application journey
        </p>
        <h2 className="mt-1 text-lg font-black text-ink">One place for what to do next</h2>
        <p className="mt-1 text-sm leading-6 text-ink-soft">
          Your saved programmes, verified application windows, and preparation checklist are connected here.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-brand-teal/25 bg-brand-teal/5 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-teal">Next action</p>
        <h3 className="mt-1 text-base font-extrabold text-ink">{nextAction.title}</h3>
        <p className="mt-1 text-sm leading-5 text-ink-soft">{nextAction.detail}</p>
        <Link
          href={nextAction.href}
          className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-brand-teal px-4 text-sm font-bold text-white"
        >
          {nextAction.label}
        </Link>
      </div>

      <div className="mt-4 rounded-xl border border-line/70 bg-paper p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-ink">Prepare to apply</h3>
            <p className="mt-1 text-xs text-ink-soft">
              {checkedCount} of {APPLICATION_CHECKLIST_ITEMS.length} general preparation tasks checked.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-teal">
            {Math.round((checkedCount / APPLICATION_CHECKLIST_ITEMS.length) * 100)}%
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper-overlay" aria-hidden>
          <div
            className="h-full rounded-full bg-brand-teal transition-all"
            style={{ width: `${Math.round((checkedCount / APPLICATION_CHECKLIST_ITEMS.length) * 100)}%` }}
          />
        </div>

        <details className="mt-4">
          <summary className="cursor-pointer min-h-11 flex items-center text-sm font-bold text-ink">
            View preparation checklist
          </summary>
          <p className="mt-2 text-xs leading-5 text-ink-faint">
            This is general guidance, not an institution's official document checklist. Confirm exact requirements on the official institution website.
          </p>

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {[{ title: "Documents", items: documents }, { title: "Timeline", items: timeline }].map(
              (group) => (
                <fieldset key={group.title} className="flex flex-col gap-2">
                  <legend className="text-xs font-extrabold uppercase tracking-wide text-ink-faint">
                    {group.title}
                  </legend>
                  {group.items.map((item) => (
                    <label
                      key={item.id}
                      className="flex min-h-11 items-start gap-3 rounded-lg border border-line/60 bg-paper-raised p-2 text-sm text-ink"
                    >
                      <input
                        type="checkbox"
                        checked={checked.has(item.id)}
                        onChange={() => toggle(item.id)}
                        className="mt-1 h-4 w-4"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </fieldset>
              )
            )}
          </div>
        </details>
      </div>

      <div className="mt-4 rounded-xl border border-line/70 bg-paper p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-ink">Saved programmes</h3>
            <p className="mt-1 text-xs text-ink-soft">
              Verified application-window information is shown when available.
            </p>
          </div>
          <Link
            href="/programmes"
            className="inline-flex min-h-11 items-center rounded-xl border border-line px-3 text-xs font-bold text-ink"
          >
            Add
          </Link>
        </div>

        {!profile.shortlist.length ? (
          <div className="mt-3 rounded-lg bg-paper-raised p-4 text-sm text-ink-soft">
            No programmes saved yet. Shortlist programmes you are considering to track their application status here.
          </div>
        ) : catalogFailed ? (
          <div className="mt-3 rounded-lg bg-paper-raised p-4 text-sm text-ink-soft">
            Your saved programmes are safe, but the verified catalogue could not be loaded right now.
          </div>
        ) : !catalog ? (
          <p className="mt-3 text-sm text-ink-faint">Loading verified application information...</p>
        ) : saved.length === 0 ? (
          <div className="mt-3 rounded-lg bg-paper-raised p-4 text-sm text-ink-soft">
            A saved programme is no longer in the current verified catalogue. No replacement or deadline has been invented.
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {saved.map(({ programme, institution, window, status }) => {
              const label =
                status === "open"
                  ? "Applications open"
                  : status === "openingSoon"
                    ? "Opening soon"
                    : status === "closed"
                      ? "Application window closed"
                      : "Dates being verified";
              const detail =
                status === "open"
                  ? window?.closesOn
                    ? `Deadline recorded: ${dateLabel(window.closesOn)}.`
                    : "Check the official programme page for the current deadline."
                  : status === "openingSoon"
                    ? window?.opensOn
                      ? `Opening recorded: ${dateLabel(window.opensOn)}.`
                      : "Prepare before applications open."
                    : status === "closed"
                      ? "Keep the programme saved and prepare for the next cycle."
                      : "Use the official institution site for current application dates.";

              return (
                <article key={programme.id} className="rounded-lg border border-line/60 bg-paper-raised p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Link
                        href={`/programmes/${programme.id}`}
                        className="font-bold text-ink hover:text-brand-teal hover:underline"
                      >
                        {programme.name}
                      </Link>
                      <p className="mt-1 text-xs text-ink-soft">
                        {institution?.shortName ?? institution?.name ?? "Institution"} · {programme.qualificationType}
                      </p>
                    </div>
                    <span className="inline-flex min-h-9 items-center rounded-full border border-line px-3 text-xs font-bold text-ink-soft">
                      {label}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-ink-soft">{detail}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link
                      href={`/programmes/${programme.id}`}
                      className="inline-flex min-h-10 items-center rounded-lg border border-line px-3 text-xs font-bold text-ink"
                    >
                      View programme
                    </Link>
                    {status === "open" && programme.applyUrl && (
                      <a
                        href={programme.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-10 items-center rounded-lg bg-brand-teal px-3 text-xs font-bold text-white"
                      >
                        Apply on official site
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <p className="mt-4 text-[11px] leading-5 text-ink-faint">
        UCAG is a planning aid. Application decisions, document requirements, deadlines, and submissions remain with the official institution.
      </p>
    </section>
  );
}
