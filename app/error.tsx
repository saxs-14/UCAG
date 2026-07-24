"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/errorReporting";

/**
 * Next.js App Router error boundary -- catches anything that throws
 * inside a page or layout below the root, so a learner sees a plain,
 * recoverable message instead of a blank crashed screen. Also the real
 * integration point for error monitoring (see lib/errorReporting.ts).
 */
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
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">Something went wrong</h1>
      <p className="max-w-md text-sm text-ink-soft">
        That&apos;s on us, not you -- the page hit an error it couldn&apos;t recover from on its
        own. Your entered marks aren&apos;t saved unless you signed in and used &quot;Save my
        marks.&quot;
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded bg-mark-green px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Try again
      </button>
    </main>
  );
}
