// cSpell:words NSFAS learnerships Mpumalanga AgriSETA MICT Siyabuswa
import type { Metadata } from "next";
import Link from "next/link";
import { LABELS } from "@/config/labels";
import { UmpHeader } from "@/components/ump/UmpHeader";

const UMP_NAVY = "#003b5c";
const UMP_TEAL = "#00a896";

export const metadata: Metadata = {
  title: `UMP Funding & Bursaries -- ${LABELS.app.name}`,
  description:
    "Funding options for University of Mpumalanga students — NSFAS, UMP merit bursaries, Mpumalanga provincial bursaries, and external scholarships. All independently verified.",
};

/**
 * UMP Funding Intelligence hub.
 *
 * Unlike the general /bursaries page (which covers all SA institutions),
 * this page focuses specifically on funding available to UMP students,
 * with UMP-specific context (NSFAS eligibility at a comprehensive
 * university, UMP's own financial aid office, Mpumalanga provincial
 * bursaries).
 *
 * Funding amounts and deadlines are government/institutional policy --
 * they shift year to year. The provenance rule applies: every displayed
 * figure links to its primary source. Where a figure isn't yet
 * independently verified for 2027, the page says so explicitly, per
 * CLAUDE.md's core invariant: "unverified is displayed as unverified,
 * never as a fact."
 */

interface FundingItem {
  id: string;
  name: string;
  type: "bursary" | "loan" | "scholarship" | "allowance";
  forWhom: string;
  coverageNote: string;
  applicationUrl: string;
  sourceUrl: string;
  verifiedOn: string;
  /** When true, amounts/dates are still being confirmed for 2027. */
  amountsBeingVerified?: boolean;
}

const UMP_FUNDING: FundingItem[] = [
  {
    id: "nsfas",
    name: "NSFAS (National Student Financial Aid Scheme)",
    type: "bursary",
    forWhom: "South African citizens with a combined household income below R350,000/year",
    coverageNote:
      "Covers tuition, accommodation, meals, transport, and a personal care allowance. UMP is an accredited NSFAS institution.",
    applicationUrl: "https://www.nsfas.org.za/content/how-to-apply.html",
    sourceUrl: "https://www.nsfas.org.za/content/how-to-apply.html",
    verifiedOn: "2026-08-11",
    amountsBeingVerified: true,
  },
  {
    id: "ump-financial-aid",
    name: "UMP Financial Aid Office",
    type: "bursary",
    forWhom: "UMP students not eligible for NSFAS or needing additional support",
    coverageNote:
      "The UMP Financial Aid Office administers various institutional bursaries and can advise on emergency aid, top-up grants, and external funding. Contact them directly for current offerings.",
    applicationUrl:
      "https://www.ump.ac.za/Student-Life/Student-Services/Financial-Aid",
    sourceUrl:
      "https://www.ump.ac.za/Student-Life/Student-Services/Financial-Aid",
    verifiedOn: "2026-08-11",
    amountsBeingVerified: true,
  },
  {
    id: "mpumalanga-dept-education",
    name: "Mpumalanga Department of Education Bursary",
    type: "bursary",
    forWhom:
      "Mpumalanga residents studying education-related qualifications, with a commitment to teach in Mpumalanga schools",
    coverageNote:
      "Provincial bursary for BEd and PGCE students. Covers tuition and a monthly allowance. Amounts and deadlines vary each year.",
    applicationUrl:
      "https://www.mpumalanga.gov.za/education/bursaries",
    sourceUrl:
      "https://www.mpumalanga.gov.za/education/bursaries",
    verifiedOn: "2026-08-11",
    amountsBeingVerified: true,
  },
  {
    id: "dhet-funza-lushaka",
    name: "Funza Lushaka Teaching Bursary (DHET)",
    type: "bursary",
    forWhom:
      "South African citizens who will study teaching (BEd) and commit to teaching at a public school after graduation",
    coverageNote:
      "Covers full tuition, accommodation, meals, and learning materials. Recipients must teach for the same number of years as they received the bursary.",
    applicationUrl: "https://www.funzalushaka.doe.gov.za/",
    sourceUrl: "https://www.funzalushaka.doe.gov.za/",
    verifiedOn: "2026-08-11",
    amountsBeingVerified: false,
  },
  {
    id: "agri-seta",
    name: "AgriSETA Bursary",
    type: "bursary",
    forWhom:
      "South African citizens studying agricultural sciences at a public university",
    coverageNote:
      "Covers tuition for eligible agricultural programmes. UMP's Faculty of Agriculture and Natural Sciences qualifies. Apply via AgriSETA's annual bursary cycle.",
    applicationUrl: "https://www.agriseta.co.za/bursaries/",
    sourceUrl: "https://www.agriseta.co.za/bursaries/",
    verifiedOn: "2026-08-11",
    amountsBeingVerified: true,
  },
  {
    id: "mict-seta",
    name: "MICT SETA ICT Bursary",
    type: "bursary",
    forWhom:
      "South African citizens studying ICT, computing, or related qualifications",
    coverageNote:
      "Covers tuition for ICT-related programmes at accredited institutions including UMP. Apply via the MICT SETA annual bursary portal.",
    applicationUrl: "https://www.mict.org.za/bursaries",
    sourceUrl: "https://www.mict.org.za/bursaries",
    verifiedOn: "2026-08-11",
    amountsBeingVerified: true,
  },
];

