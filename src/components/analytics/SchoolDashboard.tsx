'use client';
import { useState, useEffect } from 'react';
import { BarChart3, AlertTriangle, Loader2, MapPin, TrendingUp, BookOpen, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SchoolRecord } from '@/types';

const DEMAND_COLOURS: Record<string, string> = {
  BSc: 'bg-navy-500', BEd: 'bg-ugreen-500', BSW: 'bg-ured-400', LLB: 'bg-ugold-600',
  Diploma: 'bg-uorange-400', Bachelor: 'bg-navy-400',
};

function BarChart({ data, label }: { data: { label: string; value: number; max: number }[]; label: string }) {
  return (
    <div>
      <div className="text-xs font-bold text-navy-600 dark:text-navy-300 mb-2">{label}</div>
      <div className="space-y-1.5">
        {data.map(d => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="w-32 text-[11px] text-navy-600 dark:text-navy-400 truncate flex-shrink-0">{d.label}</span>
            <div className="flex-1 bg-navy-100 dark:bg-navy-800 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-navy-700 dark:bg-navy-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.round((d.value / d.max) * 100)}%` }}
              />
            </div>
            <span className="w-8 text-[11px] font-bold text-navy-700 dark:text-navy-300 text-right flex-shrink-0">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SchoolCard({ school }: { school: SchoolRecord }) {
  const readinessColor =
    school.readinessRate >= 65 ? 'text-ugreen-700 bg-ugreen-50 border-ugreen-200'
    : school.readinessRate >= 45 ? 'text-ugold-700 bg-ugold-50 border-ugold-200'
    : 'text-ured-700 bg-ured-50 border-ured-200';

  return (
    <div className="card p-4 space-y-3 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-navy-900 dark:text-white text-sm">{school.schoolName}</h3>
          <p className="flex items-center gap-1 text-[11px] text-navy-400 mt-0.5">
            <MapPin size={9} /> {school.region}
          </p>
        </div>
        <div className={cn('text-center rounded-lg border px-2.5 py-1.5 flex-shrink-0', readinessColor)}>
          <div className="text-lg font-black leading-none">{school.readinessRate}%</div>
          <div className="text-[9px] font-bold uppercase tracking-wide mt-0.5">Ready</div>
        </div>
      </div>

      {/* APS bar */}
      <div>
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-navy-400">Average APS</span>
          <span className="font-bold text-navy-700 dark:text-navy-300">{school.averageAps}/42</span>
        </div>
        <div className="h-2 bg-navy-100 dark:bg-navy-800 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full',
              school.averageAps >= 28 ? 'bg-ugreen-500' : school.averageAps >= 22 ? 'bg-ugold-500' : 'bg-ured-400')}
            style={{ width: `${Math.round((school.averageAps / 42) * 100)}%` }}
          />
        </div>
      </div>

      {/* Struggling subjects */}
      <div>
        <p className="text-[10px] font-bold text-navy-500 uppercase tracking-wider mb-1.5">Struggling Subjects</p>
        <div className="space-y-1">
          {school.subjectStruggles.slice(0, 3).map(s => (
            <div key={s.subjectName} className="flex items-center justify-between text-[11px]">
              <span className="text-navy-600 dark:text-navy-400">{s.subjectName}</span>
              <span className="font-bold text-ured-600">{s.strugglesCount} learners</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top career interests */}
      <div>
        <p className="text-[10px] font-bold text-navy-500 uppercase tracking-wider mb-1.5">Top Career Interests</p>
        <div className="flex flex-wrap gap-1">
          {school.topCareerInterests.slice(0, 3).map(c => (
            <span key={c} className="badge badge-navy text-[9px]">{c}</span>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-1 border-t border-navy-100 dark:border-navy-800 text-[10px] text-navy-400">
        <span className="flex items-center gap-1"><Users size={9} />{school.totalLearners} learners</span>
        <span className="flex items-center gap-1 text-ugreen-600"><TrendingUp size={9} />{school.bachelorCount} bachelor</span>
        <span className="flex items-center gap-1 text-ugold-600"><BookOpen size={9} />{school.diplomaCount} diploma</span>
      </div>
    </div>
  );
}

export function SchoolDashboard() {
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/analytics/schools')
      .then(r => r.json())
      .then(d => { setSchools(d.schools ?? []); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-navy-300" /></div>
  );

  if (error) return (
    <div className="card p-6 flex items-start gap-3 border-ured-200 bg-ured-50">
      <AlertTriangle size={18} className="text-ured-500 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="font-bold text-navy-900 mb-1">Analytics unavailable</h3>
        <p className="text-sm text-navy-600">{error}</p>
        <p className="text-xs text-navy-400 mt-1">Configure MONGODB_URI in .env.local to enable the school analytics dashboard.</p>
      </div>
    </div>
  );

  const avgAps = schools.length > 0 ? Math.round(schools.reduce((s, sc) => s + sc.averageAps, 0) / schools.length) : 0;
  const avgReady = schools.length > 0 ? Math.round(schools.reduce((s, sc) => s + sc.readinessRate, 0) / schools.length) : 0;
  const totalLearners = schools.reduce((s, sc) => s + sc.totalLearners, 0);

  const subjectTotals: Record<string, number> = {};
  schools.forEach(sc => sc.subjectStruggles.forEach(ss => {
    subjectTotals[ss.subjectName] = (subjectTotals[ss.subjectName] ?? 0) + ss.strugglesCount;
  }));
  const topStruggles = Object.entries(subjectTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxStruggle = topStruggles[0]?.[1] ?? 1;

  const careerTotals: Record<string, number> = {};
  schools.forEach(sc => sc.topCareerInterests.forEach(c => {
    careerTotals[c] = (careerTotals[c] ?? 0) + 1;
  }));
  const topCareers = Object.entries(careerTotals).sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Schools Tracked', value: schools.length, icon: BarChart3, color: 'text-navy-700' },
          { label: 'Total Learners', value: totalLearners.toLocaleString(), icon: Users, color: 'text-ugreen-700' },
          { label: 'Average APS', value: avgAps, icon: TrendingUp, color: 'text-ugold-700' },
          { label: 'Avg Readiness', value: `${avgReady}%`, icon: BookOpen, color: 'text-ured-600' },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="card p-4 text-center">
              <Icon size={20} className={cn('mx-auto mb-1', k.color)} />
              <div className="text-2xl font-black text-navy-900 dark:text-white">{k.value}</div>
              <div className="text-[10px] font-bold text-navy-400 uppercase tracking-wider mt-0.5">{k.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="card p-5">
          <BarChart
            label="Subject Struggles (Region-wide)"
            data={topStruggles.map(([l, v]) => ({ label: l, value: v, max: maxStruggle }))}
          />
        </div>
        <div className="card p-5">
          <div className="text-xs font-bold text-navy-600 dark:text-navy-300 mb-3">Top Career Interests</div>
          <div className="flex flex-wrap gap-2">
            {topCareers.map(([career, count]) => {
              const key = Object.keys(DEMAND_COLOURS).find(k => career.includes(k)) ?? 'Bachelor';
              return (
                <div key={career} className="flex items-center gap-1.5 bg-slate-50 dark:bg-navy-800 border border-navy-100 dark:border-navy-700 rounded-lg px-2.5 py-1.5">
                  <span className={cn('w-2 h-2 rounded-full flex-shrink-0', DEMAND_COLOURS[key])} />
                  <span className="text-xs font-semibold text-navy-700 dark:text-navy-300">{career}</span>
                  <span className="text-[10px] text-navy-400 font-bold ml-1">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* School cards */}
      <div>
        <h3 className="section-title text-sm mb-4">
          <BarChart3 size={16} /> Individual School Performance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map(sc => <SchoolCard key={sc._id?.toString() ?? sc.schoolName} school={sc} />)}
        </div>
      </div>
    </div>
  );
}
