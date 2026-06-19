'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Save, Check, BookOpen, AlertCircle, ChevronRight, Share2, Copy } from 'lucide-react';
import { calculateAPS, getApsLevel } from '@/lib/aps';
import { CAREER_DATABASE } from '@/data/careers';
import type { Subject, APSResult } from '@/types';
import { cn } from '@/lib/utils';

const PRESETS: Record<string, Subject[]> = {
  science: [
    { name: 'Mathematics', mark: 65 },
    { name: 'Physical Sciences', mark: 60 },
    { name: 'Life Sciences', mark: 62 },
    { name: 'English First Additional', mark: 65 },
    { name: 'isiZulu Home Language', mark: 70 },
    { name: 'Life Orientation', mark: 80 },
    { name: 'Geography', mark: 55 },
  ],
  commerce: [
    { name: 'Mathematics', mark: 60 },
    { name: 'Accounting', mark: 68 },
    { name: 'Economics', mark: 62 },
    { name: 'English First Additional', mark: 62 },
    { name: 'Sepedi Home Language', mark: 72 },
    { name: 'Life Orientation', mark: 78 },
    { name: 'Business Studies', mark: 70 },
  ],
  humanities: [
    { name: 'Mathematical Literacy', mark: 58 },
    { name: 'History', mark: 72 },
    { name: 'Geography', mark: 65 },
    { name: 'English Home Language', mark: 70 },
    { name: 'Siswati First Additional', mark: 68 },
    { name: 'Life Orientation', mark: 82 },
    { name: 'Tourism', mark: 75 },
  ],
};

const tierStyles: Record<string, string> = {
  bachelor:      'text-ugreen-700 bg-ugreen-50 border-ugreen-200 dark:bg-ugreen-900/20 dark:border-ugreen-800 dark:text-ugreen-400',
  diploma:       'text-ugold-700 bg-ugold-50 border-ugold-200 dark:bg-ugold-900/20 dark:border-ugold-800 dark:text-ugold-400',
  'higher-cert': 'text-navy-700 bg-navy-50 border-navy-200 dark:bg-navy-800 dark:border-navy-700 dark:text-navy-300',
  none:          'text-ured-700 bg-ured-50 border-ured-200 dark:bg-ured-900/20 dark:border-ured-800 dark:text-ured-400',
};

function LevelBadge({ level, mark }: { level: number; mark: number }) {
  const color =
    mark >= 50 ? 'bg-ugreen-100 text-ugreen-700 dark:bg-ugreen-900/40 dark:text-ugreen-400'
    : mark >= 40 ? 'bg-ugold-100 text-ugold-700 dark:bg-ugold-900/40 dark:text-ugold-400'
    : 'bg-ured-100 text-ured-700 dark:bg-ured-900/40 dark:text-ured-400';
  return (
    <span className={cn('inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold flex-shrink-0', color)}>
      L{level}
    </span>
  );
}

function buildWhatsAppText(subjects: Subject[], result: APSResult, qualifiedCourses: { title: string }[]): string {
  const lines = [
    '📊 *My UCAG APS Results*',
    '',
    `🎯 *APS Score: ${result.standardAps}/42* (UMP APS incl. LO: ${result.umpAps})`,
    `📋 *Status: ${result.qualificationLabel}*`,
    '',
    '*My Subjects:*',
    ...subjects.map(s => `• ${s.name}: ${s.mark}% (Level ${getApsLevel(s.mark, s.name)})`),
    '',
  ];
  if (qualifiedCourses.length > 0) {
    lines.push('*I qualify for at UMP:*');
    qualifiedCourses.forEach(c => lines.push(`✅ ${c.title}`));
  } else {
    lines.push('Keep improving — every mark counts! 💪');
  }
  lines.push('', '🔗 Calculate yours free at UCAG — University Course Advisory Guide');
  return lines.join('\n');
}

