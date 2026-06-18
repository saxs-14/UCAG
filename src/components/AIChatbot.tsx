import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Mic, Volume2, Sparkles, Languages, Copy, Check } from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'user' | 'mpumi';
  text: string;
}

interface Subject {
  name: string;
  mark: number;
}

interface AIChatbotProps {
  lowDataMode?: boolean;
  apsScore?: number;
  subjects?: Subject[];
}

const LOCALIZED_FAQ = {
  en: {
    welcome: "Hello! I am Mpumi, your AI educational assistant powered by the UCAG ecosystem. I can help with UMP admissions, APS calculations, bursaries, career guidance, mentorship, and more. What would you like to know?",
    q1: "What are the UMP application closing dates?",
    a1: "UMP applications for the 2027 academic year close on 30 November 2026. I strongly recommend applying before September to secure your preferred faculty. Late applications may be accepted on a space-available basis only.",
    q2: "What is the minimum APS for BSc Agriculture?",
    a2: "BSc Agriculture at UMP requires a minimum of 26 APS points (excluding Life Orientation), with at least Level 4 (50%+) in Mathematics and either Physical Sciences or Life Sciences. Mpumalanga's agricultural demand makes this one of the most impactful degrees in the region.",
    q3: "How do I qualify for a UMP merit scholarship?",
    a3: "The UMP Academic Merit Scholarship requires an APS of 32 or higher and outstanding matric results. You also qualify for NSFAS regardless of your APS — simply apply at nsfas.org.za. Additional bursaries include Mpumalanga Provincial, Sasol, and the Funza Lushaka Teaching Bursary.",
    placeholder: "Ask about APS, bursaries, careers, nursing, law, mentorship..."
  },
  zu: {
    welcome: "Sawubona! NginguMpumi, umsizi wakho we-AI wezemfundo. Ngibuze noma yini mayelana nokungena eNyuvesi yaseMpumalanga (UMP), imibandela ye-APS, noma ukwelulekwa!",
    q1: "Zivalwa nini izicelo zokufunda e-UMP?",
    a1: "Izicelo zonyaka wezifundo olandelayo zivalwa ngomhlaka 30 Novemba. Ukufaka izicelo kusenesikhathi kuyanconywa kakhulu!",
    q2: "Yini i-APS ephansi kakhulu ye-BSc Agriculture?",
    a2: "I-APS ephansi efunekayo ku-BSc Agriculture ingamaphuzu angama-26 (ngaphandle kwe-Life Orientation), kanye ne-L4 kwa-Mathematics ne-Sciences.",
    q3: "Ngiwathola kanjani amasholashiphi e-UMP?",
    a3: "Udinga i-APS esezingeni eliphezulu engama-32 noma ngaphezulu. Abafundi abafanelekile bathola izaphulelo ezizenzakalelayo zokufunda.",
    placeholder: "Bhala umbuzo wakho lapha..."
  },
  nso: {
    welcome: "Dumela! Ke nna Mpumi, mothusi wa gago wa AI wa tša thuto. Mpotšiše se sengwe le se sengwe ka ga go amogelwa go la University of Mpumalanga (UMP)!",
    q1: "Dikhhuphelo tša go tsenya dikopo tša UMP di tswalelwa neng?",
    a1: "Dikopo tša ngwaga wa thuto o latelago di tswalelwa ka la 30 Dibatsela (November). Go kgothaletšwa go tsenya dikopo ka pela!",
    q2: "Aps e nnyane go BSc Agriculture ke efe?",
    a2: "Aps e nnyane ke dintlha tše 26 tša go tsena sekolo (ntle le Life Orientation), ka L4 go Mathematics le Physical Science.",
    q3: "Nka tsenela bjang scholarship sa UMP?",
    a3: "O swanetše go ba le APS ya 32 goba go feta. Baithuti ba ba amogetšwego ba fiwa diphaselana tša tšhelete tša dithuto.",
    placeholder: "Ngwala potšišo ya gago mo..."
  },
  ts: {
    welcome: "Avuxeni! Hi mina Mpumi, mupfuni wa wena wa dyondzo hi ku tirhisa AI. Ndzi vutise swo karhi hi ta ku amukeriwa eYunivhesiti ya Mpumalanga (UMP)!",
    q1: "Tinkhensa to tisa swikombelo swa UMP ti pfariwa rini?",
    a1: "Swikombelo swa lembe leri landzelaka swi pfariwa hi ti 30 ta Nyenyankulu (November). Pfuxeta hi nkarhi lowu faneleke!",
    q2: "I yini APS ya le hansi eka BSc Agriculture?",
    a2: "APS ya le hansi i 26 (handle ka Life Orientation), u ri na L4 eka Mathematics na Physical Science.",
    q3: "Ndzi nga swi kumisa ku yini masolachipi ya UMP?",
    a3: "U fanele ku fikelela APS ya 32 kumbe ku tlula leswaku u kuma nseketelo wa timali eka UMP.",
    placeholder: "Tsala xivutiso xa wena la..."
  },
  ss: {
    welcome: "Sanibonani! NginguMpumi, umsiti wakho we-AI wetemfundvo. Ngibute noma yini mayelana nekungena eNyuvesi yaseMpumalanga (UMP) netetimali!",
    q1: "Tivalwa nini ticelo tekufundza e-UMP?",
    a1: "Ticelo temnyaka lotako tetemfundvo tivalwa ngamhlaka 30 Lweti (November). Faka sicelo sakho maphambili!",
    q2: "Ngubani i-APS lephasi yekuphasa BSc Agriculture?",
    a2: "I-APS lephasi ngu-26 (ngaphandle kwe-Life Orientation), kanye ne-L4 ku-Mathematics ne-Physical Sciences.",
    q3: "Ngititfolela njani tisitiso tetimali tase-UMP?",
    a3: "Utsintsa APS ya-32 nobe ngetulu. Bafundzi labaphumelele batfola litfuba lekufundza ngaphandle kwekubhadala.",
    placeholder: "Bhala umbuto wakho lapha..."
  }
};

