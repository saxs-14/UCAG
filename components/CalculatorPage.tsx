"use client";

import { useEffect, useState } from "react";
import { SubjectForm } from "./subject-form/SubjectForm";
import { ResultsSection } from "./results/ResultsSection";
import { SaveMarksButton } from "./SaveMarksButton";
import { useAuth } from "./auth/AuthProvider";
import { subjectMarksToFormState, type SubjectFormInitialState } from "@/config/subjects";
import type { SubjectMarkInput } from "@/lib/aps/types";

/**
 * The landing page IS the calculator -- no marketing hero above it
 * (docs/MASTER_PROMPT_v2.md sect. 3). Lifts marks state above SubjectForm
 * so ResultsSection can react to it live.
 */
export function CalculatorPage() {
  const { user } = useAuth();
  const [marks, setMarks] = useState<SubjectMarkInput[]>([]);
  const [initialState, setInitialState] = useState<SubjectFormInitialState | undefined>(undefined);
  // Bumped only once saved marks actually load, forcing SubjectForm to
  // remount and re-read initialState -- its useState calls only consult
  // initialState on mount, and this fetch is necessarily async.
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      // Dynamic import -- see SaveMarksButton.tsx for why: keeps Firestore
      // out of the calculator route's initial bundle for the common case
      // (an anonymous visitor, for whom this never even runs).
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
      <SubjectForm key={formKey} onMarksChange={setMarks} initialState={initialState} />
      <SaveMarksButton marks={marks} />
      <ResultsSection marks={marks} />
    </div>
  );
}
