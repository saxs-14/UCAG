"use client";

import dynamic from "next/dynamic";

// next/dynamic's ssr:false option is only allowed inside a Client
// Component (App Router restriction) -- this one-line wrapper is what
// lets app/layout.tsx (a Server Component) still keep ChatWidget's JS
// out of the server-rendered HTML and initial bundle. See
// components/chat/ChatWidget.tsx's own doc comment for why that matters.
const ChatWidget = dynamic(() => import("./ChatWidget").then((m) => m.ChatWidget), {
  ssr: false,
});

export function ChatWidgetLoader() {
  return <ChatWidget />;
}
