// cSpell:words Siyabuswa Mpumalanga Mbombela Nelspruit Bophirima
import type { Metadata } from "next";
import Link from "next/link";
import { LABELS } from "@/config/labels";
import { UmpHeader } from "@/components/ump/UmpHeader";

export const metadata: Metadata = {
  title: `UMP Campus Guide -- ${LABELS.app.name}`,
  description:
    "Comprehensive guide to University of Mpumalanga Mbombela and Siyabuswa campuses — residences, libraries, laboratories, student services, and facilities.",
};

const UMP_NAVY = "#003b5c";
const UMP_GOLD = "#d4af37";
const UMP_TEAL = "#00a896";

const UMP_CAMPUSES = [
  {
    id: "mbombela",
    name: "Mbombela Campus",
    badge: "Main Campus",
    location: "D725 Road, Mbombela (Nelspruit), Mpumalanga",
    description:
      "The primary campus of UMP, housing the Faculties of Economics, Development & Business Sciences, and Agriculture & Natural Sciences.",
    residences: [
      "On-campus student residences with single and shared self-catering options.",
      "24/7 security access control and student Wi-Fi coverage.",
      "Accredited off-campus private accommodation within 5 km radius.",
    ],
    facilities: [
      "Modern Central Library & Information Centre with digital research labs.",
      "State-of-the-art Science Laboratories & Agricultural Experimental Farm.",
      "Student Wellness Centre (clinic, counselling, sports fields, cafeteria).",
    ],
    transport:
      "Local minibus taxis and campus shuttle service running between Mbombela CBD and campus.",
    contacts: { switchboard: "+27 13 002 0001", email: "info@ump.ac.za" },
    sourceUrl: "https://www.ump.ac.za/About-Us/Campuses/Mbombela-Campus",
    verifiedOn: "2026-08-11",
  },
  {
    id: "siyabuswa",
    name: "Siyabuswa Campus",
    badge: "Education Campus",
    location: "Bophirima Street, Siyabuswa, Mpumalanga",
    description:
      "Home to UMP's Faculty of Education, specialising in Foundation and Intermediate Phase Teacher Education.",
    residences: [
      "On-campus student residence blocks with communal dining and study areas.",
      "Dedicated residence tutors and security officers.",
    ],
    facilities: [
      "Education Resource Centre & Curriculum Teaching Library.",
      "Micro-teaching simulation rooms and ICT computer centres.",
      "Multipurpose sports grounds and student centre.",
    ],
    transport:
      "Local commuter transport and direct links to Siyabuswa bus terminal.",
    contacts: { switchboard: "+27 13 002 0800", email: "info@ump.ac.za" },
    sourceUrl: "https://www.ump.ac.za/About-Us/Campuses/Siyabuswa-Campus",
    verifiedOn: "2026-08-11",
  },
];

export default function UmpCampusGuidePage() {
  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <UmpHeader />

      {/* Hero */}
      <div
        className="w-full py-10 px-6 sm:px-10 text-white"
        style={{
          background: `linear-gradient(135deg, ${UMP_NAVY} 0%, #004f7c 60%, #003348 100%)`,
        }}
      >
        <div className="mx-auto max-w-5xl flex flex-col gap-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs opacity-70"
          >
            <Link href="/ump" className="hover:opacity-100 hover:underline">
              UMP Hub
            </Link>
            <span>›</span>
            <span>Campus Guide</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight">
            🏛️ Campus Guide
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            Explore University of Mpumalanga campuses — Mbombela Main Campus &
            Siyabuswa Education Campus facilities, residences, libraries, and
            student services.
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 sm:p-8">
        {UMP_CAMPUSES.map((campus) => (
          <section
            key={campus.id}
            className="flex flex-col gap-5 rounded-3xl border bg-white dark:bg-paper-raised p-6 sm:p-8 shadow-sm"
            style={{ borderColor: `${UMP_NAVY}20` }}
          >
            <div
              className="border-b pb-4"
              style={{ borderColor: `${UMP_GOLD}30` }}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold text-white"
                  style={{ background: UMP_NAVY }}
                >
                  Official Campus
                </span>
                <span
                  className="rounded-full border px-3 py-1 text-xs font-bold"
                  style={{
                    borderColor: `${UMP_GOLD}60`,
                    color: UMP_GOLD,
                    background: `${UMP_GOLD}10`,
                  }}
                >
                  {campus.badge}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-ink">{campus.name}</h2>
              <p className="text-xs font-medium text-ink-soft mt-1">
                📍 {campus.location}
              </p>
              <p className="text-xs text-ink-soft leading-relaxed mt-2">
                {campus.description}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 text-xs">
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-sm text-ink flex items-center gap-1.5">
                  🏠 Residences & Housing
                </h3>
                <ul className="flex flex-col gap-1.5 text-ink-soft">
                  {campus.residences.map((res, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span style={{ color: UMP_TEAL }} className="mt-0.5">
                        ›
                      </span>
                      {res}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-sm text-ink flex items-center gap-1.5">
                  🔬 Facilities & Laboratories
                </h3>
                <ul className="flex flex-col gap-1.5 text-ink-soft">
                  {campus.facilities.map((fac, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span style={{ color: UMP_TEAL }} className="mt-0.5">
                        ›
                      </span>
                      {fac}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              className="rounded-2xl p-4 text-xs flex flex-wrap justify-between items-center gap-3"
              style={{
                background: `${UMP_NAVY}08`,
                border: `1px solid ${UMP_NAVY}15`,
              }}
            >
              <div>
                <span className="font-bold text-ink">🚌 Transport: </span>
                <span className="text-ink-soft">{campus.transport}</span>
              </div>
              <div className="flex items-center gap-4 font-mono font-semibold text-ink">
                <span>📞 {campus.contacts.switchboard}</span>
                <span>✉ {campus.contacts.email}</span>
              </div>
            </div>

            <p className="font-mono text-[10px] text-ink-faint">
              Verified {campus.verifiedOn} ·{" "}
              <a
                href={campus.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Source
              </a>
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
