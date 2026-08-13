// cSpell:words Mpumalanga NSFAS MERSETA AgriSETA MICT learnerships SETA Nelspruit Siyabuswa CHIETA ETDP HWSETA FASSET
import type { Metadata } from "next";
import Link from "next/link";
import { LABELS } from "@/config/labels";
import { UmpHeader } from "@/components/ump/UmpHeader";

export const metadata: Metadata = {
  title: `Learnerships & Apprenticeships -- ${LABELS.app.name}`,
  description:
    "SETA-registered learnerships and apprenticeships for Grade 11/12 learners and school leavers in Mpumalanga — AgriSETA, MICT SETA, MERSETA, and more. No degree required.",
};

const UMP_NAVY = "#003b5c";
const UMP_GOLD = "#d4af37";
const UMP_TEAL = "#00a896";

interface Learnership {
  id: string;
  seta: string;
  title: string;
  nqfLevel: number;
  durationMonths: number;
  forWhom: string;
  stipend: string;
  sectors: string[];
  applyUrl: string;
  sourceUrl: string;
  verifiedOn: string;
}

const LEARNERSHIPS: Learnership[] = [
  {
    id: "agriseta-plant",
    seta: "AgriSETA",
    title: "Plant Production (Mixed Farming Systems)",
    nqfLevel: 2,
    durationMonths: 12,
    forWhom: "Grade 11 pass minimum; no Grade 12 required",
    stipend: "R2 500 – R3 500/month (varies by employer)",
    sectors: ["Agriculture", "Natural Sciences"],
    applyUrl: "https://www.agriseta.co.za/learnerships/",
    sourceUrl: "https://www.agriseta.co.za/learnerships/",
    verifiedOn: "2026-08-12",
  },
  {
    id: "agriseta-animal",
    seta: "AgriSETA",
    title: "Animal Production (Livestock Farming)",
    nqfLevel: 2,
    durationMonths: 12,
    forWhom: "Grade 11 pass minimum; South African citizen",
    stipend: "R2 500 – R3 500/month (varies by employer)",
    sectors: ["Agriculture"],
    applyUrl: "https://www.agriseta.co.za/learnerships/",
    sourceUrl: "https://www.agriseta.co.za/learnerships/",
    verifiedOn: "2026-08-12",
  },
  {
    id: "mict-it-support",
    seta: "MICT SETA",
    title: "IT Technical Support (End User Computing)",
    nqfLevel: 3,
    durationMonths: 12,
    forWhom: "Grade 12 (Matric) with Mathematics or Mathematical Literacy",
    stipend: "R3 000 – R4 500/month (varies by employer)",
    sectors: ["Technology", "Computing"],
    applyUrl: "https://www.mict.org.za/learnerships",
    sourceUrl: "https://www.mict.org.za/learnerships",
    verifiedOn: "2026-08-12",
  },
  {
    id: "merseta-engineering",
    seta: "MERSETA",
    title: "Engineering Fitting & Turning (Apprenticeship)",
    nqfLevel: 3,
    durationMonths: 36,
    forWhom: "Grade 12 with Physical Sciences and Mathematics (50%+)",
    stipend: "R3 500 – R6 000/month depending on year",
    sectors: ["Engineering", "Manufacturing"],
    applyUrl: "https://www.merseta.org.za/learnerships-apprenticeships/",
    sourceUrl: "https://www.merseta.org.za/learnerships-apprenticeships/",
    verifiedOn: "2026-08-12",
  },
  {
    id: "merseta-welding",
    seta: "MERSETA",
    title: "Boilermaking / Welding (Apprenticeship)",
    nqfLevel: 3,
    durationMonths: 36,
    forWhom: "Grade 10 or higher; strong numeracy skills",
    stipend: "R3 000 – R5 500/month",
    sectors: ["Engineering", "Manufacturing"],
    applyUrl: "https://www.merseta.org.za/learnerships-apprenticeships/",
    sourceUrl: "https://www.merseta.org.za/learnerships-apprenticeships/",
    verifiedOn: "2026-08-12",
  },
  {
    id: "etdp-educare",
    seta: "ETDP SETA",
    title: "Early Childhood Development (ECD) Practice",
    nqfLevel: 4,
    durationMonths: 12,
    forWhom: "Grade 12; passion for working with young children",
    stipend: "R2 000 – R3 000/month (varies by placement)",
    sectors: ["Education", "Social Development"],
    applyUrl: "https://www.etdpseta.org.za/",
    sourceUrl: "https://www.etdpseta.org.za/",
    verifiedOn: "2026-08-12",
  },
  {
    id: "hwseta-healthcare",
    seta: "HWSETA",
    title: "Healthcare Support (Nursing Auxiliary)",
    nqfLevel: 3,
    durationMonths: 12,
    forWhom: "Grade 12 with Life Sciences; South African citizen",
    stipend: "R2 500 – R4 000/month",
    sectors: ["Health", "Social Sciences"],
    applyUrl: "https://www.hwseta.org.za/",
    sourceUrl: "https://www.hwseta.org.za/",
    verifiedOn: "2026-08-12",
  },
];

const SECTOR_COLORS: Record<string, string> = {
  Agriculture: "#16a34a",
  "Natural Sciences": "#0d9488",
  Technology: "#7c3aed",
  Computing: "#2563eb",
  Engineering: "#d97706",
  Manufacturing: "#d97706",
  Education: "#0891b2",
  "Social Development": "#0891b2",
  Health: "#dc2626",
  "Social Sciences": "#9333ea",
};

