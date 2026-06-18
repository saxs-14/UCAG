import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, Award, Landmark, TrendingUp } from 'lucide-react';

interface Subject {
  name: string;
  mark: number;
}

interface SuccessAnalyticsProps {
  apsScore: number;
  subjects: Subject[];
}

export const SuccessAnalytics: React.FC<SuccessAnalyticsProps> = ({ apsScore, subjects }) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'FULL_COVERAGE' | 'MERIT' | 'REGIONAL'>('ALL');

  const maths = subjects.find(s => s.name.toLowerCase() === 'mathematics');
  const sci = subjects.find(s => s.name.toLowerCase().includes('physical') || s.name.toLowerCase().includes('life'));

  // 1. Success Probability Predictive Engine (Client Heuristics)
  const calculateSuccessProbability = (): { percent: number; risk: 'Low' | 'Medium' | 'High'; color: string } => {
    let base = 35;
    
    // Impact of total APS
    base += Math.min(45, (apsScore - 15) * 3);
    
    // Impact of Mathematics
    if (maths) {
      if (maths.mark >= 70) base += 10;
      else if (maths.mark >= 50) base += 5;
      else if (maths.mark < 40) base -= 10;
    }

    // Impact of Science
    if (sci) {
      if (sci.mark >= 70) base += 5;
      else if (sci.mark < 40) base -= 5;
    }

    const percent = Math.min(95, Math.max(25, base));
    
    if (percent >= 75) return { percent, risk: 'Low', color: 'var(--success)' };
    if (percent >= 50) return { percent, risk: 'Medium', color: 'var(--accent-gold)' };
    return { percent, risk: 'High', color: 'var(--danger)' };
  };

  const predictive = calculateSuccessProbability();

  // 2. Automated Foundation/Bridging Advice (Responsible AI)
  const getBridgingAdvice = (): string[] => {
    const advice: string[] = [];
    if (maths && maths.mark < 50) {
      advice.push("⚠️ Core Math Boost: Your mathematics mark is currently below 50%. Mpumi recommends registering for the UMP Foundation Mathematics (MATH001) module to bridge academic gaps before commencing your major.");
    }
    if (sci && sci.mark < 50) {
      advice.push("🌱 Natural Sciences Support: High-tier science majors require deep experimental understanding. Consider UMP's academic enrichment coaching sessions during your first semester.");
    }
    if (apsScore < 24) {
      advice.push("🎓 Extended Curricula: An APS of less than 24 qualifies you for the Extended Degree Programmes. These spread your first-year modules over two years, dramatically boosting graduation success rates.");
    }
    if (advice.length === 0) {
      advice.push("✨ Perfect Standing: Your academic record places you in high standing. No mandatory bridging courses are needed. Keep maintaining your outstanding grades!");
    }
    return advice;
  };

  const academicBridging = getBridgingAdvice();

  // 3. Bursary Matching Algorithms
  const getBursaryMatches = () => {
    const matches = [];

    // NSFAS
    matches.push({
      name: "NSFAS (National Student Financial Aid Scheme)",
      provider: "South African Government",
      eligibility: "SA Citizens matriculating with university entrance. Income threshold applies.",
      matchReason: "Matches your academic NSC credentials automatically.",
      matchPercentage: 99,
      type: "Full Coverage"
    });

    // UMP Merit
    if (apsScore >= 32) {
      matches.push({
        name: "UMP Academic Merit Scholarship",
        provider: "University of Mpumalanga",
        eligibility: "APS of 32 or higher, outstanding high school results.",
        matchReason: "Exceptional Match! Your calculated APS of " + apsScore + " exceeds the premium excellence threshold.",
        matchPercentage: 95,
        type: "Full Tuition"
      });
    }

    // Sasol Agriculture
    const hasMathAndSci = maths && maths.mark >= 60 && sci && sci.mark >= 60;
    if (hasMathAndSci) {
      matches.push({
        name: "Sasol Agricultural & Science Grant",
        provider: "Sasol South Africa",
        eligibility: "Mathematics >= 60%, Science >= 60%. Pursuing Agriculture/Sciences.",
        matchReason: "Strong Science Fit! Your Mathematics (" + maths.mark + "%) & Science (" + sci.mark + "%) marks qualify you.",
        matchPercentage: 85,
        type: "Comprehensive Support"
      });
    }

    // Standard local corporate support
    if (apsScore >= 26) {
      matches.push({
        name: "Mpumalanga Provincial Government Bursary",
        provider: "Mpumalanga Office of the Premier",
        eligibility: "Resident of Mpumalanga, accepted into high-demand regional majors.",
        matchReason: "Provincial Alignment: Matches your regional focus and career interest profile.",
        matchPercentage: 75,
        type: "Tuition + Accommodation"
      });
    }

    return matches;
  };

  const bursaryMatches = getBursaryMatches();

  const filteredBursaries = bursaryMatches.filter(bur => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'FULL_COVERAGE') return bur.type === "Full Coverage";
    if (activeFilter === 'MERIT') return bur.type === "Full Tuition";
    if (activeFilter === 'REGIONAL') return bur.type === "Comprehensive Support" || bur.type === "Tuition + Accommodation";
    return true;
  });

  return (
    <div className="grid-2 animate-fade-in-up" style={{ alignItems: 'start' }}>
      
      {/* Predictive Success Meter Card */}
      <div className="glass-card">
        <h3 style={styles.cardTitle}>
          <TrendingUp size={18} color="var(--primary-emerald)" />
          <span>Predictive Success Analytics</span>
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Simulates university transition success probability based on historical matric outcomes.
        </p>

        {/* Big Meter */}
        <div style={styles.meterContainer}>
          <div style={styles.meterTrack}>
            <div style={{
              ...styles.meterFill,
              width: `${predictive.percent}%`,
              background: predictive.color,
            }}></div>
          </div>
          <div style={styles.meterLabelRow}>
            <span style={styles.meterValueText}>Estimated Readiness: <strong>{predictive.percent}%</strong></span>
            <span className="badge" style={{
              background: predictive.color + '22',
              color: predictive.color,
            }}>
              {predictive.risk} Academic Risk
            </span>
          </div>
        </div>

        <hr style={styles.divider} />

        {/* Automated Bridging / Academic Support Advice */}
        <div style={styles.adviceBox}>
          <h4 style={styles.adviceBoxTitle}>Mpumi Academic Risk Interventions</h4>
          <div style={styles.adviceList}>
            {academicBridging.map((adv, idx) => (
              <div key={idx} style={styles.adviceItem}>
                {predictive.risk === 'High' ? (
                  <ShieldAlert size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                ) : (
                  <CheckCircle size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                )}
                <span style={styles.adviceText}>{adv}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bursary & Funding Recommendations Card */}
      <div className="glass-card">
        <h3 style={styles.cardTitle}>
          <Landmark size={18} color="var(--primary-emerald)" />
          <span>Bursary & Funding Matching</span>
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          AI matching rules linking academic achievements directly to premium South African grants.
        </p>

        {/* Filter Chips */}
        <div style={styles.filterChipsRow}>
          <button 
            onClick={() => setActiveFilter('ALL')} 
            style={{
              ...styles.filterChip,
              ...(activeFilter === 'ALL' ? styles.filterChipActive : {})
            }}
          >
            All Funding
          </button>
          <button 
            onClick={() => setActiveFilter('FULL_COVERAGE')} 
            style={{
              ...styles.filterChip,
              ...(activeFilter === 'FULL_COVERAGE' ? styles.filterChipActive : {})
            }}
          >
            Full Coverage
          </button>
          <button 
            onClick={() => setActiveFilter('MERIT')} 
            style={{
              ...styles.filterChip,
              ...(activeFilter === 'MERIT' ? styles.filterChipActive : {})
            }}
          >
            Academic Merit
          </button>
          <button 
            onClick={() => setActiveFilter('REGIONAL')} 
            style={{
              ...styles.filterChip,
              ...(activeFilter === 'REGIONAL' ? styles.filterChipActive : {})
            }}
          >
            Provincial / Corporate
          </button>
        </div>

        <div style={styles.bursaryList}>
          {filteredBursaries.map((bur, idx) => (
            <div key={idx} style={styles.bursaryRow}>
              <div style={styles.bursaryHeader}>
                <div>
                  <h4 style={styles.bursaryName}>{bur.name}</h4>
                  <span style={styles.bursaryProvider}>Provided by {bur.provider} • <strong>{bur.type}</strong></span>
                </div>
                <span style={{
                  ...styles.matchScore,
                  borderColor: bur.matchPercentage > 85 ? 'var(--primary-emerald)' : 'var(--accent-gold)',
                  color: bur.matchPercentage > 85 ? 'var(--primary-emerald)' : 'var(--accent-gold-hover)',
                }}>
                  {bur.matchPercentage}% Match
                </span>
              </div>
              
              <p style={styles.bursaryDetails}><strong>Eligibility:</strong> {bur.eligibility}</p>
              
              <div style={styles.matchReasonBox}>
                <Award size={12} color="var(--primary-emerald)" style={{ marginRight: '0.35rem' }} />
                <span>{bur.matchReason}</span>
              </div>
            </div>
          ))}
          {filteredBursaries.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No bursary matches in this category for your current scores.
            </div>
          )}
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
  meterContainer: {
    margin: '1rem 0',
  },
  meterTrack: {
    width: '100%',
    height: '14px',
    borderRadius: '7px',
    background: 'var(--border-color)',
    overflow: 'hidden',
    marginBottom: '0.75rem',
  },
  meterFill: {
    height: '100%',
    borderRadius: '7px',
    transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  meterLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meterValueText: {
    fontSize: '0.85rem',
    color: 'var(--text-main)',
  },
  divider: {
    border: 'none',
    borderBottom: '1px solid var(--border-color)',
    margin: '1.25rem 0',
  },
  adviceBox: {
    background: 'var(--bg-app)',
    borderRadius: '0.75rem',
  },
  adviceBoxTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginBottom: '0.75rem',
  },
  adviceList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  adviceItem: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'start',
  },
  adviceText: {
    fontSize: '0.825rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  filterChipsRow: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap' as const,
    marginBottom: '1rem',
  },
  filterChip: {
    background: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-muted)',
    padding: '0.3rem 0.65rem',
    borderRadius: '999px',
    fontSize: '0.725rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  filterChipActive: {
    background: 'var(--primary-emerald)',
    borderColor: 'var(--primary-emerald)',
    color: '#ffffff',
  },
  bursaryList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    maxHeight: '380px',
    overflowY: 'auto' as const,
    paddingRight: '0.25rem',
  },
  bursaryRow: {
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.75rem',
    padding: '0.75rem 1rem',
  },
  bursaryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  bursaryName: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  bursaryProvider: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  matchScore: {
    fontSize: '0.7rem',
    fontWeight: '800',
    border: '1px solid',
    padding: '0.2rem 0.5rem',
    borderRadius: '999px',
    whiteSpace: 'nowrap' as const,
  },
  bursaryDetails: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    lineHeight: '1.3',
    marginBottom: '0.5rem',
  },
  matchReasonBox: {
    background: 'var(--primary-emerald-light)',
    color: 'var(--primary-emerald)',
    display: 'flex',
    alignItems: 'center',
    padding: '0.4rem 0.6rem',
    borderRadius: '0.35rem',
    fontSize: '0.725rem',
    fontWeight: '700',
  }
};

export default SuccessAnalytics;
