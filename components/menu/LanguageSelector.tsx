"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { UI_STRINGS } from "@/lib/translations";
import type { Language } from "@/types/translations.types";
import ChevronDownSmallIcon from "../icons/ChevronDownSmallIcon";

const languages: Language[] = ["es", "en", "pt"];

export function LanguageSelector() {
  const { language, setLanguage } = useLanguageStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  function handleSelect(lang: Language) {
    setLanguage(lang);
    setOpen(false);
  }

  const strings = UI_STRINGS[language];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-[12px] text-gray-600 font-medium hover:bg-white transition-colors"
        aria-label={strings.languageAriaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {strings[`language${language.charAt(0).toUpperCase() + language.slice(1)}` as keyof typeof strings]}
        <ChevronDownSmallIcon />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-30 z-50"
        >
          {languages.map((lang) => (
            <li key={lang}>
              <button
                type="button"
                role="option"
                aria-selected={lang === language}
                onClick={() => handleSelect(lang)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  lang === language ? "font-semibold text-gray-900" : "text-gray-600"
                }`}
              >
                {UI_STRINGS[lang][`language${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof typeof UI_STRINGS["es"]]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
