import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LABELS } from "@/config/labels";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

// Placeholder fonts -- Phase 8 (design pass) proposes the real token
// system/type pairing before any CSS gets written for real. Do not treat
// this as a design decision.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${LABELS.app.name} -- ${LABELS.app.fullName}`,
  description: LABELS.app.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Functional only -- Phase 8 should reconsider whether a
            persistent nav bar belongs above the calculator on "/" at
            all, given the brief's "a learner arriving from a WhatsApp
            link should see subject dropdowns without scrolling"
            requirement (sect. 3). One thin nav row likely doesn't push
            content below the fold on most screens, but this wasn't
            validated against that requirement -- flagged, not resolved. */}
        <NavBar />
        {children}
      </body>
    </html>
  );
}
