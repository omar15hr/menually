import { describe, it, expect } from "vitest";
import {
  UI_STRINGS,
  applyTranslations,
  buildTranslationsMap,
} from "./translations";
import type { Translation, Language, TranslationsMap } from "@/types/translations.types";

describe("UI_STRINGS", () => {
  it("contains all three languages", () => {
    expect(UI_STRINGS["es"]).toBeDefined();
    expect(UI_STRINGS["en"]).toBeDefined();
    expect(UI_STRINGS["pt"]).toBeDefined();
  });

  it("contains required keys for each language", () => {
    const keys = ["filter", "shareMenu", "shareAriaLabel", "languageAriaLabel", "coverAlt"];
    for (const lang of ["es", "en", "pt"] as Language[]) {
      for (const key of keys) {
        expect(UI_STRINGS[lang][key as keyof typeof UI_STRINGS["es"]]).toBeDefined();
      }
    }
  });

  it("returns Spanish strings for es", () => {
    expect(UI_STRINGS["es"].filter).toBe("Filtrar");
    expect(UI_STRINGS["es"].shareMenu).toBe("Compartir menú");
    expect(UI_STRINGS["es"].shareAriaLabel).toBe("Compartir menú");
    expect(UI_STRINGS["es"].languageAriaLabel).toBe("Cambiar idioma");
  });

  it("returns English strings for en", () => {
    expect(UI_STRINGS["en"].filter).toBe("Filter");
    expect(UI_STRINGS["en"].shareMenu).toBe("Share menu");
    expect(UI_STRINGS["en"].shareAriaLabel).toBe("Share menu");
    expect(UI_STRINGS["en"].languageAriaLabel).toBe("Change language");
  });

  it("returns Portuguese strings for pt", () => {
    expect(UI_STRINGS["pt"].filter).toBe("Filtrar");
    expect(UI_STRINGS["pt"].shareMenu).toBe("Compartilhar cardápio");
    expect(UI_STRINGS["pt"].shareAriaLabel).toBe("Compartilhar cardápio");
    expect(UI_STRINGS["pt"].languageAriaLabel).toBe("Mudar idioma");
  });
});

describe("buildTranslationsMap", () => {
  it("builds an empty map from empty rows", () => {
    const map = buildTranslationsMap([]);
    expect(map.size).toBe(0);
  });

  it("builds a map from translation rows", () => {
    const rows: Translation[] = [
      {
        id: "t1",
        menu_id: "m1",
        entity_type: "product",
        entity_id: "p1",
        field: "name",
        language: "en",
        content: "Meat empanada",
        created_at: "",
        updated_at: "",
      },
      {
        id: "t2",
        menu_id: "m1",
        entity_type: "product",
        entity_id: "p1",
        field: "name",
        language: "pt",
        content: "Empanada de carne",
        created_at: "",
        updated_at: "",
      },
    ];
    const map = buildTranslationsMap(rows);
    expect(map.size).toBe(1);
    const entry = map.get("product:p1:name");
    expect(entry).toBeDefined();
    expect(entry?.en).toBe("Meat empanada");
    expect(entry?.pt).toBe("Empanada de carne");
  });
});

describe("applyTranslations", () => {
  interface TestEntity {
    id: string;
    name: string;
    description: string | null;
  }

  it("returns entities unchanged when language is es", () => {
    const entities: TestEntity[] = [
      { id: "p1", name: "Empanada", description: "Rica" },
    ];
    const map: TranslationsMap = new Map();
    const result = applyTranslations(entities, map, "es", "product", ["name", "description"]);
    expect(result[0].name).toBe("Empanada");
    expect(result[0].description).toBe("Rica");
  });

  it("applies translated fields when translation exists", () => {
    const entities: TestEntity[] = [
      { id: "p1", name: "Empanada", description: "Rica" },
    ];
    const map: TranslationsMap = new Map();
    map.set("product:p1:name", { en: "Meat pie", pt: "Empanada" });
    map.set("product:p1:description", { en: "Tasty", pt: "Gostosa" });

    const result = applyTranslations(entities, map, "en", "product", ["name", "description"]);
    expect(result[0].name).toBe("Meat pie");
    expect(result[0].description).toBe("Tasty");
  });

  it("falls back to base value when translation is missing", () => {
    const entities: TestEntity[] = [
      { id: "p1", name: "Empanada", description: "Rica" },
    ];
    const map: TranslationsMap = new Map();
    map.set("product:p1:name", { en: "Meat pie", pt: "Empanada" });
    // No description translation

    const result = applyTranslations(entities, map, "en", "product", ["name", "description"]);
    expect(result[0].name).toBe("Meat pie");
    expect(result[0].description).toBe("Rica");
  });

  it("does not mutate original entities", () => {
    const entities: TestEntity[] = [
      { id: "p1", name: "Empanada", description: "Rica" },
    ];
    const map: TranslationsMap = new Map();
    map.set("product:p1:name", { en: "Meat pie", pt: "Empanada" });

    const result = applyTranslations(entities, map, "en", "product", ["name"]);
    expect(entities[0].name).toBe("Empanada");
    expect(result[0].name).toBe("Meat pie");
  });
});
