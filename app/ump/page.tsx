// cSpell:words Firestore tvet TVET keyfacts Mpumalanga nums appwindow NSFAS Agri MICT
import type { Metadata } from "next";
import Link from "next/link";
import { LABELS } from "@/config/labels";
import { fetchUmpData } from "@/lib/catalog/getUmpData";
import { deriveApplicationWindowStatus } from "@/lib/applicationStatus";
import { UmpSmartAdmissionHero } from "@/components/UmpSmartAdmissionHero";

export const metadata: Metadata = {
  title: `${LABELS.ump.hubPageTitle} -- ${LABELS.app.name}`,
  description: LABELS.ump.hubPageSubtitle,
};

// Live Firestore data -- never stale from build-time snapshot.
export const dynamic = "force-dynamic";

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

  // Institutional application window (no specific programmeId, applies to all).
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

  // Group schools by faculty for the structure overview.
  const schoolsByFaculty = new Map<string, typeof schools>();
  for (const school of schools) {
    const existing = schoolsByFaculty.get(school.facultyId) ?? [];
    schoolsByFaculty.set(school.facultyId, [...existing, school]);
  }

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      {/* ── UMP Smart Admission 3D Hero ── */}
      <UmpSmartAdmissionHero />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 sm:p-8">

        {/* ── At-a-glance key facts ── */}
        <section aria-labelledby="ump-keyfacts-heading">
          <h2 id="ump-keyfacts-heading" className="sr-only">
            {LABELS.ump.keyFactsHeading}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: LABELS.ump.programmeCountLabel, value: programmes.length },
              { label: LABELS.ump.facultyCountLabel, value: faculties.length },
              {
                label: LABELS.ump.provinceLabel,
                value: institution?.province ?? "Mpumalanga",
              },
              {
                label: LABELS.ump.typeLabel,
                value: institution
                  ? INSTITUTION_TYPE_LABELS[institution.type] ?? institution.type
                  : "Comprehensive University",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="card-learner flex flex-col gap-1 rounded-xl p-4 text-center"
              >
                <span className="text-2xl font-extrabold tracking-tight text-brand-teal tabular-nums">
                  {value}
                </span>
                <span className="text-xs font-medium text-ink-faint">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Application window status ── */}
        {institutionWindow && (
          <section
            aria-labelledby="ump-appwindow-heading"
            className="card-learner rounded-2xl p-6"
          >
            <h2
              id="ump-appwindow-heading"
              className="mb-3 text-lg font-bold tracking-tight text-ink"
            >
              Application Window
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              {windowStatus === "open" && (
                <span className="rounded-full bg-mark-green-soft px-3 py-1 text-sm font-bold text-mark-green border border-mark-green/30">
                  ✅ Applications are open
                </span>
              )}
              {windowStatus === "openingSoon" && (
                <span className="rounded-full bg-mark-gold-soft px-3 py-1 text-sm font-bold text-mark-gold border border-mark-gold/30">
                  🕐 Opening soon
                </span>
              )}
              {(windowStatus === "closed" || windowStatus === null) && (
                <span className="rounded-full bg-slate-soft px-3 py-1 text-sm font-semibold text-ink-soft border border-line">
                  Applications closed / dates being verified
                </span>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-ink-soft">
                {institutionWindow.opensOn && (
                  <span>
                    Opens:{" "}
                    <strong className="text-ink">
                      {new Date(institutionWindow.opensOn).toLocaleDateString("en-ZA", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </strong>
                  </span>
                )}
                {institutionWindow.closesOn && (
                  <span>
                    Closes:{" "}
                    <strong className="text-ink">
                      {new Date(institutionWindow.closesOn).toLocaleDateString("en-ZA", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </strong>
                  </span>
                )}
              </div>
            </div>

            {/* How-to-apply */}
            <div className="mt-4 border-t border-line pt-4">
              <h3 className="mb-1 text-sm font-semibold text-ink">
                {LABELS.ump.applyHeading}
              </h3>
              <p className="text-sm text-ink-soft leading-relaxed">
                {LABELS.ump.applyBody}
              </p>
              {institution?.applicationPortalUrl && (
                <a
                  href={institution.applicationPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 rounded-lg bg-brand-teal px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {LABELS.ump.applyCtaLabel} ↗
                </a>
              )}
            </div>

            <p className="mt-4 font-mono text-xs tabular-nums text-ink-faint">
              Verified {institutionWindow.verifiedOn} ·{" "}
              <a
                href={institutionWindow.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Source
              </a>
            </p>
          </section>
        )}

        {/* ── Faculties & Schools ── */}
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
                const facultyProgrammes = programmes.filter(
                  (p) => p.facultyId === faculty.id
                );
                return (
                  <div
                    key={faculty.id}
                    className="card-learner animate-rise-in flex flex-col gap-3 rounded-2xl p-5"
                  >
                    <div>
                      <h3 className="font-bold text-ink leading-snug">
                        {faculty.name}
                      </h3>
                      <span className="mt-1 inline-block rounded bg-slate-soft px-2 py-0.5 text-xs font-mono font-semibold text-ink-faint">
                        {faculty.code}
                      </span>
                    </div>

                    {facultySchools.length > 0 && (
                      <ul className="flex flex-col gap-1 text-sm text-ink-soft">
                        {facultySchools.map((school) => (
                          <li key={school.id} className="flex items-center gap-1.5">
                            <span className="text-brand-teal">›</span>
                            {school.name}
                          </li>
                        ))}
                      </ul>
                    )}

                    <Link
                      href={`/ump/programmes?faculty=${encodeURIComponent(faculty.id)}`}
                      className="mt-auto text-xs font-semibold text-brand-teal hover:underline"
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

        {/* ── Quick nav to sub-sections ── */}
        <section aria-labelledby="ump-explore-heading">
          <h2 id="ump-explore-heading" className="mb-4 text-xl font-bold tracking-tight text-ink">
            Explore UMP
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                href: "/ump/programmes",
                emoji: "📚",
                title: "Programmes",
                desc: `${programmes.length} verified undergraduate programmes across all UMP faculties.`,
              },
              {
                href: "/ump/funding",
                emoji: "💰",
                title: "Funding & Bursaries",
                desc: "NSFAS, UMP aid, AgriSETA, MICT SETA, and Mpumalanga provincial bursaries.",
              },
              {
                href: "/ump/careers",
                emoji: "🗺️",
                title: "Career Roadmaps",
                desc: "Step-by-step paths from Grade 12 through your UMP degree to a career.",
              },
            ].map(({ href, emoji, title, desc }) => (
              <Link
                key={href}
                href={href}
                className="card-learner animate-rise-in group flex flex-col gap-3 rounded-2xl p-5 transition hover:-translate-y-0.5"
              >
                <span className="text-2xl" aria-hidden>{emoji}</span>
                <p className="font-bold text-ink group-hover:text-brand-teal transition-colors">{title}</p>
                <p className="text-xs text-ink-soft leading-relaxed">{desc}</p>
                <span className="text-xs font-bold text-brand-teal group-hover:underline mt-auto">Explore →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Disclaimer ── */}
        {institution && (
          <p className="text-xs text-ink-faint leading-relaxed">
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
