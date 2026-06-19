'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { GraduationCap, Users, Compass, BarChart3, Moon, Sun, Menu, X, Award, FileText, ClipboardList, Contrast } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/',           label: 'APS Calc',      icon: GraduationCap },
  { href: '/career',     label: 'Career',         icon: Compass       },
  { href: '/bursary',    label: 'Bursaries',      icon: Award         },
  { href: '/roadmap',    label: 'Roadmap',        icon: FileText      },
  { href: '/tracker',    label: 'Tracker',        icon: ClipboardList },
  { href: '/mentorship', label: 'Mentorship',     icon: Users         },
  { href: '/analytics',  label: 'Analytics',      icon: BarChart3     },
];

export function Navigation() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [hc, setHc] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('ucag-theme');
    if (stored === 'dark') { setDark(true); document.documentElement.classList.add('dark'); }
    const storedHc = localStorage.getItem('ucag-hc');
    if (storedHc === 'on') { setHc(true); document.documentElement.classList.add('hc'); }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('ucag-theme', next ? 'dark' : 'light');
  };

  const toggleHc = () => {
    const next = !hc;
    setHc(next);
    document.documentElement.classList.toggle('hc', next);
    localStorage.setItem('ucag-hc', next ? 'on' : 'off');
  };

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-navy-900 shadow-nav border-b border-navy-100 dark:border-navy-800">
      {/* Identity strip */}
      <div className="bg-navy-800 text-center py-1 px-4">
        <p className="text-navy-200 text-[11px] font-medium tracking-wide">
          An independent student innovation project — not an official University of Mpumalanga system.
        </p>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative w-9 h-9 flex-shrink-0">
            <Image
              src="/University-of-Mpumalanga-UMP-logo.png"
              alt="University of Mpumalanga logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-extrabold text-navy-900 dark:text-white leading-tight">UCAG</div>
            <div className="text-[10px] text-navy-500 dark:text-navy-400 font-medium leading-tight">Course Advisory Guide</div>
          </div>
        </Link>

        {/* Desktop tabs */}
        <nav className="hidden lg:flex items-center gap-0.5" role="navigation" aria-label="Main navigation">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all duration-150',
                  active
                    ? 'bg-navy-800 text-white shadow-sm'
                    : 'text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={13} />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleHc}
            aria-label={hc ? 'Turn off high contrast' : 'Turn on high contrast'}
            title={hc ? 'High contrast: ON' : 'High contrast: OFF'}
            className={cn(
              'p-2 rounded-lg transition-colors',
              hc
                ? 'bg-ugold-400 text-navy-900 hover:bg-ugold-500'
                : 'text-navy-500 dark:text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-800'
            )}
          >
            <Contrast size={16} />
          </button>
          <button
            onClick={toggleDark}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg text-navy-500 dark:text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            className="lg:hidden p-2 rounded-lg text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="lg:hidden border-t border-navy-100 dark:border-navy-800 bg-white dark:bg-navy-900 px-4 py-3 grid grid-cols-2 gap-1 animate-fade-in">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                  active
                    ? 'bg-navy-800 text-white'
                    : 'text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800'
                )}
              >
                <Icon size={15} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
