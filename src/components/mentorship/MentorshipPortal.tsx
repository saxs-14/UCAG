'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, UserPlus, MessageSquare, Award, CheckCircle, Shield, Sparkles,
  Send, Loader2, AlertTriangle, Trophy, LogIn, LogOut, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isFirebaseConfigured, auth } from '@/lib/firebase-client';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, User
} from 'firebase/auth';
import type { LearnerProfile, MentorProfile, ThreadMessage } from '@/types';

type Tab = 'browse' | 'chat' | 'leaderboard';

const SAFE_PATTERNS = [/\b\d{9,}\b/, /@\w+/, /snapchat/i, /instagram/i, /facebook/i, /whatsapp/i, /telegram/i];
function isSafe(text: string) { return !SAFE_PATTERNS.some(p => p.test(text)); }

function ConfigBanner() {
  return (
    <div className="card p-6 flex items-start gap-3 border-ugold-200 bg-ugold-50">
      <AlertTriangle size={18} className="text-ugold-600 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="font-bold text-navy-900 mb-1">Firebase & MongoDB not configured</h3>
        <p className="text-sm text-navy-600 leading-relaxed">
          The mentorship portal requires Firebase Auth and MongoDB. Set the following environment variables in{' '}
          <code className="bg-white px-1 rounded text-xs">.env.local</code>, then restart the dev server:
        </p>
        <ul className="mt-2 text-xs font-mono text-navy-700 space-y-0.5 list-disc list-inside">
          <li>NEXT_PUBLIC_FIREBASE_API_KEY</li>
          <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
          <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
          <li>FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY</li>
          <li>MONGODB_URI</li>
        </ul>
        <p className="text-xs text-navy-500 mt-2">See <code className="bg-white px-1 rounded">.env.example</code> for instructions on where to obtain each value.</p>
      </div>
    </div>
  );
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    if (!auth || !email || !password) return;
    setLoading(true); setError(null);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message.replace('Firebase: ', '') : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="card p-6 w-full max-w-sm space-y-4">
        <h2 className="font-bold text-navy-900 dark:text-white text-lg flex items-center gap-2">
          <LogIn size={18} /> {mode === 'login' ? 'Sign in' : 'Create account'}
        </h2>
        <p className="text-xs text-navy-500">
          {mode === 'login' ? 'Sign in with your UMP or learner account.' : 'Create a new account to join the mentorship community.'}
        </p>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="input" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="input" onKeyDown={e => e.key === 'Enter' && handle()} />
        {error && <p className="text-xs text-ured-600 flex items-center gap-1"><AlertTriangle size={11} />{error}</p>}
        <button onClick={handle} disabled={loading || !email || !password} className="btn-primary w-full">
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
        <button onClick={() => setMode(m => m === 'login' ? 'signup' : 'login')} className="text-xs text-navy-500 hover:text-navy-700 w-full text-center">
          {mode === 'login' ? 'Don\'t have an account? Sign up' : 'Already have an account? Sign in'}
        </button>
        <button onClick={onClose} className="text-xs text-navy-400 hover:text-navy-600 w-full text-center">Cancel</button>
      </div>
    </div>
  );
}

