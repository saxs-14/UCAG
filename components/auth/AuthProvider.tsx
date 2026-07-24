"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getIdTokenResult, onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** True only once the `role: "admin"` custom claim (see
   * lib/admin/auth.ts, scripts/set-admin-claim.mjs) has been confirmed on
   * a fresh ID token. False -- never undefined -- while that check is
   * still in flight, so admin-only UI defaults closed. */
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true, isAdmin: false });

/** Wraps the app so any component can ask "who's signed in?" without
 * prop-drilling. Accounts are optional (docs/MASTER_PROMPT_v2.md Phase
 * 6) -- most of the app never reads this context, and getFirebaseAuth()
 * is lazy, so this provider costs nothing on routes that don't touch it
 * until a component actually calls useAuth(). */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (u) => {
      setUser(u);
      setLoading(false);

      if (!u) {
        setIsAdmin(false);
        return;
      }

      // Force-refresh: an admin claim granted by scripts/set-admin-claim.mjs
      // while this tab already has a cached (claim-less) token should show
      // up without requiring a manual sign-out/sign-in.
      getIdTokenResult(u, true)
        .then((result) => setIsAdmin(result.claims.role === "admin"))
        .catch(() => setIsAdmin(false));
    });
    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={{ user, loading, isAdmin }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
