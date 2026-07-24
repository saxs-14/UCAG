import Link from "next/link";
import { LABELS } from "@/config/labels";

export function NavBar() {
  return (
    <nav className="no-print flex gap-5 border-b border-line bg-paper-raised px-4 py-3 text-sm font-medium">
      <Link href="/" className="text-ink-soft hover:text-mark-green">
        {LABELS.nav.calculator}
      </Link>
      <Link href="/bursaries" className="text-ink-soft hover:text-mark-green">
        {LABELS.nav.bursaries}
      </Link>
      <Link href="/statistics" className="text-ink-soft hover:text-mark-green">
        {LABELS.nav.statistics}
      </Link>
      <Link href="/account" className="text-ink-soft hover:text-mark-green">
        {LABELS.nav.profile}
      </Link>
    </nav>
  );
}
