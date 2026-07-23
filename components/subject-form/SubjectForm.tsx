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
}: {
  onMarksChange?: (marks: SubjectMarkInput[]) => void;
}) {
  const [homeLanguage, setHomeLanguage] = useState<LanguageOption | "">("");
  const [homeLanguageMark, setHomeLanguageMark] = useState<number | null>(null);

  const [firstAdditionalLanguage, setFirstAdditionalLanguage] = useState<LanguageOption | "">(
    ""
  );
  const [firstAdditionalLanguageMark, setFirstAdditionalLanguageMark] = useState<number | null>(
    null
  );

  const [mathematics, setMathematics] = useState<MathematicsOption | "">("");
  const [mathematicsMark, setMathematicsMark] = useState<number | null>(null);

  const [lifeOrientationMark, setLifeOrientationMark] = useState<number | null>(null);

  const [electives, setElectives] = useState<ElectiveSlot[]>([
    { code: null, percentage: null },
    { code: null, percentage: null },
    { code: null, percentage: null },
  ]);

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

  // Fire the callback on every change without requiring the parent to
  // memoize -- useMemo above already dedupes recomputation.
  onMarksChange?.(marks);

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
    <form className="flex w-full max-w-xl flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Compulsory
        </legend>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" htmlFor="home-language">
            Home Language
          </label>
          <select
            id="home-language"
            className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
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
            className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
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
            className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
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

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Electives ({electives.length} of {MIN_ELECTIVES}-{MAX_ELECTIVES})
        </legend>

        {electives.map((elective, index) => {
          const availableOptions = ELECTIVE_SUBJECTS.filter(
            (s) => s.code === elective.code || !selectedElectiveCodes.includes(s.code)
          );
          return (
            <div key={index} className="flex flex-col gap-2 rounded border border-gray-200 p-3 dark:border-gray-700">
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
                  <button
                    type="button"
                    className="mt-6 text-xs text-red-500 hover:underline"
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
            className="self-start text-sm text-blue-600 hover:underline dark:text-blue-400"
            onClick={addElective}
          >
            + Add a 4th elective
          </button>
        )}
      </fieldset>
    </form>
  );
}
