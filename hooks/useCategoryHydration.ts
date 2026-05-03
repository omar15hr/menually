"use client";

import { useEffect } from "react";
import { useMenuStore } from "@/store/useMenuStore";
import type { CategoryWithProducts } from "@/types/categories.types";

export function useCategoryHydration(categories: CategoryWithProducts[]) {
  const setCategories = useMenuStore((s) => s.setCategories);
  const selectCategory = useMenuStore((s) => s.selectCategory);
  const selectedCategoryId = useMenuStore((s) => s.selectedCategoryId);

  useEffect(() => {
    setCategories(categories);
  }, [categories, setCategories]);

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      selectCategory(categories[0].id);
    }
  }, [categories, selectedCategoryId, selectCategory]);
}
