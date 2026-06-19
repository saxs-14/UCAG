'use client';
import { useState, useCallback, useEffect } from 'react';
import {
  Sparkles, Check, X, MapPin, BadgeDollarSign, TrendingUp, ChevronRight,
  AlertTriangle, Loader2, RefreshCw, BookmarkPlus, BookmarkCheck
} from 'lucide-react';
import { APSCalculatorShell } from '@/components/aps/APSCalculatorShell';
import { CAREER_DATABASE, BURSARIES } from '@/data/careers';
import { checkCareerEligibility } from '@/lib/aps';
import type { Subject, APSResult, CareerPath } from '@/types';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged, User } from 'firebase/auth';

const demandClass: Record<string, string> = {
  CRITICAL: 'demand-critical',
  HIGH:     'demand-high',
  MEDIUM:   'demand-medium',
};

const districtLabels = ['Nkangala', 'GertSibande', 'Ehlanzeni', 'Mbombela', 'Nkomazi'];

function DemandMap({ demand }: { demand: Record<string, 'CRITICAL' | 'HIGH' | 'MEDIUM'> }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const fill = (d: string) =>
    demand[d] === 'CRITICAL' ? '#E43C24' : demand[d] === 'HIGH' ? '#6C843C' : '#D4D9EF';

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-xs font-bold text-navy-600 dark:text-navy-300 flex items-center gap-1">
          <MapPin size={11} /> Employment Demand by District
        </h5>
        {hovered && (
          <span className="text-[10px] font-semibold px-2 py-0.5 bg-navy-100 dark:bg-navy-800 rounded text-navy-700 dark:text-navy-200">
            {hovered}: {demand[hovered.replace(' ', '')]}
          </span>
        )}
      </div>
      <svg viewBox="0 0 300 220" className="w-full max-h-40">
        {[
          { id: 'Nkangala',    d: 'M20,70 L100,50 L120,110 L80,150 L20,130 Z' },
          { id: 'GertSibande', d: 'M20,130 L80,150 L120,110 L150,140 L190,140 L210,200 L80,210 L20,190 Z' },
          { id: 'Ehlanzeni',   d: 'M100,50 L220,10 L250,90 L180,120 L120,110 Z' },
          { id: 'Nkomazi',     d: 'M250,90 L290,100 L280,160 L210,200 L190,140 L180,120 Z' },
        ].map(({ id, d }) => (
          <path
            key={id}
            d={d}
            fill={fill(id)}
            stroke="white"
            strokeWidth="1.5"
            className="cursor-pointer transition-opacity hover:opacity-90"
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        <circle cx="180" cy="90" r="12" fill={fill('Mbombela')} stroke="white" strokeWidth="1.5"
          className="cursor-pointer" onMouseEnter={() => setHovered('Mbombela')} onMouseLeave={() => setHovered(null)} />
        {[
          { x: 65,  y: 100, label: 'Nkangala' },
          { x: 100, y: 180, label: 'Gert Sibande' },
          { x: 165, y: 55,  label: 'Ehlanzeni' },
          { x: 248, y: 148, label: 'Nkomazi' },
          { x: 180, y: 113, label: 'Mbombela' },
        ].map(({ x, y, label }) => (
          <text key={label} x={x} y={y} textAnchor="middle" fontSize="7" fontWeight="700" fill="#0C246C" pointerEvents="none">
            {label}
          </text>
        ))}
      </svg>
      <div className="flex gap-3 justify-center mt-1">
        {[['#E43C24','Critical'],['#6C843C','High'],['#D4D9EF','Medium']].map(([c,l]) => (
          <span key={l} className="flex items-center gap-1 text-[10px] text-navy-500">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c }} />{l}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CareerExplorer() {
  const [apsResult, setApsResult] = useState<APSResult | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selected, setSelected] = useState<CareerPath>(CAREER_DATABASE[0]);
  const [aiText, setAiText] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  const saveCourse = async (career: CareerPath) => {
    if (!user) return;
    setSavingId(career.id);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/tracker', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'save-course', course: { courseId: career.id, courseTitle: career.title } }),
      });
      if (res.ok) setSavedIds(prev => new Set([...prev, career.id]));
    } finally {
      setSavingId(null);
    }
  };

  const handleResult = useCallback((r: APSResult, subs: Subject[]) => {
    setApsResult(r);
    setSubjects(subs);
    setAiText('');
    setAiError(null);
  }, []);

  const qualified = CAREER_DATABASE.filter(c => (apsResult?.standardAps ?? 0) >= c.minAps).map(c => c.title);
  const close     = CAREER_DATABASE.filter(c => {
    const aps = apsResult?.standardAps ?? 0;
    return aps < c.minAps && aps >= c.minAps - 4;
  }).map(c => c.title);

  const eligibility = checkCareerEligibility(selected, subjects, apsResult?.standardAps ?? 0);
  const allMet = eligibility.every(e => e.met);

  const fetchGuidance = async () => {
    if (!apsResult) return;
    setAiLoading(true);
    setAiError(null);
    setAiText('');
    try {
      const res = await fetch('/api/ai/career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apsScore: apsResult.standardAps, subjects, qualifiedCourses: qualified, closeCourses: close }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Request failed (${res.status})`);
      }
      const data = await res.json();
      setAiText(data.guidance);
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setAiLoading(false);
    }
  };

  const relevantBursaries = BURSARIES.filter(b => {
    if (selected.id === 'bed') return b.name.includes('Funza') || b.name === 'NSFAS';
    if (selected.id === 'bsw') return b.name.includes('Social') || b.name === 'NSFAS';
    if (selected.id === 'bsc-cs' || selected.id === 'bsc-agriculture') return b.name.includes('Sasol') || b.name === 'NSFAS';
    return b.name === 'NSFAS' || b.name.includes('Mpumalanga');
  }).slice(0, 2);

  return (
    <div className="space-y-6">
      {/* APS input */}
      <APSCalculatorShell onResult={handleResult} />

      {/* AI Career Guidance Banner */}
      <div className="card p-5 bg-gradient-to-br from-navy-50 to-slate-50 dark:from-navy-900 dark:to-navy-950 border-navy-200 dark:border-navy-700">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-uorange-500" />
            <div>
              <h3 className="font-bold text-navy-900 dark:text-white text-sm">Mpumi AI Career Guidance</h3>
              <p className="text-[11px] text-navy-500 dark:text-navy-400">Powered by Google Gemini · real model output, no canned responses</p>
            </div>
          </div>
          <button
            onClick={fetchGuidance}
            disabled={aiLoading || !apsResult}
            className="btn-primary text-xs px-4 py-2"
          >
            {aiLoading ? <><Loader2 size={13} className="animate-spin" /> Generating…</> : aiText ? <><RefreshCw size={13} /> Regenerate</> : <><Sparkles size={13} /> Get AI Guidance</>}
          </button>
        </div>

        {aiError && (
          <div className="flex items-start gap-2 bg-ured-50 border border-ured-200 rounded-lg p-3 text-sm text-ured-700">
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">AI guidance unavailable</p>
              <p className="text-xs mt-0.5">{aiError}</p>
            </div>
          </div>
        )}

        {aiText && !aiError && (
          <div className="prose prose-sm max-w-none text-navy-800 dark:text-navy-200 leading-relaxed whitespace-pre-line animate-fade-up border-t border-navy-100 dark:border-navy-800 pt-4">
            {aiText}
          </div>
        )}

        {!aiText && !aiLoading && !aiError && (
          <p className="text-xs text-navy-400 dark:text-navy-500 italic">
            Enter your subjects above, then click "Get AI Guidance" for a personalised career narrative based on your actual marks.
          </p>
        )}
      </div>

      {/* Career Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Course list */}
        <div className="lg:col-span-2 card p-5 space-y-3">
          <h3 className="section-title text-sm">
            <TrendingUp size={16} /> UMP Career Pathways
          </h3>
          <p className="text-xs text-navy-500 dark:text-navy-400">Click a course to see detailed requirements.</p>
          <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
            {CAREER_DATABASE.map(career => {
              const qualifies = (apsResult?.standardAps ?? 0) >= career.minAps;
              return (
                <button
                  key={career.id}
                  onClick={() => setSelected(career)}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 px-3 py-3 rounded-lg text-left transition-all text-sm border',
                    selected.id === career.id
                      ? 'bg-navy-800 text-white border-navy-800 shadow-sm'
                      : 'bg-slate-50 dark:bg-navy-800/50 text-navy-700 dark:text-navy-300 border-navy-100 dark:border-navy-700 hover:border-navy-300'
                  )}
                >
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{career.title}</div>
                    <div className={cn('text-[10px] truncate mt-0.5', selected.id === career.id ? 'text-navy-200' : 'text-navy-400')}>
                      {career.faculty}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded',
                      qualifies
                        ? 'bg-ugreen-100 text-ugreen-700'
                        : 'bg-ured-100 text-ured-700')}>
                      APS {career.minAps}+
                    </span>
                    <ChevronRight size={12} className="opacity-50" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3 card p-6 flex flex-col gap-5 animate-fade-in">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">{selected.title}</h3>
              <p className="text-xs text-navy-500 dark:text-navy-400 mt-0.5">{selected.faculty}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={cn('badge text-[10px]', demandClass[selected.demandMpumalanga])}>
                {selected.demandMpumalanga} Demand
              </span>
              {user && (
                <button
                  onClick={() => saveCourse(selected)}
                  disabled={!!savingId || savedIds.has(selected.id)}
                  title={savedIds.has(selected.id) ? 'Saved to tracker' : 'Save to Application Tracker'}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors border',
                    savedIds.has(selected.id)
                      ? 'bg-ugreen-50 border-ugreen-200 text-ugreen-700 dark:bg-ugreen-900/20 dark:border-ugreen-800 dark:text-ugreen-400'
                      : 'bg-navy-50 border-navy-200 text-navy-600 hover:bg-navy-100 dark:bg-navy-800 dark:border-navy-700 dark:text-navy-300'
                  )}
                >
                  {savingId === selected.id
                    ? <Loader2 size={12} className="animate-spin" />
                    : savedIds.has(selected.id)
                      ? <BookmarkCheck size={12} />
                      : <BookmarkPlus size={12} />
                  }
                  {savedIds.has(selected.id) ? 'Saved' : 'Save'}
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-navy-600 dark:text-navy-300 leading-relaxed">{selected.description}</p>

          {/* Salary + overall status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-navy-800 rounded-lg p-3 flex items-center gap-2">
              <BadgeDollarSign size={16} className="text-ugreen-600 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-navy-400 font-semibold uppercase tracking-wide">Salary Range</div>
                <div className="text-sm font-bold text-navy-900 dark:text-white">{selected.salaryRange}</div>
              </div>
            </div>
            <div className={cn('rounded-lg p-3 flex items-center gap-2', allMet ? 'bg-ugreen-50 border border-ugreen-100' : 'bg-ured-50 border border-ured-100')}>
              {allMet
                ? <Check size={16} className="text-ugreen-600 flex-shrink-0" />
                : <X size={16} className="text-ured-500 flex-shrink-0" />}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-navy-400">Your Status</div>
                <div className={cn('text-sm font-bold', allMet ? 'text-ugreen-700' : 'text-ured-700')}>
                  {allMet ? 'Qualifies' : 'Not yet'}
                </div>
              </div>
            </div>
          </div>

          {/* Eligibility checklist */}
          <div>
            <h4 className="text-xs font-bold text-navy-700 dark:text-navy-300 mb-2 flex items-center gap-1">
              <Sparkles size={11} className="text-ugold-500" /> Eligibility Checklist
            </h4>
            <div className="space-y-2">
              {eligibility.map((item, i) => (
                <div key={i} className={cn(
                  'flex items-start gap-2.5 rounded-lg p-2.5 border text-xs',
                  item.met
                    ? 'bg-ugreen-50 border-ugreen-200 text-ugreen-800'
                    : 'bg-ured-50 border-ured-200 text-ured-800'
                )}>
                  <span className={cn('flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5',
                    item.met ? 'bg-ugreen-600' : 'bg-ured-500')}>
                    {item.met ? <Check size={9} color="white" strokeWidth={3} /> : <X size={9} color="white" strokeWidth={3} />}
                  </span>
                  <div>
                    <div className="font-semibold">{item.label}</div>
                    <div className="opacity-70 text-[10px] mt-0.5">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* District demand map */}
          <DemandMap demand={selected.districtDemand} />

          {/* Career roles */}
          <div>
            <h4 className="text-xs font-bold text-navy-600 dark:text-navy-300 mb-2">Possible Careers</h4>
            <div className="flex flex-wrap gap-2">
              {selected.jobs.map(j => (
                <span key={j} className="badge badge-navy text-[10px]">{j}</span>
              ))}
            </div>
          </div>

          {/* Bursaries */}
          {relevantBursaries.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-navy-600 dark:text-navy-300 mb-2">Relevant Bursaries</h4>
              <div className="space-y-2">
                {relevantBursaries.map(b => (
                  <div key={b.name} className="flex items-start gap-2 bg-ugold-50 dark:bg-ugold-900/20 border border-ugold-200 dark:border-ugold-800 rounded-lg p-2.5 text-xs">
                    <div className="flex-1">
                      <div className="font-bold text-navy-800 dark:text-white">{b.name}</div>
                      <div className="text-navy-500 dark:text-navy-400 mt-0.5">{b.coverage}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
