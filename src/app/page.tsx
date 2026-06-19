import Link from 'next/link';
import { GraduationCap, Users, Compass, BarChart3, Sparkles, ArrowRight, BookOpen, MapPin } from 'lucide-react';
import { APSCalculatorShell } from '@/components/aps/APSCalculatorShell';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-navy-gradient bg-navy-grad p-8 sm:p-12 text-white">
        {/* Decorative sunburst */}
        <div className="absolute -top-20 -right-20 w-72 h-72 opacity-10 sunburst-decor rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 opacity-5 bg-ugold-500 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3.5 py-1 text-xs font-semibold text-white/90 mb-5">
            <MapPin size={11} />
            University of Mpumalanga — Mbombela
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
            Your path to{' '}
            <span className="text-gradient-gold">UMP starts here.</span>
          </h1>

          <p className="text-white/80 text-base sm:text-lg max-w-xl leading-relaxed mb-8">
            Free AI-powered platform helping Mpumalanga Grade 12 learners calculate APS scores,
            discover UMP qualifications, connect with peer mentors, and access bursary funding —
            available in five local languages.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/" className="btn-red">
              Calculate My APS <ArrowRight size={15} />
            </Link>
            <Link href="/career" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-btn border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
              <Sparkles size={14} /> AI Career Guidance
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-10 pt-8 border-t border-white/15">
            {[
              { num: '10', lbl: 'UMP Qualifications' },
              { num: '5',  lbl: 'Languages Supported' },
              { num: 'NSC', lbl: 'APS Compliant' },
              { num: 'Free', lbl: 'Open Access' },
            ].map(s => (
              <div key={s.lbl}>
                <div className="text-2xl font-black text-ugold-400 leading-none">{s.num}</div>
                <div className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mt-0.5">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section>
        <h2 className="text-lg font-bold text-navy-700 dark:text-navy-300 mb-4 uppercase tracking-wider text-sm">
          What UCAG can do for you
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: '/',           icon: GraduationCap, color: 'text-navy-700',   bg: 'bg-navy-50',    title: 'APS Calculator',     desc: 'NSC-compliant score with stream presets and live qualification matching.' },
            { href: '/mentorship', icon: Users,         color: 'text-ured-600',   bg: 'bg-ured-50',    title: 'Peer Mentorship',    desc: 'Connect with UMP student mentors from your district by subject need.' },
            { href: '/career',     icon: Compass,       color: 'text-ugold-700',  bg: 'bg-ugold-50',   title: 'AI Career Guidance', desc: 'Live Gemini AI analysis of your subjects → personalised career narrative.' },
            { href: '/analytics',  icon: BarChart3,     color: 'text-ugreen-700', bg: 'bg-ugreen-50',  title: 'School Analytics',  desc: 'Regional performance data and application-readiness trends for Mpumalanga schools.' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="card p-5 flex flex-col gap-3 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                  <Icon size={20} className={item.color} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy-900 dark:text-white group-hover:text-navy-700 mb-1">{item.title}</h3>
                  <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">{item.desc}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-navy-400 group-hover:text-navy-600 transition-colors mt-auto">
                  Open <ArrowRight size={11} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Inline APS Calculator */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <BookOpen size={18} className="text-navy-700" />
          <h2 className="text-xl font-bold text-navy-900 dark:text-white">APS Calculator</h2>
          <span className="badge badge-navy ml-auto">NSC Compliant</span>
        </div>
        <APSCalculatorShell />
      </section>
    </div>
  );
}
