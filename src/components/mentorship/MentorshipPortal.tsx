'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, UserPlus, MessageSquare, Award, CheckCircle, Shield, Sparkles,
  Send, Loader2, AlertTriangle, Trophy, LogIn, LogOut, Star, Plus, X,
  BookOpen, GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isFirebaseConfigured, auth } from '@/lib/firebase-client';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, type User
} from 'firebase/auth';
import type { LearnerProfile, MentorProfile, ThreadMessage } from '@/types';

type Tab = 'browse' | 'chat' | 'leaderboard';
type RegisterRole = 'mentor' | 'learner' | null;

const SAFE_PATTERNS = [/\b\d{9,}\b/, /@\w+/, /snapchat/i, /instagram/i, /facebook/i, /whatsapp/i, /telegram/i];
function isSafe(text: string) { return !SAFE_PATTERNS.some(p => p.test(text)); }

const SUBJECTS = [
  'Mathematics', 'Mathematical Literacy', 'Physical Sciences', 'Life Sciences',
  'English First Additional', 'English Home Language', 'isiZulu', 'Siswati',
  'Sepedi', 'Xitsonga', 'Accounting', 'Economics', 'Business Studies',
  'History', 'Geography', 'Information Technology', 'Tourism', 'Life Orientation',
];

const UMP_QUALIFICATIONS = [
  'BSc Agriculture', 'BSc Computer Science', 'Bachelor of Education (BEd)',
  'Bachelor of Development Studies', 'Diploma in Hospitality Management',
  'BSc Nursing / Health Sciences', 'Bachelor of Laws (LLB)',
  'BSc Environmental Science', 'Bachelor of Social Work (BSW)',
  'Diploma in Information & Communication Technology',
];

