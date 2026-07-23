/**
 * Server-only environment. Importing "server-only" makes this module fail
 * to build if anything ever tries to bundle it into client code -- the
 * enforcement mechanism for CLAUDE.md non-negotiable #1 ("secrets never
 * reach the browser"), not just a naming convention.
 *
 * Split by concern, same reasoning as lib/env/client.ts: a cron route
 * that only needs CRON_SECRET must not be forced to also have real
 * Firebase Admin credentials configured just to check that secret. One
 * combined eagerly-validated object caused exactly this bug on the
 * client side in Phase 3 (see README status) -- fixing it here
 * proactively rather than waiting to hit it again when the first cron
 * route handler is wired up.
 */

import "server-only";
import { z } from "zod";

const firebaseAdminEnvSchema = z.object({
  FIREBASE_ADMIN_PROJECT_ID: z.string().min(1),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().min(1),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1),
});

export type FirebaseAdminEnv = z.infer<typeof firebaseAdminEnvSchema>;

let cachedFirebaseAdminEnv: FirebaseAdminEnv | undefined;

/** Only called from lib/firebase/admin.ts's lazy initializer. */
export function getFirebaseAdminEnv(): FirebaseAdminEnv {
  if (cachedFirebaseAdminEnv) return cachedFirebaseAdminEnv;

  const parsed = firebaseAdminEnvSchema.safeParse({
    FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID,
    FIREBASE_ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    // Vercel/most hosts mangle newlines in multiline env vars; the
    // convention is to store them escaped and un-escape here.
    FIREBASE_ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  });

  if (!parsed.success) {
    throw new Error(
      `Missing/invalid Firebase Admin environment variables: ${parsed.error.issues
        .map((i) => i.path.join("."))
        .join(", ")}. Copy .env.example to .env.local and fill these in.`
    );
  }

  cachedFirebaseAdminEnv = parsed.data;
  return cachedFirebaseAdminEnv;
}

const llmEnvSchema = z.object({
  LLM_PROVIDER: z.string().min(1).optional(),
  LLM_API_KEY: z.string().min(1).optional(),
});

export type LlmEnv = z.infer<typeof llmEnvSchema>;

/** No caching -- cheap to read, and tests may want to vary it. Both
 * fields are optional (no LLM_API_KEY is configured for v2 yet -- see
 * README status), so this never throws; callers that actually need a
 * key check for it explicitly (see lib/ingestion/llm/). */
export function getLlmEnv(): LlmEnv {
  return llmEnvSchema.parse({
    LLM_PROVIDER: process.env.LLM_PROVIDER,
    LLM_API_KEY: process.env.LLM_API_KEY,
  });
}

/** Cron/admin route handlers must call this before doing any work -- see
 * config/ingestion.ts and CLAUDE.md non-negotiable #4. Independent of
 * Firebase Admin / LLM config -- a cron route that never touches
 * Firestore or an LLM must still be able to check its secret. */
export function assertCronSecret(providedSecret: string | null): void {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || providedSecret !== cronSecret) {
    throw new Error("Unauthorized: invalid or missing cron secret.");
  }
}
