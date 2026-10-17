import Link from "next/link";

const ADMIN_LINKS = [
  { href: "/admin/queue", title: "Verification queue", detail: "Review proposed changes before they can become public facts.", number: "01" },
  { href: "/admin/sources", title: "Source register", detail: "Manage the trusted URLs available to the ingestion pipeline.", number: "02" },
  { href: "/admin/runs", title: "Ingestion runs", detail: "Inspect run history, usage, errors and operational outcomes.", number: "03" },
  { href: "/admin/editor", title: "Content editor", detail: "Correct a fact manually while recording its source.", number: "04" },
  { href: "/admin/dead-links", title: "Dead-link report", detail: "Find application, status-check and institution links that may need attention.", number: "05" },
  { href: "/admin/activity", title: "Learner activity", detail: "Review daily aggregate usage counts without per-user tracking.", number: "06" },
];

export default function AdminOverviewPage() {
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
