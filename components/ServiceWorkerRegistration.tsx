"use client";

import { useEffect } from "react";

/**
 * Registers public/sw.js (Phase 8 PWA requirement: "the calculator and the
 * learner's saved results work offline"). A no-op in dev by default --
 * `next dev --turbopack` doesn't need a cached app shell, and iterating
 * against a stale cached bundle is a worse experience than none. Set
 * NEXT_PUBLIC_ENABLE_SW_IN_DEV=true locally if you need to test the
 * service worker itself.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev && process.env.NEXT_PUBLIC_ENABLE_SW_IN_DEV !== "true") return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline support degrading to "just doesn't work offline" is
      // acceptable -- the app must still function fully online either way.
    });
  }, []);

  return null;
}
