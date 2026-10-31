"use client";

import dynamic from "next/dynamic";

// next/dynamic's ssr:false option is only allowed inside a Client
// Component (App Router restriction) -- this one-line wrapper is what
// lets app/layout.tsx (a Server Component) still keep ChatWidget's JS
// out of the server-rendered HTML and initial bundle. See
// components/chat/ChatWidget.tsx's own doc comment for why that matters.

/**
 * A single dropped/stalled request for this chunk (observed directly:
 * "Failed to load chunk ... from module ..." in the console, with the
 * exact same file reliably returning 200 with correct content on a plain
 * retry a moment later -- a transient CDN/network blip, not a missing or
 * broken build artifact) used to leave the assistant button silently
 * never appearing, with no error shown and nothing for a learner to act
 * on. A couple of retries with a short backoff covers that common
 * transient case; if it's still failing after three attempts the failure
 * is probably not transient, so this gives up rather than retrying
 * forever.
 */
async function loadChatWidgetWithRetry(attempt = 0): Promise<typeof import("./ChatWidget")> {
  try {
    return await import("./ChatWidget");
  } catch (err) {
    if (attempt >= 2) throw err;
    await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    return loadChatWidgetWithRetry(attempt + 1);
  }
}

const ChatWidget = dynamic(() => loadChatWidgetWithRetry().then((m) => m.ChatWidget), {
  ssr: false,
});

export function ChatWidgetLoader() {
  return <ChatWidget />;
}
