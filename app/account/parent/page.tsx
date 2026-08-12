"use client";

import { useState } from "react";
import Link from "next/link";

export default function ParentGuardianDashboard() {
  const [minorConsentGiven, setMinorConsentGiven] = useState(true);
  const [savedStatus, setSavedStatus] = useState(false);

  const handleToggleConsent = () => {
    setMinorConsentGiven((prev) => !prev);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 3000);
  };

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <div className="hero-atmosphere w-full border-b border-white/10 py-10 shadow-md">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-3.5 py-1 text-xs font-semibold text-teal-200 border border-teal-400/30 w-fit">
            <span>👨‍👩‍👧 Parent & Guardian Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Parent & Guardian Guidance Dashboard
          </h1>
          <p className="max-w-2xl text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Manage minor learner consent records, monitor application readiness milestones, and view official university funding guidelines.
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 sm:p-8">
        {savedStatus && (
          <div className="rounded-xl bg-mark-green-soft p-4 text-xs font-bold text-mark-green border border-mark-green/30">
            ✅ Guardian consent preference updated successfully!
          </div>
        )}

        {/* Consent & POPIA Compliance */}
        <section aria-labelledby="consent-heading" className="card-learner rounded-2xl p-6 border border-line">
          <h2 id="consent-heading" className="text-base font-bold text-ink mb-2">
            🛡️ Minor Learner Consent & Privacy (POPIA)
          </h2>
          <p className="text-xs text-ink-soft mb-4 leading-relaxed">
            Under South Africa&apos;s Protection of Personal Information Act (POPIA), processing academic data for learners under the age of 18 requires verified parental or legal guardian consent.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-paper p-4 border border-line/60">
            <div>
              <p className="text-xs font-bold text-ink">
                Status: {minorConsentGiven ? "Granted (Active)" : "Revoked"}
              </p>
              <p className="text-[11px] text-ink-soft">
                {minorConsentGiven
                  ? "You have authorized UCAG & VarsityPath AI to assist your minor learner."
                  : "Learner features operate in limited anonymous mode until consent is granted."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleConsent}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
                minorConsentGiven
                  ? "bg-mark-red/10 text-mark-red border border-mark-red/30 hover:bg-mark-red/20"
                  : "bg-brand-teal text-white hover:bg-teal-700"
              }`}
            >
              {minorConsentGiven ? "Revoke Consent" : "Grant Guardian Consent"}
            </button>
          </div>
        </section>

        {/* Application Deadlines & Bursaries */}
        <div className="grid gap-6 md:grid-cols-2">
          <section aria-labelledby="deadlines-heading" className="card-learner rounded-2xl p-6 border border-line">
            <h2 id="deadlines-heading" className="text-base font-bold text-ink mb-3">
              📅 Important Application Deadlines
            </h2>
            <ul className="flex flex-col gap-2.5 text-xs text-ink-soft">
              <li className="rounded-xl bg-paper p-3 border border-line/60 flex justify-between font-medium">
                <span>University of Mpumalanga (UMP)</span>
                <span className="font-bold text-brand-teal">30 Nov 2026</span>
              </li>
              <li className="rounded-xl bg-paper p-3 border border-line/60 flex justify-between font-medium">
                <span>University of Pretoria (UP)</span>
                <span className="font-bold text-brand-teal">30 Jun 2026</span>
              </li>
              <li className="rounded-xl bg-paper p-3 border border-line/60 flex justify-between font-medium">
                <span>NSFAS Financial Aid</span>
                <span className="font-bold text-brand-teal">31 Jan 2027</span>
              </li>
            </ul>
          </section>

          <section aria-labelledby="funding-heading" className="card-learner rounded-2xl p-6 border border-line">
            <h2 id="funding-heading" className="text-base font-bold text-ink mb-3">
              💰 Financial Aid & Bursary Overview
            </h2>
            <p className="text-xs text-ink-soft mb-3 leading-relaxed">
              Explore Government NSFAS funding, provincial bursaries, and merit scholarships available for Grade 12 matriculants entering university.
            </p>
            <Link
              href="/bursaries"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-teal hover:underline"
            >
              Explore Verified Bursaries →
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
