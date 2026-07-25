import Link from "next/link";
import { LABELS } from "@/config/labels";

const LINK_CLASS =
  "text-ink-soft transition-colors hover:text-brand-teal border-b-2 border-transparent hover:border-brand-coral pb-0.5";

export function NavBar() {
  return (
    <nav className="no-print flex gap-5 border-b border-line bg-paper-raised px-4 py-3 text-sm font-medium">
      <Link href="/" className={LINK_CLASS}>
        {LABELS.nav.calculator}
      </Link>
      <Link href="/bursaries" className={LINK_CLASS}>
        {LABELS.nav.bursaries}
      </Link>
      <Link href="/statistics" className={LINK_CLASS}>
        {LABELS.nav.statistics}
      </Link>
      <Link href="/account" className={LINK_CLASS}>
        {LABELS.nav.profile}
      </Link>
    </nav>
  );
}
