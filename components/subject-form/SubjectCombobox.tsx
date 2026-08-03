"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Subject } from "@/lib/firestore/types";

/**
 * A searchable, grouped combobox with full keyboard support (ArrowUp/
 * ArrowDown to move the highlight, Enter to select it, Escape to close)
 * per the WAI-ARIA combobox pattern -- satisfies Phase 2.1's functional
 * requirement (searchable, grouped by category, designated-list subjects
 * visually marked) plus Phase 8's promised keyboard/accessibility pass,
 * which this component hadn't actually received despite the comment that
 * used to sit here.
 */

interface SubjectComboboxProps {
  label: string;
  options: Subject[];
  value: string | null;
  onChange: (code: string | null) => void;
  placeholder?: string;
}

function optionDomId(label: string, code: string) {
  return `combobox-option-${label}-${code}`;
}

const DROPDOWN_EXIT_MS = 150;

export function SubjectCombobox({
  label,
  options,
  value,
  onChange,
  placeholder = "Search subjects...",
}: SubjectComboboxProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
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

  // Flattened, group-order-preserving list -- what ArrowUp/ArrowDown
  // actually step through, independent of the group headers.
  const flatOptions = useMemo(() => grouped.flatMap(([, subjects]) => subjects), [grouped]);

  // Re-anchor the highlight whenever the visible option list changes
  // (query edited, or freshly opened) so it's never stuck pointing at a
  // now-filtered-out subject.
  useEffect(() => {
    if (!isOpen) return;
    setHighlightedCode((prev) =>
      prev && flatOptions.some((o) => o.code === prev) ? prev : (flatOptions[0]?.code ?? null)
    );
  }, [isOpen, flatOptions]);

  function moveHighlight(delta: 1 | -1) {
    if (flatOptions.length === 0) return;
    const currentIndex = flatOptions.findIndex((o) => o.code === highlightedCode);
    const nextIndex =
      currentIndex === -1
        ? 0
        : (currentIndex + delta + flatOptions.length) % flatOptions.length;
    const next = flatOptions[nextIndex]!;
    setHighlightedCode(next.code);
    containerRef.current
      ?.querySelector(`#${CSS.escape(optionDomId(label, next.code))}`)
      ?.scrollIntoView({ block: "nearest" });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveHighlight(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveHighlight(-1);
        break;
      case "Enter": {
        e.preventDefault();
        const highlighted = flatOptions.find((o) => o.code === highlightedCode);
        if (highlighted) handleSelect(highlighted);
        break;
      }
      case "Escape":
        e.preventDefault();
        closeList();
        break;
      default:
        break;
    }
  }

  function handleSelect(subject: Subject) {
    onChange(subject.code);
    setQuery("");
    closeList();
  }

  function closeList() {
    setIsClosing(true);
    window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, DROPDOWN_EXIT_MS);
  }

  function handleBlur() {
    // Defer so a click on an option registers before the list closes.
    window.setTimeout(closeList, 150);
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
          aria-activedescendant={
            isOpen && highlightedCode ? optionDomId(label, highlightedCode) : undefined
          }
          className="h-11 w-full cursor-text rounded-xl border border-line bg-paper-raised px-3 text-sm text-ink transition-colors focus:border-brand-coral focus:outline-none"
          placeholder={selected ? selected.name : placeholder}
          value={isOpen ? query : selected?.name ?? ""}
          onFocus={() => {
            setIsOpen(true);
            setQuery("");
          }}
          onBlur={handleBlur}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {selected && !isOpen && (
          <button
            type="button"
            aria-label={`Clear ${label}`}
            className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center text-lg text-ink-faint transition-transform hover:scale-110 hover:text-brand-coral"
            onClick={() => onChange(null)}
          >
            ×
          </button>
        )}
        {(isOpen || isClosing) && (
          <ul
            id={`combobox-listbox-${label}`}
            role="listbox"
            className={`absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-line bg-paper-raised shadow-lg ${
              isClosing ? "animate-dropdown-out" : "animate-dropdown"
            }`}
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
                        id={optionDomId(label, subject.code)}
                        type="button"
                        role="option"
                        aria-selected={subject.code === value}
                        className={`flex min-h-11 w-full cursor-pointer items-center justify-between px-3 text-left text-sm transition-colors hover:bg-brand-teal-soft ${
                          subject.code === highlightedCode ? "bg-brand-teal-soft" : ""
                        }`}
                        onClick={() => handleSelect(subject)}
                        onMouseEnter={() => setHighlightedCode(subject.code)}
                      >
                        <span className="text-ink">{subject.name}</span>
                        {subject.isDesignated && (
                          <span className="ml-2 rounded-full bg-brand-coral-soft px-2 py-0.5 text-[10px] font-medium text-brand-coral">
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
