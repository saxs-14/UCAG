import { CalculatorPage } from "@/components/CalculatorPage";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 p-6 sm:p-8">
        <CalculatorPage />
      </div>
    </main>
  );
}
