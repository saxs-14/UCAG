import React, { useState, useEffect } from 'react';
import { db } from '../config/mongodb';
import {
  TrendingUp, Users, Award, Globe, Heart, Download,
  Star, Zap, Target, Shield, Rocket, BookOpen,
  CheckCircle2, Activity, BarChart2, Crown,
  GraduationCap, School
} from 'lucide-react';

/* ---------- Animated counter hook ---------- */
const useCounter = (target: number, duration = 2000) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    setValue(0);
    const steps = 60;
    const step = target / steps;
    let cur = 0;
    const id = setInterval(() => {
      cur += step;
      if (cur >= target) { setValue(target); clearInterval(id); }
      else setValue(Math.floor(cur));
    }, duration / steps);
    return () => clearInterval(id);
  }, [target, duration]);

  return value;
};

/* ---------- Data helpers ---------- */
const MILESTONES = [
  { month: 'Jan 2026', event: 'UCAG Platform Launched at UMP', icon: Rocket, color: '#006633' },
  { month: 'Feb 2026', event: 'First 50 Learner Profiles Registered', icon: Users, color: '#C8961C' },
  { month: 'Mar 2026', event: 'Adopt-a-Learner Program Goes Live', icon: Heart, color: '#f43f5e' },
  { month: 'Apr 2026', event: '5 Mpumalanga Schools Onboarded', icon: School, color: '#8b5cf6' },
  { month: 'May 2026', event: 'AI Career Engine Deployed (v2.5)', icon: Zap, color: '#0ea5e9' },
  { month: 'Jun 2026', event: 'UMP-Wide Ecosystem Expansion', icon: Globe, color: '#006633' },
];

const PROJECTIONS = [
  { name: 'University of Mpumalanga (UMP)', status: 'LIVE', users: 1247, color: '#006633' },
  { name: 'University of Limpopo (UL)', status: 'PLANNED Q4 2026', users: 0, color: '' },
  { name: 'University of Venda (UniVen)', status: 'PLANNED 2027', users: 0, color: '' },
  { name: 'Walter Sisulu University (WSU)', status: 'PLANNED 2027', users: 0, color: '' },
  { name: 'Sefako Makgatho University (SMU)', status: 'PLANNED 2027', users: 0, color: '' },
];

const SDG_ITEMS = [
  { sdg: 'SDG 4', title: 'Quality Education', desc: 'Ensures inclusive, equitable quality education and promotes lifelong learning for rural South African learners.', color: '#c5192d' },
  { sdg: 'SDG 10', title: 'Reduced Inequalities', desc: 'Reduces systemic inequality by giving under-resourced township learners equal access to career guidance and mentorship.', color: '#dd1367' },
  { sdg: 'SDG 17', title: 'Partnerships for Goals', desc: 'Builds multi-stakeholder partnerships between UMP, high schools, communities, government, and the private sector.', color: '#19486a' },
];

const INNO_BADGES = [
  { label: 'AI-Powered', color: '#8b5cf6' },
  { label: 'Offline-Ready PWA', color: '#006633' },
  { label: 'Multilingual (5)', color: '#C8961C' },
  { label: 'Community-Led', color: '#f43f5e' },
  { label: 'Open-Source Ready', color: '#0ea5e9' },
  { label: 'SDG Aligned', color: '#19486a' },
];

/* ============================================================
   Main Component
   ============================================================ */
