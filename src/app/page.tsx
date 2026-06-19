import Link from 'next/link';
import { GraduationCap, Users, Compass, BarChart3, Sparkles, ArrowRight, MapPin, FileText, Award, ClipboardList, BookOpen } from 'lucide-react';
import { APSCalculatorShell } from '@/components/aps/APSCalculatorShell';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-navy-grad p-8 sm:p-12 text-white">
        <div className="absolute -top-20 -right-20 w-80 h-80 opacity-[0.07] bg-sunburst rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 opacity-[0.06] bg-ugold-500 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-full h-full bg-hero-radial pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3.5 py-1 text-xs font-semibold text-white/90 mb-5">
            <MapPin size={11} />
            University of Mpumalanga — Mbombela Campus
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
            Your path to{' '}
            <span className="bg-gradient-to-r from-ugold-300 to-uorange-400 bg-clip-text text-transparent">
              UMP starts here.
            </span>
          </h1>

          <p className="text-white/80 text-base sm:text-lg max-w-xl leading-relaxed mb-8">
            Free AI-powered platform helping Mpumalanga Grade 12 learners calculate APS scores,
            discover UMP qualifications, connect with peer mentors, and access bursary funding —
            available in five local languages.
          </p>

          <div className="flex flex-wrap gap-3">
            <a href="#aps-calculator" className="btn-red">
              Calculate My APS <ArrowRight size={15} />
            </a>
            <Link href="/career" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
              <Sparkles size={14} /> AI Career Guidance
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-10 pt-8 border-t border-white/15">
            {[
              { num: '10',   lbl: 'UMP Qualifications' },
              { num: '5',    lbl: 'Languages Supported' },
              { num: 'NSC',  lbl: 'APS Compliant' },
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
        <h2 className="text-[11px] font-bold text-navy-500 dark:text-navy-400 mb-4 uppercase tracking-widest">
          What UCAG can do for you
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: '/career',         icon: Compass,       color: 'text-ugold-700',   bg: 'bg-ugold-50   dark:bg-ugold-900/20',   title: 'AI Career Guidance',     desc: 'Live Gemini AI analysis of your subjects → personalised career narrative and course recommendations.' },
            { href: '/mentorship',     icon: Users,         color: 'text-ured-600',    bg: 'bg-ured-50    dark:bg-ured-900/20',    title: 'Peer Mentorship',        desc: 'Connect with UMP student mentors matched to your subject needs and district.' },
            { href: '/bursary',        icon: Award,         color: 'text-ugreen-700',  bg: 'bg-ugreen-50  dark:bg-ugreen-900/20',  title: 'Bursary Finder',         desc: 'Discover NSFAS, Funza Lushaka, Sasol, and Mpumalanga Provincial bursaries relevant to your course.' },
            { href: '/roadmap',        icon: FileText,      color: 'text-navy-700',    bg: 'bg-navy-50    dark:bg-navy-800',        title: 'My Roadmap',             desc: 'Step-by-step personal checklist from your current marks to a submitted UMP application.' },
            { href: '/tracker',        icon: ClipboardList, color: 'text-uorange-600', bg: 'bg-uorange-50 dark:bg-uorange-900/20', title: 'Application Tracker',    desc: 'Track your 10-step UMP application checklist, save target courses, and snapshot your APS — synced to your account.' },
            { href: '/analytics',      icon: BarChart3,     color: 'text-navy-700',    bg: 'bg-navy-50    dark:bg-navy-800',        title: 'School Analytics',       desc: 'Regional APS trends, struggling subjects, and application-readiness rates for Mpumalanga schools.' },
          ].map(item => {
            const Icon = item.icon;
            const isAnchor = item.href.startsWith('#');
            const props = { href: item.href, className: 'card p-5 flex flex-col gap-3 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group' };
            const content = (
              <>
                <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                  <Icon size={20} className={item.color} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy-900 dark:text-white group-hover:text-navy-700 dark:group-hover:text-navy-300 mb-1">{item.title}</h3>
                  <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed">{item.desc}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-navy-400 group-hover:text-navy-600 dark:group-hover:text-navy-300 transition-colors mt-auto">
                  Open <ArrowRight size={11} />
                </div>
              </>
            );
            return isAnchor
              ? <a key={item.href} {...props}>{content}</a>
              : <Link key={item.href} {...props}>{content}</Link>;
          })}
        </div>
      </section>

      {/* APS Calculator */}
      <section id="aps-calculator">
        <div className="flex items-center gap-2 mb-5">
          <BookOpen size={18} className="text-navy-700" />
          <h2 className="text-xl font-bold text-navy-900 dark:text-white">APS Calculator</h2>
          <span className="badge badge-navy ml-auto">NSC Compliant</span>
        </div>
        <APSCalculatorShell showExport />
      </section>
    </div>
  );
}
