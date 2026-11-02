"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev && process.env.NEXT_PUBLIC_ENABLE_SW_IN_DEV !== "true") return;

    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}