"use client";

import { useState } from "react";
import { useAuth } from "./auth/AuthProvider";
import type { SubjectMarkInput } from "@/lib/aps/types";

/**
 * "Signed-in learners get: saved marks" (docs/MASTER_PROMPT_v2.md Phase
 * 6). Only renders for a signed-in user -- the calculator itself works
 * fully without an account either way. Does NOT reload saved marks back
 * into the subject-selection form on a later visit -- that needs
 * reconstructing the form's granular UI state (which language/Math
 * option/electives were picked) from raw subject codes, which is a
 * separate, real feature this phase didn't build. Saved marks ARE
 * visible on /account (see AccountPage.tsx).
 */
export function SaveMarksButton({ marks }: { marks: SubjectMarkInput[] }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  if (!user || marks.length === 0) return null;

  async function handleSave() {
    setStatus("saving");
    try {
      // Dynamic import -- see ResultsSection.tsx for why: keeps Firestore
      // out of the calculator route's initial bundle for the common case
      // (an anonymous visitor, for whom this button never even renders).
      const { updateSavedMarks } = await import("@/lib/auth/profile");
      await updateSavedMarks(user!.uid, marks);
      setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={status === "saving"}
      className="no-print rounded border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-slate-soft disabled:opacity-50"
    >
      {status === "saved" ? "Saved!" : status === "error" ? "Couldn't save -- try again" : "Save my marks"}
    </button>
  );
}
