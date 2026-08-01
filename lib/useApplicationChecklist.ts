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
 * A personal "prepare to apply" checklist. An anonymous visitor gets
 * localStorage-only persistence -- no account needed, consistent with "the
 * calculator works fully without one" (docs/MASTER_PROMPT_v2.md sect. 6). A
 * signed-in learner's progress instead follows their userProfiles document
 * (checklistProgress field), same pattern as ResultsSection.tsx's
 * shortlist/toggleShortlist: account data replaces local state entirely
 * (no merge) once `uid` is set, and localStorage is not consulted at all
 * in that case.
 */
export function useApplicationChecklist(uid?: string | null) {
  const [checked, setChecked] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!uid) {
      setChecked(loadChecked());
      return;
    }
    // Dynamic import, same reasoning as ResultsSection.tsx's shortlist
    // effect: keeps Firestore out of the bundle for the common anonymous
    // visitor, who never triggers this branch.
    let cancelled = false;
    import("@/lib/auth/profile").then(({ getUserProfile }) =>
      getUserProfile(uid).then((profile) => {
        if (!cancelled) setChecked(new Set(profile?.checklistProgress ?? []));
      })
    );
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const toggle = useCallback(
    (id: string) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);

        if (uid) {
          // Fire-and-forget: unlike shortlist, a failed background sync
          // here just means the next profile fetch is the source of truth
          // again -- not worth the rollback complexity for a low-stakes
          // preference list.
          import("@/lib/auth/profile")
            .then(({ updateChecklistProgress }) => updateChecklistProgress(uid, Array.from(next)))
            .catch(() => {
              // Swallowed deliberately -- see the comment above this block.
            });
        } else {
          saveChecked(next);
        }

        return next;
      });
    },
    [uid]
  );

  return { checked, toggle };
}
