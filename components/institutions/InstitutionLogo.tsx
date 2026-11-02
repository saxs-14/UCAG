"use client";

import { useState } from "react";

export function InstitutionLogo({ logoUrl, shortName }: { logoUrl: string | null; shortName: string }) {
  const [failed, setFailed] = useState(false);

  if (!logoUrl || failed) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-white/40 bg-white/20 text-xl font-black tracking-wider text-white shadow-inner backdrop-blur-sm">
        {shortName.substring(0, 3).toUpperCase()}
      </div>
    );
  }

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/40 bg-white p-2.5 shadow-lg shadow-black/5">
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