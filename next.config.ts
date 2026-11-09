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
  // The institution detail page renders each university's own real,
  // verified logo (lib/institutions/branding.ts, components/institutions/
  // InstitutionLogo.tsx) as a plain <img> from that institution's own
  // domain -- deliberately NOT proxied through next/image, so this is
  // the only place that needs updating, not images.remotePatterns below.
  // Each hostname here was independently fetched and confirmed to serve
  // a real image (not a guessed path) before being added; institutions
  // without a verified logo (uj, cput) have logoUrl: null and fall back
  // to the text-initial badge instead of needing an entry here.
  "img-src 'self' data: https://www.ump.ac.za https://www.up.ac.za https://www.wits.ac.za https://www.tut.ac.za https://www.uct.ac.za https://www.mandela.ac.za https://www.nwu.ac.za https://ukzn.ac.za",
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
  // Drops the X-Powered-By: Next.js response header -- a free framework
  // fingerprint for an attacker, with no functional purpose.
  poweredByHeader: false,
  // firebase-admin/auth (requireAdmin() -> verifyIdToken(), every
  // /api/admin/* route's actual security gate) depends transitively on
  // jwks-rsa, which itself require()s "jose". jose went fully ESM-only
  // at v6 (package.json exports has no "require" condition at all,
  // just one "default" pointing at an ESM build) while jwks-rsa's own
  // package.json still declares "jose": "^6.1.3" -- a real packaging
  // bug in jwks-rsa@2.x, not a Turbopack/bundler issue (confirmed: a
  // plain `node -e "require('firebase-admin/auth')"` fails the exact
  // same way). The actual fix is package.json's top-level `overrides`
  // pinning jose to the last version with a genuine CJS build
  // (jose@5.10.0 still exports both "require" and "import" conditions;
  // the two jose functions jwks-rsa actually calls, importJWK and
  // exportSPKI, are long-stable and unchanged between v5 and v6).
  // Keeping firebase-admin external here regardless -- standard
  // practice for an SDK with native/grpc dependencies, independent of
  // the jose issue above.
  serverExternalPackages: ["firebase-admin"],
  images: {
    // components/ump/UmpHeader.tsx renders UMP's own hardcoded logo via
    // next/image, which throws a hard server-side render error for any
    // remote host not explicitly allowed here -- this is UMP-specific
    // branding on the UMP sub-experience, not a generic per-institution
    // image path, so a single scoped host entry (not a wildcard) is the
    // right fix rather than a "no fixed institution count" concern.
    remotePatterns: [{ protocol: "https", hostname: "www.ump.ac.za" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Vercel's edge already adds this for production custom domains,
          // but that's a hosting-provider default, not something this repo
          // controls or can verify from the code -- declaring it here means
          // HSTS holds even if this app is ever hosted elsewhere, matching
          // CLAUDE.md's explicit "security headers (CSP, HSTS, X-Frame-
          // Options)" requirement instead of relying on an unverified
          // platform default. 2 years + preload is the standard HSTS
          // baseline for a domain with no non-HTTPS subdomains in use.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
