"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/errorReporting";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { scope: "app-global-error-boundary", digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased bg-paper text-ink">
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-100 text-rose-600 shadow-sm">
            💥
          </div>
          <h1 className="font-display text-3xl font-black tracking-tight text-ink">Critical Error</h1>
          <p className="max-w-md text-sm font-medium leading-relaxed text-ink-soft">
            That&apos;s on us, not you — the whole application failed to load. Please try again or come back in a few minutes.
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-brand-teal px-8 text-sm font-black text-white shadow-md shadow-brand-teal/20 transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            Try Again
          </button>
        </main>
      </body>
    </html>
  );
}