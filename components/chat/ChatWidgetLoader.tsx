"use client";

import dynamic from "next/dynamic";

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