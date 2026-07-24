"use client";

import { useMemo, useRef, useState } from "react";
import type { Subject } from "@/lib/firestore/types";

/**
 * A minimal searchable, grouped combobox. Functional baseline only --
 * Phase 8 is the dedicated design/accessibility pass (WCAG 2.1 AA,
 * visible focus states, full keyboard support); this satisfies Phase
 * 2.1's functional requirement (searchable, grouped by category,
 * designated-list subjects visually marked) without pre-empting that.
 */

interface SubjectComboboxProps {
  label: string;
  options: Subject[];
  value: string | null;
  onChange: (code: string | null) => void;
  placeholder?: string;
}

export function SubjectCombobox({
  label,
  options,
  value,
  onChange,
  placeholder = "Search subjects...",
}: SubjectComboboxProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.code === value) ?? null;

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? options.filter((o) => o.name.toLowerCase().includes(q))
      : options;

    const groups = new Map<string, Subject[]>();
    for (const subject of filtered) {
      const key = subject.groupLabel ?? "Other";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(subject);
    }
    return Array.from(groups.entries());
  }, [options, query]);

  function handleSelect(subject: Subject) {
    onChange(subject.code);
    setQuery("");
    setIsOpen(false);
  }

  function handleBlur() {
    // Defer so a click on an option registers before the list closes.
    window.setTimeout(() => setIsOpen(false), 150);
  }

  return (
    <div className="flex flex-col gap-1" ref={containerRef}>
      <label className="text-sm font-medium" htmlFor={`combobox-${label}`}>
        {label}
      </label>
      <div className="relative">
        <input
          id={`combobox-${label}`}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`combobox-listbox-${label}`}
          aria-autocomplete="list"
          className="w-full rounded border border-line bg-paper-raised px-3 py-2 text-sm text-ink focus:border-mark-green focus:outline-none"
          placeholder={selected ? selected.name : placeholder}
          value={isOpen ? query : selected?.name ?? ""}
          onFocus={() => {
            setIsOpen(true);
            setQuery("");
          }}
          onBlur={handleBlur}
          onChange={(e) => setQuery(e.target.value)}
        />
        {selected && !isOpen && (
          <button
            type="button"
            aria-label={`Clear ${label}`}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-soft"
            onClick={() => onChange(null)}
          >
            ×
          </button>
        )}
        {isOpen && (
          <ul
            id={`combobox-listbox-${label}`}
            role="listbox"
            className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded border border-line bg-paper-raised shadow-lg"
          >
            {grouped.length === 0 && (
              <li className="px-3 py-2 text-sm text-ink-faint">No subjects match.</li>
            )}
            {grouped.map(([groupLabel, subjects]) => (
              <li key={groupLabel}>
                <div className="bg-slate-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  {groupLabel}
                </div>
                <ul>
                  {subjects.map((subject) => (
                    <li key={subject.code}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={subject.code === value}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-mark-green-soft"
                        onClick={() => handleSelect(subject)}
                      >
                        <span className="text-ink">{subject.name}</span>
                        {subject.isDesignated && (
                          <span className="ml-2 rounded bg-mark-green-soft px-1.5 py-0.5 text-[10px] font-medium text-mark-green">
                            Designated
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
