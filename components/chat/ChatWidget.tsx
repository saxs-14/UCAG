"use client";

import { useEffect, useRef, useState } from "react";
import { LABELS } from "@/config/labels";
import { splitSseFrames } from "@/lib/chat/sse";
import { useAuth } from "@/components/auth/AuthProvider";

interface DisplayMessage {
  role: "user" | "model";
  text: string;
}

export function ChatWidget() {
  const { displayName } = useAuth();
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
        body: JSON.stringify({ messages: nextMessages, userName: displayName }),
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
    <div className="no-print fixed bottom-20 right-4 z-40 sm:bottom-4" onKeyDown={handleKeyDown}>
      {isOpen && (
        <div
          role="dialog"
          aria-label="Student Support"
          className="glass-blur-strong animate-rise-in mb-4 flex h-[32rem] w-[24rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-glass-border bg-glass-surface-strong shadow-2xl shadow-brand-teal/10"
        >
          <header className="flex items-center justify-between gap-3 border-b border-line/50 bg-gradient-to-r from-brand-teal to-teal-700 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl backdrop-blur-sm">
                💬
              </div>
              <div className="flex flex-col">
                <span className="font-display text-base font-bold">Virtual Guide</span>
                <span className="text-[10px] font-medium text-teal-100">Ready to help you plan</span>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-[0.97]"
            >
              ×
            </button>
          </header>

          <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto bg-slate-soft/50 p-4">
            <div className="animate-pop-in max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-paper-raised p-3 text-sm font-medium leading-relaxed text-ink shadow-sm border border-line/40">
              {displayName ? `Hi ${displayName}! ` : "Hi there! "}
              How can I help you with your application journey today?
            </div>
            {messages.map((message, i) => (
              <div
                key={i}
                className={`animate-pop-in max-w-[85%] rounded-2xl p-3 text-sm font-medium leading-relaxed shadow-sm ${
                  message.role === "user"
                    ? "self-end rounded-br-sm bg-brand-teal text-white"
                    : "self-start rounded-bl-sm bg-paper-raised text-ink border border-line/40"
                }`}
              >
                {message.text}
              </div>
            ))}
            {streamingReply !== null && (
              <div className="animate-pop-in self-start max-w-[85%] rounded-2xl rounded-bl-sm bg-paper-raised p-3 text-sm font-medium text-ink shadow-sm border border-line/40">
                {streamingReply || "Thinking..."}
              </div>
            )}
            {error && (
              <div role="alert" className="animate-pop-in self-start rounded-2xl rounded-bl-sm bg-mark-red/10 p-3 text-sm font-bold text-mark-red">
                {error}
              </div>
            )}
          </div>

          <form className="flex items-center gap-3 border-t border-line/50 bg-paper-raised p-3" onSubmit={(e) => { e.preventDefault(); void handleSend(); }}>
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="h-12 flex-1 rounded-2xl border border-line/60 bg-slate-soft px-4 text-sm font-medium text-ink transition-all focus:border-brand-teal focus:bg-paper-raised focus:outline-none focus:ring-4 focus:ring-brand-teal/20"
            />
            <button
              type="submit"
              disabled={isLoading || !draft.trim()}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-teal text-white shadow-md transition-transform hover:-translate-y-0.5 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        aria-label="Open support"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-teal text-white shadow-xl shadow-brand-teal/30 transition-transform hover:-translate-y-1 active:scale-[0.97]"
      >
        {isOpen ? (
          <span aria-hidden className="text-3xl leading-none">×</span>
        ) : (
          <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
          </svg>
        )}
      </button>
    </div>
  );
}