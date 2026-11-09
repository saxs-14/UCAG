import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { LABELS } from "@/config/labels";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AdminRedirect } from "@/components/auth/AdminRedirect";
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

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: `${LABELS.app.name} -- ${LABELS.app.fullName}`,
  description: LABELS.app.tagline,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0a12" },
  ],
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
          <AdminRedirect />
          <NavBar />
          <main id="main-content" className="flex-1 w-full pb-16 sm:pb-0">
            {children}
          </main>
          <MobileNavBar />
          <ChatWidgetLoader />
        </AuthProvider>
        <Footer />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}