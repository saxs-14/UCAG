'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { GraduationCap, Users, Compass, BarChart3, Moon, Sun, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/',             label: 'APS Calculator',  icon: GraduationCap },
  { href: '/mentorship',   label: 'Mentorship',       icon: Users         },
  { href: '/career',       label: 'Career Guidance',  icon: Compass       },
  { href: '/analytics',    label: 'School Analytics', icon: BarChart3     },
];

export function Navigation() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('ucag-theme');
    if (stored === 'dark') {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('ucag-theme', next ? 'dark' : 'light');
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-navy-900 shadow-nav border-b border-navy-100 dark:border-navy-800">
      {/* Top identity strip */}
      <div className="bg-navy-800 text-center py-1 px-4">
        <p className="text-navy-200 text-[11px] font-medium tracking-wide">
          An independent student innovation project — not an official University of Mpumalanga system.
        </p>
      </div>

      {/* Main nav bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative w-9 h-9 flex-shrink-0">
            <Image
              src="/University-of-Mpumalanga-UMP-logo.png"
              alt="UMP logo"
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
        <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150',
                  active
                    ? 'bg-navy-800 text-white shadow-sm'
                    : 'text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={14} />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg text-navy-500 dark:text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-navy-600 hover:bg-navy-50 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-navy-100 dark:border-navy-800 bg-white dark:bg-navy-900 px-4 py-3 flex flex-col gap-1 animate-fade-in">
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
                <Icon size={16} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