function ConfigBanner() {
  return (
    <div className="card p-6 flex items-start gap-3 border-ugold-200 bg-ugold-50 dark:bg-ugold-900/20 dark:border-ugold-800">
      <AlertTriangle size={18} className="text-ugold-600 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="font-bold text-navy-900 dark:text-white mb-1">Firebase & MongoDB required</h3>
        <p className="text-sm text-navy-600 dark:text-navy-400 leading-relaxed">
          The mentorship portal requires Firebase Auth and MongoDB Atlas. Add these to{' '}
          <code className="bg-white dark:bg-navy-800 px-1 rounded text-xs">.env.local</code>:
        </p>
        <ul className="mt-2 text-xs font-mono text-navy-700 dark:text-navy-300 space-y-0.5 list-disc list-inside">
          {['NEXT_PUBLIC_FIREBASE_API_KEY', 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
            'NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'FIREBASE_PROJECT_ID',
            'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY', 'MONGODB_URI'].map(v => (
            <li key={v}>{v}</li>
          ))}
        </ul>
        <p className="text-xs text-navy-400 dark:text-navy-500 mt-2">
          See <code className="bg-white dark:bg-navy-800 px-1 rounded">.env.example</code> for where to obtain each value.
        </p>
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
      if (mode === 'login') await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message.replace('Firebase: ', '') : 'Authentication failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="card p-6 w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-navy-900 dark:text-white text-lg flex items-center gap-2">
            <LogIn size={18} /> {mode === 'login' ? 'Sign in' : 'Create account'}
          </h2>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-700 dark:hover:text-navy-200 transition-colors"><X size={18} /></button>
        </div>
        <p className="text-xs text-navy-500 dark:text-navy-400">
          {mode === 'login' ? 'Sign in to access the mentorship portal.' : 'Create a free account to join as a mentor or learner.'}
        </p>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="input" autoFocus />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (6+ characters)" className="input" onKeyDown={e => e.key === 'Enter' && handle()} />
        {error && <p className="text-xs text-ured-600 flex items-center gap-1"><AlertTriangle size={11} />{error}</p>}
        <button onClick={handle} disabled={loading || !email || !password} className="btn-primary w-full">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
        <button onClick={() => setMode(m => m === 'login' ? 'signup' : 'login')} className="text-xs text-navy-500 hover:text-navy-700 dark:hover:text-navy-300 w-full text-center transition-colors">
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}

function RegisterModal({ role, token, onClose, onSuccess }: {
  role: RegisterRole;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [umpStudentId, setUmpStudentId] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('2');
  const [qualification, setQualification] = useState(UMP_QUALIFICATIONS[0]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [apsScore, setApsScore] = useState('');
  const [province] = useState('Mpumalanga');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSubject = (s: string) => {
    setSelectedSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) { setError('Full name is required.'); return; }
    if (role === 'mentor' && selectedSubjects.length === 0) { setError('Select at least one subject you can mentor.'); return; }
    if (role === 'learner' && !apsScore) { setError('APS score is required.'); return; }

    setLoading(true); setError(null);
    try {
      const body = role === 'mentor'
        ? { role: 'mentor', fullName, umpStudentId, yearOfStudy: +yearOfStudy, qualification, majorSubjects: selectedSubjects, bio }
        : { role: 'learner', fullName, school, province, apsScore: +apsScore, subjects: [], careerInterests: selectedSubjects };

      const res = await fetch('/api/mentorship/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `Registration failed (${res.status})`);
      }
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed.');
    } finally { setLoading(false); }
  };

  if (!role) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="card p-6 w-full max-w-md space-y-4 my-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-navy-900 dark:text-white text-lg flex items-center gap-2">
            {role === 'mentor' ? <GraduationCap size={18} /> : <Users size={18} />}
            {role === 'mentor' ? 'Register as a Mentor' : 'Register as a Learner'}
          </h2>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-700 dark:hover:text-navy-200"><X size={18} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">Full Name *</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Thabo Mokoena" className="input" />
          </div>

          {role === 'mentor' ? (
            <>
              <div>
                <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">UMP Student ID</label>
                <input type="text" value={umpStudentId} onChange={e => setUmpStudentId(e.target.value)} placeholder="e.g. 202214532" className="input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">Year of Study</label>
                  <select value={yearOfStudy} onChange={e => setYearOfStudy(e.target.value)} className="input">
                    {['1','2','3','4','5'].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">Your Qualification</label>
                  <select value={qualification} onChange={e => setQualification(e.target.value)} className="input text-xs">
                    {UMP_QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">Subjects you can mentor *</label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                  {SUBJECTS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSubject(s)}
                      className={cn(
                        'text-[11px] font-semibold px-2 py-1 rounded-full border transition-colors',
                        selectedSubjects.includes(s)
                          ? 'bg-navy-800 text-white border-navy-800'
                          : 'border-navy-200 dark:border-navy-700 text-navy-600 dark:text-navy-300 hover:border-navy-400'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">Short bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell learners about yourself, your experience, and how you can help…"
                  className="input resize-none"
                  rows={3}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">School Name</label>
                <input type="text" value={school} onChange={e => setSchool(e.target.value)} placeholder="e.g. Lehawu High School" className="input" />
              </div>
              <div>
                <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">Your APS Score *</label>
                <input type="number" min={0} max={42} value={apsScore} onChange={e => setApsScore(e.target.value)} placeholder="e.g. 24" className="input" />
              </div>
              <div>
                <label className="text-xs font-bold text-navy-700 dark:text-navy-300 block mb-1">Career interests</label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {UMP_QUALIFICATIONS.map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => toggleSubject(q)}
                      className={cn(
                        'text-[10px] font-semibold px-2 py-1 rounded-full border transition-colors',
                        selectedSubjects.includes(q)
                          ? 'bg-navy-800 text-white border-navy-800'
                          : 'border-navy-200 dark:border-navy-700 text-navy-600 dark:text-navy-300 hover:border-navy-400'
                      )}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {error && <p className="text-xs text-ured-600 dark:text-ured-400 flex items-center gap-1"><AlertTriangle size={11} />{error}</p>}

        <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
          {loading ? <><Loader2 size={14} className="animate-spin" /> Registering…</> : `Register as ${role === 'mentor' ? 'Mentor' : 'Learner'}`}
        </button>
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
  const [registerRole, setRegisterRole] = useState<RegisterRole>(null);
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

  const loadProfile = useCallback(async (u: User) => {
    const token = await u.getIdToken();
    try {
      const data = await apiFetch('/api/mentorship/profile', {}, token);
      setMyProfile(data.profile);
    } catch { setMyProfile(null); }
  }, []);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u);
      if (u) await loadProfile(u);
      else setMyProfile(null);
    });
    return () => unsub();
  }, [loadProfile]);

  const loadData = useCallback(async () => {
    setLoading(true); setApiError(null);
    try {
      const [{ learners: l }, { mentors: m }] = await Promise.all([
        apiFetch('/api/mentorship/learners'),
        apiFetch('/api/mentorship/mentors'),
      ]);
      setLearners(l);
      setMentors(m);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Could not load data');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const adoptLearner = async (learner: LearnerProfile) => {
    if (!user || !myProfile) { setAuthModal(true); return; }
    if (myProfile.adoptedLearnersCount >= myProfile.maxLearners) {
      setApiError(`You have reached your limit of ${myProfile.maxLearners} learners.`); return;
    }
    const token = await user.getIdToken();
    try {
      await apiFetch('/api/mentorship/adopt', {
        method: 'POST',
        body: JSON.stringify({ learnerUid: learner.firebaseUid }),
      }, token);
      await loadData();
      await loadProfile(user);
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Adoption failed.');
    }
  };

  const openChat = async (learner: LearnerProfile) => {
    if (!user) { setAuthModal(true); return; }
    setSelectedLearner(learner);
    setTab('chat');
    const token = await user.getIdToken();
    try {
      const { messages: msgs } = await apiFetch(`/api/mentorship/messages?learnerUid=${learner.firebaseUid}`, {}, token);
      setMessages(msgs);
    } catch { setMessages([]); }
  };

  const sendMessage = async () => {
    if (!user || !selectedLearner || !msgInput.trim()) return;
    if (!isSafe(msgInput)) {
      setApiError('SafeChat: Message blocked — keep conversations academic and do not share contact details.'); return;
    }
    const token = await user.getIdToken();
    setApiError(null);
    try {
      const { message } = await apiFetch('/api/mentorship/messages', {
        method: 'POST',
        body: JSON.stringify({ learnerUid: selectedLearner.firebaseUid, text: msgInput }),
      }, token);
      setMessages(prev => [...prev, message]);
      setMsgInput('');
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Failed to send.');
    }
  };

  const handleRegistrationSuccess = async () => {
    setRegisterRole(null);
    await loadData();
    if (user) await loadProfile(user);
  };

  if (!isFirebaseConfigured) return <ConfigBanner />;

  return (
    <div className="space-y-5">
      {authModal && <AuthModal onClose={() => setAuthModal(false)} />}
      {/* RegisterModalWithToken fetches a live Firebase ID token before mounting the form */}
      {registerRole && user && (
        <RegisterModalWithToken
          role={registerRole}
          user={user}
          onClose={() => setRegisterRole(null)}
          onSuccess={handleRegistrationSuccess}
        />
      )}

      {/* Auth bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 card px-4 py-3">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.email?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <div className="text-sm font-semibold text-navy-900 dark:text-white">{user.email}</div>
              {myProfile
                ? <div className="text-xs text-navy-500 dark:text-navy-400">{myProfile.fullName} · {myProfile.adoptedLearnersCount}/{myProfile.maxLearners} learners · {myProfile.impactScore} XP</div>
                : <div className="text-xs text-ugold-600">No mentor profile yet — register below</div>}
            </div>
          </div>
        ) : (
          <p className="text-sm text-navy-500 dark:text-navy-400">Sign in to adopt learners, send messages, and earn impact XP.</p>
        )}
        <div className="flex gap-2">
          {user ? (
            <>
              {!myProfile && (
                <button onClick={() => setRegisterRole('mentor')} className="btn-primary text-xs px-3 py-1.5">
                  <Plus size={12} /> Register as Mentor
                </button>
              )}
              <button onClick={() => { if (auth) signOut(auth); }} className="btn-outline text-xs px-3 py-1.5">
                <LogOut size={12} /> Sign Out
              </button>
            </>
          ) : (
            <button onClick={() => setAuthModal(true)} className="btn-primary text-xs px-3 py-1.5">
              <LogIn size={12} /> Sign In / Register
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-navy-100 dark:border-navy-800">
        {([
          ['browse', 'Browse Learners', UserPlus],
          ['chat', 'SafeChat', MessageSquare],
          ['leaderboard', 'Leaderboard', Trophy],
        ] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors',
              tab === id
                ? 'border-navy-800 text-navy-900 dark:text-white'
                : 'border-transparent text-navy-500 dark:text-navy-400 hover:text-navy-700 dark:hover:text-navy-300'
            )}
          >
            <Icon size={14} />
            {label}
            {id === 'chat' && selectedLearner && <span className="w-1.5 h-1.5 bg-ugreen-500 rounded-full" />}
          </button>
        ))}
      </div>

      {apiError && (
        <div className="flex items-start gap-2 bg-ured-50 dark:bg-ured-900/20 border border-ured-200 dark:border-ured-800 rounded-lg p-3 text-sm text-ured-700 dark:text-ured-400">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Notice</p>
            <p className="text-xs mt-0.5">{apiError}</p>
          </div>
          <button onClick={() => setApiError(null)} className="ml-auto text-ured-400 hover:text-ured-600"><X size={14} /></button>
        </div>
      )}

      {/* Browse tab */}
      {tab === 'browse' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Learners */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="section-title text-sm"><UserPlus size={16} /> Learners Requesting Mentorship</h3>
              {user && (
                <button onClick={() => setRegisterRole('learner')} className="text-xs font-semibold text-navy-500 hover:text-navy-700 dark:hover:text-navy-300 flex items-center gap-1 transition-colors">
                  <Plus size={11} /> Add Learner Profile
                </button>
              )}
            </div>
            <p className="text-xs text-navy-500 dark:text-navy-400">Matched by subject need. Each mentor supports up to 3 learners.</p>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-navy-300" /></div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {learners.map(l => (
                  <div key={l._id ?? l.email} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-navy-800 border border-navy-100 dark:border-navy-700">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-navy-900 dark:text-white truncate">{l.fullName}</p>
                      <p className="text-xs text-navy-500 dark:text-navy-400">
                        APS {l.apsScore} · {l.school ?? 'Mpumalanga'} · {l.careerInterests.slice(0, 1).join('')}
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
                          onClick={() => user ? adoptLearner(l) : setAuthModal(true)}
                          className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 bg-navy-800 text-white rounded-lg hover:bg-navy-900 transition-colors"
                        >
                          <Sparkles size={11} /> Adopt
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {learners.length === 0 && !loading && (
                  <div className="text-center py-8 space-y-2">
                    <BookOpen size={32} className="mx-auto text-navy-200 dark:text-navy-700" />
                    <p className="text-sm text-navy-400 dark:text-navy-500">No learner profiles yet.</p>
                    {user && (
                      <button onClick={() => setRegisterRole('learner')} className="btn-primary text-xs">
                        <Plus size={12} /> Add first learner profile
                      </button>
                    )}
                  </div>
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
                    <GraduationCap size={22} className="text-navy-600" />
                  </div>
                  <div>
                    <p className="font-bold text-navy-900 dark:text-white">{myProfile.fullName}</p>
                    <p className="text-xs text-navy-500 dark:text-navy-400">{myProfile.qualification} · Year {myProfile.yearOfStudy}</p>
                    {myProfile.bio && <p className="text-xs text-navy-600 dark:text-navy-300 mt-1 italic">"{myProfile.bio}"</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-navy-800 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-navy-900 dark:text-white">{myProfile.adoptedLearnersCount}<span className="text-lg text-navy-400">/{myProfile.maxLearners}</span></div>
                    <div className="text-[10px] font-bold text-navy-400 uppercase tracking-wide mt-0.5">Learners</div>
                  </div>
                  <div className="bg-ugold-50 dark:bg-ugold-900/20 rounded-xl p-3 text-center border border-ugold-200 dark:border-ugold-800">
                    <div className="text-2xl font-black text-ugold-700 dark:text-ugold-400">{myProfile.impactScore}</div>
                    <div className="text-[10px] font-bold text-ugold-600 dark:text-ugold-500 uppercase tracking-wide mt-0.5">Impact XP</div>
                  </div>
                </div>
                {myProfile.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {myProfile.badges.map(b => (
                      <span key={b} className="badge badge-gold text-[10px]"><Star size={8} /> {b}</span>
                    ))}
                  </div>
                )}
                {myProfile.majorSubjects.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-navy-400 uppercase tracking-wider mb-1.5">Mentoring subjects</p>
                    <div className="flex flex-wrap gap-1">
                      {myProfile.majorSubjects.map(s => <span key={s} className="badge badge-navy text-[9px]">{s}</span>)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <Shield size={36} className="mx-auto text-navy-200 dark:text-navy-700" />
                {user ? (
                  <>
                    <p className="text-sm text-navy-400 dark:text-navy-500">No mentor profile yet.</p>
                    <button onClick={() => setRegisterRole('mentor')} className="btn-primary text-xs">
                      <Plus size={12} /> Register as Mentor
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-navy-400 dark:text-navy-500">Sign in to create your mentor profile and earn Impact XP.</p>
                    <button onClick={() => setAuthModal(true)} className="btn-primary text-xs"><LogIn size={12} /> Sign In</button>
                  </>
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
              <h3 className="font-bold text-navy-900 dark:text-white text-sm">SafeChat Mentorship Portal</h3>
            </div>
            <span className="badge badge-green text-[10px]"><CheckCircle size={9} /> Safety filters active</span>
          </div>

          {!selectedLearner ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-navy-400 gap-3">
              <MessageSquare size={40} className="text-navy-200 dark:text-navy-700" />
              <p className="text-sm">Select a learner from the Browse tab to start a mentorship conversation.</p>
            </div>
          ) : (
            <>
              <div className="text-xs font-semibold px-3 py-1.5 bg-navy-50 dark:bg-navy-800 rounded-lg text-navy-600 dark:text-navy-300 mb-3 border border-navy-100 dark:border-navy-700">
                Talking with: <strong>{selectedLearner.fullName}</strong> · APS {selectedLearner.apsScore}
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 mb-3" style={{ maxHeight: '280px' }}>
                {messages.length === 0 && (
                  <div className="text-center text-sm text-navy-400 dark:text-navy-500 py-8">
                    <p>No messages yet. Start the conversation!</p>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {['Hi! Let me help you with your APS.', 'Have you applied for NSFAS?', 'Which subjects need work?'].map(q => (
                        <button key={q} onClick={() => setMsgInput(q)} className="text-[10px] px-2.5 py-1 border border-navy-200 dark:border-navy-700 rounded-full text-navy-500 dark:text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors">
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
                        {!isMe && <div className="text-[10px] font-bold text-navy-400 dark:text-navy-500 mb-0.5">{m.senderName}</div>}
                        <p>{m.text}</p>
                        <div className="text-[9px] opacity-40 mt-0.5 text-right">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
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
                  placeholder="Send a mentoring message…"
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
          <p className="text-xs text-navy-500 dark:text-navy-400">Ranked by Impact XP. Earn 50 XP per learner adopted, 10 XP per message sent.</p>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-navy-300" /></div>
          ) : (
            <div className="space-y-2">
              {[...mentors].sort((a, b) => b.impactScore - a.impactScore).map((m, i) => (
                <div key={m._id ?? m.email} className={cn(
                  'flex items-center gap-4 p-3 rounded-xl border transition-colors',
                  i === 0 ? 'bg-ugold-50 dark:bg-ugold-900/20 border-ugold-200 dark:border-ugold-800'
                  : i === 1 ? 'bg-slate-100 dark:bg-navy-800 border-slate-200 dark:border-navy-700'
                  : i === 2 ? 'bg-uorange-50 dark:bg-uorange-900/20 border-uorange-200 dark:border-uorange-800'
                  : 'bg-white dark:bg-navy-800 border-navy-100 dark:border-navy-700'
                )}>
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0',
                    i === 0 ? 'bg-ugold-400 text-white' : i === 1 ? 'bg-slate-400 text-white' : i === 2 ? 'bg-uorange-400 text-white' : 'bg-navy-100 dark:bg-navy-700 text-navy-600 dark:text-navy-300'
                  )}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-navy-900 dark:text-white flex items-center gap-1">
                      {m.fullName} {i === 0 && <Trophy size={12} className="text-ugold-500" />}
                    </p>
                    <p className="text-[11px] text-navy-500 dark:text-navy-400">{m.qualification} · {m.adoptedLearnersCount} learners</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {m.badges.map(b => <span key={b} className="badge badge-gold text-[9px]"><Star size={8} />{b}</span>)}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-black text-ugold-600 dark:text-ugold-400">{m.impactScore}</div>
                    <div className="text-[10px] text-navy-400 font-semibold">XP</div>
                  </div>
                </div>
              ))}
              {mentors.length === 0 && !loading && (
                <p className="text-sm text-navy-400 dark:text-navy-500 text-center py-8">No mentor profiles yet. Be the first to register!</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RegisterModalWithToken({ role, user, onClose, onSuccess }: {
  role: RegisterRole;
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [token, setToken] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    user.getIdToken().then(t => { setToken(t); setReady(true); });
  }, [user]);

  if (!ready || !role) return null;
  return (
    <RegisterModal role={role} token={token} onClose={onClose} onSuccess={onSuccess} />
  );
}