export default function UmpLearnershipPage() {
  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <UmpHeader />

      {/* ── Hero ── */}
      <div
        className="w-full py-12 px-6 sm:px-10 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${UMP_NAVY} 0%, #004f7c 60%, #003348 100%)`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full opacity-10"
          style={{ background: UMP_TEAL }}
        />
        <div className="relative mx-auto max-w-5xl flex flex-col gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs opacity-70">
            <Link href="/ump" className="hover:opacity-100 hover:underline">UMP Hub</Link>
            <span>›</span>
            <span>Learnerships</span>
          </nav>
          <span
            className="w-fit rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
            style={{ borderColor: `${UMP_GOLD}50`, color: UMP_GOLD, background: `${UMP_GOLD}15` }}
          >
            🎯 Learnerships & Apprenticeships
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl leading-tight">
            Earn While You Learn —<br />
            <span style={{ color: UMP_GOLD }}>No Degree Required</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            SETA-registered learnerships combine theoretical training with workplace experience.
            They are open to Grade 11/12 learners, Matric school leavers, and unemployed youth —
            and include a monthly stipend while you train.
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 sm:p-8">

        {/* ── What is a Learnership? ── */}
        <section
          aria-labelledby="what-heading"
          className="rounded-2xl overflow-hidden border shadow-sm"
          style={{ borderColor: `${UMP_TEAL}30` }}
        >
          <div
            className="px-6 py-4"
            style={{ background: `linear-gradient(90deg, ${UMP_TEAL} 0%, #009688 100%)` }}
          >
            <h2 id="what-heading" className="text-sm font-bold text-white">
              💡 What is a Learnership?
            </h2>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-3 text-sm bg-white dark:bg-paper-raised">
            {[
              {
                icon: "📋",
                title: "SETA-Registered",
                desc: "All learnerships are registered with a SETA (Sector Education & Training Authority) and lead to an official NQF qualification.",
              },
              {
                icon: "💼",
                title: "Earn While You Learn",
                desc: "Learners receive a monthly stipend from the employer while completing structured workplace learning.",
              },
              {
                icon: "🎓",
                title: "NQF Certificate",
                desc: "Successful completion results in a nationally recognised certificate that counts towards further study or employment.",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col gap-2">
                <div
                  className="flex size-10 items-center justify-center rounded-xl text-xl"
                  style={{ background: `${UMP_TEAL}15` }}
                >
                  {item.icon}
                </div>
                <p className="font-bold text-ink">{item.title}</p>
                <p className="text-xs text-ink-soft leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Learnership listings ── */}
        <section aria-labelledby="listings-heading">
          <h2 id="listings-heading" className="mb-4 text-xl font-bold tracking-tight text-ink">
            Available Learnerships
          </h2>
          <p className="mb-5 text-xs text-ink-faint">
            Learnerships below are relevant to UMP programmes and Mpumalanga&apos;s key economic sectors. Deadlines and stipend amounts change annually — always verify on the SETA&apos;s official website.
          </p>

          <div className="flex flex-col gap-5">
            {LEARNERSHIPS.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border bg-white dark:bg-paper-raised p-6 shadow-sm hover:shadow-md transition"
                style={{ borderColor: `${UMP_NAVY}15` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className="rounded-full px-3 py-0.5 text-xs font-bold text-white"
                        style={{ background: UMP_NAVY }}
                      >
                        {item.seta}
                      </span>
                      <span
                        className="rounded-full border px-3 py-0.5 text-xs font-semibold"
                        style={{ borderColor: `${UMP_GOLD}60`, color: UMP_GOLD, background: `${UMP_GOLD}10` }}
                      >
                        NQF Level {item.nqfLevel}
                      </span>
                      <span className="rounded-full bg-slate-soft px-3 py-0.5 text-xs text-ink-soft border border-line">
                        {item.durationMonths} months
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-ink leading-snug">{item.title}</h3>
                  </div>
                  {/* Sectors */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.sectors.map((s) => (
                      <span
                        key={s}
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
                        style={{ background: SECTOR_COLORS[s] ?? UMP_TEAL }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-ink-faint">Who qualifies</p>
                    <p className="text-ink-soft text-xs leading-relaxed">{item.forWhom}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-ink-faint">Monthly stipend</p>
                    <p className="text-ink font-semibold text-xs">{item.stipend}</p>
                  </div>
                </div>

                <p className="rounded-xl bg-mark-gold-soft border border-mark-gold/25 px-4 py-2.5 text-xs text-mark-gold">
                  ⚠️ Stipend amounts and intake dates change annually. Check the official SETA website for current opportunities before applying.
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                  <a
                    href={item.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:opacity-90"
                    style={{ background: UMP_NAVY }}
                  >
                    Apply / Find Employer ↗
                  </a>
                  <p className="font-mono text-[10px] text-ink-faint">
                    Verified {item.verifiedOn} ·{" "}
                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
                      Source
                    </a>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── NSFAS note ── */}
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: `linear-gradient(135deg, ${UMP_NAVY} 0%, #004f7c 100%)` }}
        >
          <h3 className="font-bold text-base mb-2" style={{ color: UMP_GOLD }}>
            🎓 Thinking about University instead?
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            UMP offers comprehensive degree programmes funded through NSFAS for qualifying students. If your Matric results qualify, you may be eligible for full funding.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/ump/programmes"
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-extrabold"
              style={{ background: UMP_GOLD, color: UMP_NAVY }}
            >
              Browse UMP Programmes →
            </Link>
            <Link
              href="/ump/funding"
              className="inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-xs font-bold text-white"
              style={{ borderColor: "rgba(255,255,255,0.3)" }}
            >
              NSFAS & Bursaries →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
