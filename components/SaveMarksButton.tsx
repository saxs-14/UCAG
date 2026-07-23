"use client";

import { useState } from "react";
import { useAuth } from "./auth/AuthProvider";
import { updateSavedMarks } from "@/lib/auth/profile";
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
      className="no-print rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-800"
    >
      {status === "saved" ? "Saved!" : status === "error" ? "Couldn't save -- try again" : "Save my marks"}
    </button>
  );
}
