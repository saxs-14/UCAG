/**
 * Error monitoring (docs/MASTER_PROMPT_v2.md Phase 9), honestly scoped:
 * no Sentry (or equivalent) account/key exists for v2, and this isn't the
 * kind of external, billed third-party signup to create unprompted. What
 * this genuinely does today: structured console logging, which becomes
 * real, searchable runtime logs the moment this deploys to Vercel (Vercel
 * captures stdout/stderr from every function invocation at no extra
 * setup) -- not a no-op. The `reportError` call sites (app/error.tsx,
 * app/global-error.tsx) are the real integration point for a paid service
 * later; wiring one in is then a one-line change inside this file, not a
 * hunt through the codebase for every place an error might occur.
 */

interface ErrorContext {
  /** Where this was caught, e.g. "app-error-boundary", "admin-api". */
  scope: string;
  digest?: string;
  extra?: Record<string, unknown>;
}

export function reportError(error: unknown, context: ErrorContext): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(
    JSON.stringify({
      level: "error",
      scope: context.scope,
      message,
      digest: context.digest,
      extra: context.extra,
      stack,
      timestamp: new Date().toISOString(),
    })
  );
}