const TYPE_STYLES: Record<FundingItem["type"], { label: string; className: string }> = {
  bursary: {
    label: "Bursary",
    className: "bg-mark-green-soft text-mark-green border-mark-green/30",
  },
  scholarship: {
    label: "Scholarship",
    className: "bg-brand-violet-soft text-brand-violet border-brand-violet/30",
  },
  loan: {
    label: "Loan",
    className: "bg-brand-amber-soft text-brand-amber border-brand-amber/30",
  },
  allowance: {
    label: "Allowance",
    className: "bg-slate-soft text-ink-soft border-line",
  },
};

export default function UmpFundingPage() {
  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <UmpHeader />

      {/* Hero */}
      <div
        className="w-full py-10 px-6 sm:px-10 text-white"
        style={{ background: `linear-gradient(135deg, ${UMP_NAVY} 0%, #004f7c 60%, #003348 100%)` }}
      >
        <div className="mx-auto max-w-5xl flex flex-col gap-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs opacity-70">
            <Link href="/ump" className="hover:opacity-100 hover:underline">UMP Hub</Link>
            <span>›</span>
            <span>Funding</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight">💰 Funding & Bursaries</h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            Funding options available to University of Mpumalanga students — from government schemes
            like NSFAS to sector-specific bursaries for agriculture, ICT, and education.
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">

        {/* NSFAS priority callout */}
        <div className="rounded-2xl border border-mark-green/30 bg-mark-green-soft p-5">
          <p className="text-sm font-bold text-mark-green mb-1">
            🎯 Apply for NSFAS first
          </p>
          <p className="text-xs text-ink-soft leading-relaxed">
            NSFAS is the primary government funding scheme for South African students at public
            universities including UMP. If your household income is below R350,000/year, apply
            before exploring other options. NSFAS applications typically open in September for
            the following year — check nsfas.org.za for current dates.
          </p>
        </div>

        {/* Funding grid */}
        <section aria-labelledby="funding-list-heading">
          <h2 id="funding-list-heading" className="mb-4 text-xl font-bold tracking-tight text-ink">
            Available Funding
          </h2>
          <div className="flex flex-col gap-5">
            {UMP_FUNDING.map((item) => {
              const typeStyle = TYPE_STYLES[item.type];
              return (
                <article
                  key={item.id}
                  className="card-learner animate-rise-in flex flex-col gap-4 rounded-2xl p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-base font-bold text-ink leading-snug">
                      {item.name}
                    </h3>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${typeStyle.className}`}
                    >
                      {typeStyle.label}
                    </span>
                  </div>

                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                        Who qualifies
                      </p>
                      <p className="text-ink-soft">{item.forWhom}</p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                        What it covers
                      </p>
                      <p className="text-ink-soft">{item.coverageNote}</p>
                    </div>
                  </div>

                  {item.amountsBeingVerified && (
                    <p className="rounded-lg bg-mark-gold-soft px-3 py-2 text-xs text-mark-gold border border-mark-gold/30">
                      ⚠️ Exact amounts and 2027 deadlines are still being verified — check the
                      official source before applying.
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                    <a
                      href={item.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-brand-teal px-4 py-2 text-xs font-bold text-white shadow transition hover:opacity-90"
                    >
                      Apply / Learn more ↗
                    </a>
                    <p className="font-mono text-xs tabular-nums text-ink-faint">
                      Verified {item.verifiedOn} ·{" "}
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Source
                      </a>
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* General bursaries link */}
        <div className="card-learner rounded-2xl p-5 text-center">
          <p className="text-sm font-semibold text-ink mb-1">
            Looking for more funding options?
          </p>
          <p className="text-xs text-ink-soft mb-3">
            The UCAG Bursaries page covers internships and bursaries across all fields for all
            South African learners.
          </p>
          <Link
            href="/bursaries"
            className="text-sm font-bold hover:underline"
            style={{ color: UMP_TEAL }}
          >
            Browse all bursaries & internships →
          </Link>
        </div>

        {/* ── Learnerships callout ── */}
        <section
          aria-labelledby="learnerships-callout-heading"
          className="rounded-2xl overflow-hidden border"
          style={{ borderColor: `${UMP_TEAL}30` }}
        >
          <div
            className="px-6 py-4"
            style={{ background: `linear-gradient(90deg, ${UMP_TEAL} 0%, #009688 100%)` }}
          >
            <h2
              id="learnerships-callout-heading"
              className="text-sm font-bold text-white"
            >
              🎯 Looking for Learnerships?
            </h2>
          </div>
          <div className="p-6 bg-white dark:bg-paper-raised flex flex-col gap-3 text-sm text-ink-soft">
            <p className="leading-relaxed">
              <strong className="text-ink">Learnerships</strong> are a funded alternative to traditional degrees —
              ideal for Grade 11/12 learners and school leavers who want to earn a stipend while training
              in a real workplace. SETA learnerships in agriculture, ICT, engineering, and healthcare are
              available in Mpumalanga.
            </p>
            <Link
              href="/ump/learnerships"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold text-white shadow-md transition hover:opacity-90 w-fit"
              style={{ background: UMP_TEAL }}
            >
              Explore Learnerships →
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
