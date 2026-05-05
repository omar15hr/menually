import type { Language, Translation, TranslationsMap } from "@/types/translations.types";

interface UIStrings {
  filter: string;
  shareMenu: string;
  shareAriaLabel: string;
  languageAriaLabel: string;
  coverAlt: string;
  languageEs: string;
  languageEn: string;
  languagePt: string;
}

export const UI_STRINGS: Record<Language, UIStrings> = {
  es: {
    filter: "Filtrar",
    shareMenu: "Compartir menú",
    shareAriaLabel: "Compartir menú",
    languageAriaLabel: "Cambiar idioma",
    coverAlt: "Portada del menú",
    languageEs: "Español",
    languageEn: "English",
    languagePt: "Português",
  },
  en: {
    filter: "Filter",
    shareMenu: "Share menu",
    shareAriaLabel: "Share menu",
    languageAriaLabel: "Change language",
    coverAlt: "Menu cover",
    languageEs: "Spanish",
    languageEn: "English",
    languagePt: "Portuguese",
  },
  pt: {
    filter: "Filtrar",
    shareMenu: "Compartilhar cardápio",
    shareAriaLabel: "Compartilhar cardápio",
    languageAriaLabel: "Mudar idioma",
    coverAlt: "Capa do cardápio",
    languageEs: "Espanhol",
    languageEn: "Inglês",
    languagePt: "Português",
  },
};

export function buildTranslationsMap(rows: Translation[]): TranslationsMap {
  const map: TranslationsMap = new Map();

  for (const row of rows) {
    const key = `${row.entity_type}:${row.entity_id}:${row.field}`;
    const existing = map.get(key) ?? {};
    existing[row.language] = row.content;
    map.set(key, existing);
  }

  return map;
}

export function applyTranslations<T extends { id: string }>(
  entities: T[],
  translationsMap: TranslationsMap,
  language: Language,
  entityType: string,
  fields: (keyof T & string)[],
): T[] {
  if (language === "es") {
    return entities;
  }

  return entities.map((entity) => {
    const updated = { ...entity };
    let changed = false;

    for (const field of fields) {
      const key = `${entityType}:${entity.id}:${field}`;
      const translations = translationsMap.get(key);
      const translated = translations?.[language];
      if (translated) {
        (updated as Record<string, unknown>)[field] = translated;
        changed = true;
      }
    }

    return changed ? updated : entity;
  });
}
