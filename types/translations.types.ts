export type Language = "es" | "en" | "pt";

export type EntityType = "product" | "category" | "promotion";

export type TranslationField = "name" | "description" | "title";

export interface Translation {
  id: string;
  menu_id: string;
  entity_type: EntityType;
  entity_id: string;
  field: TranslationField;
  language: Language;
  content: string;
  created_at: string;
  updated_at: string;
}

export type TranslationsMap = Map<string, Partial<Record<Language, string>>>;
