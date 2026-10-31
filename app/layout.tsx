import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { LABELS } from "@/config/labels";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { ChatWidgetLoader } from "@/components/chat/ChatWidgetLoader";
import { MobileNavBar } from "@/components/MobileNavBar";
import { getBaseUrl } from "@/lib/env/client";
import "./globals.css";

const RICH_FONTS_SCRIPT = `try {
  var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!c || !c.saveData) {
    document.documentElement.setAttribute('data-rich-fonts', 'true');
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }
} catch (e) {}`;

/** A deployed build's static chunks are content-hashed and effectively
 * immutable -- when one fails mid-fetch (seen directly in production:
 * "Failed to load chunk ... from module ..." in the console, the same
 * file reliably returning 200 with correct bytes a moment later on a
 * plain retry, so this is a transient dropped/stalled network request,
 * not a missing or broken build artifact), the failure isn't scoped to
 * whichever component happened to trigger that import -- it can crash
 * hydration for the whole page, since the failing chunk may be a shared
 * one any number of components depend on, not just the one that
 * triggered the fetch. ChatWidgetLoader.tsx's own retry only covers its
 * own lazy import; this is the equivalent backstop for every other
 * chunk Next.js loads, including ones already present in the initial
 * HTML. A plain reload re-fetches the current (already-deployed, still
 * valid) build fresh rather than a stale cached one, which is usually
 * enough to recover. Runs once per tab session (sessionStorage guard) so
 * a persistent, non-transient failure doesn't reload-loop the visitor. */
const CHUNK_ERROR_RECOVERY_SCRIPT = `try {
  var RELOAD_KEY = 'ucagChunkReloadOnce';
  function isChunkError(message) {
    return typeof message === 'string' && (
      message.indexOf('Loading chunk') !== -1 ||
      message.indexOf('Failed to load chunk') !== -1 ||
      message.indexOf('ChunkLoadError') !== -1
    );
  }
  function recoverOnce() {
    if (sessionStorage.getItem(RELOAD_KEY)) return;
    sessionStorage.setItem(RELOAD_KEY, '1');
    location.reload();
  }
  window.addEventListener('error', function (e) { if (isChunkError(e && e.message)) recoverOnce(); });
  window.addEventListener('unhandledrejection', function (e) {
    var reason = e && e.reason;
    var msg = reason && typeof reason === 'object' ? reason.message : reason;
    if (isChunkError(msg)) recoverOnce();
  });
} catch (e) {}`;

/** Without this, Next.js can't resolve the relative openGraph/twitter image
 * URLs below (or any page's `alternates.canonical`) into absolute ones --
 * they'd silently fall back to http://localhost:3000/... in production,
 * which is exactly the kind of broken-looking-but-not-erroring bug a
 * social-share preview or a canonical tag audit would catch and this
 * build step wouldn't. Same getBaseUrl() sitemap.ts/robots.ts already use. */
const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  // A plain string, not { default, template }: every page in this app
  // already manually suffixes its own title with " -- UCAG" (see
  // app/bursaries/page.tsx and friends) -- a template here would double
  // that suffix on every one of them instead of only filling in a gap.
  title: `${LABELS.app.name} -- ${LABELS.app.fullName}`,
  description: LABELS.app.tagline,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    // iOS ignores manifest.json icons entirely for "Add to Home Screen" --
    // this is the only way it picks up a real icon rather than a screenshot.
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  // Google Search Console's HTML-tag verification method -- the actual
  // ownership check still has to happen in Search Console itself (needs
  // whoever owns the Google account/property to add the site there),
  // this just makes the resulting <meta name="google-site-verification">
  // tag show up automatically once GOOGLE_SITE_VERIFICATION is set,
  // without needing a code change at that point. Omitted entirely (not
  // an empty string) when unset, since Metadata.verification.google
  // being present at all is what tells Next.js to render the tag.
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  openGraph: {
    type: "website",
    siteName: LABELS.app.name,
    title: `${LABELS.app.name} -- ${LABELS.app.fullName}`,
    description: LABELS.app.tagline,
    url: baseUrl,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: `${LABELS.app.name} logo` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${LABELS.app.name} -- ${LABELS.app.fullName}`,
    description: LABELS.app.tagline,
    images: ["/og-image.jpg"],
  },
};

/** Organization + WebSite JSON-LD -- describes the site itself, not any
 * fact this app has or hasn't verified, so it carries none of the
 * sourceUrl/verifiedOn/academicYear provenance risk CLAUDE.md's core rule
 * is about. Site-wide (every page inherits it via the root layout)
 * rather than duplicated per page. */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: LABELS.app.name,
      alternateName: LABELS.app.fullName,
      url: baseUrl,
      logo: `${baseUrl}/og-image.jpg`,
      description: LABELS.app.tagline,
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: LABELS.app.name,
      publisher: { "@id": `${baseUrl}/#organization` },
      inLanguage: "en-ZA",
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#14121f", // brand-navy, matches the logomark's badge background
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col antialiased bg-paper text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script id="rich-fonts-detect" strategy="beforeInteractive">
          {RICH_FONTS_SCRIPT}
        </Script>
        <Script id="chunk-error-recovery" strategy="beforeInteractive">
          {CHUNK_ERROR_RECOVERY_SCRIPT}
        </Script>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-brand-navy focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        <AuthProvider>
          <NavBar />
          <main id="main-content" className="flex-1 w-full pb-16 sm:pb-0">
            {children}
          </main>
          <MobileNavBar />
        </AuthProvider>
        <Footer />
        <ServiceWorkerRegistration />
        <ChatWidgetLoader />
      </body>
    </html>
  );
}
