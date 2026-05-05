import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Language } from "@/types/translations.types";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "es",
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "menually-language",
      partialize: (state) => ({ language: state.language }),
    },
  ),
);
