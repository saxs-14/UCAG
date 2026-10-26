"use client";

import { useState } from "react";

/**
 * Renders the institution's real, verified logo (lib/institutions/
 * branding.ts) on a white chip so multi-color crest artwork reads
 * clearly against the colored hero behind it. Falls back to the
 * existing text-initial badge if logoUrl is null (uj/cput -- no
 * verified logo yet) or if the real URL ever stops resolving, rather
 * than showing a broken-image icon.
 */
export function InstitutionLogo({ logoUrl, shortName }: { logoUrl: string | null; shortName: string }) {
  const [failed, setFailed] = useState(false);

  if (!logoUrl || failed) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-2xl font-extrabold text-white shadow-inner">
        {shortName.substring(0, 3)}
      </div>
    );
  }

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/30 bg-white p-2 shadow-inner">
      {/* eslint-disable-next-line @next/next/no-img-element -- external
          institution logo from a handful of trusted, verified domains;
          not run through next/image on purpose, see branding.ts */}
      <img
        src={logoUrl}
        alt={`${shortName} logo`}
        className="h-full w-full object-contain"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
