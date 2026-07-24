import type { Metadata, Viewport } from "next";
import { LABELS } from "@/config/labels";
import { NavBar } from "@/components/NavBar";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import "./globals.css";

// No imported webfont, by design -- see app/globals.css's --font-sans. The
// brief requires system fonts in low-data mode and a <200KB JS budget on
// the calculator route; rather than treating that as a constraint to work
// around, the system-UI stack was the type decision from the start (Phase
// 8 "The Marked Script" design proposal).

export const metadata: Metadata = {
  title: `${LABELS.app.name} -- ${LABELS.app.fullName}`,
  description: LABELS.app.tagline,
  manifest: "/manifest.json",
  // icon.svg only -- no dedicated PNG icon set (apple-touch-icon,
  // maskable variants) exists yet. iOS "Add to Home Screen" support is a
  // known gap, flagged rather than faked with a broken reference.
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#1c7a4d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* WCAG 2.1 AA "bypass blocks" -- visible only on keyboard focus,
            skips the nav straight to each page's <main id="main-content">. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-mark-green focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        {/* Functional only -- Phase 8 should reconsider whether a
            persistent nav bar belongs above the calculator on "/" at
            all, given the brief's "a learner arriving from a WhatsApp
            link should see subject dropdowns without scrolling"
            requirement (sect. 3). One thin nav row likely doesn't push
            content below the fold on most screens, but this wasn't
            validated against that requirement -- flagged, not resolved. */}
        <AuthProvider>
          <NavBar />
          {children}
        </AuthProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
