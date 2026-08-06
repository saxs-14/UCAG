import { NextResponse, type NextRequest } from "next/server";
import { GeminiChatClient } from "@/lib/chat/geminiChatClient";
import { validateChatRequest } from "@/lib/chat/validateChatRequest";
import { checkChatRateLimit } from "@/lib/chat/rateLimiter";
import { buildChatSystemPrompt } from "@/lib/chat/systemPrompt";
import { getRealChatContext } from "@/lib/catalog/getRealChatContext";
import { LOOKUP_VERIFIED_FACT_CHAT_TOOL } from "@/lib/chat/tools/lookupVerifiedFact";
import { formatSseEvent } from "@/lib/chat/sse";
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
 *
 * Streams the reply as it's generated (text/event-stream) rather than
 * one JSON body -- see docs/superpowers/specs/2026-08-06-chat-backend-innovation-design.md.
 * The first chunk is awaited before any SSE headers are sent, so a
 * total failure (bad API key, network error) still returns today's
 * plain JSON 502 -- only a failure *after* streaming has started falls
 * back to an `event: error` frame instead.
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

  let iterator: AsyncGenerator<string>;
  let firstChunk: IteratorResult<string>;
  try {
    const context = await getRealChatContext();
    const systemPrompt = buildChatSystemPrompt(context);
    iterator = client.streamReply(validation.data.messages, systemPrompt, LOOKUP_VERIFIED_FACT_CHAT_TOOL);
    firstChunk = await iterator.next();
  } catch (err) {
    reportError(err, { scope: "chat-api" });
    return NextResponse.json(
      { error: "The assistant couldn't respond right now -- try again in a moment." },
      { status: 502 }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (!firstChunk.done) {
          controller.enqueue(encoder.encode(formatSseEvent({ text: firstChunk.value })));
        }
        for await (const chunk of iterator) {
          controller.enqueue(encoder.encode(formatSseEvent({ text: chunk })));
        }
        controller.enqueue(encoder.encode(formatSseEvent({}, "done")));
      } catch (err) {
        reportError(err, { scope: "chat-api-stream" });
        controller.enqueue(
          encoder.encode(
            formatSseEvent({ error: "The assistant couldn't finish responding -- try again in a moment." }, "error")
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
