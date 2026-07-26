import { NextResponse, type NextRequest } from "next/server";
import { GeminiChatClient } from "@/lib/chat/geminiChatClient";
import { validateChatRequest } from "@/lib/chat/validateChatRequest";
import { checkChatRateLimit } from "@/lib/chat/rateLimiter";
import { reportError } from "@/lib/errorReporting";

/**
 * Public, unauthenticated by design -- the calculator itself needs no
 * account (config/labels.ts's privacy copy: "Entering your subjects and
 * marks ... doesn't require signing up"), so gating help-chat behind
 * sign-in would be a worse, inconsistent experience for the exact same
 * anonymous learner. No conversation is persisted server-side, for the
 * same privacy-by-default reason -- see lib/chat/systemPrompt.ts and
 * components/chat/ChatWidget.tsx, which keeps history in React state
 * only.
 *
 * "Unauthenticated and free" is also why checkChatRateLimit exists:
 * without it, a single visitor could burn through the entire shared
 * Gemini free-tier quota (lib/ingestion/llm/geminiClient.ts) that admin
 * ingestion runs also depend on.
 */
export async function POST(request: NextRequest) {
  const clientId =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const rateLimit = checkChatRateLimit(clientId);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "You've sent a lot of messages -- wait a bit before sending another." },
      { status: 429, headers: { "retry-after": String(Math.ceil((rateLimit.retryAfterMs ?? 0) / 1000)) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const validation = validateChatRequest(body);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  let client: GeminiChatClient;
  try {
    client = new GeminiChatClient();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 501 }
    );
  }

  try {
    const reply = await client.reply(validation.data.messages);
    return NextResponse.json({ reply: reply.text });
  } catch (err) {
    reportError(err, { scope: "chat-api" });
    return NextResponse.json(
      { error: "The assistant couldn't respond right now -- try again in a moment." },
      { status: 502 }
    );
  }
}
