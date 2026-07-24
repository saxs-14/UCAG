import { LABELS } from "@/config/labels";

export const metadata = {
  title: `${LABELS.privacy.pageTitle} -- ${LABELS.app.name}`,
};

export default function Privacy() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center gap-6 p-6 sm:p-8">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{LABELS.privacy.pageTitle}</h1>
        <p className="text-base text-ink-soft">{LABELS.privacy.intro}</p>
        {LABELS.privacy.sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-1">
            <h2 className="text-lg font-bold tracking-tight text-ink">{section.heading}</h2>
            <p className="text-sm text-ink-soft">{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
