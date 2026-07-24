"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/errorReporting";
import "./globals.css";

/**
 * Catches errors in the root layout itself (rare -- app/error.tsx catches
 * everything below it) -- must render its own <html>/<body> since it
 * replaces the whole root layout tree when triggered.
 */
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
      <body className="antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Something went wrong</h1>
          <p className="max-w-md text-sm text-ink-soft">
            That&apos;s on us, not you -- the whole page failed to load. Try again, or come back
            in a few minutes.
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded bg-mark-green px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
