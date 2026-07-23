import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LABELS } from "@/config/labels";
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
        {children}
      </body>
    </html>
  );
}
