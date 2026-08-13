// cSpell:words Siyabuswa Mpumalanga Mbombela Nelspruit
import type { ReactNode } from "react";

/**
 * Shared layout for all /ump/* pages.
 * Applies the UMP brand (navy, gold, teal) to every sub-page automatically.
 */
export default function UmpLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
