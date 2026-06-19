'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, Circle, Sparkles, Loader2, AlertTriangle, ChevronDown, ChevronUp,
  BookOpen, FileText, CreditCard, Calendar, School, RefreshCw, Star
} from 'lucide-react';
import { APSCalculatorShell } from '@/components/aps/APSCalculatorShell';
import { CAREER_DATABASE } from '@/data/careers';
import type { APSResult, Subject } from '@/types';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  phase: string;
  label: string;
  description: string;
  icon: React.ElementType;
  autoComplete?: (r: APSResult | null) => boolean;
  detail?: string;
}

const BASE_STEPS: Step[] = [
  { id: 'aps-calc',      phase: 'Know Your Standing',    icon: BookOpen,    label: 'Calculate your APS score',             description: 'Use the calculator above to get your accurate NSC APS score.',         autoComplete: r => r !== null, detail: 'Your APS score determines which UMP programmes you qualify for. Complete the calculator above to tick this step automatically.' },
  { id: 'subject-check', phase: 'Know Your Standing',    icon: CheckCircle2,label: 'Review subject-specific requirements',  description: 'Check that your marks meet the specific subject requirements for your target course, not just the minimum APS.' },
  { id: 'course-select', phase: 'Know Your Standing',    icon: Star,        label: 'Choose your target UMP programme',     description: 'Browse the Career Explorer and pick your first and second choice qualifications.', detail: 'Go to Career Guidance → pick a course → review the eligibility checklist with your actual marks.' },
  { id: 'nsfas-app',     phase: 'Secure Funding',        icon: CreditCard,  label: 'Apply for NSFAS (if eligible)',        description: 'If household income is below R350 000/yr, apply at nsfas.org.za — applications open in August/September each year.', detail: 'NSFAS covers full tuition, accommodation, meals, books, and transport. Apply early — don\'t wait for your final results.' },
  { id: 'bursary-app',   phase: 'Secure Funding',        icon: Star,        label: 'Research additional bursaries',        description: 'Explore Funza Lushaka (teaching), Sasol (science/tech), and Mpumalanga Provincial bursaries on the Bursary Finder tab.', detail: 'Many bursaries close in October/November — check Bursary Finder now and set phone reminders for each deadline.' },
  { id: 'docs-id',       phase: 'Gather Documents',      icon: FileText,    label: 'Obtain certified copies of your SA ID', description: 'Most universities require recently certified ID copies. Get them from a Police Station or Commissioner of Oaths.' },
  { id: 'docs-results',  phase: 'Gather Documents',      icon: FileText,    label: 'Obtain your Grade 11 and Grade 12 results', description: 'You will need your Grade 11 mid-year results for early application, then certified final NSC statement once available.' },
  { id: 'docs-income',   phase: 'Gather Documents',      icon: FileText,    label: 'Collect proof of household income',    description: '3 months of payslips or a SASSA letter, plus recent bank statements. Needed for NSFAS and most bursary applications.' },
  { id: 'nbt',           phase: 'Prepare for Entry Tests', icon: School,    label: 'Check if NBT is required',             description: 'The National Benchmark Test (NBT) is required for some UMP programmes. Check the specific course requirements.', detail: 'Register for the NBT at nbt.ac.za. Tests are held at multiple venues — book early as slots fill up.' },
  { id: 'ump-account',   phase: 'Apply to UMP',          icon: School,      label: 'Create your UMP online account',       description: 'Register at ump.ac.za to create your applicant profile and start the online application.', detail: 'UMP applications typically open in April–June for the following academic year and close in September.' },
  { id: 'ump-apply',     phase: 'Apply to UMP',          icon: School,      label: 'Submit your UMP application',          description: 'Complete and submit your online application with all required documents and application fee payment (if applicable).', detail: 'Apply to both your first and second choice programme. You can update your programme preference before the closing date.' },
  { id: 'acceptance',    phase: 'Post-Application',      icon: CheckCircle2,label: 'Receive and accept your offer of admission', description: 'Check your email and UMP student portal regularly. Accept your offer before the deadline stated in your offer letter.', detail: 'If you receive a provisional offer, it is conditional on achieving specific final results. Know what your conditions are.' },
  { id: 'register',      phase: 'Post-Application',      icon: Calendar,    label: 'Register for the academic year',       description: 'Complete online registration by the UMP registration deadline — typically in January before lectures begin.' },
];

const PHASES = Array.from(new Set(BASE_STEPS.map(s => s.phase)));
const PHASE_ICONS: Record<string, React.ElementType> = {
  'Know Your Standing': BookOpen,
  'Secure Funding': CreditCard,
  'Gather Documents': FileText,
  'Prepare for Entry Tests': School,
  'Apply to UMP': School,
  'Post-Application': CheckCircle2,
};

