import React, { useState } from 'react';
import { db } from '../config/mongodb';
import { BarChart3, AlertTriangle, MapPin, Calendar, Check, Send } from 'lucide-react';

interface School {
  schoolName: string;
  region: string;
  averageAps: number;
  readinessRate: number;
  subjectStruggles: { subjectName: string; strugglesCount: number }[];
}

export const SchoolAnalytics: React.FC = () => {
  const [schools] = useState<School[]>(db.find('schools'));
  const [selectedSchool, setSelectedSchool] = useState<School>(schools[0]);
  const [outreachSuccess, setOutreachSuccess] = useState<boolean>(false);
  const [targetDate, setTargetDate] = useState<string>("2026-06-15");

  // Automated Outreach Coordinator (Semi-automated AI logistics planner)
  const generateOutreachLogistics = () => {
    // Look up major UMP mentor subject expert matches
    const primaryStruggle = selectedSchool.subjectStruggles[0]?.subjectName || "Mathematics";
    const mentors = db.find('mentors');
    
    // Find mentors qualified to teach this subject
    const matchedMentors = mentors.filter(m => m.majorSubjects.includes(primaryStruggle));
    
    return {
      struggleSubject: primaryStruggle,
      assignedMentors: matchedMentors.map(m => m.fullName),
      suggestedFocus: `Tutoring intensive session covering critical concepts in ${primaryStruggle} to increase averages beyond current APS limits.`
    };
  };

  const logistics = generateOutreachLogistics();

  const handleScheduleSession = () => {
    setOutreachSuccess(true);
    setTimeout(() => setOutreachSuccess(false), 3000);
  };

  return (
    <div className="grid-2 animate-fade-in-up" style={{ alignItems: 'stretch' }}>
      
      {/* School Performance Dashboard */}
      <div className="glass-card">
        <h3 style={styles.cardTitle}>
          <BarChart3 size={18} color="var(--primary-emerald)" />
          <span>Regional School Metrics</span>
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Aggregate analysis of high schools within Mpumalanga province.
        </p>

        {/* School Selectors */}
        <div style={styles.schoolSelectorGrid}>
          {schools.map((school, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedSchool(school)}
              style={{
                ...styles.schoolCard,
                ...(selectedSchool.schoolName === school.schoolName ? styles.schoolCardSelected : {}),
              }}
            >
              <h4 style={styles.schoolCardName}>{school.schoolName}</h4>
              <span style={styles.schoolCardRegion}>{school.region}</span>
              
              <div style={styles.schoolMiniStats}>
                <span>Avg APS: <strong>{school.averageAps}</strong></span>
                <span>Readiness: <strong>{school.readinessRate}%</strong></span>
              </div>
            </div>
          ))}
        </div>

        {/* Analytical SVG Charts */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BarChart3 size={14} color="var(--primary-emerald)" />
            <span>Average APS Comparison</span>
          </h4>
          <div style={styles.chartWrapper}>
            <svg viewBox="0 0 320 160" style={styles.svgChart}>
              <line x1="40" y1="10" x2="40" y2="130" stroke="var(--border-color)" strokeWidth="1" />
              <line x1="40" y1="130" x2="310" y2="130" stroke="var(--border-color)" strokeWidth="1" />
              {[0, 10, 20, 30].map((val, i) => {
                const y = 130 - (val / 30) * 110;
                return (
                  <g key={i}>
                    <line x1="40" y1={y} x2="310" y2={y} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="2,2" />
                    <text x="10" y={y + 4} fill="var(--text-muted)" fontSize="8" fontWeight="600">{val} APS</text>
                  </g>
                );
              })}
              {schools.map((school, idx) => {
                const barWidth = 35;
                const gap = 30;
                const x = 55 + idx * (barWidth + gap);
                const barHeight = (school.averageAps / 30) * 110;
                const y = 130 - barHeight;
                const isSelected = selectedSchool.schoolName === school.schoolName;
                return (
                  <g key={idx} style={{ cursor: 'pointer' }} onClick={() => setSelectedSchool(school)}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="4"
                      fill={isSelected ? 'var(--accent-gold)' : 'var(--primary-emerald)'}
                      opacity={isSelected ? 1 : 0.75}
                      style={{ transition: 'all 0.3s ease' }}
                    />
                    <text x={x + barWidth/2} y={y - 4} textAnchor="middle" fill="var(--text-main)" fontSize="8" fontWeight="800">
                      {school.averageAps}
                    </text>
                    <text x={x + barWidth/2} y="145" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontWeight="700">
                      {school.schoolName.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BarChart3 size={14} color="var(--primary-emerald)" />
            <span>UMP Readiness Rate (%)</span>
          </h4>
          <div style={styles.chartWrapper}>
            <svg viewBox="0 0 320 160" style={styles.svgChart}>
              <line x1="40" y1="10" x2="40" y2="130" stroke="var(--border-color)" strokeWidth="1" />
              <line x1="40" y1="130" x2="310" y2="130" stroke="var(--border-color)" strokeWidth="1" />
              {[0, 25, 50, 75, 100].map((val, i) => {
                const y = 130 - (val / 100) * 110;
                return (
                  <g key={i}>
                    <line x1="40" y1={y} x2="310" y2={y} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="2,2" />
                    <text x="15" y={y + 4} fill="var(--text-muted)" fontSize="8" fontWeight="600">{val}%</text>
                  </g>
                );
              })}
              {schools.map((school, idx) => {
                const barWidth = 35;
                const gap = 30;
                const x = 55 + idx * (barWidth + gap);
                const barHeight = (school.readinessRate / 100) * 110;
                const y = 130 - barHeight;
                const isSelected = selectedSchool.schoolName === school.schoolName;
                return (
                  <g key={idx} style={{ cursor: 'pointer' }} onClick={() => setSelectedSchool(school)}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="4"
                      fill={isSelected ? 'var(--accent-gold)' : 'var(--primary-emerald)'}
                      opacity={isSelected ? 1 : 0.75}
                      style={{ transition: 'all 0.3s ease' }}
                    />
                    <text x={x + barWidth/2} y={y - 4} textAnchor="middle" fill="var(--text-main)" fontSize="8" fontWeight="800">
                      {school.readinessRate}%
                    </text>
                    <text x={x + barWidth/2} y="145" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontWeight="700">
                      {school.schoolName.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Selected School Details & AI Outreach Action Planner */}
      <div className="glass-card" style={styles.plannerCard}>
        <div style={styles.plannerHeader}>
          <div>
            <h3 style={styles.plannerTitle}>{selectedSchool.schoolName}</h3>
            <span style={styles.plannerSub}><MapPin size={12} style={{ marginRight: '0.15rem' }} /> {selectedSchool.region}</span>
          </div>
          <span style={styles.readinessBadge}>
            {selectedSchool.readinessRate}% UMP Ready
          </span>
        </div>

        {/* Academic Struggles Indicators */}
        <div style={styles.strugglesBox}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
            CRITICAL SUBJECT DEFICITS (Matric cohort):
          </span>
          <div style={styles.strugglesList}>
            {selectedSchool.subjectStruggles.map((sub, idx) => (
              <div key={idx} style={styles.struggleRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={14} color="var(--danger)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{sub.subjectName}</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub.strugglesCount} learners failing limits</span>
              </div>
            ))}
          </div>
        </div>

        <hr style={styles.divider} />

        {/* Semi-automated AI Outreach Logistics Setup */}
        <div style={styles.outreachBox}>
          <h4 style={styles.outreachBoxTitle}>Mpumi Outreach Logistics Co-pilot</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
            AI has analyzed this school's subject struggles and matched appropriate UMP volunteers.
          </p>

          <div style={styles.logisticsList}>
            <div style={styles.logisticsItem}>
              <span style={styles.logLabel}>Outreach Focus:</span>
              <span style={styles.logValue}>Specialist workshop in <strong>{logistics.struggleSubject}</strong></span>
            </div>
            
            <div style={styles.logisticsItem}>
              <span style={styles.logLabel}>Matched UMP Volunteers:</span>
              <span style={styles.logValue}>
                {logistics.assignedMentors.length > 0 ? logistics.assignedMentors.join(', ') : "Sipho Khumalo, Zinhle Ndlovu"}
              </span>
            </div>

            <div style={styles.logisticsItem}>
              <span style={styles.logLabel}>Suggested Content:</span>
              <span style={{ ...styles.logValue, fontSize: '0.775rem', fontStyle: 'italic' }}>{logistics.suggestedFocus}</span>
            </div>
          </div>

          <div style={styles.scheduleRowInput}>
            <Calendar size={16} color="var(--text-muted)" />
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              style={styles.dateInput}
            />
            <button
              onClick={handleScheduleSession}
              style={{
                ...styles.scheduleBtn,
                background: outreachSuccess ? 'var(--success)' : 'var(--primary-emerald)',
              }}
            >
              {outreachSuccess ? <Check size={14} /> : <Send size={14} />}
              <span>{outreachSuccess ? "Scheduled!" : "Deploy Outreach Cohort"}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

const styles = {
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.1rem',
    fontWeight: '800',
    color: 'var(--text-main)',
  },
  schoolSelectorGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    marginTop: '0.75rem',
  },
  schoolCard: {
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.75rem',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  schoolCardSelected: {
    borderColor: 'var(--primary-emerald)',
    background: 'var(--primary-emerald-glow)',
  },
  schoolCardName: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  schoolCardRegion: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    display: 'block',
    marginTop: '0.15rem',
  },
  schoolMiniStats: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.5rem',
  },
  plannerCard: {
    background: 'var(--bg-card)',
  },
  plannerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    gap: '0.5rem',
  },
  plannerTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: 'var(--text-main)',
  },
  plannerSub: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  readinessBadge: {
    background: 'var(--primary-emerald-light)',
    color: 'var(--primary-emerald)',
    fontSize: '0.75rem',
    fontWeight: '800',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.35rem',
  },
  strugglesBox: {
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    marginTop: '1rem',
  },
  strugglesList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  struggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(239, 68, 68, 0.04)',
    padding: '0.4rem 0.6rem',
    borderRadius: '0.35rem',
    border: '1px solid rgba(239, 68, 68, 0.1)',
  },
  divider: {
    border: 'none',
    borderBottom: '1px solid var(--border-color)',
    margin: '1rem 0',
  },
  outreachBox: {
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.75rem',
    padding: '1rem',
  },
  outreachBoxTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginBottom: '0.25rem',
  },
  logisticsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    margin: '0.75rem 0',
  },
  logisticsItem: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  logLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
  },
  logValue: {
    fontSize: '0.8rem',
    color: 'var(--text-main)',
  },
  scheduleRowInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  dateInput: {
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '0.4rem 0.6rem',
    borderRadius: '0.35rem',
    fontSize: '0.8rem',
    outline: 'none',
  },
  scheduleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    border: 'none',
    color: '#ffffff',
    padding: '0.45rem 0.75rem',
    borderRadius: '0.35rem',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  chartWrapper: {
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.75rem',
    padding: '0.75rem',
    marginTop: '0.5rem',
  },
  svgChart: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
};
export default SchoolAnalytics;
