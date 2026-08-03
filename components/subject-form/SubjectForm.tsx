"use client";

import { useEffect, useMemo, useState } from "react";
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

/**
 * The full NSC subject-selection form (docs/MASTER_PROMPT_v2.md sect.
 * 2.1): Home Language, First Additional Language, Mathematics, Life
 * Orientation (locked, always present), then 3-4 electives from a
 * searchable, grouped dropdown. Emits the current SubjectMarkInput[] via
 * onMarksChange so a parent (Phase 3's results page) can feed it to
 * lib/aps/engine -- this component itself does no APS calculation and
 * does not assume any specific institution's formula.
 */
export function SubjectForm({
  onMarksChange,
  initialState,
}: {
  onMarksChange?: (marks: SubjectMarkInput[]) => void;
  /** Seeds the form from a signed-in learner's previously saved marks
   * (see config/subjects.ts's subjectMarksToFormState). Only read on first
   * render -- this form owns its state after that, same as any other
   * uncontrolled-with-defaults form. */
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

  // Notify the parent in an effect, not during render -- calling
  // onMarksChange directly in the render body updates a different
  // component (CalculatorPage) while this one is still rendering, which
  // React rejects (and which, in practice, corrupted keystrokes: typing
  // "80" was observed landing as "8" because the interrupted render
  // clobbered the in-progress input state).
  useEffect(() => {
    onMarksChange?.(marks);
  }, [marks, onMarksChange]);

  function updateElective(index: number, patch: Partial<ElectiveSlot>) {
    setElectives((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }

  function addElective() {
    if (electives.length >= MAX_ELECTIVES) return;
    setElectives((prev) => [...prev, { code: null, percentage: null }]);
  }

  function removeElective(index: number) {
    if (electives.length <= MIN_ELECTIVES) return;
    setElectives((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form
      className="animate-rise-in stagger-1 flex w-full max-w-xl flex-col gap-6"
      onSubmit={(e) => e.preventDefault()}
    >
      <fieldset className="flex flex-col gap-3 rounded-2xl border border-line bg-paper-raised p-4 shadow-sm">
        <legend className="mb-1 flex items-center gap-2 px-1 text-sm font-semibold uppercase tracking-wide text-brand-teal">
          <span aria-hidden className="h-2 w-2 rounded-full bg-brand-teal" />
          Compulsory
        </legend>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="home-language">
            Home Language
          </label>
          <select
            id="home-language"
            className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink transition-colors focus:border-brand-teal focus:outline-none"
            value={homeLanguage}
            onChange={(e) => {
              const next = e.target.value as LanguageOption | "";
              setHomeLanguage(next);
              if (next === firstAdditionalLanguage) setFirstAdditionalLanguage("");
            }}
          >
            <option value="">Select...</option>
            {HOME_LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        {homeLanguage && (
          <MarkInput
            label={`${homeLanguage} (Home Language)`}
            percentage={homeLanguageMark}
            onChange={setHomeLanguageMark}
          />
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="fal">
            First Additional Language
          </label>
          <select
            id="fal"
            className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink transition-colors focus:border-brand-teal focus:outline-none"
            value={firstAdditionalLanguage}
            onChange={(e) => setFirstAdditionalLanguage(e.target.value as LanguageOption | "")}
          >
            <option value="">Select...</option>
            {firstAdditionalLanguageOptions.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        {firstAdditionalLanguage && (
          <MarkInput
            label={`${firstAdditionalLanguage} (First Additional)`}
            percentage={firstAdditionalLanguageMark}
            onChange={setFirstAdditionalLanguageMark}
          />
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="mathematics">
            Mathematics
          </label>
          <select
            id="mathematics"
            className="min-h-11 cursor-pointer rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink transition-colors focus:border-brand-teal focus:outline-none"
            value={mathematics}
            onChange={(e) => setMathematics(e.target.value as MathematicsOption | "")}
          >
            <option value="">Select...</option>
            {MATHEMATICS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        {mathematics && (
          <MarkInput label={mathematics} percentage={mathematicsMark} onChange={setMathematicsMark} />
        )}

        {/* Life Orientation: always present, locked, cannot be removed --
            every NSC learner takes it, per docs/MASTER_PROMPT_v2.md 2.1. */}
        <MarkInput
          label="Life Orientation (compulsory)"
          percentage={lifeOrientationMark}
          onChange={setLifeOrientationMark}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded-2xl border border-line bg-paper-raised p-4 shadow-sm">
        <legend className="mb-1 flex items-center gap-2 px-1 text-sm font-semibold uppercase tracking-wide text-brand-coral">
          <span aria-hidden className="h-2 w-2 rounded-full bg-brand-coral" />
          Electives ({electives.length} of {MIN_ELECTIVES}-{MAX_ELECTIVES})
        </legend>

        {electives.map((elective, index) => {
          const availableOptions = ELECTIVE_SUBJECTS.filter(
            (s) => s.code === elective.code || !selectedElectiveCodes.includes(s.code)
          );
          const stagger = Math.min(index + 1, 6);
          return (
            <div
              key={index}
              className={`stagger-${stagger} animate-pop-in flex flex-col gap-2 rounded-xl border border-line bg-paper p-3`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <SubjectCombobox
                    label={`Elective ${index + 1}`}
                    options={availableOptions}
                    value={elective.code}
                    onChange={(code) => updateElective(index, { code, percentage: null })}
                  />
                </div>
                {electives.length > MIN_ELECTIVES && (
                  // -m-2 p-2 widens the actual tap target to 44x44 (WCAG
                  // 2.5.5) without growing the visible text -- a rarely-used
                  // destructive action doesn't need visual weight, but still
                  // needs a real hit area on a 5-inch screen (Phase 8 brief).
                  <button
                    type="button"
                    className="-m-2 mt-4 cursor-pointer p-2 text-xs text-mark-red transition-transform duration-150 ease-out hover:underline active:scale-[0.97]"
                    onClick={() => removeElective(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
              {elective.code && (
                <MarkInput
                  label={ELECTIVE_SUBJECTS.find((s) => s.code === elective.code)?.name ?? ""}
                  percentage={elective.percentage}
                  onChange={(percentage) => updateElective(index, { percentage })}
                />
              )}
            </div>
          );
        })}

        {electives.length < MAX_ELECTIVES && (
          <button
            type="button"
            className="inline-flex min-h-11 cursor-pointer items-center self-start rounded-full border border-dashed border-brand-teal px-4 text-sm font-medium text-brand-teal transition-transform hover-fine:scale-[1.03] active:scale-[0.97]"
            onClick={addElective}
          >
            + Add a 4th elective
          </button>
        )}
      </fieldset>
    </form>
  );
}
