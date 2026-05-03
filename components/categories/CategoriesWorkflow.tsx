"use client";

import { useCategoryHydration } from "@/hooks/useCategoryHydration";
import CategoryEditTable from "./CategoryEditTable";
import ProductPanel from "../products/ProductPanel";
import type { CategoryWithProducts } from "@/types/categories.types";

interface Props {
  menuId: string;
  categories: CategoryWithProducts[];
}

export default function CategoriesWorkflow({ menuId, categories }: Props) {
  useCategoryHydration(categories);

  return (
    <div className="flex gap-6 bg-[#FBFBFA] items-start">
      <CategoryEditTable menuId={menuId} />
      <ProductPanel />
    </div>
  );
}
