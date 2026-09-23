import type { Metadata } from "next";
import { CalculatorPage } from "@/components/CalculatorPage";

// No title/description here -- the root layout's already describe the
// homepage correctly, and this only needs to add the one thing that
// isn't safe to set at the root (see app/layout.tsx's own comment on why
// a root-level canonical would incorrectly apply to every page that
// doesn't set its own, e.g. /login, /register).
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main id="main-content" className="flex flex-1 flex-col bg-paper">
      <CalculatorPage />
    </main>
  );
}
