// cSpell:words Mpumalanga Siyabuswa NSFAS UCAG learnerships
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

/** UMP official brand colors */
const UMP_NAVY = "#003b5c";
const UMP_GOLD = "#d4af37";
const UMP_TEAL = "#00a896";

const UMP_NAV = [
  { href: "/ump", label: "Overview" },
  { href: "/ump/programmes", label: "Programmes" },
  { href: "/ump/learnerships", label: "Learnerships" },
  { href: "/ump/funding", label: "Funding" },
  { href: "/ump/campus", label: "Campuses" },
  { href: "/ump/careers", label: "Careers" },
  { href: "/ump/mentors", label: "Mentors" },
];

export function UmpHeader() {
  const pathname = usePathname();

  return (
    <div className="w-full">
      {/* ── Main brand header ── */}
      <div
        className="w-full py-6 px-6 sm:px-10"
        style={{
          background: `linear-gradient(135deg, ${UMP_NAVY} 0%, #004f7c 60%, #005a8e 100%)`,
        }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6">
          {/* Logo + wordmark */}
          <Link href="/ump" className="flex items-center gap-4 group">
            <div
              className="flex size-14 items-center justify-center rounded-2xl shadow-lg flex-shrink-0"
              style={{ background: UMP_GOLD }}
            >
              {/* Try remote logo; fall back to stylised shield text */}
              <Image
                src="https://www.ump.ac.za/images/logo.png"
                alt="UMP Logo"
                width={44}
                height={44}
                className="object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML =
                      `<span style="font-size:1.5rem;font-weight:900;color:${UMP_NAVY};letter-spacing:-0.05em">UMP</span>`;
                  }
                }}
              />
            </div>
            <div className="text-white">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-75">
                University of
              </p>
              <p className="text-lg font-extrabold tracking-tight leading-tight group-hover:opacity-90 transition">
                Mpumalanga
              </p>
              <p
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: UMP_GOLD }}
              >
                Smart Admission Platform
              </p>
            </div>
          </Link>

          {/* Apply CTA */}
          <a
            href="https://www.ump.ac.za/Admissions"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-extrabold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 flex-shrink-0"
            style={{
              background: UMP_GOLD,
              color: UMP_NAVY,
            }}
          >
            Apply Now ↗
          </a>
        </div>
      </div>

      {/* ── Sub-navigation ── */}
      <div
        className="w-full border-b overflow-x-auto"
        style={{
          background: `linear-gradient(90deg, #002e47 0%, ${UMP_NAVY} 100%)`,
          borderColor: `${UMP_GOLD}33`,
        }}
      >
        <nav
          aria-label="UMP section navigation"
          className="mx-auto flex max-w-5xl items-center gap-0.5 px-4 py-1 text-xs font-semibold scrollbar-none"
        >
          {UMP_NAV.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className="flex-none whitespace-nowrap rounded-lg px-3 py-2 transition-all duration-150"
                style={
                  isActive
                    ? {
                        background: UMP_GOLD,
                        color: UMP_NAVY,
                        fontWeight: 800,
                      }
                    : {
                        color: "rgba(255,255,255,0.8)",
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                }}
              >
                {label}
                {href === "/ump/learnerships" && (
                  <span
                    className="ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold"
                    style={{ background: UMP_TEAL, color: "white" }}
                  >
                    NEW
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
