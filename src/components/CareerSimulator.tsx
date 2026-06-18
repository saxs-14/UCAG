import React, { useState } from 'react';
import { Compass, Sparkles, MapPin, BadgeDollarSign, ChevronRight, TrendingUp, Check, X } from 'lucide-react';

interface Subject {
  name: string;
  mark: number;
}

interface CareerSimulatorProps {
  apsScore: number;
  subjects: Subject[];
}

interface CareerPath {
  title: string;
  faculty: string;
  minAps: number;
  requiredSubjects: string[];
  jobs: string[];
  salaryRange: string;
  demandMpumalanga: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
}

const CAREER_DATABASE: CareerPath[] = [
  {
    title: "BSc Agriculture",
    faculty: "Faculty of Agriculture & Natural Sciences",
    minAps: 26,
    requiredSubjects: ["Mathematics (Level 4 / 50%+)", "Physical Sciences (Level 4) OR Life Sciences (Level 4)"],
    jobs: ["Agronomist", "Food Security Specialist", "Farming Systems Advisor", "Environmental Consultant"],
    salaryRange: "R240,000 - R680,000",
    demandMpumalanga: "CRITICAL",
    description: "Mpumalanga is the agricultural powerhouse of South Africa. This degree equips you to enhance crop yields, manage livestock, and assure national food security."
  },
  {
    title: "BSc Computer Science / ICT",
    faculty: "Faculty of Science & IT",
    minAps: 28,
    requiredSubjects: ["Mathematics (Level 5 / 60%+)"],
    jobs: ["Software Engineer", "Systems Analyst", "Data Scientist", "IT Security Consultant"],
    salaryRange: "R300,000 - R950,000",
    demandMpumalanga: "HIGH",
    description: "Digital transition is critical for rural inclusion. Support development of agricultural-tech systems and rural financial access."
  },
  {
    title: "Bachelor of Education (BEd)",
    faculty: "Faculty of Education",
    minAps: 24,
    requiredSubjects: ["English HL (Level 4 / 50%+) OR English FAL (Level 5 / 60%+)"],
    jobs: ["High School Educator", "Curriculum Specialist", "Education NGO Developer"],
    salaryRange: "R180,000 - R420,000",
    demandMpumalanga: "CRITICAL",
    description: "Help educate the next generation of Mpumalanga youth. High demand for Science, Technology, and Indigenous Language teachers."
  },
  {
    title: "Bachelor of Development Studies",
    faculty: "Faculty of Economics & Development",
    minAps: 22,
    requiredSubjects: ["English HL or FAL (Level 4 / 50%+)"],
    jobs: ["Community Development Practitioner", "Social Policy Researcher", "NGO Officer"],
    salaryRange: "R160,000 - R380,000",
    demandMpumalanga: "HIGH",
    description: "Equips students to resolve complex inequalities, build rural infrastructure programs, and drive community empowerment initiatives."
  },
  {
    title: "Diploma in Hospitality Management",
    faculty: "Faculty of Hospitality & Tourism",
    minAps: 20,
    requiredSubjects: ["English HL or FAL (Level 3 / 40%+)"],
    jobs: ["Lodge Manager", "Tourism Director", "Guest Relations Officer", "Chef"],
    salaryRange: "R140,000 - R480,000",
    demandMpumalanga: "CRITICAL",
    description: "Mpumalanga's tourism corridors (Kruger National Park, Panorama Route) require premium hospitality leaders to welcome local and global travelers."
  },
  {
    title: "BSc Nursing / Health Sciences",
    faculty: "Faculty of Health & Natural Sciences",
    minAps: 28,
    requiredSubjects: ["Life Sciences (Level 4 / 50%+)", "Mathematics or Maths Literacy (Level 4)", "English HL or FAL (Level 4)"],
    jobs: ["Professional Nurse", "Community Health Worker", "Clinical Nurse Practitioner", "Hospital Manager"],
    salaryRange: "R260,000 - R780,000",
    demandMpumalanga: "CRITICAL",
    description: "Healthcare access in rural Mpumalanga is critically under-resourced. Nursing graduates from UMP directly improve community health outcomes in townships and farms."
  },
  {
    title: "Bachelor of Laws (LLB)",
    faculty: "Faculty of Law",
    minAps: 30,
    requiredSubjects: ["English HL (Level 4 / 50%+) OR English FAL (Level 5 / 60%+)", "Any other subject at Level 4"],
    jobs: ["Attorney", "Public Prosecutor", "Legal Aid Officer", "Human Rights Lawyer", "Municipal Advisor"],
    salaryRange: "R280,000 - R1,200,000",
    demandMpumalanga: "HIGH",
    description: "Rural South Africa faces significant legal aid shortages. LLB graduates can champion land rights, community justice, municipal accountability, and constitutional protection."
  },
  {
    title: "BSc Environmental Science",
    faculty: "Faculty of Agriculture & Natural Sciences",
    minAps: 24,
    requiredSubjects: ["Life Sciences (Level 4 / 50%+)", "Geography OR Physical Sciences (Level 4)", "Mathematics (Level 3 / 40%+)"],
    jobs: ["Environmental Scientist", "Conservation Officer", "Climate Change Analyst", "Nature Reserve Manager"],
    salaryRange: "R210,000 - R560,000",
    demandMpumalanga: "HIGH",
    description: "Mpumalanga's Kruger National Park, Blyde River Canyon, and biodiversity corridors require passionate environmental scientists to manage conservation and climate resilience."
  },
  {
    title: "Bachelor of Social Work (BSW)",
    faculty: "Faculty of Humanities & Social Sciences",
    minAps: 22,
    requiredSubjects: ["English HL or FAL (Level 4 / 50%+)", "Any social science subject at Level 3"],
    jobs: ["Social Worker", "Community Liaison Officer", "Child Protection Officer", "Youth Development Facilitator"],
    salaryRange: "R150,000 - R380,000",
    demandMpumalanga: "CRITICAL",
    description: "Social Work graduates are urgently needed to address gender-based violence, child welfare, poverty, and substance abuse in Mpumalanga's underserved communities."
  },
  {
    title: "Diploma in Information & Communication Technology",
    faculty: "Faculty of Science & IT",
    minAps: 20,
    requiredSubjects: ["Mathematics (Level 3 / 40%+) OR Mathematical Literacy (Level 5 / 60%+)"],
    jobs: ["IT Support Technician", "Network Administrator", "Database Operator", "Web Developer"],
    salaryRange: "R160,000 - R520,000",
    demandMpumalanga: "HIGH",
    description: "South Africa's digital skills gap is costing the economy billions. ICT diploma holders are fast-tracked into government, corporate, and startup tech roles across Mpumalanga."
  }
];

