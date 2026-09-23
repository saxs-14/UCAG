// cSpell:words Matric Mpumalanga Tshwane
"use client";

import { useMemo, useState } from "react";
import { SubjectCombobox } from "./SubjectCombobox";
import { MarkInput } from "./MarkInput";
import {
  ELECTIVE_SUBJECTS,
  FIRST_ADDITIONAL_LANGUAGE_OPTIONS,
  HOME_LANGUAGE_OPTIONS,
  MATHEMATICS_CODES,
  MATHEMATICS_OPTIONS,
  getLanguageSubjectCode,
  type LanguageOption,
  type MathematicsOption,
  type SubjectFormInitialState,
} from "@/config/subjects";
import type { SubjectMarkInput } from "@/lib/aps/types";

const LIFE_ORIENTATION_CODE = "LO";
const MIN_ELECTIVES = 3;
const MAX_ELECTIVES = 4;

interface ElectiveSlot {
  code: string | null;
  percentage: number | null;
}

const STEPS = [
  { title: "Languages", hint: "Your two language marks" },
  { title: "Maths", hint: "Mathematics or Mathematical Literacy" },
  { title: "LO", hint: "Life Orientation" },
  { title: "Electives", hint: "Choose at least 3 subjects" },
  { title: "Review", hint: "Check everything before matching" },
];

