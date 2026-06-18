import React, { useState, useEffect } from 'react';
import { db } from '../config/mongodb';
import { Plus, Trash2, BookOpen, Check, Save } from 'lucide-react';

interface Subject {
  name: string;
  mark: number;
}

interface APSCalculatorProps {
  onApsCalculated: (aps: number, subjects: Subject[]) => void;
  lowDataMode: boolean;
}

const PRESET_STREAMS = {
  science: [
    { name: "Mathematics", mark: 65 },
    { name: "Physical Sciences", mark: 60 },
    { name: "Life Sciences", mark: 62 },
    { name: "English First Additional", mark: 65 },
    { name: "isiZulu Home Language", mark: 70 },
    { name: "Life Orientation", mark: 80 },
    { name: "Geography", mark: 55 }
  ],
  commerce: [
    { name: "Mathematics", mark: 60 },
    { name: "Accounting", mark: 68 },
    { name: "Economics", mark: 62 },
    { name: "English First Additional", mark: 62 },
    { name: "Sepedi Home Language", mark: 72 },
    { name: "Life Orientation", mark: 78 },
    { name: "Business Studies", mark: 70 }
  ],
  humanities: [
    { name: "Mathematical Literacy", mark: 58 },
    { name: "History", mark: 72 },
    { name: "Geography", mark: 65 },
    { name: "English Home Language", mark: 70 },
    { name: "Siswati First Additional", mark: 68 },
    { name: "Life Orientation", mark: 82 },
    { name: "Tourism", mark: 75 }
  ]
};