const HUB_DEMANDS: Record<string, Record<string, 'CRITICAL' | 'HIGH' | 'MEDIUM'>> = {
  "BSc Agriculture": {
    Nkangala: 'MEDIUM',
    GertSibande: 'HIGH',
    Ehlanzeni: 'HIGH',
    Mbombela: 'HIGH',
    Nkomazi: 'CRITICAL'
  },
  "BSc Computer Science / ICT": {
    Nkangala: 'HIGH',
    GertSibande: 'MEDIUM',
    Ehlanzeni: 'HIGH',
    Mbombela: 'CRITICAL',
    Nkomazi: 'MEDIUM'
  },
  "Bachelor of Education (BEd)": {
    Nkangala: 'HIGH',
    GertSibande: 'CRITICAL',
    Ehlanzeni: 'CRITICAL',
    Mbombela: 'HIGH',
    Nkomazi: 'CRITICAL'
  },
  "Bachelor of Development Studies": {
    Nkangala: 'HIGH',
    GertSibande: 'CRITICAL',
    Ehlanzeni: 'HIGH',
    Mbombela: 'CRITICAL',
    Nkomazi: 'HIGH'
  },
  "Diploma in Hospitality Management": {
    Nkangala: 'MEDIUM',
    GertSibande: 'MEDIUM',
    Ehlanzeni: 'CRITICAL',
    Mbombela: 'CRITICAL',
    Nkomazi: 'HIGH'
  },
  "BSc Nursing / Health Sciences": {
    Nkangala: 'CRITICAL',
    GertSibande: 'CRITICAL',
    Ehlanzeni: 'CRITICAL',
    Mbombela: 'HIGH',
    Nkomazi: 'CRITICAL'
  },
  "Bachelor of Laws (LLB)": {
    Nkangala: 'HIGH',
    GertSibande: 'HIGH',
    Ehlanzeni: 'HIGH',
    Mbombela: 'CRITICAL',
    Nkomazi: 'MEDIUM'
  },
  "BSc Environmental Science": {
    Nkangala: 'MEDIUM',
    GertSibande: 'HIGH',
    Ehlanzeni: 'CRITICAL',
    Mbombela: 'HIGH',
    Nkomazi: 'CRITICAL'
  },
  "Bachelor of Social Work (BSW)": {
    Nkangala: 'CRITICAL',
    GertSibande: 'CRITICAL',
    Ehlanzeni: 'HIGH',
    Mbombela: 'HIGH',
    Nkomazi: 'CRITICAL'
  },
  "Diploma in Information & Communication Technology": {
    Nkangala: 'HIGH',
    GertSibande: 'MEDIUM',
    Ehlanzeni: 'HIGH',
    Mbombela: 'CRITICAL',
    Nkomazi: 'HIGH'
  }
};

