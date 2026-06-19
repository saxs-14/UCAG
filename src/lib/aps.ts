import type { Subject, APSResult, EligibilityCheck, CareerPath } from '@/types';

export function getApsLevel(mark: number, name: string): number {
  const isLifeOrientation = name.toLowerCase().includes('life orientation');
  if (isLifeOrientation) {
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
}

export function calculateAPS(subjects: Subject[]): APSResult {
  const loSubject = subjects.find(s => s.name.toLowerCase().includes('life orientation'));
  const academic = subjects.filter(s => !s.name.toLowerCase().includes('life orientation'));

  const withLevels = academic.map(s => ({
    name: s.name,
    mark: s.mark,
    level: getApsLevel(s.mark, s.name),
  }));

  const sorted = [...withLevels].sort((a, b) => b.level - a.level);
  const best6 = sorted.slice(0, 6);
  const standardAps = best6.reduce((sum, s) => sum + s.level, 0);

  const loPoints = loSubject ? getApsLevel(loSubject.mark, loSubject.name) : 0;
  const umpAps = standardAps + loPoints;

  const allWithLevels = [
    ...withLevels,
    ...(loSubject ? [{ name: loSubject.name, mark: loSubject.mark, level: loPoints }] : []),
  ];

  const languages = subjects.filter(s =>
    s.name.toLowerCase().includes('language') ||
    s.name.toLowerCase().includes('english') ||
    s.name.toLowerCase().includes('zulu') ||
    s.name.toLowerCase().includes('isizulu') ||
    s.name.toLowerCase().includes('sepedi') ||
    s.name.toLowerCase().includes('tsonga') ||
    s.name.toLowerCase().includes('xitsonga') ||
    s.name.toLowerCase().includes('siswati') ||
    s.name.toLowerCase().includes('home') ||
    s.name.toLowerCase().includes('additional')
  );
  const bestLangMark = languages.length > 0 ? Math.max(...languages.map(l => l.mark)) : 0;

  const lvl4Count = academic.filter(s => s.mark >= 50).length;
  const lvl3Count = academic.filter(s => s.mark >= 40).length;
  const lvl2Count = academic.filter(s => s.mark >= 30).length;

  const hasBachelorPass = standardAps >= 26 && lvl4Count >= 4 && bestLangMark >= 50;
  const hasDiplomaPass = standardAps >= 19 && (lvl4Count >= 4 || lvl3Count >= 4) && bestLangMark >= 40;
  const hasHigherCertPass = standardAps >= 15 && lvl2Count >= 3 && bestLangMark >= 30;

  let tier: APSResult['qualificationTier'];
  let label: string;
  let desc: string;

  if (hasBachelorPass) {
    tier = 'bachelor';
    label = 'Bachelor Degree Admission';
    desc = `APS ${standardAps} — qualifies for bachelor degree study at UMP. English/Home Language met at Level 4+.`;
  } else if (hasDiplomaPass) {
    tier = 'diploma';
    label = 'Diploma Admission';
    desc = `APS ${standardAps} — qualifies for diploma programmes. Consider improving two or three subjects to unlock bachelor entry.`;
  } else if (hasHigherCertPass) {
    tier = 'higher-cert';
    label = 'Higher Certificate Admission';
    desc = `APS ${standardAps} — qualifies for Higher Certificate. UMP's Extended Curriculum Programme (ECP) is a direct pathway to full degree study.`;
  } else {
    tier = 'none';
    label = 'National Senior Certificate (Foundation Pathway Recommended)';
    desc = `APS ${standardAps} — currently below minimum university thresholds. UMP's Foundation Studies bridging programme is designed specifically for this.`;
  }

  return {
    standardAps,
    umpAps,
    subjectLevels: allWithLevels,
    qualificationTier: tier,
    qualificationLabel: label,
    qualificationDesc: desc,
  };
}

export function checkCareerEligibility(career: CareerPath, subjects: Subject[], apsScore: number): EligibilityCheck[] {
  const get = (term: string) => subjects.find(s => s.name.toLowerCase().includes(term.toLowerCase()));
  const maths     = get('mathematics') ?? get('maths');
  const mathsLit  = get('mathematical literacy');
  const physSci   = get('physical sciences') ?? get('physical sci');
  const lifeSci   = get('life sciences');
  const engHL     = subjects.find(s => s.name.toLowerCase().includes('english') && (s.name.toLowerCase().includes('home') || s.name.toLowerCase().includes('hl')));
  const engFAL    = subjects.find(s => s.name.toLowerCase().includes('english') && (s.name.toLowerCase().includes('additional') || s.name.toLowerCase().includes('fal')));
  const eng       = engHL ?? engFAL ?? get('english');
  const geo       = get('geography');

  const checks: EligibilityCheck[] = [];

  checks.push({
    label: `APS Score ≥ ${career.minAps}`,
    met: apsScore >= career.minAps,
    detail: `Your APS: ${apsScore} (required: ${career.minAps})`,
  });

  switch (career.id) {
    case 'bsc-agriculture':
      checks.push({ label: 'Mathematics ≥ 50% (Level 4)', met: !!(maths && maths.mark >= 50), detail: maths ? `Maths: ${maths.mark}%` : 'Mathematics not found' });
      checks.push({ label: 'Physical Sciences or Life Sciences ≥ 50%', met: !!(physSci && physSci.mark >= 50) || !!(lifeSci && lifeSci.mark >= 50), detail: [physSci && `PhysSci: ${physSci.mark}%`, lifeSci && `LifeSci: ${lifeSci.mark}%`].filter(Boolean).join(', ') || 'No science subject found' });
      break;
    case 'bsc-cs':
      checks.push({ label: 'Mathematics ≥ 60% (Level 5)', met: !!(maths && maths.mark >= 60), detail: maths ? `Maths: ${maths.mark}%` : 'Mathematics not found' });
      break;
    case 'bed':
      checks.push({ label: 'English HL ≥ 50% OR English FAL ≥ 60%', met: !!(engHL && engHL.mark >= 50) || !!(engFAL && engFAL.mark >= 60) || !!(eng && eng.mark >= 60), detail: eng ? `English: ${eng.mark}%` : 'English not found' });
      break;
    case 'dev-studies':
      checks.push({ label: 'English ≥ 50% (Level 4)', met: !!(eng && eng.mark >= 50), detail: eng ? `English: ${eng.mark}%` : 'English not found' });
      break;
    case 'dip-hospitality':
      checks.push({ label: 'English ≥ 40% (Level 3)', met: !!(eng && eng.mark >= 40), detail: eng ? `English: ${eng.mark}%` : 'English not found' });
      break;
    case 'bsc-nursing':
      checks.push({ label: 'Life Sciences ≥ 50% (Level 4)', met: !!(lifeSci && lifeSci.mark >= 50), detail: lifeSci ? `Life Sciences: ${lifeSci.mark}%` : 'Life Sciences not found' });
      checks.push({ label: 'English ≥ 50% (Level 4)', met: !!(eng && eng.mark >= 50), detail: eng ? `English: ${eng.mark}%` : 'English not found' });
      break;
    case 'llb':
      checks.push({ label: 'English HL ≥ 50% OR English FAL ≥ 60%', met: !!(engHL && engHL.mark >= 50) || !!(engFAL && engFAL.mark >= 60) || !!(eng && eng.mark >= 55), detail: eng ? `English: ${eng.mark}%` : 'English not found' });
      break;
    case 'bsc-env':
      checks.push({ label: 'Life Sciences ≥ 50% (Level 4)', met: !!(lifeSci && lifeSci.mark >= 50), detail: lifeSci ? `Life Sciences: ${lifeSci.mark}%` : 'Life Sciences not found' });
      checks.push({ label: 'Mathematics ≥ 40% (Level 3)', met: !!(maths && maths.mark >= 40), detail: maths ? `Maths: ${maths.mark}%` : 'Mathematics not found' });
      checks.push({ label: 'Geography or Physical Sciences ≥ 50%', met: !!(geo && geo.mark >= 50) || !!(physSci && physSci.mark >= 50), detail: [geo && `Geo: ${geo.mark}%`, physSci && `PhysSci: ${physSci.mark}%`].filter(Boolean).join(', ') || 'Not found' });
      break;
    case 'bsw':
      checks.push({ label: 'English ≥ 50% (Level 4)', met: !!(eng && eng.mark >= 50), detail: eng ? `English: ${eng.mark}%` : 'English not found' });
      break;
    case 'dip-ict':
      checks.push({ label: 'Mathematics ≥ 40% OR Maths Literacy ≥ 60%', met: !!(maths && maths.mark >= 40) || !!(mathsLit && mathsLit.mark >= 60), detail: maths ? `Maths: ${maths.mark}%` : mathsLit ? `Maths Lit: ${mathsLit.mark}%` : 'Not found' });
      break;
  }

  return checks;
}