export function SubjectForm({
  onMarksChange,
  initialState,
}: {
  onMarksChange?: (marks: SubjectMarkInput[]) => void;
  initialState?: SubjectFormInitialState;
}) {
  const [step, setStep] = useState(0);
  const [homeLanguage, setHomeLanguage] = useState<LanguageOption | "">(initialState?.homeLanguage ?? "");
  const [homeLanguageMark, setHomeLanguageMark] = useState<number | null>(initialState?.homeLanguageMark ?? null);
  const [firstAdditionalLanguage, setFirstAdditionalLanguage] = useState<LanguageOption | "">(initialState?.firstAdditionalLanguage ?? "");
  const [firstAdditionalLanguageMark, setFirstAdditionalLanguageMark] = useState<number | null>(initialState?.firstAdditionalLanguageMark ?? null);
  const [mathematics, setMathematics] = useState<MathematicsOption | "">(initialState?.mathematics ?? "");
  const [mathematicsMark, setMathematicsMark] = useState<number | null>(initialState?.mathematicsMark ?? null);
  const [lifeOrientationMark, setLifeOrientationMark] = useState<number | null>(initialState?.lifeOrientationMark ?? null);
  const [electives, setElectives] = useState<ElectiveSlot[]>(() => {
    const seeded = initialState?.electives.map((e) => ({ ...e })) ?? [];
    while (seeded.length < MIN_ELECTIVES) seeded.push({ code: null, percentage: null });
    return seeded;
  });
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [targetInstitution, setTargetInstitution] = useState("ump");
  const [validationError, setValidationError] = useState<string | null>(null);

  const firstAdditionalLanguageOptions = FIRST_ADDITIONAL_LANGUAGE_OPTIONS.filter((lang) => lang !== homeLanguage);
  const selectedElectiveCodes = electives.map((e) => e.code).filter(Boolean);

  const marks: SubjectMarkInput[] = useMemo(() => {
    const result: SubjectMarkInput[] = [];
    if (homeLanguage && homeLanguageMark !== null) result.push({ subjectCode: getLanguageSubjectCode(homeLanguage, "home"), percentage: homeLanguageMark });
    if (firstAdditionalLanguage && firstAdditionalLanguageMark !== null) result.push({ subjectCode: getLanguageSubjectCode(firstAdditionalLanguage, "firstAdditional"), percentage: firstAdditionalLanguageMark });
    if (mathematics && mathematicsMark !== null) result.push({ subjectCode: MATHEMATICS_CODES[mathematics], percentage: mathematicsMark });
    if (lifeOrientationMark !== null) result.push({ subjectCode: LIFE_ORIENTATION_CODE, percentage: lifeOrientationMark });
    for (const elective of electives) if (elective.code && elective.percentage !== null) result.push({ subjectCode: elective.code, percentage: elective.percentage });
    return result;
  }, [homeLanguage, homeLanguageMark, firstAdditionalLanguage, firstAdditionalLanguageMark, mathematics, mathematicsMark, lifeOrientationMark, electives]);

  function validateStep(currentStep: number) {
    if (currentStep === 0) {
      if (!homeLanguage || homeLanguageMark === null) return "Select your Home Language and enter its mark.";
      if (!firstAdditionalLanguage || firstAdditionalLanguageMark === null) return "Select your First Additional Language and enter its mark.";
    }
    if (currentStep === 1 && (!mathematics || mathematicsMark === null)) return "Choose Mathematics or Mathematical Literacy and enter the mark.";
    if (currentStep === 2 && lifeOrientationMark === null) return "Enter your Life Orientation mark.";
    if (currentStep === 3 && electives.filter((e) => e.code && e.percentage !== null).length < MIN_ELECTIVES) return `Add marks for at least ${MIN_ELECTIVES} elective subjects.`;
    return null;
  }

  function continueStep() {
    const error = validateStep(step);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function calculate() {
    const firstInvalid = [0, 1, 2, 3].find((index) => validateStep(index));
    if (firstInvalid !== undefined) {
      setStep(firstInvalid);
      setValidationError(validateStep(firstInvalid));
      return;
    }
    setValidationError(null);
    onMarksChange?.(marks);
  }

  function updateElective(index: number, patch: Partial<ElectiveSlot>) {
    setElectives((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }

  function addElective() {
    if (electives.length < MAX_ELECTIVES) setElectives((prev) => [...prev, { code: null, percentage: null }]);
  }

  function removeElective(index: number) {
    if (electives.length <= MIN_ELECTIVES) return;
    setRemovingIndex(index);
    window.setTimeout(() => {
      setElectives((prev) => prev.filter((_, i) => i !== index));
      setRemovingIndex(null);
    }, 180);
  }

  const completed = [
    Boolean(homeLanguage && homeLanguageMark !== null && firstAdditionalLanguage && firstAdditionalLanguageMark !== null),
    Boolean(mathematics && mathematicsMark !== null),
    lifeOrientationMark !== null,
    electives.filter((e) => e.code && e.percentage !== null).length >= MIN_ELECTIVES,
    false,
  ];

  return (
    <form className="animate-rise-in flex w-full max-w-2xl flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
      <div className="rounded-2xl border border-line bg-paper-raised p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-teal">Your NSC results</p>
            <h2 className="mt-1 text-lg font-bold text-ink sm:text-xl">Let’s do this one step at a time.</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">No need to enter everything at once. Your answers stay on this page until you choose to calculate.</p>
          </div>
          <span className="hidden rounded-full bg-brand-teal-soft px-3 py-1 text-xs font-bold text-brand-teal sm:inline-flex">{step + 1} of {STEPS.length}</span>
        </div>
      </div>

      <nav aria-label="APS calculator progress" className="rounded-2xl border border-line bg-paper-raised p-3">
        <ol className="grid grid-cols-5 gap-1">
          {STEPS.map((item, index) => (
            <li key={item.title}>
              <button
                type="button"
                onClick={() => index <= step && setStep(index)}
                disabled={index > step}
                aria-current={index === step ? "step" : undefined}
                className={`flex min-h-12 w-full flex-col items-center justify-center rounded-xl px-1 text-center transition-colors ${
                  index === step ? "bg-brand-teal text-white" : completed[index] ? "bg-brand-teal-soft text-brand-teal" : "text-ink-faint"
                }`}
              >
                <span className="text-xs font-extrabold">{completed[index] && index !== step ? "✓" : index + 1}</span>
                <span className="hidden text-2xs font-semibold sm:block">{item.title}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="mt-2 text-center text-xs font-medium text-ink-soft">{STEPS[step].hint}</p>
      </nav>

      {step === 0 && (
        <section className="flex flex-col gap-4 rounded-2xl border border-line bg-paper-raised p-4 shadow-sm sm:p-5" aria-labelledby="languages-title">
          <div><h2 id="languages-title" className="text-base font-bold text-ink">1. Your languages</h2><p className="mt-1 text-sm text-ink-soft">Choose the subjects exactly as they appear on your NSC results.</p></div>
          <div className="rounded-xl border border-line/60 bg-paper p-3.5">
            <label className="text-sm font-semibold text-ink" htmlFor="home-language">Home Language</label>
            <select id="home-language" className="mt-2 min-h-11 w-full rounded-xl border border-line bg-paper-raised px-3.5 text-base text-ink" value={homeLanguage} onChange={(e) => { const next = e.target.value as LanguageOption | ""; setHomeLanguage(next); if (next === firstAdditionalLanguage) setFirstAdditionalLanguage(""); }}>
              <option value="">Select your Home Language</option>{HOME_LANGUAGE_OPTIONS.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
            </select>
            {homeLanguage && <div className="mt-3 border-t border-line/40 pt-3"><MarkInput label={`${homeLanguage} (HL)`} percentage={homeLanguageMark} onChange={setHomeLanguageMark} /></div>}
          </div>
          <div className="rounded-xl border border-line/60 bg-paper p-3.5">
            <label className="text-sm font-semibold text-ink" htmlFor="fal">First Additional Language</label>
            <select id="fal" className="mt-2 min-h-11 w-full rounded-xl border border-line bg-paper-raised px-3.5 text-base text-ink" value={firstAdditionalLanguage} onChange={(e) => setFirstAdditionalLanguage(e.target.value as LanguageOption | "")}>
              <option value="">Select your First Additional Language</option>{firstAdditionalLanguageOptions.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
            </select>
            {firstAdditionalLanguage && <div className="mt-3 border-t border-line/40 pt-3"><MarkInput label={`${firstAdditionalLanguage} (FAL)`} percentage={firstAdditionalLanguageMark} onChange={setFirstAdditionalLanguageMark} /></div>}
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="flex flex-col gap-4 rounded-2xl border border-line bg-paper-raised p-4 shadow-sm sm:p-5" aria-labelledby="maths-title">
          <div><h2 id="maths-title" className="text-base font-bold text-ink">2. Your Maths mark</h2><p className="mt-1 text-sm text-ink-soft">Tell us whether you took Mathematics or Mathematical Literacy.</p></div>
          <select id="mathematics" aria-label="Mathematics type" className="min-h-12 w-full rounded-xl border border-line bg-paper-raised px-3.5 text-base font-semibold text-ink" value={mathematics} onChange={(e) => setMathematics(e.target.value as MathematicsOption | "")}>
            <option value="">Select your Maths subject</option>{MATHEMATICS_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          {mathematics && <MarkInput label={mathematics} percentage={mathematicsMark} onChange={setMathematicsMark} />}
          <div className="rounded-xl bg-brand-teal-soft/60 p-3 text-xs leading-relaxed text-ink-soft"><strong className="text-ink">Why we ask:</strong> different programmes can require Mathematics or Mathematical Literacy, so UCAG keeps the distinction.</div>
        </section>
      )}

      {step === 2 && (
        <section className="flex flex-col gap-4 rounded-2xl border border-line bg-paper-raised p-4 shadow-sm sm:p-5" aria-labelledby="lo-title">
          <div><h2 id="lo-title" className="text-base font-bold text-ink">3. Life Orientation</h2><p className="mt-1 text-sm text-ink-soft">Enter the percentage shown on your results.</p></div>
          <MarkInput label="Life Orientation" percentage={lifeOrientationMark} onChange={setLifeOrientationMark} />
          <p className="text-xs text-ink-faint">UCAG applies the verified institution rule when calculating a programme match. We do not assume every university uses LO in the same way.</p>
        </section>
      )}

      {step === 3 && (
        <section className="flex flex-col gap-4 rounded-2xl border border-line bg-paper-raised p-4 shadow-sm sm:p-5" aria-labelledby="electives-title">
          <div><h2 id="electives-title" className="text-base font-bold text-ink">4. Your other subjects</h2><p className="mt-1 text-sm text-ink-soft">Choose at least 3 elective subjects and enter each mark.</p></div>
          {electives.map((elective, index) => {
            const availableOptions = ELECTIVE_SUBJECTS.filter((s) => s.code === elective.code || !selectedElectiveCodes.includes(s.code));
            return (
              <div key={index} className={`flex flex-col gap-3 rounded-xl border border-line bg-paper p-3.5 ${removingIndex === index ? "animate-pop-out" : "animate-pop-in"}`}>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1"><SubjectCombobox label={`Elective Subject ${index + 1}`} options={availableOptions} value={elective.code} onChange={(code) => updateElective(index, { code, percentage: null })} /></div>
                  {electives.length > MIN_ELECTIVES && <button type="button" onClick={() => removeElective(index)} className="min-h-11 px-2 text-xs font-bold text-mark-red hover:underline" disabled={removingIndex === index}>Remove</button>}
                </div>
                {elective.code && <div className="border-t border-line/40 pt-2"><MarkInput label={ELECTIVE_SUBJECTS.find((s) => s.code === elective.code)?.name ?? ""} percentage={elective.percentage} onChange={(percentage) => updateElective(index, { percentage })} /></div>}
              </div>
            );
          })}
          {electives.length < MAX_ELECTIVES && <button type="button" onClick={addElective} className="min-h-11 rounded-xl border-2 border-dashed border-brand-teal/50 bg-brand-teal-soft/30 px-4 text-sm font-bold text-brand-teal hover:bg-brand-teal-soft">+ Add another subject</button>}
        </section>
      )}

      {step === 4 && (
        <section className="flex flex-col gap-4 rounded-2xl border border-line bg-paper-raised p-4 shadow-sm sm:p-5" aria-labelledby="review-title">
          <div><h2 id="review-title" className="text-base font-bold text-ink">5. Check your results</h2><p className="mt-1 text-sm text-ink-soft">Review your entries before UCAG matches you with programmes.</p></div>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              [homeLanguage || "Home Language", homeLanguageMark],
              [firstAdditionalLanguage || "First Additional Language", firstAdditionalLanguageMark],
              [mathematics || "Maths", mathematicsMark],
              ["Life Orientation", lifeOrientationMark],
              ...electives.filter((e) => e.code).map((e) => [ELECTIVE_SUBJECTS.find((s) => s.code === e.code)?.name ?? e.code ?? "Subject", e.percentage] as [string, number | null]),
            ].map(([name, mark]) => (
              <div key={name} className="flex items-center justify-between rounded-xl border border-line/60 bg-paper p-3">
                <span className="pr-2 text-sm font-semibold text-ink">{name}</span><span className="shrink-0 text-lg font-extrabold tabular-nums text-brand-teal">{mark ?? "—"}%</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-brand-teal/30 bg-brand-teal-soft/40 p-3">
            <label htmlFor="target-institution" className="text-xs font-bold uppercase tracking-wider text-ink">Matching rule</label>
            <select id="target-institution" className="mt-2 min-h-11 w-full rounded-xl border border-line bg-paper-raised px-3.5 text-base font-semibold text-ink" value={targetInstitution} onChange={(e) => setTargetInstitution(e.target.value)}>
              <option value="ump">University of Mpumalanga</option><option value="up">University of Pretoria</option><option value="wits">University of the Witwatersrand</option><option value="uj">University of Johannesburg</option><option value="tut">Tshwane University of Technology</option><option value="all">All South African Universities</option>
            </select>
            <p className="mt-2 text-xs text-ink-soft">The programme catalogue uses verified institutional rules where available.</p>
          </div>
        </section>
      )}

      {validationError && <p role="alert" className="rounded-xl border border-mark-red/30 bg-mark-red-soft p-3 text-sm font-semibold text-mark-red">{validationError}</p>}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <button type="button" onClick={() => { setValidationError(null); setStep((current) => Math.max(0, current - 1)); }} disabled={step === 0} className="min-h-12 rounded-xl border border-line bg-paper-raised px-5 text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-40">← Back</button>
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={continueStep} className="min-h-12 rounded-xl bg-brand-teal px-6 text-sm font-extrabold text-white shadow-sm hover:bg-teal-700">Continue →</button>
        ) : (
          <button type="button" onClick={calculate} className="min-h-12 rounded-xl bg-brand-teal px-6 text-sm font-extrabold text-white shadow-sm hover:bg-teal-700">🎯 Calculate & find my options</button>
        )}
      </div>
    </form>
  );
}
