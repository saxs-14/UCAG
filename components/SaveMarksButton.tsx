"use client";

import { useState } from "react";
import { useAuth } from "./auth/AuthProvider";
import type { SubjectMarkInput } from "@/lib/aps/types";

export function SaveMarksButton({ marks }: { marks: SubjectMarkInput[] }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  if (!user || marks.length === 0) return null;

  async function handleSave() {
    setStatus("saving");
    try {
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
      className="no-print inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-teal-600/30 bg-teal-50 px-5 text-xs font-bold text-teal-800 shadow-2xs transition-all hover:bg-teal-600 hover:text-white active:scale-95 disabled:opacity-50"
    >
      <span>💾</span>
      <span>
        {status === "saving"
          ? "Saving marks..."
          : status === "saved"
            ? "Saved to Your Profile!"
            : status === "error"
              ? "Couldn't save -- try again"
              : "Save Marks to My Profile"}
      </span>
    </button>
  );
}
