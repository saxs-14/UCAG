"use client";

import { useState } from "react";
import { buildShareUrl } from "@/lib/shareLink";
import { getBaseUrl } from "@/lib/env/client";
import type { SubjectMarkInput } from "@/lib/aps/types";

export function ShareBar({ marks }: { marks: SubjectMarkInput[] }) {
  const [copied, setCopied] = useState(false);

  async function handleCopyLink() {
    const url = buildShareUrl(getBaseUrl(), marks);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleCopyLink}
        className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-line bg-paper-raised px-5 text-sm font-bold text-ink shadow-sm transition-all hover:border-brand-teal hover:text-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20"
      >
        {copied ? "✓ Link Copied!" : "🔗 Copy Share Link"}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-line bg-paper-raised px-5 text-sm font-bold text-ink shadow-sm transition-all hover:border-brand-teal hover:text-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20"
      >
        📄 Download PDF
      </button>
    </div>
  );
}