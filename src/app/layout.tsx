import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { MpumiChat } from '@/components/chat/MpumiChat';

export const metadata: Metadata = {
  title: 'UCAG — University Course Advisory Guide | University of Mpumalanga',
  description: 'Free AI-powered educational platform helping Mpumalanga Grade 12 learners calculate APS scores, discover UMP qualifications, connect with peer mentors, and access bursary funding — in five local languages.',
  keywords: ['UMP', 'University of Mpumalanga', 'APS Calculator', 'Mpumalanga', 'university courses', 'bursary', 'NSFAS', 'Grade 12', 'career guidance'],
  authors: [{ name: 'UCAG Student Innovation Project' }],
  openGraph: {
    title: 'UCAG — University Course Advisory Guide',
    description: 'Free AI-powered career and course guidance for Mpumalanga learners.',
    type: 'website',
    locale: 'en_ZA',
  },
};

export const viewport: Viewport = {
  themeColor: '#0C246C',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-navy-900 antialiased">
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
        <MpumiChat />
      </body>
    </html>
  );
}