const ANIMATION_STYLES = `
@keyframes soundwavePulse {
  0%, 100% {
    height: 4px;
    opacity: 0.4;
  }
  50% {
    height: 24px;
    opacity: 1;
  }
}
`;

export const AIChatbot: React.FC<AIChatbotProps> = ({ 
  lowDataMode = false, 
  apsScore = 20, 
  subjects = [] 
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<'en' | 'zu' | 'nso' | 'ts' | 'ss'>('en');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [voiceActive, setVoiceActive] = useState<boolean>(false);
  
  // SMS Simulator states
  const [copied, setCopied] = useState<boolean>(false);
  const [smsSuccess, setSmsSuccess] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeLang = LOCALIZED_FAQ[language];

  useEffect(() => {
    // Initial welcome message
    setMessages([
      { id: Date.now(), sender: 'mpumi', text: activeLang.welcome }
    ]);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* ── Extended AI response engine ── */
  const getMpumiReply = (query: string): string => {
    const q = query.toLowerCase();

    /* Greetings */
    if (/\b(hello|hi|hey|sawubona|dumela|sanibonani|avuxeni|heita|howzit)\b/.test(q))
      return activeLang.welcome;

    /* Application dates */
    if (/\b(date|closing|deadline|apply|when|close|application)\b/.test(q))
      return activeLang.a1;

    /* Agriculture */
    if (/\b(agriculture|farming|agric|ezolimo|temafundza)\b/.test(q))
      return activeLang.a2;

    /* Bursary / Scholarship / NSFAS */
    if (/\b(bursary|scholarship|nsfas|funding|financial|money|fees|cost|merit|award|funza)\b/.test(q))
      return activeLang.a3;

    /* APS calculation */
    if (/\b(aps|points|calculate|score|my aps|admission points)\b/.test(q))
      return `Your APS (Admission Points Score) is calculated from your best 6 subjects, excluding Life Orientation (which gets reduced points). Percentages map to levels: 80%+=7, 70-79%=6, 60-69%=5, 50-59%=4, 40-49%=3, 30-39%=2. Use the APS Calculator tab above — I've already built it for you! Your current calculated APS is ${apsScore} points.`;

    /* Nursing */
    if (/\b(nursing|nurse|health|healthcare|clinic|hospital|bsc nursing)\b/.test(q))
      return `BSc Nursing at UMP requires a minimum APS of 28, with Life Sciences at Level 4 (50%+) and English at Level 4. Nursing graduates are in CRITICAL demand across all five Mpumalanga districts. Your community impact as a professional nurse in rural areas is immeasurable. Starting salaries range from R260,000 to R780,000 per year.`;

    /* Law */
    if (/\b(law|llb|lawyer|attorney|legal|advocate|justice)\b/.test(q))
      return `Bachelor of Laws (LLB) at UMP requires a minimum APS of 30 and strong English (Level 4 for HL or Level 5 for FAL). Rural South Africa has a severe legal aid shortage — LLB graduates can champion land rights, community justice, and constitutional protection. Earning potential ranges from R280,000 to R1,200,000 depending on specialisation.`;

    /* Computer Science / ICT */
    if (/\b(computer|coding|programming|software|it|ict|data|tech|developer)\b/.test(q))
      return `BSc Computer Science at UMP needs an APS of 28 and Mathematics at Level 5 (60%+). Alternatively, the Diploma in ICT needs only APS 20. South Africa's digital skills gap is costing the economy R14 billion annually. Software developers start at R300,000 and can earn up to R950,000 per year. This is one of the fastest-growing careers in Mpumalanga.`;

    /* Environmental Science */
    if (/\b(environment|nature|conservation|ecology|wildlife|kruger|game|climate)\b/.test(q))
      return `BSc Environmental Science at UMP requires APS 24, with Life Sciences and Geography or Physical Sciences at Level 4. Mpumalanga's Kruger National Park, Blyde River Canyon, and biodiversity corridors are world-class conservation zones. Environmental scientists are in HIGH demand and earn R210,000–R560,000 per year.`;

    /* Social Work */
    if (/\b(social work|social worker|community|welfare|youth|gbv|children|counselling)\b/.test(q))
      return `Bachelor of Social Work (BSW) at UMP requires APS 22 with English at Level 4. Social Workers address gender-based violence, child welfare, substance abuse, and poverty in Mpumalanga communities. This is a CRITICAL shortage profession — government bursaries like the Social Work Scholarship are available to qualifying students.`;

    /* Education / Teaching */
    if (/\b(teach|education|educator|school|bed|teacher|class)\b/.test(q))
      return `Bachelor of Education (BEd) at UMP requires APS 24 and English at Level 4 or higher. There is a critical shortage of Mathematics and Science teachers in Mpumalanga schools. The Funza Lushaka bursary covers ALL costs for education students who commit to teaching in public schools for an equal period after graduation.`;

    /* Development Studies */
    if (/\b(development|community development|ngo|poverty|rural|municipality)\b/.test(q))
      return `Bachelor of Development Studies at UMP requires APS 22 and English at Level 4. This degree is perfect for driving community upliftment, rural infrastructure programs, and social policy initiatives. Graduates work for NGOs, municipalities, and government departments. Salaries range from R160,000 to R380,000.`;

    /* Hospitality / Tourism */
    if (/\b(hospitality|tourism|hotel|lodge|restaurant|chef|travel|kruger|game lodge)\b/.test(q))
      return `Diploma in Hospitality Management at UMP requires APS 20 and English at Level 3. Mpumalanga's tourism corridor (Kruger National Park, Panorama Route) attracts over 1.2 million visitors per year. Lodge managers and tourism directors earn R140,000–R480,000. This is one of the top CRITICAL demand sectors in the province.`;

    /* Mentorship */
    if (/\b(mentor|adopt|mentorship|help|guide|support)\b/.test(q))
      return `The UCAG Adopt-a-Learner program connects UMP student mentors with high school learners across Mpumalanga. Mentors earn Impact XP, badges, and official volunteer certificates that strengthen their CVs. Learners get free academic support in subjects they struggle with. Visit the "Adopt-a-Learner" tab to get started!`;

    /* Foundation / Bridging */
    if (/\b(foundation|bridging|extended|ecp|fail|low aps|below)\b/.test(q))
      return `If your APS is below 18, don't lose hope. UMP's Extended Curriculum Programme (ECP) and Foundation Studies courses are designed to bridge this gap. These programmes spread first-year modules over two years with additional academic support — dramatically boosting graduation success rates. Many of South Africa's greatest professionals started here.`;

    /* UMP general */
    if (/\b(ump|university of mpumalanga|mbombela|mpumalanga university)\b/.test(q))
      return `The University of Mpumalanga (UMP) is based in Mbombela, Mpumalanga. It offers qualifications across Agriculture & Natural Sciences, Education, Hospitality & Tourism, Science & IT, Law, Health Sciences, and Development Studies. UMP is ranked among the fastest-growing universities in South Africa and is uniquely positioned to address regional development challenges.`;

    /* Registration / enrollment */
    if (/\b(register|registration|enroll|enrollment|student number|admission)\b/.test(q))
      return `UMP registration happens in January–February of each academic year. You will need: your NSC certificate, certified ID copy, proof of address, and your NSFAS funding letter (if applicable). Upload all documents to the UMP Student Portal at apply.ump.ac.za. I recommend starting your application in August to avoid delays.`;

    /* Accommodation */
    if (/\b(accommodation|residence|hostel|dorm|housing|stay)\b/.test(q))
      return `UMP provides on-campus residences for qualifying students. Preference is given to first-year students from rural areas. Apply for accommodation when you apply for admission. If no campus residence is available, UMP's Student Affairs office maintains a list of accredited private accommodation near campus in Mbombela.`;

    /* Default intelligent response */
    return `Thank you for your question! As Mpumi — UCAG's AI assistant — I specialise in UMP admissions, APS calculations, career guidance, bursaries, and mentorship. Your APS is currently ${apsScore}. Try asking me about: nursing, law, computer science, agriculture, bursaries, or the adopt-a-learner programme. I am here to help you find your best path forward!`;
  };

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = { id: Date.now(), sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = getMpumiReply(textToSend);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'mpumi', text: reply }]);
      setIsTyping(false);
    }, 900 + Math.random() * 400);
  };

  const handleVoiceListen = () => {
    setVoiceActive(true);
    setTimeout(() => {
      setInputVal(language === 'en' ? "What is the minimum APS for BSc Agriculture?" : language === 'zu' ? "Zivalwa nini izicelo?" : "Dumela Mpumi");
      setVoiceActive(false);
    }, 2500);
  };

  const handleTextToSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("🔊 Text-to-Speech simulation active: Reading response aloud.");
    }
  };

  // Generate Off-Grid Rural SMS/USSD payload
  const generateSMSPayload = (): string => {
    const maths = subjects.find(s => s.name.toLowerCase() === 'mathematics');
    const eng = subjects.find(s => s.name.toLowerCase().includes('english'));
    
    let level = "HC";
    if (apsScore >= 26 && eng && eng.mark >= 50) level = "Bachelors";
    else if (apsScore >= 19 && eng && eng.mark >= 40) level = "Diploma";

    const mMark = maths ? `${maths.mark}%` : 'N/A';
    const eMark = eng ? `${eng.mark}%` : 'N/A';

    return `*31033*1#\nUCAG MATRIC PROFILE:\nAPS score: ${apsScore}\nNSC Level: ${level}\nSubjects: M:${mMark}, E:${eMark}\nRecommended UMP Course: ${
      apsScore >= 26 ? "BSc Agriculture / IT" : apsScore >= 20 ? "Dip Hospitality" : "Extended/Bridge"
    }\nBursary: ${apsScore >= 26 ? "NSFAS / Provincial" : "NSFAS"}\nOutreach Hub: Mbombela`;
  };

  const handleCopySMS = () => {
    navigator.clipboard.writeText(generateSMSPayload());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendSimulatedSMS = () => {
    setSmsSuccess(true);
    setTimeout(() => setSmsSuccess(false), 3500);
  };

  const soundwaveStyles = {
    soundwaveContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '3px',
      height: '32px',
      margin: '0.5rem 0',
    },
    soundwaveBar: {
      width: '4px',
      background: 'var(--accent-gold)',
      borderRadius: '2px',
      animation: 'soundwavePulse 1s ease-in-out infinite',
      height: '4px',
    }
  };

  return (
    <>
      <style>{ANIMATION_STYLES}</style>

      {/* Floating Toggle Button */}
      <button onClick={() => setIsOpen(!isOpen)} style={styles.floatingBtn} title="Chat with Mpumi">
        <MessageSquare size={24} />
        <span style={styles.floatingBtnText}>Ask Mpumi</span>
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="glass-card" style={{
          ...styles.chatWindow,
          ...(lowDataMode ? styles.lowDataWindow : {})
        }}>
          
          {/* Header */}
          <div style={styles.chatHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={styles.badgeSpark}>
                <Sparkles size={14} color="#ffffff" />
              </div>
              <div>
                <h3 style={styles.chatName}>Mpumi AI</h3>
                <span style={styles.statusDot}>Online</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={styles.langSelector}>
                <Languages size={14} color="var(--text-muted)" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  style={styles.select}
                >
                  <option value="en">English</option>
                  <option value="zu">isiZulu</option>
                  <option value="ss">Siswati</option>
                  <option value="nso">Sepedi</option>
                  <option value="ts">Xitsonga</option>
                </select>
              </div>
              <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Voice Simulator Overlay */}
          {voiceActive && (
            <div style={styles.voiceOverlay}>
              <Mic size={32} color="var(--accent-gold)" style={{ marginBottom: '0.5rem' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ffffff' }}>Mpumi is listening...</span>
              <div style={soundwaveStyles.soundwaveContainer}>
                <span style={{ ...soundwaveStyles.soundwaveBar, animationDelay: '0.1s' }}></span>
                <span style={{ ...soundwaveStyles.soundwaveBar, animationDelay: '0.2s' }}></span>
                <span style={{ ...soundwaveStyles.soundwaveBar, animationDelay: '0.3s' }}></span>
                <span style={{ ...soundwaveStyles.soundwaveBar, animationDelay: '0.4s' }}></span>
                <span style={{ ...soundwaveStyles.soundwaveBar, animationDelay: '0.5s' }}></span>
                <span style={{ ...soundwaveStyles.soundwaveBar, animationDelay: '0.6s' }}></span>
              </div>
            </div>
          )}

          {/* Low Data Mode Rural Panel */}
          {lowDataMode ? (
            <div style={styles.lowDataBody}>
              <div style={styles.lowDataAlert}>
                📶 Rural Low-Data Mode Active (Visual bandwidth optimization)
              </div>
              
              <div style={styles.smsGeneratorBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={styles.smsTitle}>OFF-GRID SMS PAYLOAD GENERATOR</span>
                  <button onClick={handleCopySMS} style={styles.copyBtn} title="Copy SMS to Clipboard">
                    {copied ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={generateSMSPayload()}
                  style={styles.smsTextarea}
                />
                
                <button onClick={handleSendSimulatedSMS} style={styles.smsSendBtn}>
                  Simulate USSD/SMS Outreach Sync
                </button>
                
                {smsSuccess && (
                  <div style={styles.smsSuccessBanner}>
                    📲 Profile synced successfully via offline SMS gateway!
                  </div>
                )}
              </div>
              
              <div style={styles.smsHeaderDivider}>LIGHTWEIGHT CONVERSATION:</div>
            </div>
          ) : null}

          {/* Messages body (Responsive style in low-data mode) */}
          <div style={{
            ...styles.chatBody,
            ...(lowDataMode ? styles.lowDataChatBody : {})
          }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{
                ...styles.messageRow,
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              }}>
                {msg.sender === 'mpumi' && !lowDataMode && (
                  <div style={styles.assistantAvatar}>M</div>
                )}
                <div style={{
                  ...styles.bubble,
                  background: msg.sender === 'user' 
                    ? 'var(--primary-emerald)' 
                    : (lowDataMode ? 'rgba(139, 162, 150, 0.15)' : 'var(--border-color)'),
                  color: msg.sender === 'user' ? '#ffffff' : 'var(--text-main)',
                  borderRadius: msg.sender === 'user' ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                  border: lowDataMode && msg.sender === 'mpumi' ? '1px solid var(--border-color)' : 'none'
                }}>
                  <p style={{ fontSize: '0.85rem' }}>{msg.text}</p>
                  {msg.sender === 'mpumi' && !lowDataMode && (
                    <button
                      onClick={() => handleTextToSpeech(msg.text)}
                      style={styles.ttsBtn}
                      title="Read aloud"
                    >
                      <Volume2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={styles.typingIndicator}>
                <span style={styles.typingDot}></span>
                <span style={styles.typingDot}></span>
                <span style={styles.typingDot}></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Suggestion Chips */}
          <div style={{
            ...styles.faqChips,
            ...(lowDataMode ? { paddingBottom: '0.2rem', marginBottom: '0.2rem' } : {})
          }}>
            <button onClick={() => handleSend(activeLang.q1)} style={styles.chip}>{activeLang.q1}</button>
            <button onClick={() => handleSend(activeLang.q2)} style={styles.chip}>{activeLang.q2}</button>
            <button onClick={() => handleSend(activeLang.q3)} style={styles.chip}>{activeLang.q3}</button>
          </div>

          {/* Footer controls */}
          <div style={styles.chatFooter}>
            {!lowDataMode && (
              <button
                onClick={handleVoiceListen}
                style={{
                  ...styles.micBtn,
                  background: voiceActive ? 'var(--danger)' : 'transparent',
                  color: voiceActive ? '#ffffff' : 'var(--text-main)',
                }}
                title="Simulate Voice Input"
              >
                <Mic size={18} />
              </button>
            )}
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputVal)}
              placeholder={activeLang.placeholder}
              style={styles.input}
            />
            <button onClick={() => handleSend(inputVal)} style={styles.sendBtn}>
              <Send size={16} />
            </button>
          </div>

        </div>
      )}
    </>
  );
};

