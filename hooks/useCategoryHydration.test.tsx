import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCategoryHydration } from "./useCategoryHydration";
import type { CategoryWithProducts } from "@/types/categories.types";

// ── Mock Zustand store ────────────────────────────────────────────────

const storeMock = {
  state: {
    setCategories: vi.fn(),
    selectCategory: vi.fn(),
    selectedCategoryId: null as string | null,
  },
};

vi.mock("@/store/useMenuStore", () => ({
  useMenuStore: vi.fn((selector) => selector(storeMock.state)),
}));

// ── Helpers ───────────────────────────────────────────────────────────

function makeCategories(count: number): CategoryWithProducts[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `cat-${i + 1}`,
    name: `Category ${i + 1}`,
    menu_id: "menu-1",
    position: i,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    products: [],
  }));
}

// ── Tests ─────────────────────────────────────────────────────────────

describe("useCategoryHydration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storeMock.state.selectedCategoryId = null;
  });

  it("calls setCategories with the provided categories on mount", () => {
    const categories = makeCategories(2);

    renderHook(() => useCategoryHydration(categories));

    expect(storeMock.state.setCategories).toHaveBeenCalledTimes(1);
    expect(storeMock.state.setCategories).toHaveBeenCalledWith(categories);
  });

  it("selects the first category when none is selected", () => {
    const categories = makeCategories(3);
    storeMock.state.selectedCategoryId = null;

    renderHook(() => useCategoryHydration(categories));

    expect(storeMock.state.selectCategory).toHaveBeenCalledTimes(1);
    expect(storeMock.state.selectCategory).toHaveBeenCalledWith("cat-1");
  });

  it("does NOT re-select when a category is already selected", () => {
    const categories = makeCategories(3);
    storeMock.state.selectedCategoryId = "cat-2";

    renderHook(() => useCategoryHydration(categories));

    expect(storeMock.state.selectCategory).not.toHaveBeenCalled();
  });

  it("re-calls setCategories when categories prop changes", () => {
    const categoriesA = makeCategories(2);
    const categoriesB = makeCategories(2);
    categoriesB[0] = { ...categoriesB[0], id: "cat-new" };

    const { rerender } = renderHook(
      ({ cats }) => useCategoryHydration(cats),
      { initialProps: { cats: categoriesA } },
    );

    expect(storeMock.state.setCategories).toHaveBeenCalledTimes(1);
    expect(storeMock.state.setCategories).toHaveBeenCalledWith(categoriesA);

    rerender({ cats: categoriesB });

    expect(storeMock.state.setCategories).toHaveBeenCalledTimes(2);
    expect(storeMock.state.setCategories).toHaveBeenLastCalledWith(categoriesB);
  });

  it("does NOT select a category when categories array is empty", () => {
    storeMock.state.selectedCategoryId = null;

    renderHook(() => useCategoryHydration([]));

    expect(storeMock.state.selectCategory).not.toHaveBeenCalled();
  });
});
