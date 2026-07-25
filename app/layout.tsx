import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import { LABELS } from "@/config/labels";
import { NavBar } from "@/components/NavBar";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import "./globals.css";

// Body/UI text stays on the system-UI stack, by design -- see app/globals.css's
// --font-sans. The brief's low-data-mode requirement and the <200KB
// calculator-route budget (Phase 8) are real constraints for SA users on
// limited data, not abandoned by the "beautiful/colorful/fun" redesign.
// The one deliberate addition is Fredoka for --font-display (large display
// moments only -- app name, the circled APS number, result headings) --
// next/font self-hosts and subsets it at build time (no runtime Google
// Fonts request), and only 2 weights are pulled in, not the full family.
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

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
    <html lang="en" className={fredoka.variable}>
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
