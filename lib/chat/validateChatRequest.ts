import { z } from "zod";

/** Caps chosen to keep a single request cheap and bounded, not because a
 * real conversation would ever need more: MAX_MESSAGES covers a genuinely
 * long back-and-forth, MAX_MESSAGE_LENGTH covers a pasted paragraph. Both
 * exist so one request can't single-handedly make a large fraction of
 * the shared Gemini free-tier quota (see lib/chat/geminiChatClient.ts)
 * disappear into one oversized call. */
export const MAX_MESSAGES = 20;
export const MAX_MESSAGE_LENGTH = 1000;
/** A real human name, not free text -- kept short both to fit the use
 * case and to limit how much room a spoofed (this endpoint is
 * unauthenticated, so userName is client-asserted, not verified against
 * the caller's actual Firebase session) value has to act as a prompt
 * injection vector once it's embedded in the system prompt. See
 * buildChatSystemPrompt's own framing of this field as data, never an
 * instruction, for the other half of that defence. */
export const MAX_USER_NAME_LENGTH = 80;
/** A compact plain-text summary of the signed-in learner's own saved
 * marks/APS/shortlist (built client-side in ChatWidget.tsx from their
 * real profile data) -- long enough for a full subject list plus a
 * handful of shortlisted programme names, bounded for the same reason
 * as MAX_USER_NAME_LENGTH: client-asserted and embedded in the system
 * prompt, so it needs a firm upper bound regardless of trust level. */
export const MAX_USER_CONTEXT_LENGTH = 2000;

const chatMessageSchema = z.object({
  role: z.enum(["user", "model"]),
  text: z.string().min(1).max(MAX_MESSAGE_LENGTH),
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(MAX_MESSAGES),
  /** The signed-in learner's display name, so the assistant can address
   * them by name -- omitted/null when signed out. Client-asserted, see
   * MAX_USER_NAME_LENGTH's comment on why that's an acceptable/bounded
   * risk here rather than something requiring full authentication. */
  userName: z.string().trim().min(1).max(MAX_USER_NAME_LENGTH).nullish(),
  /** See MAX_USER_CONTEXT_LENGTH's comment. Omitted/null when signed out
   * or when the learner has no saved marks/shortlist yet. */
  userContext: z.string().trim().min(1).max(MAX_USER_CONTEXT_LENGTH).nullish(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export type ChatRequestValidation =
  | { valid: true; data: ChatRequest }
  | { valid: false; error: string };

/** The last message must be from the learner -- otherwise there's
 * nothing for the assistant to reply to. Everything else about ordering
 * (e.g. strict user/model alternation) is left unenforced: the client
 * always sends its full local history, and being lenient about shape
 * there costs nothing since Gemini itself doesn't require strict
 * alternation either. */
export function validateChatRequest(body: unknown): ChatRequestValidation {
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return { valid: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const last = parsed.data.messages[parsed.data.messages.length - 1];
  if (last?.role !== "user") {
    return { valid: false, error: "The last message must be from the user." };
  }
  return { valid: true, data: parsed.data };
}
