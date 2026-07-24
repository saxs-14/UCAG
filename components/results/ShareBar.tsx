"use client";

import { useState } from "react";
import { buildShareUrl } from "@/lib/shareLink";
import { getBaseUrl } from "@/lib/env/client";
import type { SubjectMarkInput } from "@/lib/aps/types";

/**
 * "Results shareable as a link and downloadable as a one-page PDF"
 * (docs/MASTER_PROMPT_v2.md sect. 3). The PDF is implemented via the
 * browser's native print-to-PDF (window.print + a print stylesheet in
 * app/globals.css) rather than a client-side PDF library -- keeps this
 * route's JS bundle small (Phase 8's <200KB budget), and a real save
 * dialog produces a genuine, well-formed one-page PDF including the
 * verification dates already printed on each card. Revisit in Phase 8/9
 * if a one-click blob download is preferred instead.
 */
export function ShareBar({ marks }: { marks: SubjectMarkInput[] }) {
  const [copied, setCopied] = useState(false);

  async function handleCopyLink() {
    const url = buildShareUrl(getBaseUrl(), marks);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be denied/unavailable -- fail visibly, not silently.
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <div className="no-print flex gap-3">
      <button
        type="button"
        onClick={handleCopyLink}
        className="rounded border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-slate-soft"
      >
        {copied ? "Link copied!" : "Copy shareable link"}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-slate-soft"
      >
        Download as PDF
      </button>
    </div>
  );
}
