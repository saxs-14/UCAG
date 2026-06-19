'use client';
import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Circle, BookMarked, Trash2, ClipboardList, Loader2, AlertTriangle, LogIn, RefreshCw, ChevronDown, ChevronUp, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged, User } from 'firebase/auth';
import { APSCalculatorShell } from '@/components/aps/APSCalculatorShell';
import type { ApplicationTracker, SavedCourse, ApplicationStep, APSResult, Subject } from '@/types';
import { CAREER_DATABASE } from '@/data/careers';

const PHASE_LABELS: Record<string, string> = {
  'calc-aps':      'Step 1',
  'choose-course': 'Step 2',
  'check-req':     'Step 3',
  'nsfas-reg':     'Step 4',
  'nsfas-docs':    'Step 5',
  'ump-account':   'Step 6',
  'ump-form':      'Step 7',
  'school-cert':   'Step 8',
  'id-docs':       'Step 9',
  'track-outcome': 'Step 10',
};

const PHASE_GROUPS = [
  { label: 'Know Where You Stand', steps: ['calc-aps', 'choose-course', 'check-req'] },
  { label: 'Secure Funding',       steps: ['nsfas-reg', 'nsfas-docs'] },
  { label: 'Submit Application',   steps: ['ump-account', 'ump-form', 'school-cert', 'id-docs'] },
  { label: 'Post-Application',     steps: ['track-outcome'] },
];

