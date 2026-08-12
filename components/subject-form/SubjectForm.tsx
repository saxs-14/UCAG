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

export function SubjectForm({
  onMarksChange,
  initialState,
}: {
  onMarksChange?: (marks: SubjectMarkInput[]) => void;
  initialState?: SubjectFormInitialState;
}) {
  const [homeLanguage, setHomeLanguage] = useState<LanguageOption | "">(
    initialState?.homeLanguage ?? ""
  );
  const [homeLanguageMark, setHomeLanguageMark] = useState<number | null>(
    initialState?.homeLanguageMark ?? null
  );

  const [firstAdditionalLanguage, setFirstAdditionalLanguage] = useState<LanguageOption | "">(
    initialState?.firstAdditionalLanguage ?? ""
  );
  const [firstAdditionalLanguageMark, setFirstAdditionalLanguageMark] = useState<number | null>(
    initialState?.firstAdditionalLanguageMark ?? null
  );

  const [mathematics, setMathematics] = useState<MathematicsOption | "">(
    initialState?.mathematics ?? ""
  );
  const [mathematicsMark, setMathematicsMark] = useState<number | null>(
    initialState?.mathematicsMark ?? null
  );

  const [lifeOrientationMark, setLifeOrientationMark] = useState<number | null>(
    initialState?.lifeOrientationMark ?? null
  );

  const [electives, setElectives] = useState<ElectiveSlot[]>(() => {
    const seeded: ElectiveSlot[] = initialState?.electives.map((e) => ({ ...e })) ?? [];
    while (seeded.length < MIN_ELECTIVES) {
      seeded.push({ code: null, percentage: null });
    }
    return seeded;
  });
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);

  const [targetInstitution, setTargetInstitution] = useState<string>("ump");
  const [validationError, setValidationError] = useState<string | null>(null);

  const firstAdditionalLanguageOptions = FIRST_ADDITIONAL_LANGUAGE_OPTIONS.filter(
    (lang) => lang !== homeLanguage
  );

  const selectedElectiveCodes = electives.map((e) => e.code).filter(Boolean);

  const marks: SubjectMarkInput[] = useMemo(() => {
    const result: SubjectMarkInput[] = [];
    if (homeLanguage && homeLanguageMark !== null) {
      result.push({
        subjectCode: getLanguageSubjectCode(homeLanguage, "home"),
        percentage: homeLanguageMark,
      });
    }
    if (firstAdditionalLanguage && firstAdditionalLanguageMark !== null) {
      result.push({
        subjectCode: getLanguageSubjectCode(firstAdditionalLanguage, "firstAdditional"),
        percentage: firstAdditionalLanguageMark,
      });
    }
    if (mathematics && mathematicsMark !== null) {
      result.push({
        subjectCode: MATHEMATICS_CODES[mathematics],
        percentage: mathematicsMark,
      });
    }
    if (lifeOrientationMark !== null) {
      result.push({ subjectCode: LIFE_ORIENTATION_CODE, percentage: lifeOrientationMark });
    }
    for (const elective of electives) {
      if (elective.code && elective.percentage !== null) {
        result.push({ subjectCode: elective.code, percentage: elective.percentage });
      }
    }
    return result;
  }, [
    homeLanguage,
    homeLanguageMark,
    firstAdditionalLanguage,
    firstAdditionalLanguageMark,
    mathematics,
    mathematicsMark,
    lifeOrientationMark,
    electives,
  ]);

  function handleCalculate() {
    if (!homeLanguage || homeLanguageMark === null) {
      setValidationError("Please select your Home Language and enter a percentage mark.");
      return;
    }
    if (!firstAdditionalLanguage || firstAdditionalLanguageMark === null) {
      setValidationError("Please select your First Additional Language and enter a percentage mark.");
      return;
    }
    if (!mathematics || mathematicsMark === null) {
      setValidationError("Please select your Mathematics option and enter a percentage mark.");
      return;
    }
    if (lifeOrientationMark === null) {
      setValidationError("Please enter your Life Orientation percentage mark.");
      return;
    }
    const filledElectives = electives.filter((e) => e.code && e.percentage !== null);
    if (filledElectives.length < MIN_ELECTIVES) {
      setValidationError(`Please select and enter marks for at least ${MIN_ELECTIVES} elective subjects.`);
      return;
    }

    setValidationError(null);
    onMarksChange?.(marks);
  }

  function updateElective(index: number, patch: Partial<ElectiveSlot>) {
    setElectives((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }

  function addElective() {
    if (electives.length >= MAX_ELECTIVES) return;
    setElectives((prev) => [...prev, { code: null, percentage: null }]);
  }

  function removeElective(index: number) {
    if (electives.length <= MIN_ELECTIVES) return;
    setRemovingIndex(index);
    window.setTimeout(() => {
      setElectives((prev) => prev.filter((_, i) => i !== index));
      setRemovingIndex(null);
    }, 200);
  }

  return (
    <form
      className="animate-rise-in stagger-1 flex w-full max-w-2xl flex-col gap-6"
      onSubmit={(e) => e.preventDefault()}
    >
      {/* Introduction Card */}
      <div className="flex flex-col gap-1.5 rounded-2xl border border-line bg-paper-raised p-5 shadow-sm">
        <h2 className="font-bold text-lg text-ink flex items-center gap-2">
          <span>📚 Enter Your Matric Subjects & Percentages</span>
        </h2>
        <p className="text-xs text-ink-soft leading-relaxed">
          Enter your percentage marks for your 4 compulsory subjects and 3 to 4 electives below. Your APS points will automatically update for every university in South Africa.
        </p>
      </div>

      {/* Compulsory Subjects Fieldset */}
      <fieldset className="flex flex-col gap-4 rounded-2xl border border-line bg-paper-raised p-5 shadow-sm">
        <legend className="mb-1 flex items-center gap-2 rounded-full bg-brand-teal-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-teal border border-brand-teal/20">
          <span aria-hidden className="h-2 w-2 rounded-full bg-brand-teal animate-pulse" />
          Compulsory NSC Subjects (4)
        </legend>

        {/* Home Language */}
        <div className="flex flex-col gap-2 rounded-xl bg-paper p-3.5 border border-line/60">
          <label className="text-sm font-semibold text-ink" htmlFor="home-language">
            Home Language
          </label>
          <select
            id="home-language"
            className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper-raised px-3.5 py-2 text-sm text-ink font-medium transition-colors focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none"
            value={homeLanguage}
            onChange={(e) => {
              const next = e.target.value as LanguageOption | "";
              setHomeLanguage(next);
              if (next === firstAdditionalLanguage) setFirstAdditionalLanguage("");
            }}
          >
            <option value="">Select Home Language...</option>
            {HOME_LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          {homeLanguage && (
            <div className="mt-1 border-t border-line/40 pt-2">
              <MarkInput
                label={`${homeLanguage} (HL)`}
                percentage={homeLanguageMark}
                onChange={setHomeLanguageMark}
              />
            </div>
          )}
        </div>

        {/* First Additional Language */}
        <div className="flex flex-col gap-2 rounded-xl bg-paper p-3.5 border border-line/60">
          <label className="text-sm font-semibold text-ink" htmlFor="fal">
            First Additional Language (FAL)
          </label>
          <select
            id="fal"
            className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper-raised px-3.5 py-2 text-sm text-ink font-medium transition-colors focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none"
            value={firstAdditionalLanguage}
            onChange={(e) => setFirstAdditionalLanguage(e.target.value as LanguageOption | "")}
          >
            <option value="">Select First Additional Language...</option>
            {firstAdditionalLanguageOptions.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          {firstAdditionalLanguage && (
            <div className="mt-1 border-t border-line/40 pt-2">
              <MarkInput
                label={`${firstAdditionalLanguage} (FAL)`}
                percentage={firstAdditionalLanguageMark}
                onChange={setFirstAdditionalLanguageMark}
              />
            </div>
          )}
        </div>

        {/* Mathematics */}
        <div className="flex flex-col gap-2 rounded-xl bg-paper p-3.5 border border-line/60">
          <label className="text-sm font-semibold text-ink" htmlFor="mathematics">
            Mathematics Option
          </label>
          <select
            id="mathematics"
            className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper-raised px-3.5 py-2 text-sm text-ink font-medium transition-colors focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none"
            value={mathematics}
            onChange={(e) => setMathematics(e.target.value as MathematicsOption | "")}
          >
            <option value="">Select Mathematics Type...</option>
            {MATHEMATICS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {mathematics && (
            <div className="mt-1 border-t border-line/40 pt-2">
              <MarkInput label={mathematics} percentage={mathematicsMark} onChange={setMathematicsMark} />
            </div>
          )}
        </div>

        {/* Life Orientation */}
        <div className="rounded-xl bg-paper p-3.5 border border-line/60">
          <MarkInput
            label="Life Orientation"
            percentage={lifeOrientationMark}
            onChange={setLifeOrientationMark}
          />
        </div>
      </fieldset>

      {/* Elective Subjects Fieldset */}
      <fieldset className="flex flex-col gap-4 rounded-2xl border border-line bg-paper-raised p-5 shadow-sm">
        <legend className="mb-1 flex items-center gap-2 rounded-full bg-brand-coral-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-coral border border-brand-coral/20">
          <span aria-hidden className="h-2 w-2 rounded-full bg-brand-coral animate-pulse" />
          Elective Subjects ({electives.length} of {MIN_ELECTIVES}-{MAX_ELECTIVES})
        </legend>

        {electives.map((elective, index) => {
          const availableOptions = ELECTIVE_SUBJECTS.filter(
            (s) => s.code === elective.code || !selectedElectiveCodes.includes(s.code)
          );
          const stagger = Math.min(index + 1, 6);
          return (
            <div
              key={index}
              className={`${removingIndex === index ? "animate-pop-out" : `stagger-${stagger} animate-pop-in`} flex flex-col gap-3 rounded-xl border border-line bg-paper p-3.5 shadow-2xs`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <SubjectCombobox
                    label={`Elective Subject ${index + 1}`}
                    options={availableOptions}
                    value={elective.code}
                    onChange={(code) => updateElective(index, { code, percentage: null })}
                  />
                </div>
                {electives.length > MIN_ELECTIVES && (
                  <button
                    type="button"
                    className="-m-2 mt-4 cursor-pointer p-2 text-xs font-semibold text-mark-red hover:underline active:scale-95"
                    onClick={() => removeElective(index)}
                    disabled={removingIndex === index}
                  >
                    Remove
                  </button>
                )}
              </div>
              {elective.code && (
                <div className="border-t border-line/40 pt-2">
                  <MarkInput
                    label={ELECTIVE_SUBJECTS.find((s) => s.code === elective.code)?.name ?? ""}
                    percentage={elective.percentage}
                    onChange={(percentage) => updateElective(index, { percentage })}
                  />
                </div>
              )}
            </div>
          );
        })}

        {electives.length < MAX_ELECTIVES && (
          <button
            type="button"
            className="inline-flex min-h-11 cursor-pointer items-center justify-center self-start rounded-xl border-2 border-dashed border-brand-teal/60 bg-brand-teal-soft/40 px-5 text-sm font-semibold text-brand-teal transition-all hover:bg-brand-teal-soft active:scale-95 shadow-2xs"
            onClick={addElective}
          >
            + Add 4th Elective Subject
          </button>
        )}
      </fieldset>

      {/* Calculate APS Action Button */}
      <div className="flex flex-col gap-3 rounded-2xl border border-brand-teal/40 bg-brand-teal/5 p-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <label htmlFor="target-institution" className="text-xs font-bold text-ink uppercase tracking-wider">
            Target Institution Rule
          </label>
          <select
            id="target-institution"
            className="min-h-11 rounded-xl border border-line bg-paper-raised px-3.5 py-2 text-sm font-semibold text-ink focus:border-brand-teal focus:outline-none"
            value={targetInstitution}
            onChange={(e) => setTargetInstitution(e.target.value)}
          >
            <option value="ump">University of Mpumalanga (UMP) -- LO ÷ 2 Rule</option>
            <option value="up">University of Pretoria (UP) -- LO Excluded Rule</option>
            <option value="wits">University of the Witwatersrand (Wits) -- LO Included + Bonus Rule</option>
            <option value="uj">University of Johannesburg (UJ) -- LO Excluded Rule</option>
            <option value="tut">Tshwane University of Technology (TUT) -- LO Excluded Rule</option>
            <option value="all">All South African Universities</option>
          </select>
        </div>

        {validationError && (
          <p role="alert" className="text-xs font-bold text-mark-red bg-mark-red-soft p-2.5 rounded-lg border border-mark-red/30">
            ⚠️ {validationError}
          </p>
        )}

        <button
          type="button"
          onClick={handleCalculate}
          className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-teal px-6 py-3 text-base font-extrabold text-white shadow-md transition-all hover:bg-teal-700 active:scale-[0.98]"
        >
          <span>🎯 CALCULATE APS & MATCH PROGRAMMES</span>
        </button>
      </div>
    </form>
  );
}
