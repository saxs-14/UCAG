"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetchJson } from "@/lib/admin/apiClient";
import type { AdminStats } from "@/lib/admin/getAdminStats";
import type { IngestionRunStatus } from "@/lib/firestore/types";

const ADMIN_LINKS = [
  { href: "/admin/queue", title: "Verification queue", detail: "Review proposed changes before they can become public facts.", number: "01" },
  { href: "/admin/sources", title: "Source register", detail: "Manage the trusted URLs available to the ingestion pipeline.", number: "02" },
  { href: "/admin/runs", title: "Ingestion runs", detail: "Inspect run history, usage, errors and operational outcomes.", number: "03" },
  { href: "/admin/editor", title: "Content editor", detail: "Correct a fact manually while recording its source.", number: "04" },
  { href: "/admin/dead-links", title: "Dead-link report", detail: "Find application, status-check and institution links that may need attention.", number: "05" },
  { href: "/admin/activity", title: "Learner activity", detail: "Review daily aggregate usage counts without per-user tracking.", number: "06" },
];

const CATALOGUE_TILES: { key: keyof Pick<AdminStats, "institutions" | "faculties" | "schools" | "programmes" | "bursaries" | "internships">; label: string }[] = [
  { key: "institutions", label: "Institutions" },
  { key: "faculties", label: "Faculties" },
  { key: "schools", label: "Schools" },
  { key: "programmes", label: "Programmes" },
  { key: "bursaries", label: "Bursaries" },
  { key: "internships", label: "Internships" },
];

function RunStatusBadge({ status }: { status: IngestionRunStatus | undefined }) {
  const style =
    status === "completed"
      ? "bg-mark-green-soft text-mark-green"
      : status === "failed"
        ? "bg-mark-red-soft text-mark-red"
        : "bg-brand-amber-soft text-brand-amber";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${style}`}>
      {status ?? "unknown"}
    </span>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    adminFetchJson<AdminStats>("/api/admin/stats")
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6">
      <header className="relative isolate overflow-hidden rounded-3xl bg-brand-navy p-6 text-white sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 -z-10 size-56 rounded-full bg-brand-teal opacity-30" />
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-teal-soft">UCAG trust console</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Admin workspace</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
          Maintain trustworthy study information. Review sources, approve changes deliberately, and monitor platform activity without exposing individual learner histories.
        </p>
      </header>

      <section aria-labelledby="admin-principle" className="rounded-2xl border border-brand-amber/30 bg-brand-amber-soft/40 p-4 sm:p-5">
        <h2 id="admin-principle" className="font-display text-base font-bold text-ink">The trust rule</h2>
        <p className="mt-1 text-sm leading-6 text-ink-soft">
          Unverified information must remain labelled as unverified. Public facts require a source URL and verification date; never backdate a verification or silently turn a suggestion into a confirmed fact.
        </p>
      </section>

      <section aria-labelledby="admin-stats-heading">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <div>
            <h2 id="admin-stats-heading" className="font-display text-xl font-bold text-ink">Catalogue coverage</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Verified counts (publicly visible) against total records in Firestore, right now.
            </p>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-mark-red bg-mark-red-soft p-3 text-sm text-mark-red">{error}</p>
        )}
        {loading && !error && (
          <p className="rounded-xl border border-line p-4 text-sm text-ink-soft">Loading real-time counts...</p>
        )}

        {stats && (
          <>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
              {CATALOGUE_TILES.map(({ key, label }) => {
                const { total, verified } = stats[key];
                const unverified = total - verified;
                return (
                  <div key={key} className="rounded-xl border border-line bg-paper-raised p-3">
                    <div className="text-xs leading-5 text-ink-soft">{label}</div>
                    <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">
                      {verified.toLocaleString()}
                      <span className="ml-1 text-sm font-semibold text-ink-soft">/ {total.toLocaleString()}</span>
                    </div>
                    <div className="mt-1 text-xs text-ink-soft">
                      {unverified > 0 ? `${unverified.toLocaleString()} awaiting verification` : "fully verified"}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-3 text-xs text-ink-soft">
              {stats.lastVerifiedOn
                ? `Most recent verification on record: ${stats.lastVerifiedOn}.`
                : "Nothing has been verified yet."}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Link href="/admin/queue" className="rounded-xl border border-line bg-paper-raised p-3 transition hover:border-brand-teal">
                <div className="text-xs leading-5 text-ink-soft">Pending review</div>
                <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">
                  {stats.verificationQueue.pending.toLocaleString()}
                </div>
              </Link>
              <Link href="/admin/sources" className="rounded-xl border border-line bg-paper-raised p-3 transition hover:border-brand-teal">
                <div className="text-xs leading-5 text-ink-soft">Sources enabled</div>
                <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">
                  {stats.sources.enabled.toLocaleString()}
                  <span className="ml-1 text-sm font-semibold text-ink-soft">/ {stats.sources.total.toLocaleString()}</span>
                </div>
              </Link>
              <Link href="/admin/dead-links" className="rounded-xl border border-line bg-paper-raised p-3 transition hover:border-brand-teal">
                <div className="text-xs leading-5 text-ink-soft">Dead links</div>
                <div className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">
                  {stats.linkHealth.dead.toLocaleString()}
                  <span className="ml-1 text-sm font-semibold text-ink-soft">/ {stats.linkHealth.total.toLocaleString()} checked</span>
                </div>
              </Link>
              <Link href="/admin/runs" className="rounded-xl border border-line bg-paper-raised p-3 transition hover:border-brand-teal">
                <div className="text-xs leading-5 text-ink-soft">Latest ingestion run</div>
                {stats.latestRun ? (
                  <div className="mt-1 flex items-center gap-2">
                    <RunStatusBadge status={stats.latestRun.status} />
                    <span className="text-xs text-ink-soft">{stats.latestRun.startedAt.slice(0, 10)}</span>
                  </div>
                ) : (
                  <div className="mt-1 text-sm text-ink-soft">No runs yet</div>
                )}
              </Link>
            </div>
          </>
        )}
      </section>

      <section aria-labelledby="admin-tools-heading">
        <div className="mb-3">
          <h2 id="admin-tools-heading" className="font-display text-xl font-bold text-ink">Tools and reports</h2>
          <p className="mt-1 text-sm text-ink-soft">Choose a workspace to continue.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ADMIN_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="group card-learner rounded-2xl border border-line p-5 transition hover:-translate-y-0.5 hover:border-brand-teal hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2">
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-brand-teal-soft font-mono text-xs font-bold text-brand-teal">{item.number}</span>
              <h3 className="mt-4 font-display text-base font-bold text-ink group-hover:text-brand-teal">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{item.detail}</p>
              <span className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-brand-teal">Open workspace <span aria-hidden="true" className="ml-2 transition-transform group-hover:translate-x-1">→</span></span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
