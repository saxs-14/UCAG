"use client";

import { useEffect, useRef, useState } from "react";
import { LABELS } from "@/config/labels";
import { splitSseFrames } from "@/lib/chat/sse";

/**
 * A floating help assistant, mounted once in app/layout.tsx via a
 * next/dynamic({ ssr: false }) import -- see layout.tsx for why: it
 * keeps this out of the server-rendered HTML and initial JS bundle
 * entirely, which matters on the "/" route given Phase 8's <200KB
 * budget and low-data-mode commitment (app/globals.css). Nothing here
 * loads or runs until a visitor actually clicks the button.
 *
 * No conversation persistence -- plain useState, gone on reload. See
 * lib/chat/systemPrompt.ts and config/labels.ts's privacy-notice entry
 * for why: consistent with the calculator's own "nothing you type is
 * saved unless you create an account" promise, and this feature has no
 * account-linked storage story of its own to opt into.
 *
 * Replies stream in over SSE (app/api/chat/route.ts) rather than
 * arriving as one JSON blob -- streamingReply holds the in-progress
 * reply text (empty string while waiting for the first chunk, so the
 * thinking indicator still shows), and gets folded into `messages` once
 * the stream ends, errors, or the connection drops.
 */

interface DisplayMessage {
  role: "user" | "model";
  text: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingReply, setStreamingReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [messages, isLoading, streamingReply]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || isLoading) return;

    const nextMessages: DisplayMessage[] = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setIsLoading(true);
    setStreamingReply("");

    let accumulated = "";
    const commitStreamedReply = () => {
      if (accumulated) {
        setMessages((prev) => [...prev, { role: "model", text: accumulated }]);
      }
      setStreamingReply(null);
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok || !res.body) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string };
        setStreamingReply(null);
        if (res.status === 429) setError(LABELS.chat.rateLimitedError);
        else if (res.status === 501) setError(LABELS.chat.notConfiguredError);
        else setError(errBody.error ?? LABELS.chat.genericError);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const { frames, rest } = splitSseFrames(buffer);
        buffer = rest;

        for (const frame of frames) {
          const data = JSON.parse(frame.data) as { text?: string; error?: string };
          if (frame.event === "error") {
            commitStreamedReply();
            setError(data.error ?? LABELS.chat.genericError);
            return;
          }
          if (typeof data.text === "string") {
            accumulated += data.text;
            setStreamingReply(accumulated);
          }
        }
      }

      commitStreamedReply();
    } catch {
      commitStreamedReply();
      setError(LABELS.chat.genericError);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === "Escape") setIsOpen(false);
  }

  return (
    <div className="no-print fixed bottom-4 right-4 z-40" onKeyDown={handleKeyDown}>
      {isOpen && (
        <div
          role="dialog"
          aria-label={LABELS.chat.assistantName}
          className="animate-rise-in mb-3 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-xl"
        >
          <header className="flex items-center justify-between gap-2 border-b border-line bg-paper-raised px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-semibold text-ink">
                {LABELS.chat.assistantName}
              </span>
              <span className="rounded-full bg-brand-teal-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-teal">
                {LABELS.chat.aiDisclosureBadge}
              </span>
            </div>
            <button
              type="button"
              aria-label={LABELS.chat.closeButtonLabel}
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-[background-color,color,transform] duration-150 ease-out hover:bg-slate-soft hover:text-ink active:scale-[0.97]"
            >
              ×
            </button>
          </header>

          <p className="border-b border-line bg-paper-raised px-4 py-2 text-xs text-ink-faint">
            {LABELS.chat.disclaimer}
          </p>

          <div ref={scrollRef} className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-3">
            <div className="animate-pop-in max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-soft px-3 py-2 text-sm text-ink">
              {LABELS.chat.greeting}
            </div>
            {messages.map((message, i) => (
              <div
                key={i}
                className={`animate-pop-in max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "self-end rounded-br-sm bg-brand-teal text-white"
                    : "self-start rounded-bl-sm bg-slate-soft text-ink"
                }`}
              >
                {message.text}
              </div>
            ))}
            {streamingReply !== null && (
              <div className="animate-pop-in self-start max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-soft px-3 py-2 text-sm text-ink">
                {streamingReply || LABELS.chat.thinkingIndicator}
              </div>
            )}
            {error && (
              <div
                role="alert"
                className="animate-pop-in self-start rounded-2xl rounded-bl-sm bg-mark-red-soft px-3 py-2 text-sm text-mark-red"
              >
                {error}
              </div>
            )}
          </div>

          <form
            className="flex items-center gap-2 border-t border-line p-2"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
          >
            <label htmlFor="chat-message-input" className="sr-only">
              {LABELS.chat.inputPlaceholder}
            </label>
            <input
              ref={inputRef}
              id="chat-message-input"
              name="chatMessage"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={LABELS.chat.inputPlaceholder}
              disabled={isLoading}
              className="h-11 flex-1 rounded-xl border border-line bg-paper-raised px-3 text-sm text-ink transition-colors focus:border-brand-coral focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !draft.trim()}
              className="flex h-11 min-w-11 items-center justify-center rounded-full bg-brand-teal px-4 text-sm font-medium text-white transition-transform hover-fine:scale-[1.03] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {LABELS.chat.sendButtonLabel}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        aria-label={isOpen ? LABELS.chat.closeButtonLabel : LABELS.chat.openButtonLabel}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-teal text-white shadow-lg transition-transform hover-fine:scale-105 active:scale-[0.97]"
      >
        {isOpen ? (
          <span aria-hidden className="text-2xl leading-none">
            ×
          </span>
        ) : (
          <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
