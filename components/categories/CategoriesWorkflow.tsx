"use client";

import { useEffect } from "react";
import CategoryEditTable from "./CategoryEditTable";
import ProductPanel from "../products/ProductPanel";
import { useMenuStore } from "@/store/useMenuStore";
import type { Database } from "@/types/database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];

type CategoryWithProducts =
  Database["public"]["Tables"]["categories"]["Row"] & {
    products: Product[];
  };

interface Props {
  menuId: string;
  categories: CategoryWithProducts[];
}

export default function CategoriesWorkflow({ menuId, categories }: Props) {
  const { setCategories, selectCategory, selectedCategoryId } = useMenuStore();

  useEffect(() => {
    setCategories(categories);
  }, [categories, setCategories]);

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      selectCategory(categories[0].id);
    }
  }, [categories, selectedCategoryId, selectCategory]);

  return (
    <div className="flex gap-6 bg-[#FBFBFA] items-start">
      <CategoryEditTable menuId={menuId} />
      <ProductPanel />
    </div>
  );
}
