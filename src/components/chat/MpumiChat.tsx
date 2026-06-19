'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Languages, Volume2, AlertTriangle, Loader2, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage, Language } from '@/types';

const LANG_NAMES: Record<Language, string> = {
  en: 'English', zu: 'isiZulu', nso: 'Sepedi', ts: 'Xitsonga', ss: 'Siswati',
};

const QUICK_CHIPS: Record<Language, string[]> = {
  en:  ['What APS do I need for nursing?', 'How do I apply for NSFAS?', 'What is the BEd minimum APS?'],
  zu:  ['Ngidinga i-APS engakanani?', 'Ngifaka kanjani isicelo se-NSFAS?', 'I-APS yeBEd yini?'],
  nso: ['Ke hloka APS ya bokae?', 'Ke kgona bjang go etšwa go NSFAS?', 'APS ya BEd ke bokae?'],
  ts:  ['Ndzi lava APS ya kangani?', 'Ndzi faneleka bjani eka NSFAS?', 'APS ya BEd yi yini?'],
  ss:  ['Ngidinga i-APS yemalini?', 'Ngifaka njani sicelo se-NSFAS?', 'I-APS ye-BEd ngu-yini?'],
};

const WELCOME: Record<Language, string> = {
  en:  'Hello! I\'m Mpumi, your AI educational assistant for UCAG. I can help with UMP admission requirements, APS scores, bursaries, career paths, and the mentorship programme. What would you like to know?',
  zu:  'Sawubona! NginguMpumi, umsizi wakho we-AI wezemfundo. Ngingakusiza nge-APS, izindlela zokulungela izifundo, izisizo zemali, kanye nokuqeqesha. Ufunani ukwazi?',
  nso: 'Dumela! Ke nna Mpumi, mothusi wa gago wa AI wa tša thuto. Nka go thuša ka APS, dikgoro tša dithuto, dithušo tša tšhelete, le lenaneothero la go šedišwa. O nyaka go tseba eng?',
  ts:  'Avuxeni! Hi mina Mpumi, mupfuni wa wena wa AI eka UCAG. Ndzi nga ku pfuna hi APS, switirhiso swa yunivhesiti, tisitiso ta timali, na nseketelo. U lava ku tiva yini?',
  ss:  'Sanibonani! NginguMpumi, umsiti wakho we-AI wetemfundvo. Ngingakusita nge-APS, indlela yokufaka sicelo se-yunivhesithi, titfuwo, netinhlelo tekukhokhela. Ufunani kukwati?',
};

export function MpumiChat() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: 'welcome', role: 'assistant', content: WELCOME[language], timestamp: Date.now() }]);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setMessages([{ id: 'welcome-' + language, role: 'assistant', content: WELCOME[language], timestamp: Date.now() }]);
    }
  }, [language]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    if (!isOnline) {
      setError('You appear to be offline. Mpumi requires an internet connection. Please reconnect and try again.');
      return;
    }
    setInput('');
    setError(null);

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome' && !m.id.startsWith('welcome-'))
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: text, language, history }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Error ${res.status}`);
      }

      const data = await res.json();
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-r',
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
      }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to get a response.';
      setError(msg);
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      setInput(text);
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-navy-800 text-white shadow-chat hover:bg-navy-900 transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Open Mpumi AI chat"
      >
        {open ? <X size={20} /> : <MessageSquare size={20} />}
        <span className="text-sm font-bold">{open ? 'Close' : 'Ask Mpumi'}</span>
        {!open && <span className="w-2 h-2 bg-ugold-400 rounded-full animate-pulse-dot" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] flex flex-col rounded-2xl bg-white dark:bg-navy-900 shadow-chat border border-navy-100 dark:border-navy-800 animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-navy-100 dark:border-navy-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center">
                <Sparkles size={14} className="text-ugold-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-navy-900 dark:text-white leading-none">Mpumi AI</div>
                <div className={cn('text-[10px] font-semibold mt-0.5 flex items-center gap-1', isOnline ? 'text-ugreen-600' : 'text-ured-500')}>
                  {isOnline ? '● Gemini-powered' : <><WifiOff size={9} /> Offline — reconnect to chat</>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-navy-800 border border-navy-100 dark:border-navy-700 rounded-md px-2 py-1">
                <Languages size={11} className="text-navy-400" />
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value as Language)}
                  className="bg-transparent text-[11px] font-semibold text-navy-700 dark:text-navy-300 outline-none cursor-pointer"
                  aria-label="Select language"
                >
                  {(Object.entries(LANG_NAMES) as [Language, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <button onClick={() => setOpen(false)} className="text-navy-400 hover:text-navy-700 transition-colors" aria-label="Close chat">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-ugold-400 flex items-center justify-center text-[10px] font-black text-navy-900 flex-shrink-0 mt-0.5">M</div>
                )}
                <div className={cn(
                  'max-w-[82%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed relative group',
                  msg.role === 'user'
                    ? 'bg-navy-800 text-white rounded-br-sm'
                    : 'bg-slate-100 dark:bg-navy-800 text-navy-900 dark:text-navy-100 rounded-bl-sm'
                )}>
                  {msg.content}
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => speak(msg.content)}
                      className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 bg-white dark:bg-navy-700 border border-navy-100 dark:border-navy-600 rounded-full flex items-center justify-center"
                      aria-label="Read aloud"
                    >
                      <Volume2 size={10} className="text-navy-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-ugold-400 flex items-center justify-center text-[10px] font-black text-navy-900 flex-shrink-0 mt-0.5">M</div>
                <div className="bg-slate-100 dark:bg-navy-800 rounded-2xl rounded-bl-sm px-3 py-2.5 flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin text-navy-400" />
                  <span className="text-xs text-navy-400">Thinking…</span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 bg-ured-50 border border-ured-200 rounded-lg p-2.5 text-xs text-ured-700">
                <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Could not reach Mpumi</p>
                  <p className="opacity-80 mt-0.5">{error}</p>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick chips */}
          <div className="px-3 pb-1 flex gap-1.5 overflow-x-auto scrollbar-none">
            {QUICK_CHIPS[language].map(chip => (
              <button
                key={chip}
                onClick={() => send(chip)}
                className="flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-navy-200 dark:border-navy-700 text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-navy-100 dark:border-navy-800">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
              placeholder="Ask about APS, courses, bursaries…"
              className="flex-1 input text-sm py-2"
              aria-label="Type your message"
              disabled={loading}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="w-9 h-9 flex-shrink-0 rounded-lg bg-navy-800 text-white flex items-center justify-center hover:bg-navy-900 disabled:opacity-40 transition-colors"
              aria-label="Send message"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