export const APSCalculator: React.FC<APSCalculatorProps> = ({ onApsCalculated, lowDataMode }) => {
  const [subjects, setSubjects] = useState<Subject[]>(PRESET_STREAMS.science);
  const [learnerName, setLearnerName] = useState<string>("Siphesihle Nkosi");
  const [learnerEmail, setLearnerEmail] = useState<string>("siphe.nkosi@gmail.com");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Map percentage to APS levels (NSC system)
  const getApsLevel = (mark: number, name: string): number => {
    if (name.toLowerCase() === 'life orientation') {
      // Life Orientation points are often halved or not counted depending on university policies. 
      // At UMP, it gets 1-3 points based on standard percentages (80%+ is 3, 70-79% is 2, 60-69% is 1).
      if (mark >= 80) return 3;
      if (mark >= 70) return 2;
      if (mark >= 60) return 1;
      return 0;
    }
    if (mark >= 80) return 7;
    if (mark >= 70) return 6;
    if (mark >= 60) return 5;
    if (mark >= 50) return 4;
    if (mark >= 40) return 3;
    if (mark >= 30) return 2;
    return 1;
  };

  // 1. Separate Life Orientation and Academic Subjects
  const loSubject = subjects.find(s => s.name.toLowerCase() === 'life orientation');
  const academicSubjects = subjects.filter(s => s.name.toLowerCase() !== 'life orientation');

  // 2. Calculate Standard APS: Best 6 academic subjects
  const sortedAcademicLevels = [...academicSubjects]
    .map(s => getApsLevel(s.mark, s.name))
    .sort((a, b) => b - a);
  const best6Levels = sortedAcademicLevels.slice(0, 6);
  const standardAps = best6Levels.reduce((sum, lvl) => sum + lvl, 0);

  // 3. Life Orientation bonus points (UMP style)
  const loPoints = loSubject ? getApsLevel(loSubject.mark, loSubject.name) : 0;
  const umpAps = standardAps + loPoints;

  useEffect(() => {
    onApsCalculated(standardAps, subjects);
  }, [subjects, standardAps]);

  const handleMarkChange = (index: number, newMark: number) => {
    const clampedMark = Math.min(100, Math.max(0, newMark));
    const newSubjects = [...subjects];
    newSubjects[index].mark = clampedMark;
    setSubjects(newSubjects);
  };

  const handleNameChange = (index: number, newName: string) => {
    const newSubjects = [...subjects];
    newSubjects[index].name = newName;
    setSubjects(newSubjects);
  };

  const addNewSubject = () => {
    if (subjects.length < 10) {
      setSubjects([...subjects, { name: "Additional Subject", mark: 50 }]);
    }
  };

  const removeSubject = (index: number) => {
    if (subjects.length > 4) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const loadPreset = (stream: 'science' | 'commerce' | 'humanities') => {
    setSubjects(PRESET_STREAMS[stream]);
  };

  // Determine qualification thresholds based on strict NSC guidelines
  const getQualificationType = () => {
    // English or home language checking
    const languages = subjects.filter(s => 
      s.name.toLowerCase().includes('language') || 
      s.name.toLowerCase().includes('english') || 
      s.name.toLowerCase().includes('zulu') || 
      s.name.toLowerCase().includes('sepedi') || 
      s.name.toLowerCase().includes('tsonga') || 
      s.name.toLowerCase().includes('siswati')
    );
    const bestLangMark = languages.length > 0 ? Math.max(...languages.map(l => l.mark)) : 0;

    const passLevel4Count = academicSubjects.filter(s => s.mark >= 50).length;
    const passLevel3Count = academicSubjects.filter(s => s.mark >= 40).length;
    const passLevel2Count = academicSubjects.filter(s => s.mark >= 30).length;

    // Qualification rules:
    const hasBachelorPass = passLevel4Count >= 4 && bestLangMark >= 50;
    const hasDiplomaPass = passLevel3Count >= 4 && bestLangMark >= 40;
    const hasHigherCertPass = passLevel2Count >= 3 && bestLangMark >= 30; // Level 2 (30%+) for language

    if (standardAps >= 26 && hasBachelorPass) {
      return { 
        label: "Bachelor Degree Admission", 
        color: "var(--success)", 
        desc: `Allows full registration into Bachelor pathways at UMP. English/Home Language met at Level 4+ with standard APS of ${standardAps}.` 
      };
    }
    if (standardAps >= 19 && (hasBachelorPass || hasDiplomaPass)) {
      return { 
        label: "Diploma Admission", 
        color: "var(--accent-gold)", 
        desc: `Qualifies you for Diploma level studies. Standard APS of ${standardAps} points meets university entrance requirements.` 
      };
    }
    if (standardAps >= 15 && (hasBachelorPass || hasDiplomaPass || hasHigherCertPass)) {
      return { 
        label: "Higher Certificate Admission", 
        color: "#6366f1", 
        desc: `Qualifies for advanced Higher Certificate curricula. Your standard APS is ${standardAps}.` 
      };
    }
    return { 
      label: "National Senior Certificate (No University Entry)", 
      color: "var(--danger)", 
      desc: "Improvement of subject results recommended. Standard APS is currently below minimum university thresholds." 
    };
  };

  const qual = getQualificationType();

  // Save calculated APS to MongoDB simulator
  const handleSaveToMongoDB = () => {
    db.insertOne('learners', {
      fullName: learnerName,
      email: learnerEmail,
      apsScore: standardAps,
      subjects: subjects,
      careerInterests: standardAps >= 26 ? ["BSc Computer Science", "BSc Agriculture"] : ["Diploma in IT", "Higher Certificate"],
      academicRisk: standardAps >= 26 ? "Low" : standardAps >= 20 ? "Medium" : "High",
      successProbability: Math.min(95, Math.max(35, standardAps * 2.8)),
      isAdopted: false,
      adoptedBy: null
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="grid-2 animate-fade-in-up" style={{ alignItems: 'start' }}>
      {/* Subject Input Form Card */}
      <div className="glass-card">
        <h2 style={styles.cardTitle}>
          <BookOpen style={{ color: 'var(--primary-emerald)' }} />
          <span>High School Subject Grades</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Adjust your final grades or select a specialized South African academic stream below.
        </p>

        {/* Presets */}
        <div style={styles.presets}>
          <button onClick={() => loadPreset('science')} style={styles.presetBtn}>Science Stream</button>
          <button onClick={() => loadPreset('commerce')} style={styles.presetBtn}>Commerce Stream</button>
          <button onClick={() => loadPreset('humanities')} style={styles.presetBtn}>Humanities Stream</button>
        </div>

        {/* Inputs */}
        <div style={styles.subjectList}>
          {subjects.map((sub, idx) => (
            <div key={idx} style={styles.subjectRow}>
              <input
                type="text"
                value={sub.name}
                onChange={(e) => handleNameChange(idx, e.target.value)}
                style={styles.nameInput}
                placeholder="Subject Name"
              />
              <div style={styles.sliderContainer}>
                {!lowDataMode && (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sub.mark}
                    onChange={(e) => handleMarkChange(idx, parseInt(e.target.value))}
                    style={styles.rangeSlider}
                  />
                )}
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={sub.mark}
                  onChange={(e) => handleMarkChange(idx, parseInt(e.target.value) || 0)}
                  style={styles.markInput}
                />
                <span style={styles.percentSymbol}>%</span>
              </div>
              <span style={{
                ...styles.levelBadge,
                background: sub.mark >= 50 ? 'var(--primary-emerald-light)' : 'rgba(239, 68, 68, 0.1)',
                color: sub.mark >= 50 ? 'var(--primary-emerald)' : 'var(--danger)',
              }}>
                L{getApsLevel(sub.mark, sub.name)}
              </span>
              <button
                onClick={() => removeSubject(idx)}
                style={styles.removeBtn}
                title="Remove Subject"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <button onClick={addNewSubject} style={styles.addBtn}>
          <Plus size={16} />
          <span>Add Custom Subject</span>
        </button>
      </div>

      {/* Live APS & Qualification Outcomes Card */}
      <div className="glass-card" style={styles.resultsCard}>
        <div style={styles.scoreCircleContainer}>
          <div style={styles.scoreCircle}>
            <span style={styles.scoreLabel}>Standard APS</span>
            <span style={styles.scoreNumber}>{standardAps}</span>
            <span style={styles.scoreMax}>Points (Excl. LO)</span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', marginTop: '0.5rem', color: 'var(--accent-gold)' }}>
            UMP APS: {umpAps} (With LO Bonus)
          </div>
        </div>

        <div style={styles.outcomeSection}>
          <div style={styles.badgeRow}>
            <span className="badge badge-emerald" style={{ background: 'var(--primary-emerald-light)' }}>NSC Standard</span>
            <span className="badge badge-gold" style={{ background: 'var(--accent-gold-light)' }}>UMP Eligibility</span>
          </div>

          <h3 style={{ ...styles.qualTitle, color: qual.color }}>{qual.label}</h3>
          <p style={styles.qualDesc}>{qual.desc}</p>

          <hr style={styles.divider} />

          {/* MongoDB Ecosystem Sync Form */}
          <div style={styles.syncBox}>
            <h4 style={styles.syncBoxTitle}>Save Your Profile</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
              Save your academic profile to receive personalised career guidance, bursary matches, and mentorship pairing.
            </p>
            <div style={styles.syncInputs}>
              <input
                type="text"
                placeholder="Full Name"
                value={learnerName}
                onChange={(e) => setLearnerName(e.target.value)}
                style={styles.syncInput}
              />
              <input
                type="email"
                placeholder="Email Address"
                value={learnerEmail}
                onChange={(e) => setLearnerEmail(e.target.value)}
                style={styles.syncInput}
              />
            </div>
            <button
              onClick={handleSaveToMongoDB}
              style={{
                ...styles.syncSaveBtn,
                background: saveSuccess ? 'var(--success)' : 'var(--primary-emerald)',
              }}
            >
              {saveSuccess ? <Check size={16} /> : <Save size={16} />}
              <span>{saveSuccess ? "Profile Saved!" : "Save Profile & Get Guidance"}</span>
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
    gap: '0.75rem',
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: 'var(--text-main)',
  },
  presets: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.25rem',
    flexWrap: 'wrap' as const,
  },
  presetBtn: {
    background: 'var(--border-color)',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '0.5rem',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-main)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  subjectList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    maxHeight: '420px',
    overflowY: 'auto' as const,
    paddingRight: '0.5rem',
  },
  subjectRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
  },
  nameInput: {
    flex: '1.5',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-main)',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  sliderContainer: {
    flex: '2',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  rangeSlider: {
    flex: '1',
    accentColor: 'var(--primary-emerald)',
    cursor: 'pointer',
  },
  markInput: {
    width: '45px',
    background: 'transparent',
    border: 'none',
    borderBottom: '1.5px dashed var(--text-muted)',
    textAlign: 'center' as const,
    color: 'var(--text-main)',
    fontWeight: '700',
    outline: 'none',
    fontSize: '0.9rem',
  },
  percentSymbol: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
  },
  levelBadge: {
    padding: '0.2rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: '800',
    borderRadius: '0.35rem',
    minWidth: '32px',
    textAlign: 'center' as const,
  },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '0.2rem',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'transparent',
    border: '1.5px dashed var(--primary-emerald)',
    color: 'var(--primary-emerald)',
    padding: '0.6rem 1rem',
    borderRadius: '0.5rem',
    width: '100%',
    justifyContent: 'center',
    cursor: 'pointer',
    marginTop: '1.25rem',
    fontWeight: '600',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
  },
  resultsCard: {
    background: 'var(--bg-card)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    padding: '2.5rem 1.75rem',
  },
  scoreCircleContainer: {
    position: 'relative' as const,
    marginBottom: '1.5rem',
  },
  scoreCircle: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'var(--bg-card)',
    border: '4px solid var(--primary-emerald)',
    boxShadow: '0 0 30px var(--primary-emerald-glow)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreLabel: {
    fontSize: '0.8rem',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    color: 'var(--text-muted)',
  },
  scoreNumber: {
    fontSize: '3rem',
    fontWeight: '900',
    color: 'var(--text-main)',
    lineHeight: '1',
  },
  scoreMax: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
  },
  outcomeSection: {
    width: '100%',
  },
  badgeRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  qualTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    marginBottom: '0.5rem',
  },
  qualDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    maxWidth: '300px',
    margin: '0 auto',
  },
  divider: {
    width: '80%',
    margin: '1.25rem auto',
    border: 'none',
    borderBottom: '1px solid var(--border-color)',
  },
  syncBox: {
    background: 'var(--bg-app)',
    borderRadius: '0.75rem',
    padding: '1rem',
    border: '1px solid var(--border-color)',
    textAlign: 'left' as const,
  },
  syncBoxTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginBottom: '0.25rem',
  },
  syncInputs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  syncInput: {
    flex: '1',
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '0.4rem 0.6rem',
    borderRadius: '0.35rem',
    fontSize: '0.8rem',
    outline: 'none',
  },
  syncSaveBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    border: 'none',
    color: '#ffffff',
    padding: '0.5rem',
    borderRadius: '0.35rem',
    fontWeight: '700',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }
};
export default APSCalculator;
