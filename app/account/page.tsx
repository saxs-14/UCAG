import { AccountPage } from "@/components/auth/AccountPage";
import { LABELS } from "@/config/labels";

export const metadata = {
  title: `${LABELS.account.pageTitle} -- ${LABELS.app.name}`,
};

export default function Account() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center gap-6 p-6 sm:p-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{LABELS.account.pageTitle}</h1>
      <AccountPage />
    </main>
  );
}
