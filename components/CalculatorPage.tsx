"use client";

import { useEffect, useState } from "react";
import { PageHero } from "./PageHero";
import { SubjectForm } from "./subject-form/SubjectForm";
import { ResultsSection } from "./results/ResultsSection";
import { SaveMarksButton } from "./SaveMarksButton";
import { ApsFormulaBanner } from "./aps/ApsFormulaBanner";
import { useAuth } from "./auth/AuthProvider";
import { getInstitutionBranding } from "@/lib/institutions/branding";
import { subjectMarksToFormState, type SubjectFormInitialState } from "@/config/subjects";
import type { SubjectMarkInput } from "@/lib/aps/types";

const TARGET_INSTITUTIONS = [
  { id: "ump", name: "UMP", fullName: "University of Mpumalanga", icon: "🏛️" },
  { id: "uct", name: "UCT", fullName: "University of Cape Town", icon: "⛰️" },
  { id: "up", name: "UP", fullName: "University of Pretoria", icon: "🦁" },
  { id: "wits", name: "Wits", fullName: "University of the Witwatersrand", icon: "⚖️" },
  { id: "uj", name: "UJ", fullName: "University of Johannesburg", icon: "🌆" },
  { id: "tut", name: "TUT", fullName: "Tshwane University of Technology", icon: "⚙️" },
  { id: "nmu", name: "NMU", fullName: "Nelson Mandela University", icon: "🌊" },
];

export function CalculatorPage() {
  const { user } = useAuth();
  const [selectedInstId, setSelectedInstId] = useState("ump");
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

  const activeBranding = getInstitutionBranding(selectedInstId);

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <PageHero
        title="Find Your University Degree Pathways"
        subtitle="Enter your NSC Matric marks to instantly calculate your official APS score across South African universities, discover degrees you qualify for, and unlock personalized backup plans."
      />

      <div className="flex w-full max-w-3xl flex-col items-center gap-6 px-4">
        {/* Institution Target Tabs */}
        <div className="w-full flex flex-col gap-2 rounded-2xl border border-line bg-paper-raised p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-navy">
              Select Target University Formula:
            </span>
            <span className="text-[11px] font-bold text-brand-teal">
              Current: {activeBranding.name}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {TARGET_INSTITUTIONS.map((inst) => {
              const active = selectedInstId === inst.id;
              return (
                <button
                  key={inst.id}
                  type="button"
                  onClick={() => setSelectedInstId(inst.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition active:scale-95 shadow-xs ${
                    active
                      ? "bg-brand-navy text-white ring-2 ring-brand-teal"
                      : "bg-paper text-ink-soft border border-line hover:border-brand-teal hover:text-ink"
                  }`}
                >
                  <span>{inst.icon}</span>
                  <span>{inst.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <ApsFormulaBanner />
        <SubjectForm key={formKey} onMarksChange={setMarks} initialState={initialState} />
        <SaveMarksButton marks={marks} />
        <ResultsSection marks={marks} />
      </div>
    </div>
  );
}
