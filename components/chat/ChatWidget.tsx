"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { LABELS } from "@/config/labels";
import { splitSseFrames } from "@/lib/chat/sse";
import { useAuth } from "@/components/auth/AuthProvider";
import { buildUserContext } from "@/lib/chat/buildUserContext";

interface DisplayMessage {
  role: "user" | "model";
  text: string;
}

const CLOSE_ANIMATION_MS = 200;

function TypingDots() {
  return (
    <div
      role="status"
      aria-label="Assistant is replying"
      className="animate-pop-in flex w-fit items-center gap-1.5 self-start rounded-2xl rounded-bl-sm border border-line/40 bg-paper-raised px-4 py-3.5 shadow-sm"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 animate-bounce rounded-full bg-ink-faint"
          style={{ animationDelay: `${i * 140}ms`, animationDuration: "900ms" }}
        />
      ))}
    </div>
  );
}

export function ChatWidget() {
  const { user, displayName } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingReply, setStreamingReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userContext, setUserContext] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  function openChat() {
    setIsClosing(false);
    setIsMounted(true);
    setIsOpen(true);
  }

  function closeChat() {
    setIsOpen(false);
    setIsClosing(true);
    window.setTimeout(() => {
      setIsMounted(false);
      setIsClosing(false);
    }, CLOSE_ANIMATION_MS);
  }

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Fetches the signed-in learner's own saved marks/APS/shortlist once per
  // widget-open session (not per message -- fetchRealCatalog is a real
  // Firestore read) so the assistant can answer "what's my APS" without
  // the learner repeating themselves. Signed-out visitors and anyone
  // without saved data yet simply get no userContext (see buildUserContext).
  useEffect(() => {
    if (!isOpen || !user || userContext !== null) return;
    let cancelled = false;
    (async () => {
      const [{ getUserProfile }, { fetchRealCatalog }] = await Promise.all([
        import("@/lib/auth/profile"),
        import("@/lib/catalog/getRealCatalog"),
      ]);
      const [profile, catalog] = await Promise.all([getUserProfile(user.uid), fetchRealCatalog()]);
      if (!cancelled) setUserContext(buildUserContext(profile, catalog));
    })().catch(() => {
      // Leave userContext null -- the assistant still works, just without
      // the learner's saved data to reference.
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, user, userContext]);

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
        body: JSON.stringify({ messages: nextMessages, userName: displayName, userContext }),
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
    if (e.key === "Escape") closeChat();
  }

  return (
    <div className="no-print fixed bottom-20 right-4 z-40 sm:bottom-4" onKeyDown={handleKeyDown}>
      {isMounted && (
        <div
          role="dialog"
          aria-label="Student Support"
          className={`glass-blur-strong mb-4 flex h-[32rem] w-[24rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-glass-border bg-glass-surface-strong shadow-2xl shadow-brand-teal/10 ${
            isClosing ? "animate-chat-out" : "animate-chat-in"
          }`}
        >
          <header className="flex items-center justify-between gap-3 border-b border-line/50 bg-gradient-to-r from-brand-teal to-teal-700 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <MessageCircle aria-hidden size={20} strokeWidth={2.25} />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-base font-bold">Virtual Guide</span>
                <span className="text-[10px] font-medium text-teal-100">Ready to help you plan</span>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={closeChat}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-[0.97]"
            >
              <X aria-hidden size={18} />
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
              streamingReply ? (
                <div className="animate-pop-in self-start max-w-[85%] rounded-2xl rounded-bl-sm bg-paper-raised p-3 text-sm font-medium text-ink shadow-sm border border-line/40">
                  {streamingReply}
                </div>
              ) : (
                <TypingDots />
              )
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
              aria-label="Send message"
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-teal text-white shadow-md transition-transform hover:-translate-y-0.5 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <Send aria-hidden size={18} />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        aria-label={isOpen ? "Close support" : "Open support"}
        aria-expanded={isOpen}
        onClick={() => (isOpen ? closeChat() : openChat())}
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-teal text-white shadow-xl shadow-brand-teal/30 transition-transform hover:-translate-y-1 active:scale-[0.97]"
      >
        <X aria-hidden size={26} className={`absolute transition-all duration-200 ${isOpen ? "rotate-0 opacity-100" : "rotate-45 opacity-0"}`} />
        <MessageCircle aria-hidden size={26} className={`absolute transition-all duration-200 ${isOpen ? "-rotate-45 opacity-0" : "rotate-0 opacity-100"}`} />
      </button>
    </div>
  );
}