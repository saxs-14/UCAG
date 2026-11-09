"use client";

import { useId, useState } from "react";
import { LABELS } from "@/config/labels";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  minLength?: number;
}

function EyeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.4 18.4 0 0 1 4.22-5.19M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

/**
 * The conventional pattern: hidden by default (type="password"), click
 * the eye icon to reveal it as plain text. Email fields are deliberately
 * NOT masked anywhere in this app -- there's nothing to hide in an email
 * address, and hiding it only makes it harder to catch a typo, not easier.
 */
export function PasswordInput({ value, onChange, autoComplete = "current-password", minLength }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();

  return (
    <div className="relative">
      <input
        id={inputId}
        type={visible ? "text" : "password"}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        className="min-h-12 w-full rounded-xl border border-line bg-paper-raised px-4 pr-12 text-base font-medium text-ink transition-all focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? LABELS.account.hidePasswordLabel : LABELS.account.showPasswordLabel}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-faint transition-colors hover:text-brand-teal focus-visible:text-brand-teal focus:outline-none"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}
