import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LABELS } from "@/config/labels";

const YEAR = new Date().getFullYear();

/**
 * A real site footer -- the single biggest fix in this pass, per user
 * feedback that the previous version "doesn't look like a website."
 * The site previously just stopped after each page's content with
 * nothing below it, which reads as unfinished no matter what the rest
 * of the page looks like. Institutional reference (csir.co.za): name/
 * mandate, a link column, and a compliance/legal line -- this is that
 * structure at UCAG's actual scale, not padded out with fabricated
 * contact details or a physical address the app doesn't have.
 */
export function Footer() {
  return (
    <footer className="no-print brand-band mt-auto">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 sm:flex-row sm:justify-between sm:px-8">
        <div className="flex max-w-sm flex-col gap-2">
          <Logo size={26} wordmarkClassName="text-lg text-white" />
          <p className="text-sm text-white/70">{LABELS.footer.about}</p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <p className="font-semibold uppercase tracking-wide text-white/50">{LABELS.footer.linksHeading}</p>
          <Link href="/" className="text-white/80 hover:text-white hover:underline">
            {LABELS.nav.calculator}
          </Link>
          <Link href="/bursaries" className="text-white/80 hover:text-white hover:underline">
            {LABELS.nav.bursaries}
          </Link>
          <Link href="/statistics" className="text-white/80 hover:text-white hover:underline">
            {LABELS.nav.statistics}
          </Link>
          <Link href="/privacy" className="text-white/80 hover:text-white hover:underline">
            {LABELS.account.privacyNoticeLink}
          </Link>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <p className="font-semibold uppercase tracking-wide text-white/50">{LABELS.footer.aboutHeading}</p>
          <p className="max-w-xs text-white/70">{LABELS.footer.verificationNote}</p>
        </div>
      </div>

      {/* pr-20 keeps this clear of ChatWidget's fixed bottom-4 right-4
          floating button, which otherwise sits directly over this line
          whenever a visitor scrolls to the true bottom of any page. */}
      <div className="border-t border-white/10 px-6 py-4 pr-20 text-xs text-white/50 sm:px-8 sm:pr-24">
        © {YEAR} {LABELS.footer.copyright}
      </div>
    </footer>
  );
}