export function ReadinessRoadmap() {
  const [apsResult, setApsResult] = useState<APSResult | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('ucag-roadmap');
      return new Set(stored ? JSON.parse(stored) : []);
    } catch { return new Set(); }
  });
  const [expandedPhase, setExpandedPhase] = useState<string>(PHASES[0]);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [guidance, setGuidance] = useState('');
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const [guidanceError, setGuidanceError] = useState<string | null>(null);

  const handleResult = useCallback((r: APSResult, subs: Subject[]) => {
    setApsResult(r);
    setSubjects(subs);
    setGuidance('');
    setGuidanceError(null);
  }, []);

  useEffect(() => {
    const autoCompleted = BASE_STEPS
      .filter(s => s.autoComplete?.(apsResult))
      .map(s => s.id);
    if (autoCompleted.length > 0) {
      setCompleted(prev => {
        const next = new Set([...prev, ...autoCompleted]);
        try { localStorage.setItem('ucag-roadmap', JSON.stringify([...next])); } catch { /* */ }
        return next;
      });
    }
  }, [apsResult]);

  const toggleStep = (id: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      try { localStorage.setItem('ucag-roadmap', JSON.stringify([...next])); } catch { /* */ }
      return next;
    });
  };

  const fetchGuidance = async () => {
    if (!apsResult) return;
    setGuidanceLoading(true);
    setGuidanceError(null);
    setGuidance('');
    const qualifiedCourses = CAREER_DATABASE.filter(c => apsResult.standardAps >= c.minAps).map(c => c.title);
    const weakSubjects = subjects.filter(s => s.mark < 50).map(s => s.name);
    const completedSteps = BASE_STEPS.filter(s => completed.has(s.id)).map(s => s.label);
    try {
      const res = await fetch('/api/ai/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apsScore: apsResult.standardAps,
          qualificationTier: apsResult.qualificationTier,
          qualifiedCourses,
          weakSubjects,
          completedSteps,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `Request failed (${res.status})`);
      }
      const { guidance: g } = await res.json();
      setGuidance(g);
    } catch (e: unknown) {
      setGuidanceError(e instanceof Error ? e.message : 'Could not generate guidance.');
    } finally {
      setGuidanceLoading(false);
    }
  };

  const totalSteps = BASE_STEPS.length;
  const completedCount = BASE_STEPS.filter(s => completed.has(s.id)).length;
  const pct = Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="space-y-6">
      {/* APS input */}
      <APSCalculatorShell onResult={handleResult} />

      {/* Progress bar */}
      {apsResult && (
        <div className="card p-5 animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-navy-900 dark:text-white">Application Readiness</h3>
              <p className="text-xs text-navy-500 dark:text-navy-400">
                {completedCount} of {totalSteps} steps completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-navy-900 dark:text-white leading-none">{pct}%</div>
              <div className="text-[10px] font-bold text-navy-400 uppercase tracking-wider">Ready</div>
            </div>
          </div>
          <div className="h-3 bg-navy-100 dark:bg-navy-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                pct >= 80 ? 'bg-ugreen-500' : pct >= 50 ? 'bg-ugold-500' : 'bg-ured-400'
              )}
              style={{ width: `${pct}%` }}
            />
          </div>

          {pct === 100 && (
            <div className="mt-3 flex items-center gap-2 bg-ugreen-50 dark:bg-ugreen-900/20 border border-ugreen-200 dark:border-ugreen-800 rounded-lg px-3 py-2">
              <CheckCircle2 size={15} className="text-ugreen-600" />
              <p className="text-xs font-bold text-ugreen-700 dark:text-ugreen-400">
                All steps complete — you are ready to apply! Good luck at UMP. 🎓
              </p>
            </div>
          )}
        </div>
      )}

      {/* AI Guidance panel */}
      {apsResult && (
        <div className="card p-5 bg-gradient-to-br from-navy-50 to-slate-50 dark:from-navy-900 dark:to-navy-950 border-navy-200 dark:border-navy-700 animate-fade-up">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-uorange-500" />
              <div>
                <h3 className="font-bold text-navy-900 dark:text-white text-sm">AI Readiness Guidance</h3>
                <p className="text-[11px] text-navy-400 dark:text-navy-500">Live Gemini analysis · personalised to your current progress</p>
              </div>
            </div>
            <button
              onClick={fetchGuidance}
              disabled={guidanceLoading}
              className="btn-primary text-xs px-4 py-2"
            >
              {guidanceLoading
                ? <><Loader2 size={13} className="animate-spin" /> Analysing…</>
                : guidance
                ? <><RefreshCw size={13} /> Refresh</>
                : <><Sparkles size={13} /> Get Guidance</>}
            </button>
          </div>

          {guidanceError && (
            <div className="flex items-start gap-2 bg-ured-50 dark:bg-ured-900/20 border border-ured-200 dark:border-ured-800 rounded-lg p-3 text-sm text-ured-700 dark:text-ured-400">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Guidance unavailable</p>
                <p className="text-xs mt-0.5 opacity-80">{guidanceError}</p>
              </div>
            </div>
          )}

          {guidance && !guidanceError && (
            <div className="text-sm text-navy-800 dark:text-navy-200 leading-relaxed whitespace-pre-line border-t border-navy-100 dark:border-navy-800 pt-3 animate-fade-up">
              {guidance}
            </div>
          )}

          {!guidance && !guidanceLoading && !guidanceError && (
            <p className="text-xs text-navy-400 dark:text-navy-500 italic">
              Click "Get Guidance" for personalised AI advice based on your APS score, weak subjects, and completed steps.
            </p>
          )}
        </div>
      )}

      {/* Checklist */}
      <div className="space-y-3">
        <h3 className="section-title text-sm">
          <FileText size={16} /> Application Checklist
        </h3>
        {!apsResult && (
          <div className="card p-4 flex items-center gap-3 border-ugold-200 bg-ugold-50 dark:bg-ugold-900/20 dark:border-ugold-800">
            <AlertTriangle size={16} className="text-ugold-600 flex-shrink-0" />
            <p className="text-sm text-navy-700 dark:text-navy-300">
              Complete the APS Calculator above first — some checklist steps will auto-complete based on your results.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {PHASES.map(phase => {
            const phaseSteps = BASE_STEPS.filter(s => s.phase === phase);
            const phaseDone = phaseSteps.filter(s => completed.has(s.id)).length;
            const allDone = phaseDone === phaseSteps.length;
            const isOpen = expandedPhase === phase;
            const PhaseIcon = PHASE_ICONS[phase] ?? BookOpen;

            return (
              <div key={phase} className={cn('card overflow-hidden', allDone && 'border-ugreen-200 dark:border-ugreen-800')}>
                <button
                  onClick={() => setExpandedPhase(isOpen ? '' : phase)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      allDone ? 'bg-ugreen-500 text-white' : 'bg-navy-100 dark:bg-navy-800 text-navy-500 dark:text-navy-400'
                    )}>
                      {allDone ? <CheckCircle2 size={15} /> : <PhaseIcon size={15} />}
                    </div>
                    <div>
                      <div className="font-bold text-navy-900 dark:text-white text-sm">{phase}</div>
                      <div className="text-[11px] text-navy-400 dark:text-navy-500">{phaseDone}/{phaseSteps.length} steps done</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="hidden sm:flex gap-1">
                      {phaseSteps.map(s => (
                        <div
                          key={s.id}
                          className={cn('w-2 h-2 rounded-full', completed.has(s.id) ? 'bg-ugreen-500' : 'bg-navy-200 dark:bg-navy-700')}
                        />
                      ))}
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-navy-400" /> : <ChevronDown size={16} className="text-navy-400" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-navy-100 dark:border-navy-800 px-5 py-3 space-y-2 animate-fade-up">
                    {phaseSteps.map(step => {
                      const isDone = completed.has(step.id);
                      const isExpanded = expandedStep === step.id;

                      return (
                        <div key={step.id} className={cn(
                          'rounded-xl border transition-all',
                          isDone
                            ? 'bg-ugreen-50 dark:bg-ugreen-900/20 border-ugreen-200 dark:border-ugreen-800'
                            : 'bg-slate-50 dark:bg-navy-800 border-navy-100 dark:border-navy-700'
                        )}>
                          <div className="flex items-center gap-3 px-4 py-3">
                            <button
                              onClick={() => toggleStep(step.id)}
                              className={cn(
                                'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                                isDone
                                  ? 'border-ugreen-600 bg-ugreen-600'
                                  : 'border-navy-300 dark:border-navy-600 hover:border-navy-500'
                              )}
                              aria-label={isDone ? `Mark "${step.label}" as incomplete` : `Mark "${step.label}" as complete`}
                            >
                              {isDone && <CheckCircle2 size={11} color="white" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={cn('text-sm font-semibold', isDone ? 'text-ugreen-800 dark:text-ugreen-300 line-through' : 'text-navy-900 dark:text-white')}>
                                {step.label}
                              </p>
                              <p className={cn('text-xs mt-0.5', isDone ? 'text-ugreen-600/70 dark:text-ugreen-500/70' : 'text-navy-500 dark:text-navy-400')}>
                                {step.description}
                              </p>
                            </div>
                            {step.detail && (
                              <button
                                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                                className="flex-shrink-0 text-navy-400 hover:text-navy-600 dark:hover:text-navy-300 transition-colors"
                                aria-label="Show more detail"
                              >
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            )}
                          </div>

                          {isExpanded && step.detail && (
                            <div className="px-4 pb-3 animate-fade-up">
                              <p className="text-xs text-navy-600 dark:text-navy-300 bg-white dark:bg-navy-900 rounded-lg p-3 border border-navy-100 dark:border-navy-700 leading-relaxed">
                                {step.detail}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-navy-400 dark:text-navy-500 text-center">
        Your checklist progress is saved locally on this device. Sign in to sync progress across devices (coming soon).
      </p>
    </div>
  );
}
