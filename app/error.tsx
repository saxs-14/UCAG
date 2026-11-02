"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/errorReporting";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { scope: "app-error-boundary", digest: error.digest });
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-12 text-center bg-paper">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-100 text-rose-600 shadow-sm">
        ⚠️
      </div>
      <h1 className="font-display text-3xl font-black tracking-tight text-ink">Something went wrong</h1>
      <p className="max-w-md text-sm font-medium leading-relaxed text-ink-soft">
        That&apos;s on us, not you — the page hit an error it couldn&apos;t recover from on its
        own. Your entered marks aren&apos;t saved unless you signed in and used &quot;Save my
        results.&quot;
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-brand-teal px-8 text-sm font-black text-white shadow-md shadow-brand-teal/20 transition-transform hover:-translate-y-0.5 active:scale-95"
      >
        Try Again
      </button>
    </main>
  );
}