import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { APSCalculator } from './components/APSCalculator';
import { MentorshipPortal } from './components/MentorshipPortal';
import { CareerSimulator } from './components/CareerSimulator';
import { SuccessAnalytics } from './components/SuccessAnalytics';
import { SchoolAnalytics } from './components/SchoolAnalytics';
import { AIChatbot } from './components/AIChatbot';
import { ImpactDashboard } from './components/ImpactDashboard';
import { GraduationCap, Users, Compass, MapPin, BookOpen, Award } from 'lucide-react';

interface Subject {
  name: string;
  mark: number;
}

function App() {
  const [activeTab, setActiveTab] = useState<string>('calculator');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [lowDataMode, setLowDataMode] = useState<boolean>(false);

  const [apsScore, setApsScore] = useState<number>(31);
  const [subjects, setSubjects] = useState<Subject[]>([
    { name: 'Mathematics',                mark: 72 },
    { name: 'Physical Sciences',          mark: 68 },
    { name: 'Life Sciences',              mark: 75 },
    { name: 'English First Additional',   mark: 62 },
    { name: 'Siswati Home Language',      mark: 78 },
    { name: 'Life Orientation',           mark: 85 },
    { name: 'Information Technology',     mark: 81 },
  ]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const handleApsCalculated = (newAps: number, newSubjects: Subject[]) => {
    setApsScore(newAps);
    setSubjects(newSubjects);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        lowDataMode={lowDataMode}
        setLowDataMode={setLowDataMode}
      />

      <main style={{ flex: 1 }} className="container animate-fade-in">

        {/* Hero Banner */}
        <section style={s.hero}>
          <div style={s.heroBody}>
            <div style={s.umpBadge}>
              <MapPin size={12} />
              <span>University of Mpumalanga — Mbombela</span>
            </div>

            <h1 style={s.heroTitle}>
              University Course<br />
              <span className="title-gradient">Advisory Guide</span>
            </h1>

            <p style={s.heroDesc}>
              A free platform helping Mpumalanga Grade 12 learners calculate their APS score,
              discover UMP qualifications, connect with peer mentors, and access bursary funding —
              available in five local languages.
            </p>

            <div style={s.statRow}>
              <div style={s.stat}>
                <span style={s.statNum}>10</span>
                <span style={s.statLbl}>UMP Qualifications</span>
              </div>
              <div style={s.statDivider} />
              <div style={s.stat}>
                <span style={s.statNum}>5</span>
                <span style={s.statLbl}>Languages</span>
              </div>
              <div style={s.statDivider} />
              <div style={s.stat}>
                <span style={s.statNum}>NSC</span>
                <span style={s.statLbl}>Compliant</span>
              </div>
              <div style={s.statDivider} />
              <div style={s.stat}>
                <span style={s.statNum}>Free</span>
                <span style={s.statLbl}>Open Access</span>
              </div>
            </div>
          </div>

          <div style={s.featureGrid}>
            <button type="button" onClick={() => setActiveTab('calculator')} style={s.featureCard}>
              <div style={s.featureIcon}>
                <GraduationCap size={20} color="#006633" />
              </div>
              <div>
                <div style={s.featureTitle}>APS Calculator</div>
                <div style={s.featureSub}>NSC-compliant score calculator with stream presets</div>
              </div>
            </button>
            <button type="button" onClick={() => setActiveTab('mentorship')} style={s.featureCard}>
              <div style={s.featureIcon}>
                <Users size={20} color="#006633" />
              </div>
              <div>
                <div style={s.featureTitle}>Peer Mentorship</div>
                <div style={s.featureSub}>Connect with UMP student mentors from your area</div>
              </div>
            </button>
            <button type="button" onClick={() => setActiveTab('career')} style={s.featureCard}>
              <div style={s.featureIcon}>
                <Compass size={20} color="#C8961C" />
              </div>
              <div>
                <div style={s.featureTitle}>Career Guidance</div>
                <div style={s.featureSub}>AI-matched pathways and bursary recommendations</div>
              </div>
            </button>
            <button type="button" onClick={() => setActiveTab('schools')} style={s.featureCard}>
              <div style={s.featureIcon}>
                <BookOpen size={20} color="#C8961C" />
              </div>
              <div>
                <div style={s.featureTitle}>School Analytics</div>
                <div style={s.featureSub}>Regional performance data and outreach planning</div>
              </div>
            </button>
          </div>
        </section>

        {/* Tab Content */}
        <section style={s.content}>
          {activeTab === 'calculator' && (
            <APSCalculator onApsCalculated={handleApsCalculated} lowDataMode={lowDataMode} />
          )}
          {activeTab === 'mentorship' && (
            <MentorshipPortal />
          )}
          {activeTab === 'career' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <CareerSimulator apsScore={apsScore} subjects={subjects} />
              <SuccessAnalytics apsScore={apsScore} subjects={subjects} />
            </div>
          )}
          {activeTab === 'schools' && (
            <SchoolAnalytics />
          )}
          {activeTab === 'impact' && (
            <ImpactDashboard />
          )}
        </section>

      </main>

      <AIChatbot lowDataMode={lowDataMode} apsScore={apsScore} subjects={subjects} />

      <footer style={s.footer}>
        <div className="container" style={s.footerInner}>
          <div style={s.footerLeft}>
            <div style={s.footerLogo}>
              <div style={s.footerLogoBox}>
                <span style={s.footerLogoLetter}>U</span>
              </div>
              <div>
                <div style={s.footerBrand}>UCAG</div>
                <div style={s.footerSub}>University of Mpumalanga</div>
              </div>
            </div>
            <p style={s.footerText}>
              Supporting Mpumalanga learners on their journey to higher education.
            </p>
          </div>
          <div style={s.footerRight}>
            <div style={s.footerTag}><Award size={12} /> NSC Compliant</div>
            <div style={s.footerTag}><MapPin size={12} /> Mpumalanga</div>
            <div style={s.footerTag}><BookOpen size={12} /> 5 Languages</div>
          </div>
        </div>
        <div style={s.footerBase}>
          <span>© 2026 UCAG | University of Mpumalanga. All rights reserved.</span>
        </div>
      </footer>

    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  hero: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    alignItems: 'center',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    padding: '2.5rem 2rem',
    marginBottom: '1.75rem',
    boxShadow: 'var(--card-shadow)',
  },
  heroBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  umpBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    background: '#EBF5EF',
    color: '#006633',
    fontSize: '12px',
    fontWeight: '700',
    padding: '4px 12px',
    borderRadius: '999px',
    width: 'fit-content',
    border: '1px solid #CCE0D6',
  },
  heroTitle: {
    fontSize: '2.4rem',
    fontWeight: '900',
    lineHeight: '1.15',
    letterSpacing: '-0.03em',
    color: 'var(--text-main)',
  },
  heroDesc: {
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
    lineHeight: '1.65',
    maxWidth: '480px',
  },
  statRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid var(--border-color)',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statNum: {
    fontSize: '1.3rem',
    fontWeight: '900',
    color: '#006633',
    lineHeight: '1',
  },
  statLbl: {
    fontSize: '0.72rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  statDivider: {
    width: '1px',
    height: '36px',
    background: 'var(--border-color)',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  featureCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px',
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    fontFamily: 'inherit',
  },
  featureIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-main)',
    lineHeight: '1.3',
    marginBottom: '3px',
  },
  featureSub: {
    fontSize: '11.5px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  content: {
    marginBottom: '3rem',
  },
  footer: {
    borderTop: '1px solid var(--border-color)',
    background: 'var(--bg-card)',
  },
  footerInner: {
    padding: '1.75rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  footerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  footerLogoBox: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    background: '#006633',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLogoLetter: {
    color: '#C8961C',
    fontWeight: '900',
    fontSize: '17px',
    fontFamily: 'Georgia, serif',
  },
  footerBrand: {
    fontSize: '13px',
    fontWeight: '800',
    color: 'var(--text-main)',
    lineHeight: '1.2',
  },
  footerSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  footerText: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    maxWidth: '320px',
    lineHeight: '1.5',
  },
  footerRight: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    paddingTop: '4px',
  },
  footerTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 10px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  footerBase: {
    borderTop: '1px solid var(--border-color)',
    padding: '12px 1.5rem',
    textAlign: 'center',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
};

export default App;
