"use client";

import { useMemo, useState } from "react";
import { SubjectCombobox } from "./SubjectCombobox";
import { MarkInput } from "./MarkInput";
import { ICON_SIZE, TargetIcon } from "@/components/icons/Icon";
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

const CALC_STAGES = [
  "Reading your subjects and marks...",
  "Applying the institution's APS rules...",
  "Matching against verified programmes...",
  "Done.",
] as const;
const CALC_STAGE_MS = 320;

interface ElectiveSlot {
  code: string | null;
  percentage: number | null;
}

export function SubjectForm({
  onMarksChange,
  onInstitutionChange,
  initialState,
}: {
  onMarksChange?: (marks: SubjectMarkInput[]) => void;
  onInstitutionChange?: (institutionId: string) => void;
  initialState?: SubjectFormInitialState;
}) {
  const [homeLanguage, setHomeLanguage] = useState<LanguageOption | "">(initialState?.homeLanguage ?? "");
  const [homeLanguageMark, setHomeLanguageMark] = useState<number | null>(initialState?.homeLanguageMark ?? null);
  const [firstAdditionalLanguage, setFirstAdditionalLanguage] = useState<LanguageOption | "">(initialState?.firstAdditionalLanguage ?? "");
  const [firstAdditionalLanguageMark, setFirstAdditionalLanguageMark] = useState<number | null>(initialState?.firstAdditionalLanguageMark ?? null);
  const [mathematics, setMathematics] = useState<MathematicsOption | "">(initialState?.mathematics ?? "");
  const [mathematicsMark, setMathematicsMark] = useState<number | null>(initialState?.mathematicsMark ?? null);
  const [lifeOrientationMark, setLifeOrientationMark] = useState<number | null>(initialState?.lifeOrientationMark ?? null);
  const [electives, setElectives] = useState<ElectiveSlot[]>(() => {
    const seeded: ElectiveSlot[] = initialState?.electives.map((e) => ({ ...e })) ?? [];
    while (seeded.length < MIN_ELECTIVES) seeded.push({ code: null, percentage: null });
    return seeded;
  });
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [targetInstitution, setTargetInstitution] = useState("ump");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [calcStage, setCalcStage] = useState<number | null>(null);

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

  function validateAll(): string | null {
    if (!homeLanguage || homeLanguageMark === null) return "Select your Home Language and enter its mark.";
    if (!firstAdditionalLanguage || firstAdditionalLanguageMark === null) return "Select your First Additional Language and enter its mark.";
    if (!mathematics || mathematicsMark === null) return "Choose Mathematics or Mathematical Literacy and enter the mark.";
    if (lifeOrientationMark === null) return "Enter your Life Orientation mark.";
    if (electives.filter((e) => e.code && e.percentage !== null).length < MIN_ELECTIVES) return `Add marks for at least ${MIN_ELECTIVES} elective subjects.`;
    return null;
  }

  function calculate() {
    const error = validateAll();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);

    const prefersReducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      onMarksChange?.(marks);
      return;
    }

    setCalcStage(0);
    let stage = 0;
    const advance = () => {
      stage += 1;
      if (stage >= CALC_STAGES.length) {
        setCalcStage(null);
        onMarksChange?.(marks);
        return;
      }
      setCalcStage(stage);
      window.setTimeout(advance, CALC_STAGE_MS);
    };
    window.setTimeout(advance, CALC_STAGE_MS);
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

  return (
    <form className="animate-rise-in flex w-full max-w-3xl flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-teal to-teal-900 p-8 text-white shadow-lg">
        <p className="text-xs font-extrabold uppercase tracking-widest text-teal-200">Your NSC Results</p>
        <h2 className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl">Enter your subjects below</h2>
        <p className="mt-3 text-sm font-medium leading-relaxed text-teal-50 sm:text-base">
          Your marks stay secure on your device until you choose to calculate your matches.
        </p>
      </div>

      <section className="flex flex-col gap-6 rounded-3xl border border-line bg-paper-raised p-6 shadow-sm sm:p-8" aria-labelledby="languages-title">
        <div>
          <h2 id="languages-title" className="font-display text-xl font-black text-ink">1. Your Languages</h2>
          <p className="mt-1 text-sm font-medium text-ink-soft">Choose subjects exactly as they appear on your NSC results certificate.</p>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-line/60 bg-paper-raised p-5 shadow-sm">
            <label className="text-sm font-bold text-ink" htmlFor="home-language">Home Language</label>
            <select
              id="home-language"
              className="mt-2.5 h-12 w-full cursor-pointer rounded-xl border border-line bg-slate-soft px-4 text-base font-semibold text-ink transition-all focus:border-brand-teal focus:bg-paper-raised focus:outline-none focus:ring-4 focus:ring-brand-teal/20"
              value={homeLanguage}
              onChange={(e) => {
                const next = e.target.value as LanguageOption | "";
                setHomeLanguage(next);
                if (next === firstAdditionalLanguage) setFirstAdditionalLanguage("");
              }}
            >
              <option value="">Select your Home Language</option>
              {HOME_LANGUAGE_OPTIONS.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
            </select>
            {homeLanguage && <div className="mt-4 border-t border-line/60 pt-4"><MarkInput label={`${homeLanguage} (Home Language)`} percentage={homeLanguageMark} onChange={setHomeLanguageMark} /></div>}
          </div>

          <div className="rounded-2xl border border-line/60 bg-paper-raised p-5 shadow-sm">
            <label className="text-sm font-bold text-ink" htmlFor="fal">First Additional Language</label>
            <select
              id="fal"
              className="mt-2.5 h-12 w-full cursor-pointer rounded-xl border border-line bg-slate-soft px-4 text-base font-semibold text-ink transition-all focus:border-brand-teal focus:bg-paper-raised focus:outline-none focus:ring-4 focus:ring-brand-teal/20"
              value={firstAdditionalLanguage}
              onChange={(e) => setFirstAdditionalLanguage(e.target.value as LanguageOption | "")}
            >
              <option value="">Select your First Additional Language</option>
              {firstAdditionalLanguageOptions.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
            </select>
            {firstAdditionalLanguage && <div className="mt-4 border-t border-line/60 pt-4"><MarkInput label={`${firstAdditionalLanguage} (First Additional)`} percentage={firstAdditionalLanguageMark} onChange={setFirstAdditionalLanguageMark} /></div>}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6 rounded-3xl border border-line bg-paper-raised p-6 shadow-sm sm:p-8" aria-labelledby="maths-title">
        <div>
          <h2 id="maths-title" className="font-display text-xl font-black text-ink">2. Mathematics or Math Literacy</h2>
          <p className="mt-1 text-sm font-medium text-ink-soft">Select your mathematical subject type and enter your percentage.</p>
        </div>
        
        <div className="flex flex-col gap-4 rounded-2xl border border-line/60 bg-paper-raised p-5 shadow-sm">
          <select
            id="mathematics"
            aria-label="Mathematics type"
            className="h-12 w-full cursor-pointer rounded-xl border border-line bg-slate-soft px-4 text-base font-bold text-ink transition-all focus:border-brand-teal focus:bg-paper-raised focus:outline-none focus:ring-4 focus:ring-brand-teal/20"
            value={mathematics}
            onChange={(e) => setMathematics(e.target.value as MathematicsOption | "")}
          >
            <option value="">Select Mathematics or Math Literacy</option>
            {MATHEMATICS_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          {mathematics && <div className="border-t border-line/60 pt-4"><MarkInput label={mathematics} percentage={mathematicsMark} onChange={setMathematicsMark} /></div>}
          <p className="text-xs font-medium text-ink-faint">Different programmes require specific math subjects. UCAG keeps this distinction clear.</p>
        </div>
      </section>

      <section className="flex flex-col gap-6 rounded-3xl border border-line bg-paper-raised p-6 shadow-sm sm:p-8" aria-labelledby="lo-title">
        <div>
          <h2 id="lo-title" className="font-display text-xl font-black text-ink">3. Life Orientation</h2>
          <p className="mt-1 text-sm font-medium text-ink-soft">Enter the percentage shown on your NSC certificate.</p>
        </div>
        
        <div className="rounded-2xl border border-line/60 bg-paper-raised p-5 shadow-sm">
          <MarkInput label="Life Orientation" percentage={lifeOrientationMark} onChange={setLifeOrientationMark} />
        </div>
      </section>

      <section className="flex flex-col gap-6 rounded-3xl border border-line bg-paper-raised p-6 shadow-sm sm:p-8" aria-labelledby="electives-title">
        <div>
          <h2 id="electives-title" className="font-display text-xl font-black text-ink">4. Elective Subjects</h2>
          <p className="mt-1 text-sm font-medium text-ink-soft">Choose at least 3 elective subjects and enter your marks.</p>
        </div>

        <div className="flex flex-col gap-4">
          {electives.map((elective, index) => {
            const availableOptions = ELECTIVE_SUBJECTS.filter((s) => s.code === elective.code || !selectedElectiveCodes.includes(s.code));
            return (
              <div key={index} className={`flex flex-col gap-4 rounded-2xl border border-line/60 bg-paper-raised p-5 shadow-sm transition-all ${removingIndex === index ? "animate-pop-out" : "animate-pop-in"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <SubjectCombobox label={`Elective Subject ${index + 1}`} options={availableOptions} value={elective.code} onChange={(code) => updateElective(index, { code, percentage: null })} />
                  </div>
                  {electives.length > MIN_ELECTIVES && (
                    <button type="button" onClick={() => removeElective(index)} className="mt-8 text-xs font-bold text-mark-red transition-colors hover:underline" disabled={removingIndex === index}>
                      Remove
                    </button>
                  )}
                </div>
                {elective.code && (
                  <div className="border-t border-line/60 pt-4">
                    <MarkInput label={ELECTIVE_SUBJECTS.find((s) => s.code === elective.code)?.name ?? ""} percentage={elective.percentage} onChange={(percentage) => updateElective(index, { percentage })} />
                  </div>
                )}
              </div>
            );
          })}
          {electives.length < MAX_ELECTIVES && (
            <button type="button" onClick={addElective} className="flex min-h-14 items-center justify-center rounded-2xl border-2 border-dashed border-brand-teal/50 bg-brand-teal/5 px-6 text-sm font-bold text-brand-teal transition-colors hover:bg-brand-teal/10">
              + Add another elective subject
            </button>
          )}
        </div>
      </section>

      <section className="rounded-3xl border-2 border-brand-teal/30 bg-brand-teal/5 p-6 shadow-sm sm:p-8">
        <label htmlFor="target-institution" className="font-display text-lg font-bold text-ink">Preferred Institution Rule</label>
        <select
          id="target-institution"
          className="mt-3 h-12 w-full cursor-pointer rounded-xl border border-line bg-paper-raised px-4 text-base font-bold text-ink transition-all focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20"
          value={targetInstitution}
          onChange={(e) => {
            setTargetInstitution(e.target.value);
            onInstitutionChange?.(e.target.value);
          }}
        >
          <option value="ump">University of Mpumalanga</option>
          <option value="up">University of Pretoria</option>
          <option value="wits">University of the Witwatersrand</option>
          <option value="uj">University of Johannesburg</option>
          <option value="tut">Tshwane University of Technology</option>
          <option value="all">All South African Universities</option>
        </select>
        <p className="mt-2 text-xs font-medium text-ink-soft">Programmes use verified institutional calculation rules automatically.</p>
      </section>

      {validationError && (
        <div role="alert" className="rounded-2xl border border-mark-red/30 bg-mark-red/10 p-5 text-sm font-bold text-mark-red shadow-sm">
          {validationError}
        </div>
      )}

      <button
        type="button"
        onClick={calculate}
        disabled={calcStage !== null}
        aria-live="polite"
        className="flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-brand-teal px-8 text-lg font-black text-white shadow-xl shadow-brand-teal/30 transition-transform hover:-translate-y-0.5 active:scale-[0.97] disabled:cursor-wait disabled:opacity-90"
      >
        {calcStage !== null ? (
          <>
            <span className="h-6 w-6 shrink-0 animate-spin rounded-full border-3 border-white/40 border-t-white" aria-hidden="true" />
            {CALC_STAGES[calcStage]}
          </>
        ) : (
          <>
            <TargetIcon size={ICON_SIZE.md} />
            Calculate & Find My Options 🚀
          </>
        )}
      </button>
    </form>
  );
}