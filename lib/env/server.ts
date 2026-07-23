/**
 * Server-only environment. Importing "server-only" makes this module fail
 * to build if anything ever tries to bundle it into client code -- the
 * enforcement mechanism for CLAUDE.md non-negotiable #1 ("secrets never
 * reach the browser"), not just a naming convention.
 */

import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  FIREBASE_ADMIN_PROJECT_ID: z.string().min(1),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().min(1),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1),
  LLM_PROVIDER: z.string().min(1).optional(),
  LLM_API_KEY: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(1).optional(),
});

function readServerEnv() {
  const parsed = serverEnvSchema.safeParse({
    FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID,
    FIREBASE_ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    // Vercel/most hosts mangle newlines in multiline env vars; the
    // convention is to store them escaped and un-escape here.
    FIREBASE_ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n"
    ),
    LLM_PROVIDER: process.env.LLM_PROVIDER,
    LLM_API_KEY: process.env.LLM_API_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
  });

  if (!parsed.success) {
    throw new Error(
      `Missing/invalid server environment variables: ${parsed.error.issues
        .map((i) => i.path.join("."))
        .join(", ")}. Copy .env.example to .env.local and fill these in.`
    );
  }

  return parsed.data;
}

let cached: ReturnType<typeof readServerEnv> | undefined;

/** Lazy -- only validates on first call, not at module import time. Every
 * consumer (lib/firebase/admin.ts, cron routes) calls this instead of
 * reading a top-level const, so importing this module doesn't force
 * every server secret to exist just because one route needs one of them. */
export function getServerEnv() {
  if (!cached) cached = readServerEnv();
  return cached;
}

/** Cron/admin route handlers must call this before doing any work -- see
 * config/ingestion.ts and CLAUDE.md non-negotiable #4. */
export function assertCronSecret(providedSecret: string | null): void {
  const { CRON_SECRET } = getServerEnv();
  if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
    throw new Error("Unauthorized: invalid or missing cron secret.");
  }
}
