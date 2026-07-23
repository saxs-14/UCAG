import { AccountPage } from "@/components/auth/AccountPage";
import { LABELS } from "@/config/labels";

export const metadata = {
  title: `${LABELS.account.pageTitle} -- ${LABELS.app.name}`,
};

export default function Account() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-8">
      <h1 className="text-3xl font-semibold">{LABELS.account.pageTitle}</h1>
      <AccountPage />
    </main>
  );
}
