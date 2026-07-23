import Link from "next/link";
import { LABELS } from "@/config/labels";

/** Minimal functional nav -- Phase 8 owns the real design pass. */
export function NavBar() {
  return (
    <nav className="no-print flex gap-4 border-b border-gray-200 p-4 text-sm dark:border-gray-800">
      <Link href="/" className="hover:underline">
        {LABELS.nav.calculator}
      </Link>
      <Link href="/bursaries" className="hover:underline">
        {LABELS.nav.bursaries}
      </Link>
      <Link href="/statistics" className="hover:underline">
        {LABELS.nav.statistics}
      </Link>
      <Link href="/account" className="hover:underline">
        {LABELS.nav.profile}
      </Link>
    </nav>
  );
}
