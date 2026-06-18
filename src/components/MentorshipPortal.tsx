import React, { useState, useEffect } from 'react';
import { db } from '../config/mongodb';
import { mockFirebase } from '../config/firebase';
import { Users, UserPlus, MessageSquare, Award, CheckCircle, Shield, Sparkles, Send } from 'lucide-react';

interface Learner {
  _id?: string;
  fullName: string;
  email: string;
  apsScore: number;
  careerInterests: string[];
  isAdopted: boolean;
  adoptedBy: string | null;
  subjects?: { name: string; mark: number }[];
}

interface Mentor {
  fullName: string;
  email: string;
  umpStudentId: string;
  majorSubjects: string[];
  adoptedLearnersCount: number;
  impactScore: number;
  badges: string[];
}

export const MentorshipPortal: React.FC = () => {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  
  // Selection/State
  const [currentMentor, setCurrentMentor] = useState<Mentor | null>(null);
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [typedMessage, setTypedMessage] = useState<string>("");

  useEffect(() => {
    loadDatabaseState();
    
    // Subscribe to Firestore/Firebase chat simulation updates
    const unsubscribe = mockFirebase.collection('chats').onSnapshot((snapshot: any[]) => {
      setChatMessages(snapshot);
    });

    return () => unsubscribe();
  }, []);

  const loadDatabaseState = () => {
    const listLearners = db.find('learners');
    const listMentors = db.find('mentors');
    setLearners(listLearners);
    setMentors(listMentors);
    
    // Set default logged-in mentor if none is chosen
    if (listMentors.length > 0 && !currentMentor) {
      setCurrentMentor(listMentors[0]);
    }
  };

  const handleAdoptLearner = (learner: Learner) => {
    if (!currentMentor) return;

    // Smart adoption check: Maximum of 3 learners per mentor
    if (currentMentor.adoptedLearnersCount >= 3) {
      alert("⚠️ Capacity Limit: To ensure premium-quality academic guidance, mentors are limited to adopting 3 learners at once.");
      return;
    }

    // Update MongoDB
    db.updateOne('learners', { email: learner.email }, { isAdopted: true, adoptedBy: currentMentor.fullName });
    db.updateOne('mentors', { email: currentMentor.email }, { 
      adoptedLearnersCount: currentMentor.adoptedLearnersCount + 1,
      impactScore: currentMentor.impactScore + 50 // Earn +50 impact XP
    });

    // Award badges automatically if impact is high
    const updatedMentor = db.findOne('mentors', { email: currentMentor.email });
    if (updatedMentor && updatedMentor.impactScore >= 150 && !updatedMentor.badges.includes("Elite Guardian")) {
      updatedMentor.badges.push("Elite Guardian");
      db.updateOne('mentors', { email: currentMentor.email }, { badges: updatedMentor.badges });
    }

    loadDatabaseState();
    
    // Refresh currently selected mentor state
    if (updatedMentor) {
      setCurrentMentor(updatedMentor);
    }
  };

  const handleAutoMatchmaking = () => {
    // 1. Get all unadopted learners
    const unadoptedLearners = learners.filter(l => !l.isAdopted);
    if (unadoptedLearners.length === 0) {
      alert("ℹ️ All learners have already been adopted!");
      return;
    }

    let matchCount = 0;
    // Track mentor workloads locally during the matchmaking loop
    let tempMentors = [...mentors];

    unadoptedLearners.forEach(learner => {
      // 2. Identify subjects the learner struggles with (mark < 50)
      const fullLearner = db.findOne('learners', { email: learner.email }) || learner;
      const strugglingSubjects = fullLearner.subjects
        ? fullLearner.subjects.filter((s: any) => s.mark < 50).map((s: any) => s.name)
        : [];

      if (strugglingSubjects.length === 0) return;

      // 3. Find candidates among tempMentors who:
      // - Have workload < 3
      // - Have at least one of learner's struggling subjects in majorSubjects
      const candidates = tempMentors.filter(m => 
        m.adoptedLearnersCount < 3 && 
        m.majorSubjects.some(subject => strugglingSubjects.includes(subject))
      );

      if (candidates.length > 0) {
        // 4. Sort by workload (adoptedLearnersCount) asc to prioritize lower load
        candidates.sort((a, b) => a.adoptedLearnersCount - b.adoptedLearnersCount);
        const selectedMentor = candidates[0];

        // 5. Perform the adoption
        db.updateOne('learners', { email: learner.email }, { isAdopted: true, adoptedBy: selectedMentor.fullName });
        
        const newCount = selectedMentor.adoptedLearnersCount + 1;
        const newXP = selectedMentor.impactScore + 50;
        const newBadges = [...selectedMentor.badges];
        if (newXP >= 150 && !newBadges.includes("Elite Guardian")) {
          newBadges.push("Elite Guardian");
        }

        db.updateOne('mentors', { email: selectedMentor.email }, { 
          adoptedLearnersCount: newCount,
          impactScore: newXP,
          badges: newBadges
        });

        // Update our local state trackers
        const idx = tempMentors.findIndex(m => m.email === selectedMentor.email);
        if (idx !== -1) {
          tempMentors[idx] = {
            ...tempMentors[idx],
            adoptedLearnersCount: newCount,
            impactScore: newXP,
            badges: newBadges
          };
        }

        matchCount++;
      }
    });

    if (matchCount > 0) {
      alert(`🎉 Smart Matchmaker successfully paired ${matchCount} learner(s) with expert UMP student mentors based on subject needs!`);
      loadDatabaseState();
      
      // Update current mentor state if they were updated
      if (currentMentor) {
        const refreshed = db.findOne('mentors', { email: currentMentor.email });
        if (refreshed) {
          setCurrentMentor(refreshed);
        }
      }
    } else {
      alert("ℹ️ No eligible matches could be made automatically at this time. (Either learners don't have grades < 50%, or mentors for those subjects are at full capacity).");
    }
  };

  const selectChatRecipient = (learner: Learner) => {
    setSelectedLearner(learner);
  };

  const handleSendMessage = () => {
    if (!typedMessage.trim() || !selectedLearner || !currentMentor) return;

    // AI Guardrail / Safety Filter Check (Eecosystem policy)
    const isMessageSafe = validateMessageContent(typedMessage);
    if (!isMessageSafe) {
      alert("🛡️ Safety Filter: Mpumi detected content violating educational standards. Please keep conversations academic and safe.");
      return;
    }

    // Push message to simulated Firebase Firestore
    mockFirebase.collection('chats').add({
      sender: currentMentor.fullName,
      recipient: selectedLearner.fullName,
      text: typedMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // Boost XP score for answering a query
    db.updateOne('mentors', { email: currentMentor.email }, { impactScore: currentMentor.impactScore + 10 });
    const refreshed = db.findOne('mentors', { email: currentMentor.email });
    if (refreshed) {
      setCurrentMentor(refreshed);
    }

    setTypedMessage("");
  };

  // Safe chat filters: ensures no phone numbers, social media handles, or inappropriate keywords
  const validateMessageContent = (text: string): boolean => {
    const forbiddenPatterns = [
      /\b\d{10}\b/, // Mobile number filter
      /@\w+/,       // Social handles
      /snapchat/i,
      /instagram/i,
      /facebook/i
    ];
    return !forbiddenPatterns.some(pattern => pattern.test(text));
  };

  const activeChats = chatMessages.filter(msg => 
    (msg.sender === currentMentor?.fullName && msg.recipient === selectedLearner?.fullName) ||
    (msg.sender === selectedLearner?.fullName && msg.recipient === currentMentor?.fullName)
  ).sort((a, b) => a.id > b.id ? 1 : -1);

  return (
    <div className="grid-2 animate-fade-in-up" style={{ alignItems: 'stretch' }}>
      
      {/* Mentorship & Impact Dashboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Mentor Selector Profile */}
        <div className="glass-card" style={styles.profileCard}>
          <div style={styles.mentorInfo}>
            <div style={styles.avatar}>
              <Users size={24} color="var(--primary-emerald)" />
            </div>
            <div>
              <h3 style={styles.mentorName}>{currentMentor?.fullName || "UMP Volunteer"}</h3>
              <p style={styles.mentorSub}>University of Mpumalanga Mentor (ID: {currentMentor?.umpStudentId})</p>
            </div>
          </div>
          
          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <span style={styles.statValue}>{currentMentor?.adoptedLearnersCount} / 3</span>
              <span style={styles.statLabel}>Adopted Learners</span>
            </div>
            <div style={styles.statBox}>
              <span style={{ ...styles.statValue, color: 'var(--accent-gold)' }}>
                {currentMentor?.impactScore} XP
              </span>
              <span style={styles.statLabel}>Impact Score</span>
            </div>
          </div>

          <div style={styles.badgesWrapper}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>BADGES:</span>
            {currentMentor?.badges.map((badge, idx) => (
              <span key={idx} className="badge badge-gold" style={styles.profileBadge}>
                <Award size={10} style={{ marginRight: '0.2rem' }} />
                {badge}
              </span>
            ))}
            {(!currentMentor?.badges || currentMentor.badges.length === 0) && (
              <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>Adopt a learner to earn badges!</span>
            )}
          </div>
        </div>

        {/* Available Learners for Adoption (Connected to live MongoDB store) */}
        <div className="glass-card" style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={styles.listTitle}>
              <UserPlus size={18} color="var(--primary-emerald)" />
              <span>Learners Requesting Mentorship</span>
            </h3>
            <button
              onClick={handleAutoMatchmaking}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              <Sparkles size={12} />
              Auto-Matchmake
            </button>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Smart matching dashboard showing local South African high school candidates.
          </p>

          <div style={styles.learnersList}>
            {learners.map((learner, idx) => (
              <div key={idx} style={styles.learnerRow}>
                <div>
                  <h4 style={styles.learnerRowName}>{learner.fullName}</h4>
                  <p style={styles.learnerRowSub}>APS: <strong>{learner.apsScore}</strong> • Hobbies: {learner.careerInterests?.join(', ')}</p>
                </div>
                <div>
                  {learner.isAdopted ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Adopted by {learner.adoptedBy}
                      </span>
                      {learner.adoptedBy === currentMentor?.fullName && (
                        <button 
                          onClick={() => selectChatRecipient(learner)}
                          style={styles.chatActionBtn}
                        >
                          <MessageSquare size={14} />
                          Chat
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAdoptLearner(learner)}
                      style={styles.adoptBtn}
                    >
                      <Sparkles size={12} />
                      Adopt & Help
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* UMP Mentor Impact Leaderboard */}
        <div className="glass-card">
          <h3 style={styles.listTitle}>
            <Award size={18} color="var(--accent-gold)" />
            <span>UMP Mentor Impact Leaderboard</span>
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Top student mentors from University of Mpumalanga ranked by volunteer support XP.
          </p>
          <div style={styles.leaderboardList}>
            {[...mentors]
              .sort((a, b) => b.impactScore - a.impactScore)
              .map((mentor, idx) => (
                <div key={idx} style={styles.leaderboardRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      ...styles.rankBadge,
                      background: idx === 0 ? 'var(--accent-gold)' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : 'var(--border-color)',
                      color: idx < 3 ? '#121f04' : 'var(--text-main)',
                    }}>
                      {idx + 1}
                    </div>
                    <div>
                      <h4 style={{ ...styles.learnerRowName, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {mentor.fullName}
                        {idx === 0 && <span style={{ fontSize: '0.8rem' }}>🏆</span>}
                      </h4>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Majors: {mentor.majorSubjects.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: '800', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
                      {mentor.impactScore} XP
                    </span>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {mentor.adoptedLearnersCount} adopted
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

      </div>

      {/* Safe Live-Chat Simulation Panel (Firebase Simulator) */}
      <div className="glass-card" style={styles.chatPanel}>
        <div style={styles.chatHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} color="var(--primary-emerald)" />
            <h3 style={styles.chatTitle}>Mpumi SafeChat Portal</h3>
          </div>
          <span style={styles.safetyTag}>
            <CheckCircle size={10} style={{ marginRight: '0.2rem' }} /> Active AI Guardrails
          </span>
        </div>

        {selectedLearner ? (
          <>
            <div style={styles.chatTargetBanner}>
              Talking to: <strong>{selectedLearner.fullName}</strong> ({selectedLearner.email})
            </div>
            
            {/* Scrollable chat body */}
            <div style={styles.chatBody}>
              {activeChats.length === 0 && (
                <div style={styles.emptyChat}>
                  <MessageSquare size={36} color="var(--border-color)" />
                  <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Start your mentorship conversation. Offer tips on subjects and UMP life.</p>
                </div>
              )}
              {activeChats.map((msg, idx) => {
                const isMe = msg.sender === currentMentor?.fullName;
                return (
                  <div key={idx} style={{
                    ...styles.messageBubbleContainer,
                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                  }}>
                    <div style={{
                      ...styles.messageBubble,
                      background: isMe ? 'var(--primary-emerald)' : 'var(--border-color)',
                      color: isMe ? '#ffffff' : 'var(--text-main)',
                      borderRadius: isMe ? '0.75rem 0.75rem 0 0.75rem' : '0.75rem 0.75rem 0.75rem 0',
                    }}>
                      <span style={styles.msgText}>{msg.text}</span>
                      <span style={styles.msgTime}>{msg.timestamp}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick response helpers */}
            <div style={styles.quickHelpers}>
              <button onClick={() => setTypedMessage("Hi! Don't stress about your math mark, UMP offers foundation paths. Let's do it!")} style={styles.helperBtn}>
                💡 Encourage Marks
              </button>
              <button onClick={() => setTypedMessage("Remember, the closing date for NSFAS bursary applications is approaching. Have you completed it?")} style={styles.helperBtn}>
                💰 NSFAS Advice
              </button>
            </div>

            {/* Input area */}
            <div style={styles.chatFooter}>
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your mentoring message (safety filters active)..."
                style={styles.chatInput}
              />
              <button onClick={handleSendMessage} style={styles.chatSendBtn}>
                <Send size={16} />
              </button>
            </div>
          </>
        ) : (
          <div style={styles.chatPlaceholder}>
            <MessageSquare size={48} color="var(--border-color)" style={{ marginBottom: '1rem' }} />
            <h3>Safe Mentorship Chat</h3>
            <p style={{ maxWidth: '300px', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Select one of your adopted learners from the left panel to begin discussing study tips, career advice, and UMP university insights.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

const styles = {
  profileCard: {
    background: 'var(--bg-card)',
  },
  mentorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '0.75rem',
    background: 'var(--primary-emerald-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mentorName: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: 'var(--text-main)',
  },
  mentorSub: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  statBox: {
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--primary-emerald)',
  },
  statLabel: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    marginTop: '0.15rem',
  },
  badgesWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
    borderTop: '1px solid var(--border-color)',
    paddingTop: '0.75rem',
  },
  profileBadge: {
    fontSize: '0.65rem',
    background: 'var(--accent-gold-light)',
    color: 'var(--accent-gold-hover)',
    fontWeight: '800',
  },
  listTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.1rem',
    fontWeight: '800',
    color: 'var(--text-main)',
  },
  learnersList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    maxHeight: '280px',
    overflowY: 'auto' as const,
    paddingRight: '0.25rem',
  },
  learnerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
  },
  learnerRowName: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  learnerRowSub: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  adoptBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    border: 'none',
    background: 'var(--primary-emerald)',
    color: '#ffffff',
    padding: '0.4rem 0.8rem',
    borderRadius: '0.4rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  chatActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    border: 'none',
    background: 'var(--accent-gold)',
    color: '#121f04',
    padding: '0.4rem 0.8rem',
    borderRadius: '0.4rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  chatPanel: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '480px',
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid var(--border-color)',
  },
  chatTitle: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: 'var(--text-main)',
  },
  safetyTag: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.2rem 0.5rem',
    borderRadius: '0.25rem',
  },
  chatTargetBanner: {
    background: 'var(--primary-emerald-light)',
    color: 'var(--primary-emerald)',
    fontSize: '0.8rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.35rem',
    marginTop: '0.75rem',
  },
  chatBody: {
    flex: 1,
    overflowY: 'auto' as const,
    margin: '0.75rem 0',
    paddingRight: '0.25rem',
    maxHeight: '260px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  emptyChat: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    color: 'var(--text-muted)',
    padding: '2rem',
  },
  messageBubbleContainer: {
    display: 'flex',
    width: '100%',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: '0.6rem 0.8rem',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  msgText: {
    fontSize: '0.85rem',
    lineHeight: '1.3',
  },
  msgTime: {
    fontSize: '0.6rem',
    opacity: 0.7,
    textAlign: 'right' as const,
    marginTop: '0.2rem',
  },
  quickHelpers: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap' as const,
    marginBottom: '0.75rem',
  },
  helperBtn: {
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '999px',
    padding: '0.3rem 0.6rem',
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    cursor: 'pointer',
  },
  chatFooter: {
    display: 'flex',
    gap: '0.5rem',
  },
  chatInput: {
    flex: 1,
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    color: 'var(--text-main)',
    padding: '0.6rem 0.8rem',
    fontSize: '0.85rem',
    outline: 'none',
  },
  chatSendBtn: {
    background: 'var(--primary-emerald)',
    color: '#ffffff',
    border: 'none',
    width: '36px',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  chatPlaceholder: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    color: 'var(--text-muted)',
    padding: '3rem',
  },
  leaderboardList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  leaderboardRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.6rem 0.75rem',
    borderRadius: '0.5rem',
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
  },
  rankBadge: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '800',
  },
};
export default MentorshipPortal;

