import { z } from "zod";

/** Caps chosen to keep a single request cheap and bounded, not because a
 * real conversation would ever need more: MAX_MESSAGES covers a genuinely
 * long back-and-forth, MAX_MESSAGE_LENGTH covers a pasted paragraph. Both
 * exist so one request can't single-handedly make a large fraction of
 * the shared Gemini free-tier quota (see lib/chat/geminiChatClient.ts)
 * disappear into one oversized call. */
export const MAX_MESSAGES = 20;
export const MAX_MESSAGE_LENGTH = 1000;

const chatMessageSchema = z.object({
  role: z.enum(["user", "model"]),
  text: z.string().min(1).max(MAX_MESSAGE_LENGTH),
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(MAX_MESSAGES),
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
