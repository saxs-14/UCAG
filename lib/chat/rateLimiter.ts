/**
 * A simple in-memory, per-process sliding-window limiter -- deliberately
 * not Firestore-backed like lib/ingestion/budgetTracker.ts's month-to-date
 * check. That one guards admin-triggered, infrequent runs where an extra
 * Firestore read per call is nothing; this one guards a public, unauthenticated
 * endpoint that could see many requests per minute, where a Firestore
 * round-trip per message would be real added latency and cost for no
 * real accuracy gain. The known limitation -- this resets on every
 * server restart/redeploy and isn't shared across serverless instances --
 * is an acceptable trade for "protect the shared free-tier quota from one
 * abusive session," which doesn't need to be perfectly precise, just
 * present. A real distributed limiter (Firestore or Redis-backed) is the
 * upgrade path if usage ever justifies it.
 */

const WINDOW_MS = 5 * 60 * 1000;
/** Deliberately well under the 15 req/min Gemini free-tier cap (see
 * lib/ingestion/llm/geminiClient.ts) -- this budget is shared with
 * whatever ingestion runs an admin triggers, so no single chat client
 * should be able to consume most of it. */
const MAX_REQUESTS_PER_WINDOW = 8;

const requestLog = new Map<string, number[]>();

export function __resetChatRateLimiterForTests(): void {
  requestLog.clear();
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs?: number;
}

/** Call once per incoming request, before spending any Gemini quota on
 * it. `clientId` should be something like the caller's IP. */
export function checkChatRateLimit(clientId: string, now: number = Date.now()): RateLimitResult {
  const windowStart = now - WINDOW_MS;
  const recent = (requestLog.get(clientId) ?? []).filter((t) => t > windowStart);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldestInWindow = recent[0]!;
    requestLog.set(clientId, recent);
    return { allowed: false, retryAfterMs: oldestInWindow + WINDOW_MS - now };
  }

  recent.push(now);
  requestLog.set(clientId, recent);
  return { allowed: true };
}
