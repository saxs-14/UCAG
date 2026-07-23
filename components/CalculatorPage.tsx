"use client";

import { useState } from "react";
import { SubjectForm } from "./subject-form/SubjectForm";
import { ResultsSection } from "./results/ResultsSection";
import { SaveMarksButton } from "./SaveMarksButton";
import type { SubjectMarkInput } from "@/lib/aps/types";

/**
 * The landing page IS the calculator -- no marketing hero above it
 * (docs/MASTER_PROMPT_v2.md sect. 3). Lifts marks state above SubjectForm
 * so ResultsSection can react to it live.
 */
export function CalculatorPage() {
  const [marks, setMarks] = useState<SubjectMarkInput[]>([]);

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <SubjectForm onMarksChange={setMarks} />
      <SaveMarksButton marks={marks} />
      <ResultsSection marks={marks} />
    </div>
  );
}
