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

export const metadata: Metadata = {
  title: `${LABELS.app.name} -- ${LABELS.app.fullName}`,
  description: LABELS.app.tagline,
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
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
