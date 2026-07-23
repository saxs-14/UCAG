import { LABELS } from "@/config/labels";

export const metadata = {
  title: `${LABELS.privacy.pageTitle} -- ${LABELS.app.name}`,
};

export default function Privacy() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-8">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <h1 className="text-3xl font-semibold">{LABELS.privacy.pageTitle}</h1>
        <p className="text-base text-gray-600 dark:text-gray-400">{LABELS.privacy.intro}</p>
        {LABELS.privacy.sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
