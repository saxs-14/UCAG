"use client";

import { useEffect, useState } from "react";
import { PageHero } from "./PageHero";
import { SubjectForm } from "./subject-form/SubjectForm";
import { ResultsSection } from "./results/ResultsSection";
import { SaveMarksButton } from "./SaveMarksButton";
import { ApsFormulaBanner } from "./aps/ApsFormulaBanner";
import { useAuth } from "./auth/AuthProvider";
import { subjectMarksToFormState, type SubjectFormInitialState } from "@/config/subjects";
import type { SubjectMarkInput } from "@/lib/aps/types";

export function CalculatorPage() {
  const { user } = useAuth();
  const [marks, setMarks] = useState<SubjectMarkInput[]>([]);
  const [initialState, setInitialState] = useState<SubjectFormInitialState | undefined>(undefined);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const { getUserProfile } = await import("@/lib/auth/profile");
      const profile = await getUserProfile(user.uid);
      if (!cancelled && profile?.marks.length) {
        setInitialState(subjectMarksToFormState(profile.marks));
        setFormKey((k) => k + 1);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <PageHero
        title="Find Your University Degree Pathways"
        subtitle="Enter your NSC Matric marks to instantly calculate your official APS score across South African universities, discover degrees you qualify for, and unlock personalized backup plans."
      />

      <div className="flex w-full max-w-2xl flex-col items-center gap-6 px-4">
        <ApsFormulaBanner />
        <SubjectForm key={formKey} onMarksChange={setMarks} initialState={initialState} />
        <SaveMarksButton marks={marks} />
        <ResultsSection marks={marks} />
      </div>
    </div>
  );
}
