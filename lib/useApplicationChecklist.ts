"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ucag-application-checklist";

function loadChecked(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveChecked(checked: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(checked)));
  } catch {
    // localStorage can be unavailable (private browsing, quota) -- the
    // checklist still works for the current session, it just won't persist.
  }
}

/**
 * A personal "prepare to apply" checklist, kept entirely client-side
 * (localStorage) -- no account needed, consistent with "the calculator
 * works fully without one" (docs/MASTER_PROMPT_v2.md sect. 6). Shared
 * across every result card via ResultsSection, since the checklist items
 * are generic (not per-programme) -- see config/applicationDocuments.ts.
 */
export function useApplicationChecklist() {
  const [checked, setChecked] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setChecked(loadChecked());
  }, []);

  const toggle = useCallback((id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveChecked(next);
      return next;
    });
  }, []);

  return { checked, toggle };
}