export function ApplicationTrackerShell() {
  const [user, setUser] = useState<User | null | 'loading'>('loading');
  const [tracker, setTracker] = useState<ApplicationTracker | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [showAps, setShowAps] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(PHASE_GROUPS.map(g => g.label)));

  useEffect(() => {
    if (!auth) { setUser(null); return; }
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return unsub;
  }, []);

  const fetchTracker = useCallback(async (u: User) => {
    setLoading(true);
    setError(null);
    try {
      const token = await u.getIdToken();
      const res = await fetch('/api/tracker', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setTracker(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load tracker');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user !== 'loading') fetchTracker(user);
  }, [user, fetchTracker]);

  async function patch(body: object, field: keyof ApplicationTracker) {
    if (!user || user === 'loading') return;
    const id = JSON.stringify(body);
    setSaving(id);
    try {
      const token = await (user as User).getIdToken();
      const res = await fetch('/api/tracker', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setTracker(prev => prev ? { ...prev, [field]: data[field as string] } : prev);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(null);
    }
  }

  const toggleStep = (stepId: string) =>
    patch({ action: 'toggle-step', stepId }, 'steps');

  const removeCourse = (courseId: string) =>
    patch({ action: 'remove-course', courseId }, 'savedCourses');

  const onApsResult = useCallback((result: APSResult, subjects: Subject[]) => {
    if (!user || user === 'loading') return;
    patch(
      { action: 'save-aps', apsSnapshot: { subjects, apsScore: result.umpAps } },
      'apsSnapshot'
    );
    setShowAps(false);
  }, [user]);

  const completedCount = tracker?.steps.filter(s => s.completed).length ?? 0;
  const totalSteps = tracker?.steps.length ?? 10;
  const pct = Math.round((completedCount / totalSteps) * 100);

  if (user === 'loading') {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-navy-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center">
            <ClipboardList size={28} className="text-navy-600 dark:text-navy-300" />
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">Application Tracker</h1>
          <p className="text-navy-500 dark:text-navy-400 text-sm leading-relaxed">
            Sign in to track your UMP application steps, save your target courses, and snapshot your APS score — all synced across your devices.
          </p>
          <a
            href="/mentorship"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-navy-800 text-white text-sm font-bold hover:bg-navy-900 transition-colors"
          >
            <LogIn size={15} />
            Sign in via Mentorship Portal
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">Application Tracker</h1>
          <p className="text-navy-500 dark:text-navy-400 text-sm mt-1">
            Your personal checklist for applying to the University of Mpumalanga.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-ured-50 dark:bg-ured-900/20 border border-ured-200 dark:border-ured-800 rounded-xl p-4 text-sm text-ured-700 dark:text-ured-300">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
            <button onClick={() => user && fetchTracker(user as User)} className="flex items-center gap-1 text-xs underline underline-offset-2">
              <RefreshCw size={11} /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-navy-400" />
          </div>
        ) : tracker && (
          <>
            {/* Overall progress */}
            <div className="card">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <div className="text-3xl font-black text-navy-900 dark:text-white">{pct}%</div>
                  <div className="text-xs text-navy-500 dark:text-navy-400 mt-0.5">{completedCount} of {totalSteps} steps complete</div>
                </div>
                <div className={cn(
                  'text-xs font-bold px-3 py-1.5 rounded-full',
                  pct === 100 ? 'bg-ugreen-100 text-ugreen-700 dark:bg-ugreen-900/30 dark:text-ugreen-400'
                  : pct >= 50  ? 'bg-ugold-100 text-ugold-700 dark:bg-ugold-900/30 dark:text-ugold-400'
                  :              'bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-navy-400'
                )}>
                  {pct === 100 ? 'Ready to apply!' : pct >= 50 ? 'Good progress' : 'Just getting started'}
                </div>
              </div>
              <div className="h-3 w-full bg-slate-200 dark:bg-navy-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    pct === 100 ? 'bg-ugreen-500' : pct >= 50 ? 'bg-ugold-400' : 'bg-navy-500'
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* APS Snapshot */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calculator size={16} className="text-navy-500" />
                  <span className="text-sm font-bold text-navy-800 dark:text-navy-200">APS Snapshot</span>
                </div>
                <button
                  onClick={() => setShowAps(v => !v)}
                  className="text-xs font-semibold text-navy-500 hover:text-navy-700 dark:hover:text-navy-300 flex items-center gap-1 transition-colors"
                >
                  {showAps ? <><ChevronUp size={13} /> Hide</> : <><ChevronDown size={13} /> {tracker.apsSnapshot ? 'Recalculate' : 'Calculate APS'}</>}
                </button>
              </div>

              {tracker.apsSnapshot ? (
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-navy-900 dark:text-white">{tracker.apsSnapshot.apsScore}</span>
                    <span className="text-sm text-navy-500">APS points</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tracker.apsSnapshot.subjects.map(s => (
                      <span key={s.name} className="text-[11px] px-2 py-0.5 rounded-md bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 font-medium">
                        {s.name}: {s.mark}%
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-navy-400 dark:text-navy-500 mt-1">
                    Saved {new Date(tracker.apsSnapshot.savedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-navy-400 dark:text-navy-500">
                  No APS score saved yet. Use the calculator below to save your score here.
                </p>
              )}

              {showAps && (
                <div className="mt-4 border-t border-navy-100 dark:border-navy-800 pt-4">
                  <APSCalculatorShell onResult={onApsResult} />
                </div>
              )}
            </div>

            {/* Saved Courses */}
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <BookMarked size={16} className="text-navy-500" />
                <span className="text-sm font-bold text-navy-800 dark:text-navy-200">Saved Courses</span>
                <span className="ml-auto text-xs text-navy-400">{tracker.savedCourses.length} saved</span>
              </div>

              {tracker.savedCourses.length === 0 ? (
                <div className="text-center py-6 text-navy-400 dark:text-navy-500 text-sm">
                  <BookMarked size={24} className="mx-auto mb-2 opacity-30" />
                  <p>No courses saved yet.</p>
                  <p className="text-xs mt-1">Use the Career Explorer to save courses you're interested in.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {tracker.savedCourses.map(c => {
                    const course = CAREER_DATABASE.find(cd => cd.id === c.courseId);
                    return (
                      <li key={c.courseId} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-navy-800/60 border border-navy-100 dark:border-navy-700">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-navy-800 dark:text-navy-200 truncate">{c.courseTitle}</div>
                          {course && (
                            <div className="text-[11px] text-navy-400 dark:text-navy-500 mt-0.5">{course.faculty} · {course.minAps} APS min</div>
                          )}
                        </div>
                        <button
                          onClick={() => removeCourse(c.courseId)}
                          disabled={!!saving}
                          className="text-navy-300 dark:text-navy-600 hover:text-ured-500 transition-colors flex-shrink-0"
                          aria-label={`Remove ${c.courseTitle}`}
                        >
                          {saving === JSON.stringify({ action: 'remove-course', courseId: c.courseId })
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Trash2 size={14} />
                          }
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Application Checklist */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList size={16} className="text-navy-500" />
                <span className="text-sm font-bold text-navy-800 dark:text-navy-200">Application Checklist</span>
              </div>

              <div className="space-y-4">
                {PHASE_GROUPS.map(group => {
                  const groupSteps = tracker.steps.filter(s => group.steps.includes(s.id));
                  const groupDone  = groupSteps.filter(s => s.completed).length;
                  const expanded   = expandedGroups.has(group.label);

                  return (
                    <div key={group.label} className="rounded-xl border border-navy-100 dark:border-navy-700 overflow-hidden">
                      <button
                        onClick={() => setExpandedGroups(prev => {
                          const next = new Set(prev);
                          expanded ? next.delete(group.label) : next.add(group.label);
                          return next;
                        })}
                        className="w-full flex items-center justify-between px-4 py-3 bg-navy-50 dark:bg-navy-800/50 hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            'text-xs font-bold px-2 py-0.5 rounded-full',
                            groupDone === groupSteps.length
                              ? 'bg-ugreen-100 text-ugreen-700 dark:bg-ugreen-900/30 dark:text-ugreen-400'
                              : 'bg-navy-200 dark:bg-navy-700 text-navy-600 dark:text-navy-300'
                          )}>
                            {groupDone}/{groupSteps.length}
                          </span>
                          <span className="text-sm font-semibold text-navy-800 dark:text-navy-200">{group.label}</span>
                        </div>
                        {expanded ? <ChevronUp size={15} className="text-navy-400" /> : <ChevronDown size={15} className="text-navy-400" />}
                      </button>

                      {expanded && (
                        <ul className="divide-y divide-navy-100 dark:divide-navy-700/50">
                          {groupSteps.map(step => {
                            const isSaving = saving === JSON.stringify({ action: 'toggle-step', stepId: step.id });
                            return (
                              <li key={step.id}>
                                <button
                                  onClick={() => toggleStep(step.id)}
                                  disabled={isSaving}
                                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-navy-50 dark:hover:bg-navy-800/30 transition-colors text-left"
                                >
                                  {isSaving
                                    ? <Loader2 size={18} className="flex-shrink-0 mt-0.5 animate-spin text-navy-400" />
                                    : step.completed
                                      ? <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5 text-ugreen-500" />
                                      : <Circle size={18} className="flex-shrink-0 mt-0.5 text-navy-300 dark:text-navy-600" />
                                  }
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-[10px] font-bold text-navy-400 dark:text-navy-500 uppercase tracking-wide">{PHASE_LABELS[step.id]}</span>
                                    </div>
                                    <div className={cn(
                                      'text-sm font-medium leading-snug',
                                      step.completed
                                        ? 'text-navy-400 dark:text-navy-500 line-through'
                                        : 'text-navy-800 dark:text-navy-200'
                                    )}>
                                      {step.label}
                                    </div>
                                    {step.completed && step.completedAt && (
                                      <div className="text-[10px] text-ugreen-500 mt-0.5">
                                        Done {new Date(step.completedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                                      </div>
                                    )}
                                  </div>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
