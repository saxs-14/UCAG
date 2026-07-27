import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { LABELS } from "@/config/labels";
import { NavBar } from "@/components/NavBar";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { ChatWidgetLoader } from "@/components/chat/ChatWidgetLoader";
import "./globals.css";

// Body/UI text stays on the system-UI stack, by design -- see app/globals.css's
// --font-sans. The brief's low-data-mode requirement and the <200KB
// calculator-route budget (Phase 8) are real constraints for SA users on
// limited data, not abandoned by the "beautiful/colorful/fun" redesign.
// Fredoka (large display moments -- app name, the circled APS number,
// result headings) and Caveat (the "marked in pen" accent -- eyebrow
// labels, hand-drawn annotations, never body copy) are loaded via a
// plain <link> injected by the script below, NOT next/font, and that's
// a deliberate correction, not a downgrade:
//
// next/font's self-hosting is normally the right call (no third-party
// request), but it bakes the font's @font-face rule into the single CSS
// bundle every visitor gets, unconditionally, since server-rendered HTML
// can never know navigator.connection.saveData's value at generation
// time. Two rounds of live verification against a real production build
// (not dev) proved that's fatal for a genuine low-data guarantee: neither
// an opt-out CSS override NOR an opt-in default (both tried, both
// confirmed working correctly for computed *style*) stopped the actual
// network request -- this Chromium build fetches a @font-face resource
// once its rule is present and its unicode-range matches page content,
// regardless of whether any element's resolved style actually uses that
// font-family. The only way to guarantee zero bytes for a saveData
// visitor is for the font reference to not exist in the DOM/CSSOM at all
// by default -- hence a dynamically-injected <link>, added only after
// confirming saveData is off, trading the self-hosting property for a
// guarantee that actually holds.
const RICH_FONTS_SCRIPT = `try {
  var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!c || !c.saveData) {
    document.documentElement.setAttribute('data-rich-fonts', 'true');
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;700&family=Caveat:wght@600;700&display=swap';
    document.head.appendChild(link);
  }
} catch (e) {}`;

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
    // suppressHydrationWarning: the RICH_FONTS_SCRIPT below sets
    // data-rich-fonts on this element based on navigator.connection, a
    // client-only signal the server genuinely cannot know at render
    // time -- the resulting mismatch on first hydration is expected and
    // intentional (same reasoning next-themes and other client-signal
    // detection scripts rely on), not something to silently patch away.
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {/* Shared SVG filter defs, zero-sized and never rendered directly --
            referenced via CSS `filter: url(#...)` wherever a "drawn by
            hand, not a vector tool" wobble is wanted (headings' underline
            strokes, card outlines). One definition here instead of
            duplicating the filter markup in every component that uses it. */}
        <svg width="0" height="0" aria-hidden="true" className="pointer-events-none absolute">
          <filter id="hand-wobble">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
          </filter>
        </svg>
        {/* Phase 8 brief, verbatim: "Ship a low-data mode: no hero imagery,
            system fonts, deferred charts. Detect navigator.connection.saveData
            and honour it." Every visitor, saveData or not, sees the system
            font first; non-data-saver visitors upgrade to Fredoka as soon as
            this script confirms they're not on a metered connection and
            injects its stylesheet -- see the comment above RICH_FONTS_SCRIPT
            for why this is a dynamically-added <link>, not next/font.
            beforeInteractive scripts run before hydration regardless of
            where they sit in the tree (Next.js hoists them into <head>
            itself) -- they must still be placed inside <body> in JSX, not
            as a direct child of <html>, which is invalid HTML and was
            producing a real hydration error on every page. */}
        <Script id="rich-fonts-detect" strategy="beforeInteractive">
          {RICH_FONTS_SCRIPT}
        </Script>
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
        <ChatWidgetLoader />
      </body>
    </html>
  );
}
