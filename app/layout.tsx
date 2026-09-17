import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { LABELS } from "@/config/labels";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { ChatWidgetLoader } from "@/components/chat/ChatWidgetLoader";
import { getCatalogStats } from "@/lib/catalog/getCatalogStats";
import { MobileNavBar } from "@/components/MobileNavBar";
import { getBaseUrl } from "@/lib/env/client";
import "./globals.css";

const RICH_FONTS_SCRIPT = `try {
  var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!c || !c.saveData) {
    document.documentElement.setAttribute('data-rich-fonts', 'true');
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }
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
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
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
  themeColor: "#0f2438",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const stats = await getCatalogStats().catch(() => null);

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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-brand-navy focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        <AuthProvider>
          <NavBar stats={stats} />
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
