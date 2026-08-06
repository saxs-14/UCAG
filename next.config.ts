import type { NextConfig } from "next";

/**
 * next.config.ts previously set no headers at all. This CSP allows:
 * self (the app's own scripts/styles/images), 'unsafe-inline' for
 * script-src because app/layout.tsx's RICH_FONTS_SCRIPT is an inline
 * beforeInteractive <Script> with no nonce wired up (a nonce-based
 * tightening is a real follow-up, not attempted here under deadline
 * pressure), Google Fonts (the same RICH_FONTS_SCRIPT's stylesheet
 * link), and https://*.googleapis.com for connect-src -- the Firebase
 * client SDK (Auth + Firestore) talks to several *.googleapis.com
 * subdomains, and the wildcard avoids this list silently breaking sign-in
 * or a Firestore read if Firebase changes which exact subdomain it uses.
 * The Gemini API itself is never called from the browser (secrets never
 * reach the browser -- CLAUDE.md non-negotiable #1), so it isn't listed
 * here at all.
 *
 * script-src also allows https://apis.google.com and a dedicated
 * frame-src allows https://*.firebaseapp.com -- both found missing by
 * live-testing this exact CSP against a real Google popup sign-in
 * (SignInForm/SignUpForm's signInWithPopup + browserPopupRedirectResolver,
 * see lib/firebase/client.ts), not added speculatively. Firebase's popup
 * resolver injects a <script src="https://apis.google.com/js/api.js">
 * into this page to load its gapi.iframes helper, then that helper opens
 * a hidden iframe pointing at the configured Auth domain
 * (NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, the standard Firebase pattern is
 * "<project-id>.firebaseapp.com") to talk reliably to the popup window.
 * Without both of these the "Continue with Google" button fails silently
 * behind two separate CSP violations (script-src, then frame-src) --
 * confirmed by clicking it end-to-end against the local Auth emulator
 * with a headless Chromium instance and watching the console. Email/
 * password sign-in (signInWithEmailAndPassword) needs neither -- it's a
 * plain fetch already covered by connect-src's *.googleapis.com wildcard.
 *
 * connect-src also conditionally admits the local Firebase emulator
 * origins when NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true. This is a
 * build-time env check -- it's evaluated once when next.config.ts loads,
 * not per-request, so it never reaches a real production build (which
 * never sets that flag). Without it, lib/firebase/client.ts's
 * connectAuthEmulator("http://127.0.0.1:9099") and
 * lib/firebase/firestoreClient.ts's connectFirestoreEmulator("127.0.0.1",
 * 8080) calls would have every sign-in and Firestore read blocked by
 * this same CSP during local dev (headers() applies under `next dev`
 * too), against this project's documented normal local-dev workflow of
 * running against the emulator suite.
 */
const isFirebaseEmulatorMode = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://apis.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  [
    "connect-src 'self' https://*.googleapis.com",
    isFirebaseEmulatorMode ? "http://127.0.0.1:9099 http://127.0.0.1:8080" : "",
  ]
    .filter(Boolean)
    .join(" "),
  "frame-src https://*.firebaseapp.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