interface ChecklistItem {
  label: string;
  met: boolean;
  value: string;
}

export const CareerSimulator: React.FC<CareerSimulatorProps> = ({ apsScore, subjects }) => {
  const [selectedCareer, setSelectedCareer] = useState<CareerPath>(CAREER_DATABASE[0]);
  const [hoveredHub, setHoveredHub] = useState<string | null>(null);

  // Convert **markdown bold** to <strong> HTML for dangerouslySetInnerHTML
  const mdToHtml = (text: string) =>
    text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // AI Career Recommendation Heuristics — v3.0 expanded engine
  const getMpumiRecommendations = () => {
    const recs: string[] = [];
    const maths    = subjects.find(s => s.name.toLowerCase() === 'mathematics');
    const physSci  = subjects.find(s => s.name.toLowerCase().includes('physical'));
    const lifeSci  = subjects.find(s => s.name.toLowerCase().includes('life sciences'));
    const english  = subjects.find(s => s.name.toLowerCase().includes('english'));
    const geo      = subjects.find(s => s.name.toLowerCase().includes('geography'));
    const history  = subjects.find(s => s.name.toLowerCase().includes('history'));
    const business = subjects.find(s => s.name.toLowerCase().includes('business') || s.name.toLowerCase().includes('accounting') || s.name.toLowerCase().includes('economics'));
    const it       = subjects.find(s => s.name.toLowerCase().includes('information technology') || s.name.toLowerCase().includes(' it'));
    const tourism  = subjects.find(s => s.name.toLowerCase().includes('tourism') || s.name.toLowerCase().includes('hospitality'));

    // Science & Tech pathway
    if (maths && maths.mark >= 65 && physSci && physSci.mark >= 60 && apsScore >= 28) {
      recs.push("🚀 Elite Science & Tech Profile: Your outstanding performance in Mathematics (" + maths.mark + "%) and Physical Sciences (" + physSci.mark + "%) positions you in the top tier for **BSc Computer Science**, **BSc Agriculture**, or **BSc Environmental Science** at UMP. These streams achieve 92% graduate employment placement in Mpumalanga.");
    } else if (maths && maths.mark >= 50 && apsScore >= 26) {
      recs.push("🌾 Agricultural Science Pathway: With solid Mathematics (" + maths.mark + "%) and an APS of " + apsScore + ", you qualify confidently for **BSc Agriculture**. Mpumalanga is South Africa's agricultural heartland — graduates here directly impact national food security.");
    }

    // Nursing / Health Sciences
    if (lifeSci && lifeSci.mark >= 55 && apsScore >= 26) {
      recs.push("🏥 Healthcare Career Match: Strong Life Sciences performance (" + lifeSci.mark + "%) is the gateway to **BSc Nursing / Health Sciences**. Nursing is critically under-supplied in Mpumalanga — demand is CRITICAL across all five districts. You would be making a real, measurable difference in your community.");
    }

    // Law pathway
    if (english && english.mark >= 60 && apsScore >= 28) {
      recs.push("⚖️ Law & Justice Pathway: Your strong English mark (" + english.mark + "%) and APS of " + apsScore + " indicate you are well-suited for **Bachelor of Laws (LLB)**. Rural legal aid is one of South Africa's most underfunded sectors — a local LLB graduate has extraordinary community impact potential.");
    }

    // Environmental / Geography
    if ((geo && geo.mark >= 55) && lifeSci && lifeSci.mark >= 50 && apsScore >= 22) {
      recs.push("🌍 Environmental Science Fit: Your Geography (" + geo!.mark + "%) and Life Sciences (" + lifeSci.mark + "%) combination is ideal for **BSc Environmental Science**. Mpumalanga's game reserves, biodiversity corridors, and Kruger National Park constantly seek qualified environmental scientists.");
    }

    // Social Work
    if ((history && history.mark >= 55) || (english && english.mark >= 55 && apsScore >= 20 && apsScore < 26)) {
      recs.push("🤝 Social Impact Pathway: Your humanities performance and community-oriented profile aligns with **Bachelor of Social Work**. Social Workers are CRITICALLY needed in townships, farms, and rural municipalities across Ehlanzeni and Nkomazi districts.");
    }

    // Education
    if (english && english.mark >= 58 && apsScore >= 22) {
      recs.push("🏫 Education & Mentorship Focus: Your language strength (" + english.mark + "%) makes you an excellent candidate for **Bachelor of Education (BEd)**. South Africa faces a severe maths and science teacher shortage — your impact as an educator would be generational.");
    }

    // Commerce / Business
    if (business && business.mark >= 55 && apsScore >= 20) {
      recs.push("📊 Commerce & Development Pathway: Strong commerce subject performance positions you well for **Bachelor of Development Studies** or **Diploma in Business Management**. Local economic development is one of Mpumalanga's top government priorities.");
    }

    // IT / Technology
    if (it && it.mark >= 60 && apsScore >= 20) {
      recs.push("💻 Technology & ICT Pathway: Your Information Technology mark (" + it.mark + "%) is a strong signal for the **Diploma in ICT** or **BSc Computer Science**. The digital skills gap in South Africa is costing R14 billion annually — ICT skills are in extraordinary demand.");
    }

    // Tourism / Hospitality
    if (tourism && tourism.mark >= 55 && apsScore >= 18) {
      recs.push("🏨 Tourism & Hospitality Pathway: Your Tourism background perfectly aligns with the **Diploma in Hospitality Management**. Mpumalanga's Kruger National Park and Panorama Route attract over 1.2 million visitors per year — qualified hospitality professionals are in CRITICAL demand.");
    }

    // Diploma fallback (APS 18-23)
    if (recs.length === 0 && apsScore >= 18 && apsScore < 24) {
      recs.push("💼 Practical Career Route: Your APS of " + apsScore + " qualifies you for Diploma-level programmes at UMP including **Diploma in Hospitality Management** and **Diploma in ICT**. These offer excellent salary prospects and career mobility — many diploma graduates upgrade to degree level within 3 years.");
    }

    // Foundation bridging
    if (apsScore < 18) {
      recs.push("📈 Academic Foundation Programme Recommended: With an APS of " + apsScore + ", Mpumi recommends the UMP Extended Curriculum Programme (ECP) or Foundation Studies pathway. These bridging courses are specifically designed to elevate your marks to full degree entry level within 1-2 years. Many of South Africa's most successful graduates started here.");
    }

    if (recs.length === 0) {
      recs.push("✨ Well-Rounded Profile: Your academic record shows consistent performance across multiple disciplines. Explore the UMP Career Pathways panel to simulate your eligibility for your preferred qualification.");
    }

    return recs;
  };

  const aiRecs = getMpumiRecommendations();

  // Evaluate dynamic eligibility checklist
  const checkCareerRequirements = (careerTitle: string): ChecklistItem[] => {
    const maths = subjects.find(s => s.name.toLowerCase() === 'mathematics');
    const physicalSciences = subjects.find(s => s.name.toLowerCase().includes('physical'));
    const lifeSciences = subjects.find(s => s.name.toLowerCase().includes('life'));
    const englishHL = subjects.find(s => s.name.toLowerCase().includes('english') && s.name.toLowerCase().includes('home'));
    const englishFAL = subjects.find(s => s.name.toLowerCase().includes('english') && (s.name.toLowerCase().includes('additional') || s.name.toLowerCase().includes('fal')));
    const generalEnglish = subjects.find(s => s.name.toLowerCase().includes('english'));

    const items: ChecklistItem[] = [];

    switch (careerTitle) {
      case "BSc Agriculture":
        items.push({
          label: "APS Score ≥ 26",
          met: apsScore >= 26,
          value: `Your APS: ${apsScore} (Required: 26)`
        });
        items.push({
          label: "Mathematics ≥ 50% (Level 4)",
          met: !!(maths && maths.mark >= 50),
          value: maths ? `Your Mark: ${maths.mark}%` : "Mathematics not found"
        });
        {
          const physMet = !!(physicalSciences && physicalSciences.mark >= 50);
          const lifeMet = !!(lifeSciences && lifeSciences.mark >= 50);
          const scienceMarkStr = [];
          if (physicalSciences) scienceMarkStr.push(`PhysSci: ${physicalSciences.mark}%`);
          if (lifeSciences) scienceMarkStr.push(`LifeSci: ${lifeSciences.mark}%`);
          items.push({
            label: "Physical Sciences or Life Sciences ≥ 50% (Level 4)",
            met: physMet || lifeMet,
            value: scienceMarkStr.length > 0 ? scienceMarkStr.join(', ') : "No Science subjects found"
          });
        }
        break;

      case "BSc Computer Science / ICT":
        items.push({
          label: "APS Score ≥ 28",
          met: apsScore >= 28,
          value: `Your APS: ${apsScore} (Required: 28)`
        });
        items.push({
          label: "Mathematics ≥ 60% (Level 5)",
          met: !!(maths && maths.mark >= 60),
          value: maths ? `Your Mark: ${maths.mark}%` : "Mathematics not found"
        });
        break;

      case "Bachelor of Education (BEd)":
        items.push({
          label: "APS Score ≥ 24",
          met: apsScore >= 24,
          value: `Your APS: ${apsScore} (Required: 24)`
        });
        {
          const hlMet = !!(englishHL && englishHL.mark >= 50);
          const falMet = !!(englishFAL && englishFAL.mark >= 60);
          const englishVal = [];
          if (englishHL) englishVal.push(`HL: ${englishHL.mark}%`);
          if (englishFAL) englishVal.push(`FAL: ${englishFAL.mark}%`);
          items.push({
            label: "English HL ≥ 50% (L4) OR English FAL ≥ 60% (L5)",
            met: hlMet || falMet || !!(generalEnglish && generalEnglish.mark >= 60),
            value: englishVal.length > 0 ? englishVal.join(', ') : generalEnglish ? `English: ${generalEnglish.mark}%` : "English not found"
          });
        }
        break;

      case "Bachelor of Development Studies":
        items.push({
          label: "APS Score ≥ 22",
          met: apsScore >= 22,
          value: `Your APS: ${apsScore} (Required: 22)`
        });
        {
          const engMet = !!(generalEnglish && generalEnglish.mark >= 50);
          items.push({
            label: "English HL or FAL ≥ 50% (Level 4)",
            met: engMet,
            value: generalEnglish ? `Your Mark: ${generalEnglish.mark}%` : "English not found"
          });
        }
        break;

      case "Diploma in Hospitality Management":
        items.push({
          label: "APS Score ≥ 20",
          met: apsScore >= 20,
          value: `Your APS: ${apsScore} (Required: 20)`
        });
        {
          const engMet = !!(generalEnglish && generalEnglish.mark >= 40);
          items.push({
            label: "English HL or FAL ≥ 40% (Level 3)",
            met: engMet,
            value: generalEnglish ? `Your Mark: ${generalEnglish.mark}%` : "English not found"
          });
        }
        break;
      
      case "BSc Nursing / Health Sciences":
        items.push({ label: "APS Score ≥ 28", met: apsScore >= 28, value: `Your APS: ${apsScore} (Required: 28)` });
        items.push({ label: "Life Sciences ≥ 50% (Level 4)", met: !!(lifeSciences && lifeSciences.mark >= 50), value: lifeSciences ? `Your Mark: ${lifeSciences.mark}%` : "Life Sciences not found" });
        {
          const engMet = !!(generalEnglish && generalEnglish.mark >= 50);
          items.push({ label: "English HL or FAL ≥ 50% (Level 4)", met: engMet, value: generalEnglish ? `Your Mark: ${generalEnglish.mark}%` : "English not found" });
        }
        break;

      case "Bachelor of Laws (LLB)":
        items.push({ label: "APS Score ≥ 30", met: apsScore >= 30, value: `Your APS: ${apsScore} (Required: 30)` });
        {
          const hlMet = !!(englishHL && englishHL.mark >= 50);
          const falMet = !!(englishFAL && englishFAL.mark >= 60);
          items.push({ label: "English HL ≥ 50% OR English FAL ≥ 60%", met: hlMet || falMet || !!(generalEnglish && generalEnglish.mark >= 55), value: generalEnglish ? `Your Mark: ${generalEnglish.mark}%` : "English not found" });
        }
        break;

      case "BSc Environmental Science":
        items.push({ label: "APS Score ≥ 24", met: apsScore >= 24, value: `Your APS: ${apsScore} (Required: 24)` });
        items.push({ label: "Life Sciences ≥ 50% (Level 4)", met: !!(lifeSciences && lifeSciences.mark >= 50), value: lifeSciences ? `Your Mark: ${lifeSciences.mark}%` : "Life Sciences not found" });
        items.push({ label: "Mathematics ≥ 40% (Level 3)", met: !!(maths && maths.mark >= 40), value: maths ? `Your Mark: ${maths.mark}%` : "Mathematics not found" });
        break;

      case "Bachelor of Social Work (BSW)":
        items.push({ label: "APS Score ≥ 22", met: apsScore >= 22, value: `Your APS: ${apsScore} (Required: 22)` });
        {
          const engMet = !!(generalEnglish && generalEnglish.mark >= 50);
          items.push({ label: "English HL or FAL ≥ 50% (Level 4)", met: engMet, value: generalEnglish ? `Your Mark: ${generalEnglish.mark}%` : "English not found" });
        }
        break;

      case "Diploma in Information & Communication Technology":
        items.push({ label: "APS Score ≥ 20", met: apsScore >= 20, value: `Your APS: ${apsScore} (Required: 20)` });
        {
          const mathsMet = !!(maths && maths.mark >= 40);
          const mathsLit = subjects.find(s => s.name.toLowerCase().includes('mathematical literacy'));
          const mathsLitMet = !!(mathsLit && mathsLit.mark >= 60);
          items.push({ label: "Mathematics ≥ 40% OR Mathematical Literacy ≥ 60%", met: mathsMet || mathsLitMet, value: maths ? `Maths: ${maths.mark}%` : mathsLit ? `Maths Lit: ${mathsLit.mark}%` : "Mathematics not found" });
        }
        break;

      default:
        items.push({
          label: "APS Score Requirement",
          met: apsScore >= 20,
          value: `Your APS: ${apsScore}`
        });
    }

    return items;
  };

  const checklistItems = checkCareerRequirements(selectedCareer.title);

  // SVG Demand Color Selector
  const getDemandColor = (level: 'CRITICAL' | 'HIGH' | 'MEDIUM') => {
    if (level === 'CRITICAL') return 'var(--accent-gold)';
    if (level === 'HIGH') return 'var(--primary-emerald)';
    return 'rgba(139, 162, 150, 0.2)';
  };

  const careerDemands = HUB_DEMANDS[selectedCareer.title] || {
    Nkangala: 'MEDIUM',
    GertSibande: 'MEDIUM',
    Ehlanzeni: 'MEDIUM',
    Mbombela: 'MEDIUM',
    Nkomazi: 'MEDIUM'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Mpumi AI Recommendation Board */}
      <div className="glass-card" style={styles.aiBoard}>
        <div style={styles.aiHeader}>
          <div style={styles.aiTitleGroup}>
            <Sparkles size={20} color="var(--accent-gold)" />
            <h3 style={styles.aiTitle}>Mpumi AI Career Insights</h3>
          </div>
          <span style={styles.badgeModel}>Active Model: Mpumi-v2.5</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Real-time, automated analysis of your high school academic record.
        </p>

        <div style={styles.recsWrapper}>
          {aiRecs.map((rec, idx) => (
            <div key={idx} style={styles.recItem}>
              <div style={styles.recIndicator}></div>
              <p style={styles.recText} dangerouslySetInnerHTML={{ __html: mdToHtml(rec) }} />
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Career Pathway Simulator */}
      <div className="grid-2" style={{ alignItems: 'stretch' }}>
        
        {/* Course Selectors */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={styles.sectionTitle}>
            <Compass size={18} color="var(--primary-emerald)" />
            <span>UMP Career Pathways</span>
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
            Simulate qualifications and explore local career metrics immediately.
          </p>

          <div style={styles.careerList}>
            {CAREER_DATABASE.map((career, idx) => {
              const qualifies = apsScore >= career.minAps;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedCareer(career)}
                  style={{
                    ...styles.careerRow,
                    ...(selectedCareer.title === career.title ? styles.careerRowSelected : {}),
                  }}
                >
                  <div>
                    <h4 style={styles.careerRowTitle}>{career.title}</h4>
                    <span style={styles.careerRowFaculty}>{career.faculty}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      ...styles.minApsBadge,
                      background: qualifies ? 'var(--primary-emerald-light)' : 'rgba(239, 68, 68, 0.1)',
                      color: qualifies ? 'var(--primary-emerald)' : 'var(--danger)',
                    }}>
                      APS {career.minAps}+
                    </span>
                    <ChevronRight size={16} color="var(--text-muted)" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Course Deep-dive */}
        <div className="glass-card" style={styles.detailCard}>
          <div style={styles.detailHeader}>
            <h3 style={styles.detailTitle}>{selectedCareer.title}</h3>
            <span style={{
              ...styles.demandLabel,
              background: selectedCareer.demandMpumalanga === 'CRITICAL' ? 'rgba(239, 68, 68, 0.1)' : 'var(--primary-emerald-light)',
              color: selectedCareer.demandMpumalanga === 'CRITICAL' ? 'var(--danger)' : 'var(--primary-emerald)',
            }}>
              {selectedCareer.demandMpumalanga} DEMAND
            </span>
          </div>
          <span style={styles.detailFaculty}>{selectedCareer.faculty}</span>
          
          <p style={styles.detailDesc}>{selectedCareer.description}</p>

          <div style={styles.metricGrid}>
            <div style={styles.metricItem}>
              <BadgeDollarSign size={16} color="var(--primary-emerald)" />
              <div>
                <span style={styles.metricLabel}>Average Salary</span>
                <span style={styles.metricValue}>{selectedCareer.salaryRange}</span>
              </div>
            </div>

            <div style={styles.metricItem}>
              <MapPin size={16} color="var(--accent-gold)" />
              <div>
                <span style={styles.metricLabel}>Mpumalanga Hubs</span>
                <span style={styles.metricValue}>Mbombela, Nkomazi</span>
              </div>
            </div>
          </div>

          {/* Sub-Grid for Mpumi AI Career Panel Checklist & SVG Map */}
          <div style={styles.deepDiveGrid}>
            
            {/* Eligibility Checklist Panel */}
            <div style={styles.checklistSection}>
              <h4 style={styles.widgetSubTitle}>
                <Sparkles size={14} color="var(--accent-gold)" style={{ marginRight: '0.3rem' }} />
                Mpumi Eligibility Checklist
              </h4>
              <div style={styles.checklistWrapper}>
                {checklistItems.map((item, idx) => (
                  <div key={idx} style={styles.checklistItem}>
                    <div style={{
                      ...styles.checkCircle,
                      backgroundColor: item.met ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: item.met ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {item.met ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{
                        ...styles.checklistLabel,
                        color: item.met ? 'var(--text-main)' : 'var(--text-muted)'
                      }}>
                        {item.label}
                      </span>
                      <span style={styles.checklistVal}>
                        {item.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive SVG Demand Map */}
            <div style={styles.mapSection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={styles.widgetSubTitle}>
                  <MapPin size={14} color="var(--primary-emerald)" style={{ marginRight: '0.3rem' }} />
                  Employment Demand Map
                </h4>
                {hoveredHub && (
                  <span style={styles.mapTooltip}>
                    {hoveredHub}: <strong>{careerDemands[hoveredHub.replace(' Hub', '').replace(' ', '')]}</strong>
                  </span>
                )}
              </div>
              
              <div style={styles.mapWrapper}>
                <svg viewBox="0 0 300 220" style={{ width: '100%', height: 'auto', maxHeight: '180px' }}>
                  {/* Districts */}
                  <path
                    d="M 20,70 L 100,50 L 120,110 L 80,150 L 20,130 Z"
                    fill={getDemandColor(careerDemands.Nkangala)}
                    stroke="var(--bg-card)"
                    strokeWidth="1.5"
                    style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredHub('Nkangala')}
                    onMouseLeave={() => setHoveredHub(null)}
                  />
                  <path
                    d="M 20,130 L 80,150 L 120,110 L 150,140 L 190,140 L 210,200 L 80,210 L 20,190 Z"
                    fill={getDemandColor(careerDemands.GertSibande)}
                    stroke="var(--bg-card)"
                    strokeWidth="1.5"
                    style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredHub('Gert Sibande')}
                    onMouseLeave={() => setHoveredHub(null)}
                  />
                  <path
                    d="M 100,50 L 220,10 L 250,90 L 180,120 L 120,110 Z"
                    fill={getDemandColor(careerDemands.Ehlanzeni)}
                    stroke="var(--bg-card)"
                    strokeWidth="1.5"
                    style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredHub('Ehlanzeni')}
                    onMouseLeave={() => setHoveredHub(null)}
                  />
                  <path
                    d="M 250,90 L 290,100 L 280,160 L 210,200 L 190,140 L 180,120 Z"
                    fill={getDemandColor(careerDemands.Nkomazi)}
                    stroke="var(--bg-card)"
                    strokeWidth="1.5"
                    style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredHub('Nkomazi')}
                    onMouseLeave={() => setHoveredHub(null)}
                  />
                  <circle
                    cx="180"
                    cy="90"
                    r="12"
                    fill={getDemandColor(careerDemands.Mbombela)}
                    stroke="var(--bg-card)"
                    strokeWidth="1.5"
                    style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredHub('Mbombela')}
                    onMouseLeave={() => setHoveredHub(null)}
                  />

                  {/* Text labels */}
                  <text x="65" y="100" fill="var(--text-main)" fontSize="7" fontWeight="800" textAnchor="middle" pointerEvents="none">Nkangala</text>
                  <text x="100" y="180" fill="var(--text-main)" fontSize="7" fontWeight="800" textAnchor="middle" pointerEvents="none">Gert Sibande</text>
                  <text x="160" y="55" fill="var(--text-main)" fontSize="7" fontWeight="800" textAnchor="middle" pointerEvents="none">Ehlanzeni</text>
                  <text x="245" y="150" fill="var(--text-main)" fontSize="7" fontWeight="800" textAnchor="middle" pointerEvents="none">Nkomazi</text>
                  <text x="180" y="112" fill="var(--text-main)" fontSize="7" fontWeight="800" textAnchor="middle" pointerEvents="none">Mbombela</text>
                </svg>
                
                {/* Small Map Legend */}
                <div style={styles.legend}>
                  <div style={styles.legendItem}><span style={{ ...styles.legendColor, background: 'var(--accent-gold)' }}></span> Critical</div>
                  <div style={styles.legendItem}><span style={{ ...styles.legendColor, background: 'var(--primary-emerald)' }}></span> High</div>
                  <div style={styles.legendItem}><span style={{ ...styles.legendColor, background: 'rgba(139, 162, 150, 0.25)' }}></span> Med/Low</div>
                </div>
              </div>
            </div>

          </div>

          <div style={styles.jobsBox}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
              POSSIBLE CAREERS & ROLES:
            </span>
            <div style={styles.jobsList}>
              {selectedCareer.jobs.map((job, idx) => (
                <span key={idx} style={styles.jobTag}>
                  <TrendingUp size={12} style={{ marginRight: '0.2rem' }} />
                  {job}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

const styles = {
  aiBoard: {
    background: 'var(--primary-emerald-light)',
    borderLeft: '4px solid var(--primary-emerald)',
  },
  aiHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.75rem',
  },
  aiTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  aiTitle: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: 'var(--primary-emerald)',
  },
  badgeModel: {
    fontSize: '0.65rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    padding: '0.2rem 0.5rem',
    borderRadius: '0.25rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  recsWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  recItem: {
    display: 'flex',
    gap: '0.75rem',
    background: 'var(--bg-card)',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    border: '1px solid var(--border-color)',
  },
  recIndicator: {
    width: '4px',
    borderRadius: '2px',
    background: 'var(--accent-gold)',
    alignSelf: 'stretch',
  },
  recText: {
    fontSize: '0.85rem',
    lineHeight: '1.4',
    color: 'var(--text-main)',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.1rem',
    fontWeight: '800',
    color: 'var(--text-main)',
  },
  careerList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.6rem',
    flexGrow: 1,
    overflowY: 'auto' as const,
    paddingRight: '0.25rem',
  },
  careerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  careerRowSelected: {
    borderColor: 'var(--primary-emerald)',
    background: 'var(--primary-emerald-glow)',
  },
  careerRowTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  careerRowFaculty: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  minApsBadge: {
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '0.2rem 0.5rem',
    borderRadius: '0.25rem',
  },
  detailCard: {
    background: 'var(--bg-card)',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    gap: '0.5rem',
  },
  detailTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--text-main)',
  },
  demandLabel: {
    fontSize: '0.65rem',
    fontWeight: '800',
    padding: '0.2rem 0.5rem',
    borderRadius: '0.25rem',
  },
  detailFaculty: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    marginTop: '0.15rem',
  },
  detailDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    margin: '0.75rem 0',
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  metricItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
  },
  metricLabel: {
    display: 'block',
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  metricValue: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  deepDiveGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1rem',
    marginBottom: '1.25rem',
  },
  checklistSection: {
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.75rem',
    padding: '0.75rem 1rem',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  widgetSubTitle: {
    fontSize: '0.8rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
  },
  checklistWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.6rem',
  },
  checklistItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  checkCircle: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  checklistLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    lineHeight: '1.2',
  },
  checklistVal: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
  },
  mapSection: {
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.75rem',
    padding: '0.75rem 1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
  },
  mapWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  mapTooltip: {
    fontSize: '0.65rem',
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    padding: '0.1rem 0.4rem',
    borderRadius: '0.25rem',
    color: 'var(--text-main)',
  },
  legend: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
    marginTop: '0.5rem',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.6rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
  },
  legendColor: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  jobsBox: {
    background: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    marginTop: 'auto',
  },
  jobsList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.4rem',
  },
  jobTag: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'var(--primary-emerald-light)',
    color: 'var(--primary-emerald)',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.35rem',
  }
};

export default CareerSimulator;
