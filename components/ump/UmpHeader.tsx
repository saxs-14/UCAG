"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

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
];

export function UmpHeader() {
  const pathname = usePathname();

  return (
    <div className="w-full shadow-md">
      <div
        className="w-full py-6 px-6 sm:px-10"
        style={{
          background: `linear-gradient(135deg, ${UMP_NAVY} 0%, #004f7c 60%, #005a8e 100%)`,
        }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6">
          <Link href="/ump" className="flex items-center gap-4 group">
            <div
              className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-lg"
              style={{ border: `2px solid ${UMP_GOLD}` }}
            >
              <Image
                src="https://www.ump.ac.za/images/logo.png"
                alt="UMP Logo"
                width={56}
                height={56}
                // h-full/w-full + object-contain (not a fixed pixel size
                // smaller than the box) -- matching how every other
                // institution's logo badge fills its own box
                // (InstitutionLogo.tsx). A hardcoded 44px image inside a
                // 56px box left a visible gap of flat gold background
                // around the logo instead of the logo actually filling
                // the badge it sits in.
                className="h-full w-full object-contain"
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
              <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-75">
                University of
              </p>
              <p className="text-xl font-black tracking-tight leading-tight group-hover:opacity-90 transition">
                Mpumalanga
              </p>
              <p
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ color: UMP_GOLD }}
              >
                Smart Admission Platform
              </p>
            </div>
          </Link>

          <a
            // Was /Admissions -- confirmed 404 by a direct fetch. This is
            // the same application URL already verified and used as UMP's
            // applicationPortalUrl in config/institutions.seed.ts (a real
            // 200, confirmed the same way).
            href="https://www.ump.ac.za/Study-with-us/Application-Process/Online-Applications"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-black shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 flex-shrink-0"
            style={{
              background: UMP_GOLD,
              color: UMP_NAVY,
            }}
          >
            Apply Now ↗
          </a>
        </div>
      </div>

      <div
        className="w-full border-b overflow-x-auto shadow-inner"
        style={{
          background: `linear-gradient(90deg, #002e47 0%, ${UMP_NAVY} 100%)`,
          borderColor: `${UMP_GOLD}33`,
        }}
      >
        <nav
          aria-label="UMP section navigation"
          className="mx-auto flex max-w-5xl items-center gap-2 px-6 py-2.5 text-xs font-bold scrollbar-none"
        >
          {UMP_NAV.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className="flex-none whitespace-nowrap rounded-xl px-4 py-2 transition-all duration-200"
                style={
                  isActive
                    ? {
                        background: UMP_GOLD,
                        color: UMP_NAVY,
                        fontWeight: 900,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }
                    : {
                        color: "rgba(255,255,255,0.85)",
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.12)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                }}
              >
                {label}
                {href === "/ump/learnerships" && (
                  <span
                    className="ml-1.5 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
                    style={{ background: UMP_TEAL, color: "white" }}
                  >
                    New
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