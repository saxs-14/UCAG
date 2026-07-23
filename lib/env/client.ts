/**
 * Client-safe environment. Only NEXT_PUBLIC_ vars belong here -- anything
 * else must go in lib/env/server.ts instead.
 *
 * Split into two independent pieces, not one eagerly-validated object:
 * getBaseUrl() has nothing to do with Firebase and must work even when no
 * Firebase project is configured yet (true for most of this app's
 * lifetime so far -- see README status). getFirebaseClientConfig() is
 * lazy (only validated when actually called, by lib/firebase/client.ts's
 * lazy initializer) so importing anything from this module doesn't force
 * every NEXT_PUBLIC_FIREBASE_* var to exist just to read a base URL --
 * that coupling caused a real bug in Phase 3 (the results page 500'd
 * because ShareBar only needed getBaseUrl but pulled in the Firebase
 * validation transitively).
 */

import { z } from "zod";

const baseUrlSchema = z.object({
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
});

function readBaseUrlEnv() {
  const parsed = baseUrlSchema.safeParse({
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  });
  if (!parsed.success) {
    throw new Error(
      `Invalid NEXT_PUBLIC_BASE_URL: ${parsed.error.issues.map((i) => i.message).join(", ")}`
    );
  }
  return parsed.data;
}

/** Auto-detect the deployed base URL over a hardcoded one -- see
 * docs/MASTER_PROMPT_v2.md sect. 0.4 ("auto-detect over hardcode"). Note
 * VERCEL_URL is a server-only env var (not NEXT_PUBLIC_-prefixed, so
 * Next.js does not inline it into the client bundle) -- it's only ever
 * populated when this runs on the server; the browser falls back to
 * window.location.origin instead, which is the actually-correct signal
 * client-side. */
export function getBaseUrl(): string {
  const { NEXT_PUBLIC_BASE_URL } = readBaseUrlEnv();
  if (NEXT_PUBLIC_BASE_URL) return NEXT_PUBLIC_BASE_URL;
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

const firebaseClientEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
});

export type FirebaseClientEnv = z.infer<typeof firebaseClientEnvSchema>;

/** Only called from lib/firebase/client.ts's lazy initializer -- never at
 * module load time -- so pages that don't touch Firebase (most of the
 * app, still, as of Phase 3) never pay for or fail on this validation. */
export function getFirebaseClientConfig(): FirebaseClientEnv {
  const parsed = firebaseClientEnvSchema.safeParse({
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });

  if (!parsed.success) {
    throw new Error(
      `Missing/invalid Firebase client environment variables: ${parsed.error.issues
        .map((i) => i.path.join("."))
        .join(", ")}. Copy .env.example to .env.local and fill these in.`
    );
  }

  return parsed.data;
}
