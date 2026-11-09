"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "ucag-theme";

type Theme = "light" | "dark";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// The stored/applied value, if any -- set synchronously by the inline
// script in app/layout.tsx before paint, so this just reads what's
// already on the page rather than re-deciding it.
function getEffectiveTheme(): Theme {
  const current = document.documentElement.getAttribute("data-theme");
  return current === "light" || current === "dark" ? current : getSystemTheme();
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private browsing / storage disabled -- the toggle still works for
    // this page load, it just won't be remembered next visit.
  }
  // Keeps the mobile browser chrome (status bar / task switcher) in sync
  // with the chosen theme instead of only ever following the OS, which
  // viewport.themeColor in app/layout.tsx can't do on its own -- that's
  // static per-request metadata, with no way to react to a client-side
  // toggle.
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content",
    theme === "dark" ? "#0b0a12" : "#fafaf8"
  );
}

export function ThemeToggle() {
  // Starts unknown, not a guessed default -- which icon is "correct"
  // depends on client-only state (a stored choice, or the system
  // preference), and guessing wrong here would mean the icon visibly
  // flips right after mount. A stable placeholder of the same size
  // renders first; the real icon appears once useEffect (post-hydration,
  // so no SSR/client mismatch) reads the actual theme.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(getEffectiveTheme());
  }, []);

  if (theme === null) {
    return <span className="inline-block h-11 w-11 shrink-0" aria-hidden />;
  }

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-soft text-ink-soft shadow-sm transition-all hover:bg-slate-200 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      {theme === "dark" ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  );
}
