"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getIdTokenResult, onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { reportError } from "@/lib/errorReporting";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** True only once the `role: "admin"` custom claim (see
   * lib/admin/auth.ts, scripts/set-admin-claim.mjs) has been confirmed on
   * a fresh ID token. False -- never undefined -- while that check is
   * still in flight, so admin-only UI defaults closed. */
  isAdmin: boolean;
  /** True when Firebase Auth couldn't initialize at all -- e.g. this
   * deployment has no real Firebase project's credentials configured
   * (NEXT_PUBLIC_FIREBASE_* env vars). The calculator, bursaries, and
   * statistics pages don't depend on auth at all and work fully either
   * way; only sign-in/account/shortlist features are affected. Consumed
   * by SignInForm/SignUpForm/AccountPage to show a plain explanation
   * instead of a form that would fail confusingly on submit. */
  authUnavailable: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAdmin: false,
  authUnavailable: false,
});

/** Wraps the app so any component can ask "who's signed in?" without
 * prop-drilling. Accounts are optional (docs/MASTER_PROMPT_v2.md Phase
 * 6) -- most of the app never reads this context, and getFirebaseAuth()
 * is lazy, so this provider costs nothing on routes that don't touch it
 * until a component actually calls useAuth(). */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authUnavailable, setAuthUnavailable] = useState(false);

  useEffect(() => {
    let auth;
    try {
      auth = getFirebaseAuth();
    } catch (err) {
      // Missing/invalid Firebase client config -- degrade gracefully
      // rather than taking down every route (AuthProvider wraps the
      // whole app). Real per docs/MASTER_PROMPT_v2.md sect. 0.3: the
      // rest of the product must keep working without an account.
      reportError(err, { scope: "auth-provider-init" });
      setLoading(false);
      setAuthUnavailable(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
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

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, authUnavailable }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
