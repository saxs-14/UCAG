import { AccountPage } from "@/components/auth/AccountPage";
import { LABELS } from "@/config/labels";
import { PageHero } from "@/components/PageHero";

export const metadata = {
  title: `${LABELS.account.pageTitle} -- ${LABELS.app.name}`,
  description: LABELS.account.pageSubtitle,
  alternates: { canonical: "/account" },
  // Real account settings behind auth -- nothing here is content worth a
  // stranger finding via search, and indexing it would just show Google
  // an empty/signed-out shell.
  robots: { index: false, follow: true },
};

export default function Account() {
  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <PageHero title={LABELS.account.pageTitle} subtitle={LABELS.account.pageSubtitle} />
      <div className="flex w-full flex-col items-center gap-6 p-6 sm:p-8">
        <AccountPage />
      </div>
    </main>
  );
}
