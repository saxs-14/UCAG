import React from 'react';
import { GraduationCap, Users, Compass, BarChart3, Activity, WifiOff, Sun, Moon } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  lowDataMode: boolean;
  setLowDataMode: (lowData: boolean) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  lowDataMode,
  setLowDataMode,
}) => {
  const tabs = [
    { id: 'calculator', label: 'APS Calculator',   icon: GraduationCap },
    { id: 'mentorship', label: 'Mentorship',        icon: Users         },
    { id: 'career',     label: 'Career Guidance',   icon: Compass       },
    { id: 'schools',    label: 'School Analytics',  icon: BarChart3     },
    { id: 'impact',     label: 'Impact',            icon: Activity      },
  ];

  return (
    <header style={s.header}>
      {/* UMP top strip */}
      <div style={s.umpStrip}>
        <span style={s.umpStripText}>University of Mpumalanga — Official Student Advisory Platform</span>
      </div>

      {/* Main nav bar */}
      <div style={s.navBar}>
        {/* Brand */}
        <div style={s.brand}>
          <div style={s.logoBox}>
            <span style={s.logoLetter}>U</span>
          </div>
          <div>
            <div style={s.brandName}>UCAG</div>
            <div style={s.brandSub}>Course Advisory Guide</div>
          </div>
        </div>

        {/* Tabs */}
        <nav style={s.nav} role="navigation" aria-label="Main navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...s.tab,
                  ...(active ? s.tabActive : {}),
                }}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.id === 'impact' && !active && (
                  <span style={s.liveDot} aria-hidden="true" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div style={s.actions}>
          <button
            onClick={() => setLowDataMode(!lowDataMode)}
            title={lowDataMode ? 'Disable Low-Data Mode' : 'Enable Low-Data Mode (for rural areas)'}
            style={{ ...s.actionBtn, ...(lowDataMode ? s.actionBtnActive : {}) }}
          >
            <WifiOff size={15} />
            <span>Low Data</span>
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={s.iconBtn}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
};

const s: Record<string, React.CSSProperties> = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'var(--bg-card)',
    boxShadow: '0 1px 0 var(--border-color)',
  },
  umpStrip: {
    background: '#006633',
    padding: '5px 1.5rem',
    textAlign: 'center',
  },
  umpStripText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '11.5px',
    fontWeight: '500',
    letterSpacing: '0.02em',
  },
  navBar: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '60px',
    gap: '1rem',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },
  logoBox: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    background: '#006633',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoLetter: {
    color: '#C8961C',
    fontWeight: '900',
    fontSize: '20px',
    fontFamily: 'Georgia, serif',
    lineHeight: '1',
  },
  brandName: {
    fontSize: '15px',
    fontWeight: '800',
    color: 'var(--text-main)',
    lineHeight: '1.2',
    letterSpacing: '-0.01em',
  },
  brandSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: '500',
    lineHeight: '1.2',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    flex: 1,
    justifyContent: 'center',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '7px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '13.5px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.15s ease, color 0.15s ease',
    position: 'relative',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
  },
  tabActive: {
    background: '#006633',
    color: '#FFFFFF',
  },
  liveDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#16a34a',
    animation: 'livePulse 1.8s ease-in-out infinite',
    marginLeft: '1px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '7px 12px',
    borderRadius: '7px',
    border: '1.5px solid var(--border-color)',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
  },
  actionBtnActive: {
    background: '#FAF3E0',
    borderColor: '#C8961C',
    color: '#A67A14',
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    borderRadius: '7px',
    border: '1.5px solid var(--border-color)',
    background: 'transparent',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
  },
};

export default Navigation;
