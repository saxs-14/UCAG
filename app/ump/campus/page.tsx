import type { Metadata } from "next";
import Link from "next/link";
import { LABELS } from "@/config/labels";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: `UMP Campus Guide -- ${LABELS.app.name}`,
  description: "Comprehensive guide to University of Mpumalanga Mbombela and Siyabuswa campuses — residences, libraries, laboratories, student services, and facilities.",
};

const UMP_CAMPUSES = [
  {
    id: "mbombela",
    name: "Mbombela Campus (Main Campus)",
    location: "D725 Road, Mbombela (Nelspruit), Mpumalanga",
    description: "The primary campus of UMP, housing the Faculties of Economics, Development & Business Sciences, and Agriculture & Natural Sciences.",
    residences: [
      "On-campus student residences with single and shared self-catering options.",
      "24/7 security access control and student Wi-Fi coverage.",
      "Accredited off-campus private accommodation within 5 km radius.",
    ],
    facilities: [
      "Modern Central Library & Information Centre with digital research labs.",
      "State-of-the-art Science Laboratories & Agricultural Experimental Farm.",
      "Student Wellness Centre (clinic, counseling, sports fields, cafeteria).",
    ],
    transport: "Local minibus taxis and campus shuttle service running between Mbombela CBD and campus.",
    contacts: {
      switchboard: "+27 13 002 0001",
      email: "info@ump.ac.za",
    },
    sourceUrl: "https://www.ump.ac.za/About-Us/Campuses/Mbombela-Campus",
    verifiedOn: "2026-08-11",
  },
  {
    id: "siyabuswa",
    name: "Siyabuswa Campus",
    location: "Bophirima Street, Siyabuswa, Mpumalanga",
    description: "Home to UMP's Faculty of Education, specializing in Foundation and Intermediate Phase Teacher Education.",
    residences: [
      "On-campus student residence blocks with communal dining and study areas.",
      "Dedicated residence tutors and security officers.",
    ],
    facilities: [
      "Education Resource Centre & Curriculum Teaching Library.",
      "Micro-teaching simulation rooms and ICT computer centers.",
      "Multipurpose sports grounds and student center.",
    ],
    transport: "Local commuter transport and direct links to Siyabuswa bus terminal.",
    contacts: {
      switchboard: "+27 13 002 0800",
      email: "info@ump.ac.za",
    },
    sourceUrl: "https://www.ump.ac.za/About-Us/Campuses/Siyabuswa-Campus",
    verifiedOn: "2026-08-11",
  },
];

export default function UmpCampusGuidePage() {
  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <PageHero
        title="UMP Campus Guide"
        subtitle="Explore University of Mpumalanga campuses — Mbombela Main Campus & Siyabuswa Education Campus facilities, residences, libraries, and student services."
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 sm:p-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-faint">
          <Link href="/ump" className="hover:text-brand-teal hover:underline">UMP Hub</Link>
          <span>›</span>
          <span className="text-ink-soft font-medium">Campus Guide</span>
        </nav>

        <div className="flex flex-col gap-8">
          {UMP_CAMPUSES.map((campus) => (
            <section key={campus.id} className="card-learner rounded-3xl p-6 sm:p-8 flex flex-col gap-5">
              <div className="border-b border-line pb-4">
                <span className="rounded-full bg-brand-teal-soft text-brand-teal border border-brand-teal/30 px-3 py-1 text-xs font-bold">
                  Official Campus
                </span>
                <h2 className="text-xl font-extrabold text-ink mt-2">{campus.name}</h2>
                <p className="text-xs font-medium text-ink-soft mt-1">📍 {campus.location}</p>
                <p className="text-xs text-ink-soft leading-relaxed mt-2">{campus.description}</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 text-xs">
                {/* Residences */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-ink text-sm flex items-center gap-1.5">
                    🏠 Residences & Housing
                  </h3>
                  <ul className="flex flex-col gap-1.5 text-ink-soft">
                    {campus.residences.map((res, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-brand-teal">›</span>
                        {res}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Facilities */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-ink text-sm flex items-center gap-1.5">
                    🔬 Facilities & Laboratories
                  </h3>
                  <ul className="flex flex-col gap-1.5 text-ink-soft">
                    {campus.facilities.map((fac, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-brand-teal">›</span>
                        {fac}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Transport & Contacts */}
              <div className="rounded-2xl bg-slate-soft p-4 text-xs flex flex-wrap justify-between items-center gap-3">
                <div>
                  <span className="font-bold text-ink">🚌 Transport:</span>{" "}
                  <span className="text-ink-soft">{campus.transport}</span>
                </div>
                <div className="flex items-center gap-4 text-ink font-mono font-semibold">
                  <span>📞 {campus.contacts.switchboard}</span>
                  <span>✉ {campus.contacts.email}</span>
                </div>
              </div>

              <p className="font-mono text-[10px] text-ink-faint">
                Verified {campus.verifiedOn} ·{" "}
                <a href={campus.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  Source
                </a>
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
