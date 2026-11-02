import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LABELS } from "@/config/labels";

const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="no-print mt-auto border-t border-line/60 bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-14 sm:flex-row sm:justify-between sm:px-8 lg:px-8">
        <div className="flex max-w-sm flex-col gap-3">
          <Logo size={32} wordmarkClassName="text-xl font-black text-white" />
          <p className="text-sm font-medium leading-relaxed text-slate-400">{LABELS.footer.about}</p>
        </div>

        <div className="flex flex-col gap-3 text-sm font-medium">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">{LABELS.footer.linksHeading}</p>
          <Link href="/" className="text-slate-300 transition-colors hover:text-white hover:underline">
            {LABELS.nav.calculator}
          </Link>
          <Link href="/bursaries" className="text-slate-300 transition-colors hover:text-white hover:underline">
            {LABELS.nav.bursaries}
          </Link>
          <Link href="/internships" className="text-slate-300 transition-colors hover:text-white hover:underline">
            {LABELS.nav.internships}
          </Link>
          <Link href="/programmes" className="text-slate-300 transition-colors hover:text-white hover:underline">
            {LABELS.nav.programmes}
          </Link>
          <Link href="/privacy" className="text-slate-300 transition-colors hover:text-white hover:underline">
            {LABELS.account.privacyNoticeLink}
          </Link>
        </div>

        <div className="flex flex-col gap-3 text-sm font-medium">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">{LABELS.footer.aboutHeading}</p>
          <p className="max-w-xs leading-relaxed text-slate-400">{LABELS.footer.verificationNote}</p>
        </div>
      </div>

      <div className="border-t border-slate-800 px-6 py-6 pr-20 text-xs font-semibold text-slate-500 sm:px-8 sm:pr-24 lg:px-8">
        © {YEAR} {LABELS.footer.copyright}
      </div>
    </footer>
  );
}