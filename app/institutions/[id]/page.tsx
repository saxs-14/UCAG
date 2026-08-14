// cSpell:words keyfacts
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SEED_INSTITUTIONS } from "@/config/institutions.seed";
import { getInstitutionBranding } from "@/lib/institutions/branding";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const inst = SEED_INSTITUTIONS.find((i) => i.id.toLowerCase() === id.toLowerCase());
  if (!inst) return { title: "Institution Not Found -- UCAG" };

  return {
    title: `${inst.name} (${inst.shortName}) -- UCAG Institution Directory`,
    description: `Admission requirements, APS calculation rules, and verified programme information for ${inst.name}.`,
  };
}

export const dynamic = "force-dynamic";

export default async function InstitutionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const inst = SEED_INSTITUTIONS.find((i) => i.id.toLowerCase() === id.toLowerCase());

  if (!inst) notFound();

  const branding = getInstitutionBranding(inst.id);
  const isUmp = inst.id === "ump";

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      {/* Institution Branded Hero */}
      <div className={`w-full border-b border-white/10 py-12 shadow-md ${branding.heroStyle}`}>
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold text-white border border-white/30 w-fit">
            <span>🏛️ {inst.province} Province · Tier {inst.tier} Institution</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl font-extrabold text-white border border-white/30 shadow-inner">
              {inst.shortName.substring(0, 3)}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
                {inst.name} ({inst.shortName})
              </h1>
              <p className="text-xs text-white/80 font-medium">
                {inst.type === "traditionalUniversity"
                  ? "Traditional Public University"
                  : inst.type === "universityOfTechnology"
                  ? "University of Technology"
                  : "Distance Education University"}
              </p>
            </div>
          </div>

          <p className="max-w-2xl text-sm sm:text-base text-white/90 leading-relaxed">
            Official South African higher education institution profile, verified APS scoring rules, degree entry requirements, and application portals.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white text-xs font-extrabold text-brand-navy shadow hover:bg-slate-100 transition px-4 py-2.5"
            >
              🎓 Calculate {inst.shortName} APS →
            </Link>

            {isUmp ? (
              <Link
                href="/ump/programmes"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-teal px-4 py-2.5 text-xs font-extrabold text-white shadow hover:opacity-90 transition"
              >
                Explore UMP Degrees →
              </Link>
            ) : (
              <Link
                href="/programmes"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 border border-white/30 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-white/30 transition"
              >
                Browse All Programmes →
              </Link>
            )}

            {inst.applicationPortalUrl && (
              <a
                href={inst.applicationPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-white/20 transition"
              >
                Official Application Portal ↗
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 sm:p-8">
        {/* Key Information Grid */}
        <section aria-labelledby="inst-keyfacts-heading" className="grid gap-4 sm:grid-cols-3">
          <div className="card-learner rounded-2xl p-5 border border-line flex flex-col gap-1">
            <span className="text-xs font-semibold text-ink-soft">Institution Type</span>
            <p className="font-bold text-sm text-ink">
              {inst.type === "traditionalUniversity"
                ? "Traditional University"
                : inst.type === "universityOfTechnology"
                ? "University of Technology"
                : "Distance Education University"}
            </p>
          </div>

          <div className="card-learner rounded-2xl p-5 border border-line flex flex-col gap-1">
            <span className="text-xs font-semibold text-ink-soft">NBT Requirements</span>
            <p className="font-bold text-sm text-ink">
              {inst.nbtRequired ? "Required for select faculties" : "Not required"}
            </p>
          </div>

          <div className="card-learner rounded-2xl p-5 border border-line flex flex-col gap-1">
            <span className="text-xs font-semibold text-ink-soft">Verified Status</span>
            <p className="font-bold text-sm text-emerald-700">
              Verified for Academic Year {inst.academicYear}
            </p>
          </div>
        </section>

        {/* Institution Specific APS Rules */}
        <section aria-labelledby="aps-rule-heading" className="card-learner rounded-2xl p-6 border border-line">
          <h2 id="aps-rule-heading" className="text-base font-bold text-ink mb-2">
            📐 {inst.shortName} Admission Point Score (APS) Formula Rules
          </h2>
          <p className="text-xs text-ink-soft leading-relaxed mb-3">
            {inst.id === "uct"
              ? "UCT calculates admission using Faculty Points Score (FPS / WPS). English Home or First Additional Language and Mathematics percentages are summed with your next 4 best subjects (excluding Life Orientation) out of a maximum of 600 points."
              : inst.id === "ump"
              ? "UMP evaluates 7 NSC subjects total. Life Orientation is divided by 2 (50% weight) when computing your overall APS score."
              : inst.id === "up"
              ? "UP computes APS using your 6 best NSC subjects, completely excluding Life Orientation."
              : inst.id === "wits"
              ? "Wits calculates APS using your best 7 subjects including LO, with additional bonus points awarded for scoring 60%+ in English and Mathematics."
              : `Calculated using verified ${inst.shortName} admission subject level conversion tables for Academic Year ${inst.academicYear}.`}
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-extrabold text-brand-teal hover:underline"
          >
            Calculate Your {inst.shortName} APS Now →
          </Link>
        </section>

        {/* Campuses & Links */}
        <section aria-labelledby="campuses-heading" className="card-learner rounded-2xl p-6 border border-line">
          <h2 id="campuses-heading" className="text-base font-bold text-ink mb-2">
            📍 Primary Campuses & Location
          </h2>
          <p className="text-xs text-ink-soft mb-3">
            Primary campuses in {inst.province}: {inst.campuses.length > 0 ? inst.campuses.join(", ") : "Main Campus"}.
          </p>

          {inst.websiteUrl && (
            <a
              href={inst.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-teal hover:underline"
            >
              Visit Official {inst.shortName} Website ({inst.websiteUrl}) ↗
            </a>
          )}
        </section>
      </div>
    </main>
  );
}
