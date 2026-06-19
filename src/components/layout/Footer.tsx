import Image from 'next/image';
import { MapPin, BookOpen, Globe, Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-navy-100 dark:border-navy-800 bg-white dark:bg-navy-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Brand */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image src="/University-of-Mpumalanga-UMP-logo.png" alt="UMP" fill className="object-contain" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-navy-900 dark:text-white">UCAG</div>
              <div className="text-[11px] text-navy-500 dark:text-navy-400">University of Mpumalanga</div>
            </div>
          </div>
          <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed max-w-xs">
            A free platform helping Mpumalanga learners navigate higher education — APS calculation, career guidance, mentorship, and bursary discovery.
          </p>
        </div>

        {/* Quick facts */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-navy-700 dark:text-navy-300 uppercase tracking-widest mb-1">Platform</h3>
          {[
            { icon: BookOpen, text: '10 UMP qualifications' },
            { icon: Globe,    text: '5 local languages' },
            { icon: MapPin,   text: 'Mbombela, Mpumalanga' },
            { icon: Shield,   text: 'NSC-compliant APS logic' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-navy-500 dark:text-navy-400">
              <Icon size={13} className="text-navy-400 dark:text-navy-500 flex-shrink-0" />
              {text}
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-navy-700 dark:text-navy-300 uppercase tracking-widest mb-1">Important</h3>
          <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">
            UCAG is an independent student innovation project and is not affiliated with, endorsed by, or an official system of the University of Mpumalanga.
          </p>
          <p className="text-xs text-navy-400 dark:text-navy-500 leading-relaxed">
            Always verify APS requirements and closing dates directly with UMP admissions at{' '}
            <span className="text-navy-600 dark:text-navy-400 font-medium">apply.ump.ac.za</span>.
          </p>
        </div>
      </div>

      <div className="border-t border-navy-100 dark:border-navy-800 py-3 px-6 text-center">
        <p className="text-[11px] text-navy-400 dark:text-navy-600">
          © 2026 UCAG Student Innovation Project · Powered by Google Gemini AI · Built with Next.js
        </p>
      </div>
    </footer>
  );
}
