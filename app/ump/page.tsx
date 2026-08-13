// cSpell:words Firestore tvet TVET keyfacts Mpumalanga nums appwindow NSFAS Agri MICT Siyabuswa learnerships
import type { Metadata } from "next";
import Link from "next/link";
import { LABELS } from "@/config/labels";
import { fetchUmpData } from "@/lib/catalog/getUmpData";
import { deriveApplicationWindowStatus } from "@/lib/applicationStatus";
import { UmpHeader } from "@/components/ump/UmpHeader";

export const metadata: Metadata = {
  title: `${LABELS.ump.hubPageTitle} -- ${LABELS.app.name}`,
  description: LABELS.ump.hubPageSubtitle,
};

export const dynamic = "force-dynamic";

const UMP_NAVY = "#003b5c";
const UMP_GOLD = "#d4af37";
const UMP_TEAL = "#00a896";

const INSTITUTION_TYPE_LABELS: Record<string, string> = {
  traditionalUniversity: "Traditional University",
  universityOfTechnology: "University of Technology",
  comprehensiveUniversity: "Comprehensive University",
  distanceUniversity: "Distance University",
  tvetCollege: "TVET College",
  privateProvider: "Private Provider",
};

export default async function UmpHubPage() {
  const { institution, faculties, schools, programmes, applicationWindows } =
    await fetchUmpData();

  const institutionWindow =
    applicationWindows.find((w) => w.programmeId === null) ??
    applicationWindows[0] ??
    null;

  const windowStatus = institutionWindow
    ? deriveApplicationWindowStatus(
        {
          opensOn: institutionWindow.opensOn,
          closesOn: institutionWindow.closesOn,
          lateClosesOn: institutionWindow.lateClosesOn ?? null,
        },
        new Date()
      )
    : null;

  const schoolsByFaculty = new Map<string, typeof schools>();
  for (const school of schools) {
    const existing = schoolsByFaculty.get(school.facultyId) ?? [];
    schoolsByFaculty.set(school.facultyId, [...existing, school]);
  }

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <UmpHeader />

      {/* ── Hero Banner ── */}
      <section
        className="w-full py-16 px-6 sm:px-12 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${UMP_NAVY} 0%, #004f7c 50%, #003348 100%)`,
        }}
      >
        {/* Decorative circles */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full opacity-10"
          style={{ background: UMP_GOLD }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 bottom-0 size-60 rounded-full opacity-5"
          style={{ background: UMP_TEAL }}
        />

        <div className="relative mx-auto flex max-w-5xl flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 max-w-2xl">
            <span
              className="w-fit rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur-sm"
              style={{ borderColor: `${UMP_GOLD}50`, color: UMP_GOLD, background: `${UMP_GOLD}15` }}
            >
              University of Mpumalanga · Smart Admission
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight">
              Your Journey to<br />
              <span style={{ color: UMP_GOLD }}>Academic Excellence</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
              Explore programmes, learnerships, funding, and campus life at UMP — Mpumalanga&apos;s flagship comprehensive university.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/ump/programmes"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                style={{ background: UMP_GOLD, color: UMP_NAVY }}
              >
                Explore Programmes →
              </Link>
              <Link
                href="/ump/learnerships"
                className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-bold backdrop-blur-sm transition hover:bg-white/10"
                style={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}
              >
                Find Learnerships
              </Link>
            </div>
          </div>

          {/* Stats card */}
          <div
            className="rounded-3xl p-6 flex-shrink-0 w-full md:w-64 shadow-2xl border"
            style={{
              background: "rgba(255,255,255,0.06)",
              borderColor: `${UMP_GOLD}30`,
              backdropFilter: "blur(12px)",
            }}
          >
            <p
              className="text-[10px] font-extrabold uppercase tracking-widest mb-4"
              style={{ color: UMP_GOLD }}
            >
              At a Glance
            </p>
            {[
              { label: "Programmes", value: programmes.length },
              { label: "Faculties", value: faculties.length },
              { label: "Province", value: institution?.province ?? "Mpumalanga" },
              {
                label: "Type",
                value: institution
                  ? (INSTITUTION_TYPE_LABELS[institution.type] ?? institution.type)
                  : "Comprehensive University",
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-baseline justify-between py-2 border-b border-white/10 last:border-0">
                <span className="text-xs text-slate-400">{label}</span>
                <span className="font-extrabold text-white text-sm tabular-nums">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 sm:p-8">

        {/* ── Application Window ── */}
        {institutionWindow && (
          <section
            aria-labelledby="ump-appwindow-heading"
            className="rounded-2xl overflow-hidden shadow-sm border"
            style={{ borderColor: `${UMP_GOLD}30` }}
          >
            <div
              className="px-6 py-4"
              style={{ background: `linear-gradient(90deg, ${UMP_NAVY} 0%, #004f7c 100%)` }}
            >
              <h2 id="ump-appwindow-heading" className="text-sm font-bold text-white">
                📋 Application Window
              </h2>
            </div>
            <div className="p-6 flex flex-wrap items-center gap-4 bg-white dark:bg-paper-raised">
              {windowStatus === "open" && (
                <span className="rounded-full bg-mark-green-soft px-4 py-1.5 text-sm font-bold text-mark-green border border-mark-green/30">
                  ✅ Applications are open
                </span>
              )}
              {windowStatus === "openingSoon" && (
                <span className="rounded-full bg-mark-gold-soft px-4 py-1.5 text-sm font-bold text-mark-gold border border-mark-gold/30">
                  🕐 Opening soon
                </span>
              )}
              {(windowStatus === "closed" || windowStatus === null) && (
                <span className="rounded-full bg-slate-soft px-4 py-1.5 text-sm font-semibold text-ink-soft border border-line">
                  Applications closed / dates being verified
                </span>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-ink-soft">
                {institutionWindow.opensOn && (
                  <span>
                    Opens:{" "}
                    <strong className="text-ink">
                      {new Date(institutionWindow.opensOn).toLocaleDateString("en-ZA", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </strong>
                  </span>
                )}
                {institutionWindow.closesOn && (
                  <span>
                    Closes:{" "}
                    <strong className="text-ink">
                      {new Date(institutionWindow.closesOn).toLocaleDateString("en-ZA", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </strong>
                  </span>
                )}
              </div>

              {institution?.applicationPortalUrl && (
                <a
                  href={institution.applicationPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-1 rounded-xl px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition hover:opacity-90"
                  style={{ background: UMP_NAVY }}
                >
                  {LABELS.ump.applyCtaLabel} ↗
                </a>
              )}
            </div>
            <p className="px-6 pb-4 font-mono text-xs tabular-nums text-ink-faint">
              Verified {institutionWindow.verifiedOn} ·{" "}
              <a href={institutionWindow.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
                Source
              </a>
            </p>
          </section>
        )}

        {/* ── Quick Nav cards ── */}
        <section aria-labelledby="ump-explore-heading">
          <h2 id="ump-explore-heading" className="mb-4 text-xl font-bold tracking-tight text-ink">
            Explore UMP
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                href: "/ump/programmes",
                icon: "📚",
                title: "Programmes",
                desc: `${programmes.length} verified undergraduate programmes across all UMP faculties.`,
                accent: UMP_NAVY,
              },
              {
                href: "/ump/learnerships",
                icon: "🎯",
                title: "Learnerships",
                desc: "SETA-registered learnerships and apprenticeships for Grade 11/12 learners and school leavers.",
                accent: UMP_TEAL,
                badge: "NEW",
              },
              {
                href: "/ump/funding",
                icon: "💰",
                title: "Funding & Bursaries",
                desc: "NSFAS, UMP aid, AgriSETA, MICT SETA, and Mpumalanga provincial bursaries.",
                accent: UMP_GOLD,
              },
              {
                href: "/ump/careers",
                icon: "🗺️",
                title: "Career Roadmaps",
                desc: "Step-by-step paths from Grade 12 through your UMP degree to a career.",
                accent: UMP_NAVY,
              },
              {
                href: "/ump/campus",
                icon: "🏛️",
                title: "Campus Guide",
                desc: "Mbombela Main Campus & Siyabuswa Education Campus — residences, labs, and services.",
                accent: UMP_TEAL,
              },
              {
                href: "/ump/mentors",
                icon: "👥",
                title: "Student Mentors",
                desc: "Connect with senior UMP students who can guide you through admission and first year.",
                accent: UMP_GOLD,
              },
            ].map(({ href, icon, title, desc, accent, badge }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col gap-3 rounded-2xl border p-5 bg-white dark:bg-paper-raised shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                style={{ borderColor: `${accent}25` }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex size-10 items-center justify-center rounded-xl text-xl shadow-sm"
                    style={{ background: `${accent}15` }}
                  >
                    {icon}
                  </div>
                  {badge && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white"
                      style={{ background: accent }}
                    >
                      {badge}
                    </span>
                  )}
                </div>
                <div>
                  <p
                    className="font-bold text-ink transition-colors group-hover:opacity-80"
                    style={{ color: "inherit" }}
                  >
                    {title}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft leading-relaxed">{desc}</p>
                </div>
                <span
                  className="mt-auto text-xs font-bold transition-all group-hover:underline"
                  style={{ color: accent }}
                >
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Faculties ── */}
        {faculties.length > 0 && (
          <section aria-labelledby="ump-faculties-heading">
            <h2
              id="ump-faculties-heading"
              className="mb-4 text-xl font-bold tracking-tight text-ink"
            >
              {LABELS.ump.facultiesHeading}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {faculties.map((faculty) => {
                const facultySchools = schoolsByFaculty.get(faculty.id) ?? [];
                const facultyProgrammes = programmes.filter((p) => p.facultyId === faculty.id);
                return (
                  <div
                    key={faculty.id}
                    className="flex flex-col gap-3 rounded-2xl border bg-white dark:bg-paper-raised p-5 shadow-sm transition hover:shadow-md"
                    style={{ borderColor: `${UMP_NAVY}20` }}
                  >
                    <div>
                      <h3 className="font-bold text-ink leading-snug">{faculty.name}</h3>
                      <span
                        className="mt-1 inline-block rounded px-2 py-0.5 text-xs font-mono font-semibold"
                        style={{ background: `${UMP_NAVY}10`, color: UMP_NAVY }}
                      >
                        {faculty.code}
                      </span>
                    </div>

                    {facultySchools.length > 0 && (
                      <ul className="flex flex-col gap-1 text-sm text-ink-soft">
                        {facultySchools.map((school) => (
                          <li key={school.id} className="flex items-center gap-1.5">
                            <span style={{ color: UMP_TEAL }}>›</span>
                            {school.name}
                          </li>
                        ))}
                      </ul>
                    )}

                    <Link
                      href={`/ump/programmes?faculty=${encodeURIComponent(faculty.id)}`}
                      className="mt-auto text-xs font-semibold hover:underline transition"
                      style={{ color: UMP_TEAL }}
                    >
                      {facultyProgrammes.length} programme
                      {facultyProgrammes.length !== 1 ? "s" : ""} →
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Disclaimer ── */}
        {institution && (
          <p className="text-xs text-ink-faint leading-relaxed border-t border-line pt-4">
            ⚠️ {LABELS.ump.unverifiedNote}{" "}
            <a
              href={institution.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              ump.ac.za
            </a>
          </p>
        )}
      </div>
    </main>
  );
}
