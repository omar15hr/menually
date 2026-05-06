export type Language = "es" | "en" | "pt";

export type EntityType = "product" | "category" | "promotion";

export type TranslationField = "name" | "description" | "title";

export type TargetLanguage = Exclude<Language, "es">;

export type TranslationJobStatus =
  | "pending"
  | "processing"
  | "done"
  | "failed";

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

export interface TranslationJob {
  id: string;
  menu_id: string;
  entity_type: EntityType;
  entity_id: string;
  fields: Record<string, string>;
  target_languages: TargetLanguage[];
  status: TranslationJobStatus;
  retries: number;
  error_message: string | null;
  created_at: string | null;
  updated_at: string | null;
  processed_at: string | null;
}