export function APSCalculatorShell({
  onResult,
  showExport = false,
}: {
  onResult?: (r: APSResult, subjects: Subject[]) => void;
  showExport?: boolean;
}) {
  const [subjects, setSubjects] = useState<Subject[]>(PRESETS.science);
  const [result, setResult] = useState<APSResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const stableOnResult = useCallback((r: APSResult, subs: Subject[]) => {
    onResult?.(r, subs);
  }, [onResult]);

  useEffect(() => {
    const r = calculateAPS(subjects);
    setResult(r);
    stableOnResult(r, subjects);
  }, [subjects, stableOnResult]);

  const updateMark = (i: number, val: number) => {
    const next = [...subjects];
    next[i] = { ...next[i], mark: Math.min(100, Math.max(0, val)) };
    setSubjects(next);
  };

  const updateName = (i: number, val: string) => {
    const next = [...subjects];
    next[i] = { ...next[i], name: val };
    setSubjects(next);
  };

  const addSubject = () => {
    if (subjects.length < 10) setSubjects([...subjects, { name: 'Additional Subject', mark: 50 }]);
  };

  const removeSubject = (i: number) => {
    if (subjects.length > 4) setSubjects(subjects.filter((_, idx) => idx !== i));
  };

  const handleSave = () => {
    if (!result) return;
    try {
      localStorage.setItem('ucag-aps-snapshot', JSON.stringify({ subjects, result, ts: Date.now() }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* localStorage unavailable */ }
  };

  const handleCopyWhatsApp = async () => {
    if (!result) return;
    const text = buildWhatsAppText(subjects, result, qualifiedCourses);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const qualifiedCourses = CAREER_DATABASE.filter(c => result && result.standardAps >= c.minAps);
  const nearCourses      = CAREER_DATABASE.filter(c => {
    const aps = result?.standardAps ?? 0;
    return aps < c.minAps && aps >= c.minAps - 4;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-up">
      {/* Subject inputs */}
      <div className="lg:col-span-3 card p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-bold text-navy-900 dark:text-white flex items-center gap-2">
            <BookOpen size={16} className="text-navy-600" />
            High School Subject Grades
          </h3>
          <div className="flex gap-2 flex-wrap">
            {(['science', 'commerce', 'humanities'] as const).map(stream => (
              <button
                key={stream}
                onClick={() => setSubjects(PRESETS[stream])}
                className="px-2.5 py-1 rounded-md border border-navy-200 dark:border-navy-700 text-xs font-semibold text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors capitalize"
              >
                {stream}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-navy-500 dark:text-navy-400">
          Enter your final marks (0–100%). Life Orientation receives reduced APS points per NSC guidelines.
          Best 6 academic subjects count toward your standard APS.
        </p>

        <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
          {subjects.map((sub, i) => {
            const level = getApsLevel(sub.mark, sub.name);
            return (
              <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-navy-800 rounded-lg px-3 py-2.5 border border-navy-100 dark:border-navy-700">
                <input
                  type="text"
                  value={sub.name}
                  onChange={e => updateName(i, e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-navy-900 dark:text-white outline-none"
                  aria-label={`Subject ${i + 1} name`}
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sub.mark}
                  onChange={e => updateMark(i, +e.target.value)}
                  className="hidden sm:block w-28 accent-navy-800"
                  aria-label={`${sub.name} mark slider`}
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={sub.mark}
                    onChange={e => updateMark(i, +e.target.value || 0)}
                    className="w-12 text-center bg-transparent border-b border-dashed border-navy-300 dark:border-navy-600 text-sm font-bold text-navy-900 dark:text-white outline-none"
                    aria-label={`${sub.name} percentage`}
                  />
                  <span className="text-xs text-navy-400">%</span>
                </div>
                <LevelBadge level={level} mark={sub.mark} />
                <button
                  onClick={() => removeSubject(i)}
                  disabled={subjects.length <= 4}
                  className="text-navy-300 hover:text-ured-500 disabled:opacity-30 transition-colors"
                  aria-label={`Remove ${sub.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={addSubject}
            disabled={subjects.length >= 10}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 border border-dashed border-navy-300 dark:border-navy-600 rounded-lg py-2 text-sm font-semibold text-navy-500 hover:border-navy-500 hover:text-navy-700 dark:hover:text-navy-300 disabled:opacity-40 transition-colors"
          >
            <Plus size={15} /> Add Subject
          </button>
          <button onClick={handleSave} className="btn-outline text-sm px-4">
            {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save</>}
          </button>
          {showExport && (
            <button onClick={handleCopyWhatsApp} className="btn-primary text-sm px-4">
              {copied ? <><Check size={14} /> Copied!</> : <><Share2 size={14} /> WhatsApp</>}
            </button>
          )}
        </div>

        {showExport && (
          <p className="text-[11px] text-navy-400 dark:text-navy-500 flex items-center gap-1">
            <Copy size={10} />
            "WhatsApp" copies your APS summary as formatted text — paste directly into WhatsApp.
          </p>
        )}
      </div>

      {/* Results panel */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {/* Score circle */}
        <div className="card p-6 flex flex-col items-center text-center gap-3">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-navy-100 dark:text-navy-800" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke="currentColor" strokeWidth="8"
                strokeDasharray={`${((result?.standardAps ?? 0) / 42) * 327} 327`}
                strokeLinecap="round"
                className={cn(
                  'transition-all duration-700',
                  (result?.standardAps ?? 0) >= 28 ? 'text-ugreen-600'
                  : (result?.standardAps ?? 0) >= 22 ? 'text-ugold-500'
                  : 'text-ured-500'
                )}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-navy-900 dark:text-white leading-none" aria-label={`APS Score: ${result?.standardAps ?? 0}`}>
                {result?.standardAps ?? 0}
              </span>
              <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider mt-0.5">APS Score</span>
            </div>
          </div>
          <div className="text-xs text-ugold-600 font-semibold">
            UMP APS (incl. LO): <span className="font-black">{result?.umpAps ?? 0}</span>
          </div>

          {result && (
            <div className={cn('w-full rounded-xl border px-4 py-3 text-sm text-left', tierStyles[result.qualificationTier])}>
              <p className="font-bold leading-tight mb-1">{result.qualificationLabel}</p>
              <p className="text-xs opacity-80 leading-relaxed">{result.qualificationDesc}</p>
            </div>
          )}
        </div>

        {/* Qualified courses */}
        <div className="card p-5 space-y-3">
          <h4 className="font-bold text-navy-900 dark:text-white text-sm">Courses You Qualify For</h4>
          {qualifiedCourses.length === 0 ? (
            <div className="flex items-start gap-2 text-xs text-navy-400">
              <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
              No courses at current APS. Improve any 2 subjects by one level to unlock diploma pathways.
            </div>
          ) : (
            <ul className="space-y-1.5">
              {qualifiedCourses.map(c => (
                <li key={c.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-navy-700 dark:text-navy-300 font-medium">{c.title}</span>
                  <span className={cn('badge text-[10px]', c.demandMpumalanga === 'CRITICAL' ? 'badge-red' : c.demandMpumalanga === 'HIGH' ? 'badge-green' : 'badge-navy')}>
                    {c.demandMpumalanga}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {nearCourses.length > 0 && (
            <>
              <h4 className="font-bold text-navy-700 dark:text-navy-300 text-xs pt-2 border-t border-navy-100 dark:border-navy-800">
                Close — within 4 APS points
              </h4>
              <ul className="space-y-1.5">
                {nearCourses.map(c => (
                  <li key={c.id} className="flex items-center gap-2 text-xs text-navy-500 dark:text-navy-400">
                    <ChevronRight size={11} className="flex-shrink-0 text-ugold-500" />
                    <span className="flex-1">{c.title}</span>
                    <span className="font-bold text-ugold-600 flex-shrink-0">+{c.minAps - (result?.standardAps ?? 0)} pts</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