const styles = {
  floatingBtn: {
    position: 'fixed' as const,
    bottom: '24px',
    right: '24px',
    zIndex: 999,
    background: 'linear-gradient(135deg, var(--primary-emerald) 0%, var(--accent-gold) 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '999px',
    padding: '0.85rem 1.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '700',
    boxShadow: '0 8px 32px rgba(0, 102, 51, 0.25)',
    transition: 'all 0.3s ease',
  },
  floatingBtnText: {
    fontSize: '0.9rem',
  },
  chatWindow: {
    position: 'fixed' as const,
    bottom: '90px',
    right: '24px',
    width: '380px',
    height: '520px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column' as const,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
  },
  lowDataWindow: {
    height: '590px',
    background: 'var(--bg-app)',
    backdropFilter: 'none',
    border: '2px solid var(--border-color)',
    boxShadow: 'none',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid var(--border-color)',
  },
  badgeSpark: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'var(--primary-emerald)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatName: {
    fontSize: '0.95rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    lineHeight: '1',
  },
  statusDot: {
    fontSize: '0.65rem',
    color: 'var(--success)',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
    marginTop: '0.1rem',
  },
  langSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.35rem',
    padding: '0.15rem 0.35rem',
  },
  select: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-main)',
    fontSize: '0.75rem',
    fontWeight: '700',
    outline: 'none',
    cursor: 'pointer',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  voiceOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'var(--bg-card)',
    zIndex: 1010,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '1.25rem',
  },
  chatBody: {
    flex: 1,
    overflowY: 'auto' as const,
    margin: '0.75rem 0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    paddingRight: '0.25rem',
  },
  lowDataChatBody: {
    maxHeight: '140px',
    border: '1px dashed var(--border-color)',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    background: 'var(--bg-app)',
  },
  lowDataBody: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    paddingTop: '0.5rem',
  },
  lowDataAlert: {
    background: 'rgba(94, 111, 103, 0.15)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    fontSize: '0.7rem',
    padding: '0.35rem 0.5rem',
    borderRadius: '0.35rem',
    fontWeight: '800',
    textAlign: 'center' as const,
  },
  smsGeneratorBox: {
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    padding: '0.6rem',
    borderRadius: '0.5rem',
  },
  smsTitle: {
    fontSize: '0.65rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
  },
  copyBtn: {
    background: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    fontSize: '0.65rem',
    padding: '0.15rem 0.4rem',
    borderRadius: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
    cursor: 'pointer',
  },
  smsTextarea: {
    width: '100%',
    height: '110px',
    background: 'var(--bg-app)',
    color: 'var(--text-main)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.25rem',
    fontFamily: 'monospace',
    fontSize: '0.7rem',
    padding: '0.4rem',
    resize: 'none' as const,
    outline: 'none',
  },
  smsSendBtn: {
    width: '100%',
    background: 'var(--primary-emerald)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.35rem',
    fontSize: '0.725rem',
    fontWeight: '800',
    padding: '0.4rem',
    cursor: 'pointer',
    marginTop: '0.4rem',
  },
  smsSuccessBanner: {
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid var(--success)',
    color: 'var(--success)',
    fontSize: '0.65rem',
    fontWeight: '800',
    padding: '0.35rem',
    borderRadius: '0.25rem',
    marginTop: '0.4rem',
    textAlign: 'center' as const,
  },
  smsHeaderDivider: {
    fontSize: '0.65rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.2rem',
    marginTop: '0.25rem',
  },
  messageRow: {
    display: 'flex',
    alignItems: 'start',
    gap: '0.5rem',
    maxWidth: '85%',
  },
  assistantAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'var(--accent-gold)',
    color: '#121f04',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: '800',
    flexShrink: 0,
  },
  bubble: {
    padding: '0.65rem 0.85rem',
    position: 'relative' as const,
  },
  ttsBtn: {
    position: 'absolute' as const,
    bottom: '-8px',
    right: '8px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-muted)',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  typingIndicator: {
    display: 'flex',
    gap: '0.25rem',
    padding: '0.5rem',
    background: 'var(--border-color)',
    borderRadius: '0.5rem',
    alignSelf: 'flex-start',
    marginLeft: '1.75rem',
  },
  typingDot: {
    width: '6px',
    height: '6px',
    background: 'var(--text-muted)',
    borderRadius: '50%',
    animation: 'soundwavePulse 1.4s infinite ease-in-out',
  },
  faqChips: {
    display: 'flex',
    gap: '0.35rem',
    overflowX: 'auto' as const,
    paddingBottom: '0.5rem',
    marginBottom: '0.5rem',
  },
  chip: {
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    borderRadius: '999px',
    padding: '0.35rem 0.7rem',
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap' as const,
    fontWeight: '600',
    cursor: 'pointer',
  },
  chatFooter: {
    display: 'flex',
    gap: '0.5rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '0.75rem',
  },
  micBtn: {
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  input: {
    flex: 1,
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    color: 'var(--text-main)',
    padding: '0.5rem 0.75rem',
    fontSize: '0.8rem',
    outline: 'none',
  },
  sendBtn: {
    background: 'var(--primary-emerald)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    width: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  }
};

export default AIChatbot;
