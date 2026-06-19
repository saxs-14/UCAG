'use client';
import { useState } from 'react';
import { Award, ExternalLink, Filter, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react';
import { BURSARIES, CAREER_DATABASE } from '@/data/careers';
import { cn } from '@/lib/utils';
import type { BursaryOption } from '@/types';

const EXTRA_BURSARIES: BursaryOption[] = [
  {
    name: 'Ikusasa Student Financial Aid Programme (ISFAP)',
    provider: 'Multi-Stakeholder Programme (Government + Private)',
    coverage: 'Tuition, accommodation, meals, books, travel, personal care',
    eligibility: 'NSFAS-excluded students: household income R350 001–R600 000/yr; Black, Coloured, Indian students; STEM or Health Sciences',
    url: 'https://www.isfap.co.za',
  },
  {
    name: 'Allan Gray Orbis Foundation Bursary',
    provider: 'Allan Gray Orbis Foundation',
    coverage: 'Tuition, accommodation, books, mentorship, development programme',
    eligibility: 'Exceptional Grade 12 / first-year students; entrepreneurial mindset; any field of study',
    url: 'https://www.allangrayorbis.org',
  },
  {
    name: 'Department of Health Bursary (Mpumalanga)',
    provider: 'Mpumalanga Department of Health',
    coverage: 'Full tuition, accommodation allowance, stipend',
    eligibility: 'Health Sciences (Nursing, Medicine, Pharmacy, Allied Health); Mpumalanga residents; commit to provincial service',
    url: 'https://www.mpumalanga.gov.za/health',
  },
];

const ALL_BURSARIES = [...BURSARIES, ...EXTRA_BURSARIES];

const FACULTY_TAGS: Record<string, string[]> = {
  'NSFAS': ['All Faculties'],
  'Funza Lushaka Teaching Bursary': ['Education'],
  'Mpumalanga Provincial Bursary': ['Scarce Skills', 'All Faculties'],
  'Sasol Bursary Programme': ['Engineering', 'Science & Technology', 'Finance'],
  'Social Work Scholarship': ['Humanities & Social Sciences'],
  'Thuthuka Bursary Fund': ['Commerce', 'Accounting'],
  'Ikusasa Student Financial Aid Programme (ISFAP)': ['STEM', 'Health Sciences'],
  'Allan Gray Orbis Foundation Bursary': ['All Faculties'],
  'Department of Health Bursary (Mpumalanga)': ['Health Sciences', 'Nursing'],
};

const INCOME_TIERS = [
  { label: 'All income levels', value: 'all' },
  { label: '≤ R350 000/yr (NSFAS eligible)', value: 'low' },
  { label: 'R350 001–R600 000/yr (middle)', value: 'middle' },
  { label: 'Merit-based (any income)', value: 'merit' },
];

function BursaryCard({ bursary }: { bursary: BursaryOption }) {
  const [expanded, setExpanded] = useState(false);
  const tags = FACULTY_TAGS[bursary.name] ?? ['General'];
  const isNSFAS = bursary.name === 'NSFAS';

  return (
    <div className={cn('card p-5 flex flex-col gap-3 transition-shadow', expanded && 'shadow-card-hover')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-navy-900 dark:text-white text-sm">{bursary.name}</h3>
            {isNSFAS && <span className="badge badge-green text-[9px]">PRIMARY SOURCE</span>}
          </div>
          <p className="text-[11px] text-navy-500 dark:text-navy-400">{bursary.provider}</p>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="p-1.5 rounded-md text-navy-400 hover:text-navy-700 hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors flex-shrink-0"
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tags.map(t => (
          <span key={t} className="badge badge-navy text-[9px]">{t}</span>
        ))}
      </div>

      {/* Coverage highlight */}
      <div className="bg-ugreen-50 dark:bg-ugreen-900/20 border border-ugreen-200 dark:border-ugreen-800 rounded-lg px-3 py-2">
        <div className="text-[10px] font-bold text-ugreen-700 dark:text-ugreen-400 uppercase tracking-wider mb-0.5">Coverage</div>
        <p className="text-xs text-navy-700 dark:text-navy-300">{bursary.coverage}</p>
      </div>

      {expanded && (
        <div className="animate-fade-up space-y-3 border-t border-navy-100 dark:border-navy-800 pt-3">
          {/* Eligibility */}
          <div className="bg-navy-50 dark:bg-navy-800 rounded-lg px-3 py-2">
            <div className="text-[10px] font-bold text-navy-600 dark:text-navy-300 uppercase tracking-wider mb-0.5">Eligibility</div>
            <p className="text-xs text-navy-700 dark:text-navy-300">{bursary.eligibility}</p>
          </div>

          {/* Quick checklist for NSFAS */}
          {isNSFAS && (
            <div>
              <div className="text-[10px] font-bold text-navy-600 dark:text-navy-300 uppercase tracking-wider mb-2">What you need to apply</div>
              <div className="space-y-1">
                {[
                  'SA ID number', 'Proof of household income (payslips / SASSA letter)',
                  'Grade 11/12 results or final NSC certificate', 'UMP acceptance / proof of registration',
                  'Bank statement (3 months) for the household',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 text-xs text-navy-600 dark:text-navy-300">
                    <CheckCircle2 size={11} className="text-ugreen-600 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          <a
            href={bursary.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-700 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white transition-colors"
          >
            <ExternalLink size={12} /> Apply / Learn more
          </a>
        </div>
      )}
    </div>
  );
}

function EligibilityFilter({
  aps,
  faculty,
  onFacultyChange,
}: {
  aps: number;
  faculty: string;
  onFacultyChange: (f: string) => void;
}) {
  const faculties = ['All', ...Array.from(new Set(CAREER_DATABASE.map(c => c.faculty.replace('Faculty of ', ''))))];
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter size={14} className="text-navy-400 flex-shrink-0" />
      <span className="text-xs font-semibold text-navy-500 flex-shrink-0">Filter by faculty:</span>
      <div className="flex gap-1.5 flex-wrap">
        {faculties.slice(0, 6).map(f => (
          <button
            key={f}
            onClick={() => onFacultyChange(f)}
            className={cn(
              'text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors',
              faculty === f
                ? 'bg-navy-800 text-white border-navy-800'
                : 'border-navy-200 dark:border-navy-700 text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800'
            )}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}

export function BursaryExplorer() {
  const [faculty, setFaculty] = useState('All');
  const [aps] = useState(0);

  const filtered = ALL_BURSARIES.filter(b => {
    if (faculty === 'All') return true;
    const tags = FACULTY_TAGS[b.name] ?? [];
    return tags.some(t => t.includes('All') || t.toLowerCase().includes(faculty.toLowerCase()));
  });

  return (
    <div className="space-y-5">
      {/* Hero tip */}
      <div className="card p-4 bg-gradient-to-r from-ugreen-50 to-navy-50 dark:from-ugreen-900/20 dark:to-navy-900 border-ugreen-200 dark:border-ugreen-800">
        <div className="flex items-start gap-3">
          <Award size={18} className="text-ugreen-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-navy-700 dark:text-navy-300">
            <strong className="text-ugreen-700 dark:text-ugreen-400">Start with NSFAS.</strong>{' '}
            If your combined household income is below R350 000/yr, NSFAS covers full tuition, accommodation,
            meals, books, and transport. Apply at{' '}
            <a href="https://www.nsfas.org.za" target="_blank" rel="noopener noreferrer" className="underline hover:text-navy-900 dark:hover:text-white">nsfas.org.za</a>{' '}
            as early as August each year — applications open before final Grade 12 exams.
          </div>
        </div>
      </div>

      <EligibilityFilter aps={aps} faculty={faculty} onFacultyChange={setFaculty} />

      <p className="text-xs text-navy-400 dark:text-navy-500">
        Showing {filtered.length} of {ALL_BURSARIES.length} bursaries
        {faculty !== 'All' ? ` relevant to ${faculty}` : ''}
        . Expand each card to see full eligibility requirements and application links.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(b => <BursaryCard key={b.name} bursary={b} />)}
      </div>

      {/* Deadline reminder */}
      <div className="card p-4 border-ugold-200 bg-ugold-50 dark:bg-ugold-900/20 dark:border-ugold-800">
        <div className="flex items-start gap-3">
          <XCircle size={18} className="text-ured-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-navy-800 dark:text-navy-200">
            <strong>Don't miss the deadlines.</strong>{' '}
            Most bursaries open in August–September and close by November 30.
            NSFAS applications typically open in September for the following academic year.
            Set a reminder on your phone now — late applications are almost never accepted.
          </div>
        </div>
      </div>
    </div>
  );
}
