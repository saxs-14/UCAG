/**
 * Client-safe environment. Only NEXT_PUBLIC_ vars belong here -- anything
 * else must go in lib/env/server.ts instead. Validated with Zod so a
 * missing var fails loudly at startup rather than as a confusing runtime
 * error deep in a Firebase SDK call.
 */

import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
});

function readClientEnv() {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  });

  if (!parsed.success) {
    throw new Error(
      `Missing/invalid client environment variables: ${parsed.error.issues
        .map((i) => i.path.join("."))
        .join(", ")}. Copy .env.example to .env.local and fill these in.`
    );
  }

  return parsed.data;
}

export const clientEnv = readClientEnv();

/** Auto-detect the deployed base URL over a hardcoded one -- see
 * docs/MASTER_PROMPT_v2.md sect. 0.4 ("auto-detect over hardcode"). */
export function getBaseUrl(): string {
  if (clientEnv.NEXT_PUBLIC_BASE_URL) return clientEnv.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