async function apiFetch(path: string, opts: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(path, { ...opts, headers: { ...headers, ...(opts.headers ?? {}) } });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export function MentorshipPortal() {
  const [user, setUser] = useState<User | null>(null);
  const [authModal, setAuthModal] = useState(false);
  const [tab, setTab] = useState<Tab>('browse');
  const [learners, setLearners] = useState<LearnerProfile[]>([]);
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [myProfile, setMyProfile] = useState<MentorProfile | null>(null);
  const [selectedLearner, setSelectedLearner] = useState<LearnerProfile | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u);
      if (u) {
        const token = await u.getIdToken();
        try {
          const data = await apiFetch('/api/mentorship/profile', {}, token);
          setMyProfile(data.profile);
        } catch { /* not yet a mentor — that's fine */ }
      } else {
        setMyProfile(null);
      }
    });
    return () => unsub();
  }, []);

  const loadData = useCallback(async (token?: string) => {
    setLoading(true);
    setApiError(null);
    try {
      const [{ learners: l }, { mentors: m }] = await Promise.all([
        apiFetch('/api/mentorship/learners', {}, token),
        apiFetch('/api/mentorship/mentors', {}, token),
      ]);
      setLearners(l);
      setMentors(m);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Could not load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = user ? undefined : undefined;
    loadData(token).catch(() => {});
  }, [user, loadData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const adoptLearner = async (learner: LearnerProfile) => {
    if (!user || !myProfile) { setAuthModal(true); return; }
    if (myProfile.adoptedLearnersCount >= myProfile.maxLearners) {
      alert('You have reached your maximum of 3 learners. Complete an existing mentorship to adopt another.');
      return;
    }
    try {
      const token = await user.getIdToken();
      await apiFetch('/api/mentorship/adopt', {
        method: 'POST',
        body: JSON.stringify({ learnerUid: learner.firebaseUid }),
      }, token);
      await loadData(token);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Adoption failed.');
    }
  };

  const openChat = async (learner: LearnerProfile) => {
    if (!user) { setAuthModal(true); return; }
    setSelectedLearner(learner);
    setTab('chat');
    try {
      const token = await user.getIdToken();
      const { messages: msgs } = await apiFetch(`/api/mentorship/messages?learnerUid=${learner.firebaseUid}`, {}, token);
      setMessages(msgs);
    } catch { setMessages([]); }
  };

  const sendMessage = async () => {
    if (!user || !selectedLearner || !msgInput.trim()) return;
    if (!isSafe(msgInput)) {
      alert('🛡️ SafeChat: Your message was blocked. Please keep conversations academic and safe — no phone numbers or social handles.');
      return;
    }
    const token = await user.getIdToken();
    try {
      const { message } = await apiFetch('/api/mentorship/messages', {
        method: 'POST',
        body: JSON.stringify({ learnerUid: selectedLearner.firebaseUid, text: msgInput }),
      }, token);
      setMessages(prev => [...prev, message]);
      setMsgInput('');
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to send.');
    }
  };

  if (!isFirebaseConfigured) return <ConfigBanner />;

  return (
    <div className="space-y-5">
      {authModal && <AuthModal onClose={() => setAuthModal(false)} />}

      {/* Auth bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 card px-4 py-3">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center text-white font-bold text-sm">
              {user.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <div className="text-sm font-semibold text-navy-900 dark:text-white">{user.email}</div>
              {myProfile && (
                <div className="text-xs text-navy-500">{myProfile.fullName} · {myProfile.adoptedLearnersCount}/{myProfile.maxLearners} learners</div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-navy-500">Sign in to adopt learners, send messages, and earn impact XP.</p>
        )}
        <div className="flex gap-2">
          {user ? (
            <button onClick={() => { if (auth) signOut(auth); }} className="btn-outline text-xs px-3 py-1.5">
              <LogOut size={12} /> Sign Out
            </button>
          ) : (
            <button onClick={() => setAuthModal(true)} className="btn-primary text-xs px-3 py-1.5">
              <LogIn size={12} /> Sign In / Register
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-navy-100 dark:border-navy-800">
        {([['browse', 'Browse Learners', UserPlus], ['chat', 'SafeChat', MessageSquare], ['leaderboard', 'Leaderboard', Trophy]] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors',
              tab === id
                ? 'border-navy-800 text-navy-900 dark:text-white'
                : 'border-transparent text-navy-500 hover:text-navy-700 dark:hover:text-navy-300'
            )}
          >
            <Icon size={14} />
            {label}
            {id === 'chat' && selectedLearner && <span className="w-1.5 h-1.5 bg-ugreen-500 rounded-full" />}
          </button>
        ))}
      </div>

      {apiError && (
        <div className="flex items-start gap-2 bg-ured-50 border border-ured-200 rounded-lg p-3 text-sm text-ured-700">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Data unavailable</p>
            <p className="text-xs mt-0.5">{apiError}</p>
          </div>
        </div>
      )}

      {/* Browse tab */}
      {tab === 'browse' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Learners */}
          <div className="card p-5 space-y-3">
            <h3 className="section-title text-sm"><UserPlus size={16} /> Learners Requesting Mentorship</h3>
            <p className="text-xs text-navy-500 dark:text-navy-400">Smart matching by subject need. Each mentor supports up to 3 learners.</p>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-navy-300" /></div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {learners.map(l => (
                  <div key={l._id ?? l.email} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-navy-800 border border-navy-100 dark:border-navy-700">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-navy-900 dark:text-white truncate">{l.fullName}</p>
                      <p className="text-xs text-navy-500 dark:text-navy-400">
                        APS {l.apsScore} · {l.careerInterests.slice(0, 2).join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {l.isAdopted ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle size={13} className="text-ugreen-600" />
                          <span className="text-xs text-navy-400 hidden sm:block">Adopted</span>
                          {user && l.adoptedBy === user.uid && (
                            <button onClick={() => openChat(l)} className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 bg-ugold-400 text-navy-900 rounded hover:bg-ugold-500 transition-colors">
                              <MessageSquare size={10} /> Chat
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => adoptLearner(l)}
                          className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 bg-navy-800 text-white rounded-lg hover:bg-navy-900 transition-colors"
                        >
                          <Sparkles size={11} /> Adopt
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {learners.length === 0 && !loading && !apiError && (
                  <p className="text-sm text-navy-400 text-center py-8">No learner profiles yet. MongoDB seed data loads on first connection.</p>
                )}
              </div>
            )}
          </div>

          {/* Mentor profile */}
          <div className="card p-5 space-y-4">
            <h3 className="section-title text-sm"><Award size={16} className="text-ugold-500" /> Your Mentor Profile</h3>
            {myProfile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center">
                    <Users size={20} className="text-navy-600" />
                  </div>
                  <div>
                    <p className="font-bold text-navy-900 dark:text-white">{myProfile.fullName}</p>
                    <p className="text-xs text-navy-500">{myProfile.qualification} · Year {myProfile.yearOfStudy}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-navy-800 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-navy-900 dark:text-white">{myProfile.adoptedLearnersCount}<span className="text-lg text-navy-400">/{myProfile.maxLearners}</span></div>
                    <div className="text-[10px] font-bold text-navy-400 uppercase tracking-wide mt-0.5">Learners</div>
                  </div>
                  <div className="bg-ugold-50 dark:bg-ugold-900/20 rounded-xl p-3 text-center border border-ugold-200 dark:border-ugold-800">
                    <div className="text-2xl font-black text-ugold-700 dark:text-ugold-400">{myProfile.impactScore}</div>
                    <div className="text-[10px] font-bold text-ugold-600 uppercase tracking-wide mt-0.5">Impact XP</div>
                  </div>
                </div>
                {myProfile.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {myProfile.badges.map(b => (
                      <span key={b} className="badge badge-gold text-[10px]"><Star size={8} /> {b}</span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-navy-400 space-y-3">
                <Shield size={32} className="mx-auto text-navy-200" />
                <p>{user ? 'No mentor profile found. Register as a mentor below.' : 'Sign in to view or create your mentor profile.'}</p>
                {!user && (
                  <button onClick={() => setAuthModal(true)} className="btn-primary text-xs">
                    <LogIn size={12} /> Sign In
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat tab */}
      {tab === 'chat' && (
        <div className="card p-5 flex flex-col" style={{ minHeight: '480px' }}>
          <div className="flex items-center justify-between pb-3 border-b border-navy-100 dark:border-navy-800 mb-3">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-ugreen-600" />
              <h3 className="font-bold text-navy-900 dark:text-white text-sm">SafeChat Portal</h3>
            </div>
            <span className="badge badge-green text-[10px]"><CheckCircle size={9} /> AI Guardrails Active</span>
          </div>

          {!selectedLearner ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-navy-400 gap-3">
              <MessageSquare size={40} className="text-navy-200" />
              <p className="text-sm">Select a learner from the Browse tab to start a mentorship conversation.</p>
            </div>
          ) : (
            <>
              <div className="text-xs font-semibold px-3 py-1.5 bg-navy-50 dark:bg-navy-800 rounded-lg text-navy-600 dark:text-navy-300 mb-3 border border-navy-100 dark:border-navy-700">
                Talking with: <strong>{selectedLearner.fullName}</strong>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 mb-3" style={{ maxHeight: '280px' }}>
                {messages.length === 0 && (
                  <div className="text-center text-sm text-navy-400 py-8">
                    <p>No messages yet. Start the conversation!</p>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {['Hi! Let me help you with your APS.', 'Have you applied for NSFAS?', 'Which subjects are you struggling with?'].map(q => (
                        <button key={q} onClick={() => setMsgInput(q)} className="text-[10px] px-2.5 py-1 border border-navy-200 rounded-full text-navy-500 hover:bg-navy-50 transition-colors">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map(m => {
                  const isMe = user && m.senderUid === user.uid;
                  return (
                    <div key={m._id ?? m.timestamp} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                      <div className={cn(
                        'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                        isMe ? 'bg-navy-800 text-white rounded-br-sm' : 'bg-slate-100 dark:bg-navy-800 text-navy-900 dark:text-navy-100 rounded-bl-sm'
                      )}>
                        {!isMe && <div className="text-[10px] font-bold text-navy-400 mb-0.5">{m.senderName}</div>}
                        <p>{m.text}</p>
                        <div className="text-[9px] opacity-50 mt-0.5 text-right">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              <div className="flex gap-2 pt-3 border-t border-navy-100 dark:border-navy-800">
                <input
                  value={msgInput}
                  onChange={e => setMsgInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Send a mentoring message (safety filters active)…"
                  className="input flex-1 text-sm"
                  disabled={!user}
                />
                <button onClick={sendMessage} disabled={!msgInput.trim() || !user} className="btn-primary px-3 py-2">
                  <Send size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Leaderboard tab */}
      {tab === 'leaderboard' && (
        <div className="card p-5 space-y-4">
          <h3 className="section-title text-sm"><Trophy size={16} className="text-ugold-500" /> UMP Mentor Impact Leaderboard</h3>
          <p className="text-xs text-navy-500">Ranked by Impact XP earned through learner adoptions and mentoring sessions.</p>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-navy-300" /></div>
          ) : (
            <div className="space-y-2">
              {[...mentors].sort((a, b) => b.impactScore - a.impactScore).map((m, i) => (
                <div key={m._id ?? m.email} className={cn(
                  'flex items-center gap-4 p-3 rounded-xl border transition-colors',
                  i === 0 ? 'bg-ugold-50 border-ugold-200' : i === 1 ? 'bg-slate-100 border-slate-200' : i === 2 ? 'bg-orange-50 border-orange-200' : 'bg-white dark:bg-navy-800 border-navy-100 dark:border-navy-700'
                )}>
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0',
                    i === 0 ? 'bg-ugold-400 text-white' : i === 1 ? 'bg-slate-400 text-white' : i === 2 ? 'bg-orange-400 text-white' : 'bg-navy-100 text-navy-600'
                  )}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-navy-900 dark:text-white flex items-center gap-1">
                      {m.fullName} {i === 0 && <Trophy size={12} className="text-ugold-500" />}
                    </p>
                    <p className="text-[11px] text-navy-500 dark:text-navy-400">{m.qualification} · {m.adoptedLearnersCount} learners adopted</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {m.badges.map(b => <span key={b} className="badge badge-gold text-[9px]">{b}</span>)}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-black text-ugold-600">{m.impactScore}</div>
                    <div className="text-[10px] text-navy-400 font-semibold">XP</div>
                  </div>
                </div>
              ))}
              {mentors.length === 0 && !loading && !apiError && (
                <p className="text-sm text-navy-400 text-center py-8">No mentor profiles yet. Seed data loads on first MongoDB connection.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
