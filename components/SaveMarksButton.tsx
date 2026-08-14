"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "./auth/AuthProvider";
import type { SubjectMarkInput } from "@/lib/aps/types";

export function SaveMarksButton({ marks }: { marks: SubjectMarkInput[] }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showModal, setShowModal] = useState(false);

  if (marks.length === 0) return null;
  const isLoggedIn = !!user && !user.isAnonymous;

  async function handleSave() {
    if (!isLoggedIn) {
      try {
        sessionStorage.setItem("ucag_stashed_marks", JSON.stringify(marks));
      } catch {}
      setShowModal(true);
      return;
    }

    setStatus("saving");
    try {
      const { updateSavedMarks } = await import("@/lib/auth/profile");
      await updateSavedMarks(user!.uid, marks);
      setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleSave}
        disabled={status === "saving"}
        className="no-print inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-teal-600/30 bg-teal-500 px-5 text-xs font-extrabold text-white shadow transition-all hover:bg-teal-600 active:scale-95 disabled:opacity-50"
      >
        <span>💾</span>
        <span>
          {status === "saving"
            ? "Saving marks..."
            : status === "saved"
              ? "Saved to Your Profile! ✅"
              : status === "error"
                ? "Couldn't save -- try again"
                : "Save My Results"}
        </span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-line bg-paper-raised p-6 shadow-xl animate-rise-in">
            <div className="flex justify-between items-start mb-3">
              <span className="rounded-full bg-brand-teal/10 p-2 text-2xl">🎓</span>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-xs text-ink-soft hover:text-ink font-bold p-1"
              >
                ✕ Close
              </button>
            </div>

            <h3 className="text-lg font-extrabold text-brand-navy">
              Save Your APS & Subject Results
            </h3>
            <p className="mt-2 text-xs text-ink-soft leading-relaxed">
              Create your free UCAG account or sign in to save your results, track application deadlines, and unlock personalized SA university recommendations.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                href="/register"
                className="flex min-h-11 items-center justify-center rounded-xl bg-brand-teal text-xs font-bold text-white shadow hover:bg-teal-700 transition"
              >
                Create Free UCAG Account
              </Link>
              <Link
                href="/login"
                className="flex min-h-11 items-center justify-center rounded-xl border border-line bg-paper text-xs font-bold text-ink hover:bg-paper-raised transition"
              >
                Already have an account? Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
