/**
 * Same in-memory, per-process sliding-window shape as
 * lib/chat/rateLimiter.ts, deliberately a separate instance with its own
 * budget rather than sharing that one -- this guards Firestore write
 * volume on a public endpoint, not the Gemini free-tier quota, so there's
 * no reason a burst of one should eat into the other's allowance. Same
 * accepted limitation: resets on redeploy/cold-start, not shared across
 * serverless instances -- "stop a single client from flooding
 * usageStats with writes" doesn't need to be precise, just present.
 */

const WINDOW_MS = 5 * 60 * 1000;
/** Generous relative to real usage -- these are legitimate, infrequent UI
 * actions (one calculator completion, one search, one bursaries page
 * view), not a chat conversation's back-and-forth. This bounds abuse
 * without being able to trip on genuine use. */
const MAX_REQUESTS_PER_WINDOW = 30;

const requestLog = new Map<string, number[]>();

export function __resetTrackRateLimiterForTests(): void {
  requestLog.clear();
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs?: number;
}

export function checkTrackRateLimit(clientId: string, now: number = Date.now()): RateLimitResult {
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