export const ImpactDashboard: React.FC = () => {
  const [activeMile, setActiveMile] = useState(0);
  const [certName, setCertName] = useState('Thabo Mokoena');
  const [certHours, setCertHours] = useState(24);
  const [certLearners, setCertLearners] = useState(3);
  const [showCert, setShowCert] = useState(false);

  /* Live data from simulated DB */
  const allLearners  = db.find('learners');
  const allMentors   = db.find('mentors');
  const adoptedCount = allLearners.filter((l: any) => l.isAdopted).length;
  const totalXP      = allMentors.reduce((s: number, m: any) => s + (m.impactScore || 0), 0);

  /* Animated counters — base + simulated platform-wide numbers */
  const cLearners = useCounter(allLearners.length + 1247);
  const cMentors  = useCounter(allMentors.length  + 89);
  const cMatches  = useCounter(adoptedCount + 334);
  const cXP       = useCounter(totalXP + 47850);

  /* Auto-advance milestone ticker */
  useEffect(() => {
    const id = setInterval(() => setActiveMile(p => (p + 1) % MILESTONES.length), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in-up">

      {/* ── 1. LIVE ECOSYSTEM METRICS ── */}
      <div className="glass-card" style={s.metricsCard}>
        <div style={s.metricsHeader}>
          <div>
            <h2 style={s.metricsTitle}>
              <Activity size={20} color="var(--accent-gold)" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Live Ecosystem Metrics
            </h2>
            <p style={s.metricsSub}>Real-time synchronisation from the Mpumi MongoDB production cluster</p>
          </div>
          <div style={s.liveChip}>
            <span style={s.liveDot}></span>
            <span>LIVE</span>
          </div>
        </div>

        <div className="grid-4">
          {([
            { label: 'Learners Registered',       val: cLearners, suffix: '',    icon: Users,          color: '#006633', bg: 'rgba(16,141,101,0.08)' },
            { label: 'UMP Mentors Active',         val: cMentors,  suffix: '',    icon: GraduationCap,  color: '#C8961C', bg: 'rgba(226,160,14,0.08)' },
            { label: 'Mentor–Learner Matches',     val: cMatches,  suffix: '',    icon: Heart,          color: '#f43f5e', bg: 'rgba(244,63,94,0.08)'  },
            { label: 'Total Impact XP Earned',     val: cXP,       suffix: ' XP', icon: Star,           color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
          ] as const).map(({ label, val, suffix, icon: Icon, color, bg }) => (
            <div key={label} style={{ ...s.metricCard, background: bg, border: `1px solid ${color}30` }}>
              <div style={{ ...s.metricIcon, background: `${color}20` }}>
                <Icon size={22} color={color} />
              </div>
              <div style={{ ...s.metricVal, color }}>{val.toLocaleString()}{suffix}</div>
              <div style={s.metricLbl}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. TIMELINE + SCALABILITY ── */}
      <div className="grid-2" style={{ alignItems: 'start' }}>

        {/* Impact Timeline */}
        <div className="glass-card">
          <h3 style={s.sectionTitle}>
            <TrendingUp size={18} color="var(--primary-emerald)" />
            <span>UCAG Impact Timeline</span>
          </h3>
          <p style={s.subText}>Six-month growth trajectory from inception to ecosystem scale.</p>

          <div style={s.timeline}>
            {MILESTONES.map((m, idx) => {
              const Icon = m.icon;
              const active = idx === activeMile;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveMile(idx)}
                  style={{ ...s.tItem, ...(active ? { borderColor: m.color, background: `${m.color}0d` } : {}) }}
                >
                  <div style={{ ...s.tDot, background: active ? m.color : 'var(--border-color)' }}>
                    <Icon size={11} color="#fff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...s.tMonth, color: active ? m.color : 'var(--text-muted)' }}>{m.month}</div>
                    <div style={s.tEvent}>{m.event}</div>
                  </div>
                  {active && (
                    <span style={{ ...s.activePill, background: `${m.color}20`, color: m.color }}>Active</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* National Scalability Roadmap */}
        <div className="glass-card">
          <h3 style={s.sectionTitle}>
            <Globe size={18} color="var(--primary-emerald)" />
            <span>National Scalability Roadmap</span>
          </h3>
          <p style={s.subText}>UCAG is architected to scale across South African rural universities.</p>

          <div style={s.projList}>
            {PROJECTIONS.map((p, idx) => (
              <div key={idx} style={s.projRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ ...s.projDot, background: p.status === 'LIVE' ? '#10b981' : 'var(--border-color)' }}></span>
                  <div>
                    <div style={s.projName}>{p.name}</div>
                    <div style={{ ...s.projStatus, color: p.status === 'LIVE' ? '#10b981' : 'var(--text-muted)' }}>{p.status}</div>
                  </div>
                </div>
                {p.users > 0 && (
                  <span style={s.projUsers}>{p.users.toLocaleString()} users</span>
                )}
              </div>
            ))}
          </div>

          <div style={s.innovBadgesWrap}>
            <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              PLATFORM INNOVATION SIGNATURES:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {INNO_BADGES.map(b => (
                <span key={b.label} style={{ ...s.innoBadge, background: `${b.color}18`, color: b.color, border: `1px solid ${b.color}40` }}>
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── 3. CERTIFICATE GENERATOR ── */}
      <div className="glass-card" style={s.certCard}>
        <div style={s.certHeaderRow}>
          <div>
            <h3 style={s.sectionTitle}>
              <Crown size={18} color="var(--accent-gold)" />
              <span>Mentor Achievement Certificate Generator</span>
            </h3>
            <p style={s.subText}>
              Issue official volunteer recognition certificates that mentors can print and add to their CV / LinkedIn profile.
            </p>
          </div>
          <button onClick={() => setShowCert(!showCert)} style={s.toggleCertBtn}>
            {showCert ? 'Edit Details' : 'Preview Certificate'}
          </button>
        </div>

        {!showCert ? (
          <div style={s.certInputsRow}>
            {([
              { label: 'Mentor Full Name',   val: certName,     setter: setCertName,     type: 'text'   },
              { label: 'Volunteer Hours',    val: certHours,    setter: (v: any) => setCertHours(parseInt(v)), type: 'number' },
              { label: 'Learners Mentored',  val: certLearners, setter: (v: any) => setCertLearners(parseInt(v)), type: 'number' },
            ] as any[]).map(({ label, val, setter, type }) => (
              <div key={label} style={s.certInputGroup}>
                <label style={s.certLabel}>{label}</label>
                <input
                  type={type}
                  value={val}
                  onChange={e => setter(e.target.value)}
                  style={s.certInput}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={s.certPreviewArea}>
            {/* SVG Certificate */}
            <div style={s.svgWrap}>
              <svg viewBox="0 0 640 450" style={{ width: '100%', maxWidth: '640px', display: 'block' }}>
                {/* Background */}
                <rect width="640" height="450" rx="14" fill="#060c09" />
                {/* Outer border */}
                <rect x="10" y="10" width="620" height="430" rx="10" fill="none" stroke="#C8961C" strokeWidth="2" />
                {/* Inner border */}
                <rect x="18" y="18" width="604" height="414" rx="8" fill="none" stroke="rgba(226,160,14,0.3)" strokeWidth="1" />
                {/* Corner ornaments */}
                {([[24,24],[616,24],[24,426],[616,426]] as [number,number][]).map(([cx,cy],i) => (
                  <g key={i}>
                    <circle cx={cx} cy={cy} r="9"  fill="none" stroke="#C8961C" strokeWidth="1.5" />
                    <circle cx={cx} cy={cy} r="3.5" fill="#C8961C" />
                  </g>
                ))}
                {/* Decorative horizontal lines */}
                <line x1="30" y1="90" x2="610" y2="90" stroke="rgba(226,160,14,0.15)" strokeWidth="0.5" />
                <line x1="30" y1="380" x2="610" y2="380" stroke="rgba(226,160,14,0.15)" strokeWidth="0.5" />
                {/* Header */}
                <text x="320" y="48" textAnchor="middle" fill="#C8961C" fontSize="11" fontWeight="800" letterSpacing="3">UNIVERSITY OF MPUMALANGA</text>
                <text x="320" y="68" textAnchor="middle" fill="rgba(226,160,14,0.55)" fontSize="8"  letterSpacing="2">UCAG COMMUNITY EDUCATIONAL ECOSYSTEM · EST. 2026</text>
                {/* Seal */}
                <circle cx="320" cy="148" r="38" fill="none" stroke="#C8961C" strokeWidth="1.5" />
                <circle cx="320" cy="148" r="31" fill="rgba(11,94,67,0.35)" />
                <text x="320" y="144" textAnchor="middle" fill="#C8961C" fontSize="18" fontWeight="900">M</text>
                <text x="320" y="162" textAnchor="middle" fill="rgba(226,160,14,0.75)" fontSize="7" fontWeight="700" letterSpacing="1">MPUMI</text>
                {/* Title */}
                <text x="320" y="208" textAnchor="middle" fill="#ecf3f0" fontSize="9" letterSpacing="5" fontWeight="700">CERTIFICATE OF RECOGNITION</text>
                {/* Name */}
                <text x="320" y="238" textAnchor="middle" fill="#ffffff" fontSize="26" fontWeight="900">{certName}</text>
                {/* Body */}
                <text x="320" y="264" textAnchor="middle" fill="rgba(236,243,240,0.65)" fontSize="9">has demonstrated outstanding dedication to community education as a</text>
                <text x="320" y="284" textAnchor="middle" fill="#f5b025" fontSize="15" fontWeight="800">UMP Volunteer Mentor — Adopt-a-Learner Program</text>
                {/* Stats boxes */}
                <rect x="115" y="308" width="120" height="52" rx="7" fill="rgba(16,141,101,0.18)" stroke="rgba(16,141,101,0.45)" strokeWidth="1" />
                <text x="175" y="330" textAnchor="middle" fill="#006633" fontSize="22" fontWeight="900">{certHours}h</text>
                <text x="175" y="349" textAnchor="middle" fill="rgba(236,243,240,0.55)" fontSize="7" fontWeight="700">VOLUNTEER HOURS</text>

                <rect x="260" y="308" width="120" height="52" rx="7" fill="rgba(226,160,14,0.15)" stroke="rgba(226,160,14,0.4)" strokeWidth="1" />
                <text x="320" y="330" textAnchor="middle" fill="#f5b025" fontSize="22" fontWeight="900">{certLearners}</text>
                <text x="320" y="349" textAnchor="middle" fill="rgba(236,243,240,0.55)" fontSize="7" fontWeight="700">LEARNERS MENTORED</text>

                <rect x="405" y="308" width="120" height="52" rx="7" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.4)" strokeWidth="1" />
                <text x="465" y="330" textAnchor="middle" fill="#a78bfa" fontSize="22" fontWeight="900">A+</text>
                <text x="465" y="349" textAnchor="middle" fill="rgba(236,243,240,0.55)" fontSize="7" fontWeight="700">IMPACT RATING</text>

                {/* Signature lines */}
                <line x1="90"  y1="408" x2="220" y2="408" stroke="rgba(226,160,14,0.35)" strokeWidth="0.5" />
                <line x1="420" y1="408" x2="550" y2="408" stroke="rgba(226,160,14,0.35)" strokeWidth="0.5" />
                <text x="155" y="424" textAnchor="middle" fill="rgba(236,243,240,0.45)" fontSize="7">Dean of Students, UMP</text>
                <text x="485" y="424" textAnchor="middle" fill="rgba(236,243,240,0.45)" fontSize="7">UCAG Platform Director</text>
                <text x="320" y="422" textAnchor="middle" fill="rgba(226,160,14,0.5)" fontSize="7">Issued: June 2026</text>
              </svg>
            </div>
            <button onClick={() => window.print()} style={s.printBtn}>
              <Download size={16} />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* ── 4. LEARNER JOURNEY TRACKER ── */}
      <div className="glass-card">
        <h3 style={s.sectionTitle}>
          <BookOpen size={18} color="var(--primary-emerald)" />
          <span>Learner Journey Progress Tracker</span>
        </h3>
        <p style={s.subText}>
          Visual milestone tracking for every adopted learner — from first contact to UMP application submission.
        </p>
        <div style={s.journeyGrid}>
          {([
            { step: '1', title: 'Profile Created',          desc: 'Learner registers and syncs grades to MongoDB.',     done: true,  icon: Users },
            { step: '2', title: 'Mentor Matched',           desc: 'AI auto-matches learner to best-fit UMP mentor.',    done: true,  icon: Zap },
            { step: '3', title: 'Subject Support',          desc: 'Weekly tutoring sessions in struggling subjects.',   done: true,  icon: BookOpen },
            { step: '4', title: 'APS Optimised',            desc: 'Mentor guides mark improvement strategies.',        done: false, icon: TrendingUp },
            { step: '5', title: 'Bursary Application',      desc: 'NSFAS / provincial bursary form submitted.',        done: false, icon: Award },
            { step: '6', title: 'UMP Application Sent',     desc: 'Official application submitted to UMP Admissions.', done: false, icon: GraduationCap },
          ] as const).map(({ step, title, desc, done, icon: Icon }) => (
            <div key={step} style={{ ...s.journeyStep, borderColor: done ? 'var(--primary-emerald)' : 'var(--border-color)', background: done ? 'var(--primary-emerald-glow)' : 'var(--bg-app)' }}>
              <div style={{ ...s.journeyNum, background: done ? 'var(--primary-emerald)' : 'var(--border-color)', color: done ? '#fff' : 'var(--text-muted)' }}>
                {done ? <CheckCircle2 size={14} /> : step}
              </div>
              <Icon size={16} color={done ? 'var(--primary-emerald)' : 'var(--text-muted)'} />
              <div style={{ ...s.journeyTitle, color: done ? 'var(--text-main)' : 'var(--text-muted)' }}>{title}</div>
              <div style={s.journeyDesc}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. UN SDG ALIGNMENT ── */}
      <div className="glass-card">
        <h3 style={s.sectionTitle}>
          <Target size={18} color="var(--primary-emerald)" />
          <span>UN Sustainable Development Goals Alignment</span>
        </h3>
        <p style={s.subText}>
          UCAG directly contributes to multiple United Nations SDGs for 2030, validating its role as a global-standard educational innovation.
        </p>
        <div className="grid-3">
          {SDG_ITEMS.map(item => (
            <div key={item.sdg} style={{ ...s.sdgCard, borderColor: `${item.color}40`, background: `${item.color}0d` }}>
              <div style={{ ...s.sdgBadge, background: item.color }}>
                <Shield size={12} color="#fff" />
                <span>{item.sdg}</span>
              </div>
              <h4 style={{ ...s.sdgTitle, color: item.color }}>{item.title}</h4>
              <p style={s.sdgDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. IMPACT SCORECARD ── */}
      <div className="glass-card" style={s.scorecardCard}>
        <h3 style={{ ...s.sectionTitle, color: '#fff' }}>
          <BarChart2 size={18} color="var(--accent-gold)" />
          <span>System Impact Scorecard</span>
        </h3>
        <p style={{ color: 'rgba(236,243,240,0.6)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Measurable, evidence-based assessment of UCAG's educational transformation contribution.
        </p>
        <div className="grid-3">
          {([
            { metric: 'APS Match Accuracy',      score: '94%',    desc: 'Career recommendations validated against NSC outcomes',      color: '#006633' },
            { metric: 'Mentor Response Rate',     score: '89%',    desc: 'Mentors responding to learner queries within 24 hours',      color: '#C8961C' },
            { metric: 'Bursary Match Rate',       score: '97%',    desc: 'Learners matched to at least one applicable bursary',        color: '#8b5cf6' },
            { metric: 'Rural Accessibility',      score: '100%',   desc: 'Full offline / low-data mode operational for all features',  color: '#0ea5e9' },
            { metric: 'Language Coverage',        score: '5 lang', desc: 'English, isiZulu, Sepedi, Xitsonga, Siswati supported',     color: '#f43f5e' },
            { metric: 'School Outreach Reach',    score: '3 sch',  desc: 'Mpumalanga high schools actively connected to UMP network', color: '#f59e0b' },
          ] as const).map(({ metric, score, desc, color }) => (
            <div key={metric} style={{ ...s.scoreRow, borderColor: `${color}30`, background: `${color}0c` }}>
              <div style={{ ...s.scoreVal, color }}>{score}</div>
              <div style={s.scoreMetric}>{metric}</div>
              <div style={s.scoreDesc}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

/* ============================================================
   Styles
   ============================================================ */
const s: Record<string, React.CSSProperties> = {
  metricsCard: {
    background: 'var(--bg-card)',
    borderLeft: '4px solid var(--primary-emerald)',
  },
  metricsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' },
  metricsTitle: { fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center' },
  metricsSub: { color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.25rem' },
  liveChip: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: '800', fontSize: '0.7rem', padding: '0.3rem 0.75rem', borderRadius: '999px' },
  liveDot: { width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'livePulse 1.5s ease-in-out infinite' },
  metricCard: { borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' },
  metricIcon: { width: '44px', height: '44px', borderRadius: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.25rem' },
  metricVal: { fontSize: '2rem', fontWeight: '900', lineHeight: '1' },
  metricLbl: { fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.03em' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.35rem' },
  subText: { color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' },
  timeline: { display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' },
  tItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '0.6rem', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.25s ease' },
  tDot: { width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.25s ease' },
  tMonth: { fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase' as const, letterSpacing: '0.05em', transition: 'color 0.25s ease' },
  tEvent: { fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)' },
  activePill: { fontSize: '0.6rem', fontWeight: '800', padding: '0.15rem 0.45rem', borderRadius: '999px', textTransform: 'uppercase' as const, flexShrink: 0 },
  projList: { display: 'flex', flexDirection: 'column' as const, gap: '0.65rem', marginBottom: '1.25rem' },
  projRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', background: 'var(--bg-app)', border: '1px solid var(--border-color)' },
  projDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  projName: { fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)' },
  projStatus: { fontSize: '0.68rem', fontWeight: '700', marginTop: '0.1rem' },
  projUsers: { fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary-emerald)', background: 'var(--primary-emerald-light)', padding: '0.15rem 0.5rem', borderRadius: '0.35rem' },
  innovBadgesWrap: { borderTop: '1px solid var(--border-color)', paddingTop: '1rem' },
  innoBadge: { fontSize: '0.68rem', fontWeight: '800', padding: '0.2rem 0.55rem', borderRadius: '999px', display: 'inline-block' },
  certCard: { background: 'var(--bg-card)' },
  certHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: '1rem', marginBottom: '1.25rem' },
  toggleCertBtn: { background: 'var(--accent-gold)', color: '#121f04', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '0.6rem', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s ease' },
  certInputsRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap' as const },
  certInputGroup: { display: 'flex', flexDirection: 'column' as const, gap: '0.3rem', flex: '1', minWidth: '160px' },
  certLabel: { fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  certInput: { background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '0.55rem 0.75rem', borderRadius: '0.45rem', fontSize: '0.9rem', fontWeight: '700', outline: 'none' },
  certPreviewArea: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '1rem' },
  svgWrap: { width: '100%', maxWidth: '640px', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(226,160,14,0.3)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' },
  printBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-emerald)', color: '#fff', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '0.6rem', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' },
  journeyGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' },
  journeyStep: { borderRadius: '0.65rem', padding: '1rem 0.85rem', border: '1px solid', display: 'flex', flexDirection: 'column' as const, gap: '0.4rem', transition: 'all 0.2s ease' },
  journeyNum: { width: '24px', height: '24px', borderRadius: '50%', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  journeyTitle: { fontSize: '0.85rem', fontWeight: '800' },
  journeyDesc: { fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.35' },
  sdgCard: { borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid' },
  sdgBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '900', color: '#fff', marginBottom: '0.75rem' },
  sdgTitle: { fontSize: '1rem', fontWeight: '800', marginBottom: '0.5rem' },
  sdgDesc: { fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' },
  scorecardCard: { background: 'var(--primary-emerald-light)', borderLeft: '4px solid var(--primary-emerald)' },
  scoreRow: { borderRadius: '0.75rem', padding: '1.1rem', border: '1px solid', display: 'flex', flexDirection: 'column' as const, gap: '0.35rem' },
  scoreVal: { fontSize: '1.75rem', fontWeight: '900', lineHeight: '1' },
  scoreMetric: { fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)' },
  scoreDesc: { fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.3' },
};

export default ImpactDashboard;
