import { AccountPage } from "@/components/auth/AccountPage";
import { LABELS } from "@/config/labels";
import { PageHero } from "@/components/PageHero";

export const metadata = {
  title: `${LABELS.account.pageTitle} -- ${LABELS.app.name}`,
  description: LABELS.account.pageSubtitle,
  alternates: { canonical: "/account" },
  robots: { index: false, follow: true },
};

export default function Account() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center bg-gradient-to-b from-brand-teal/10 to-paper pb-12">
      <PageHero title={LABELS.account.pageTitle} subtitle={LABELS.account.pageSubtitle} />
      <div className="flex w-full max-w-5xl flex-col items-center gap-8 p-6 sm:p-10">
        <div className="w-full rounded-3xl border border-brand-teal/15 bg-white/90 p-6 shadow-2xl shadow-brand-teal/5 backdrop-blur-sm transition-all hover:shadow-brand-teal/10 sm:p-12">
          <AccountPage />
        </div>
      </div>
    </main>
  );
}