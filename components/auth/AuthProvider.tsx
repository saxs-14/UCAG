"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getIdTokenResult, onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { reportError } from "@/lib/errorReporting";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  adminClaimsReady: boolean;
  authUnavailable: boolean;
  displayName: string | null;
  setDisplayName: (name: string | null) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAdmin: false,
  adminClaimsReady: false,
  authUnavailable: false,
  displayName: null,
  setDisplayName: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminClaimsReady, setAdminClaimsReady] = useState(false);
  const [authUnavailable, setAuthUnavailable] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    let auth;
    try {
      auth = getFirebaseAuth();
    } catch (err) {
      reportError(err, { scope: "auth-provider-init" });
      setLoading(false);
      setAuthUnavailable(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setDisplayName(u?.displayName ?? null);
      setLoading(false);
      setAdminClaimsReady(false); 

      if (!u) {
        setIsAdmin(false);
        setAdminClaimsReady(true);
        return;
      }

      getIdTokenResult(u, true)
        .then((result) => setIsAdmin(result.claims.role === "admin"))
        .catch(() => setIsAdmin(false))
        .finally(() => setAdminClaimsReady(true));
    });
    
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, adminClaimsReady, authUnavailable, displayName, setDisplayName }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}