/**
 * Types for AI-powered menu import feature
 * Used for parsing menu images/PDFs with GPT-4o-mini Vision
 */

export interface ImportedProduct {
  name: string;
  description?: string;
  price: number | null;
  notes?: string;
}

export interface ImportedCategory {
  name: string;
  products: ImportedProduct[];
}

export interface ImportedMenu {
  categories: ImportedCategory[];
  confidence?: number;
}

export interface ImportResult {
  success: boolean;
  categoriesAdded: number;
  categoriesSkipped: number;
  productsAdded: number;
  productsSkipped: number;
  errors: string[];
}

/**
 * Step flow for the import wizard
 */
export type ImportStep =
  | "upload"
  | "processing"
  | "preview"
  | "importing"
  | "success"
  | "error";
