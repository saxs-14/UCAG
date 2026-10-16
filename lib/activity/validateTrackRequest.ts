import { z } from "zod";

/**
 * app/api/activity/track/route.ts is public and unauthenticated by
 * necessity (any learner, signed in or not, triggers these), so the body
 * schema is deliberately as narrow as possible: one of exactly three
 * named events, nothing else -- no free-form fields, no per-user or
 * per-session identifier a client could even attempt to send.
 */
const trackEventSchema = z.object({
  event: z.enum(["calculator_completed", "programme_search", "funding_discovery_view"]),
});

export type TrackEvent = z.infer<typeof trackEventSchema>["event"];

export type TrackRequestValidation =
  | { valid: true; event: TrackEvent }
  | { valid: false; error: string };

export function validateTrackRequest(body: unknown): TrackRequestValidation {
  const parsed = trackEventSchema.safeParse(body);
  if (!parsed.success) {
    return { valid: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  return { valid: true, event: parsed.data.event };
}
