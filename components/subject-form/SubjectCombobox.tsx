"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Subject } from "@/lib/firestore/types";

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

  const flatOptions = useMemo(() => grouped.flatMap(([, subjects]) => subjects), [grouped]);

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
    window.setTimeout(closeList, 150);
  }

  return (
    <div className="flex flex-col gap-2" ref={containerRef}>
      <label className="text-sm font-bold text-ink" htmlFor={`combobox-${label}`}>
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
          className="h-12 w-full cursor-text rounded-2xl border-2 border-line bg-slate-50 px-4 text-sm font-bold text-ink transition-all focus:border-brand-teal focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-teal/20"
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
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center text-xl font-bold text-ink-faint transition-transform hover:scale-110 hover:text-brand-coral active:scale-95"
            onClick={() => onChange(null)}
          >
            ×
          </button>
        )}
        {(isOpen || isClosing) && (
          <ul
            id={`combobox-listbox-${label}`}
            role="listbox"
            className={`absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-line bg-white shadow-xl ${
              isClosing ? "animate-dropdown-out" : "animate-dropdown"
            }`}
          >
            {grouped.length === 0 && (
              <li className="px-4 py-3 text-sm font-medium text-ink-faint">No subjects match.</li>
            )}
            {grouped.map(([groupLabel, subjects]) => (
              <li key={groupLabel}>
                <div className="sticky top-0 bg-slate-100 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-ink-faint border-y border-line/50">
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
                        className={`flex min-h-12 w-full cursor-pointer items-center justify-between px-4 text-left text-sm font-semibold transition-colors ${
                          subject.code === highlightedCode ? "bg-brand-teal/10 text-brand-teal" : "hover:bg-slate-50 text-ink"
                        }`}
                        onClick={() => handleSelect(subject)}
                        onMouseEnter={() => setHighlightedCode(subject.code)}
                      >
                        <span>{subject.name}</span>
                        {subject.isDesignated && (
                          <span className="ml-2 rounded-full bg-brand-coral/10 px-2.5 py-0.5 text-xs font-bold text-brand-coral">
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