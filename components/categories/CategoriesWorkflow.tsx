"use client";

import { useMemo, useState } from "react";
import type { Database } from "@/types/database.types";
import CategoryEditTable from "./CategoryEditTable";
import ProductPanel from "../products/ProductPanel";

type Product = Database["public"]["Tables"]["products"]["Row"];

type CategoryWithProducts = Database["public"]["Tables"]["categories"]["Row"] & {
  products: Product[];
};


interface Props {
  menuId: string;
  categories: CategoryWithProducts[];
}

export default function CategoriesWorkflow({ menuId, categories }: Props) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    () => categories[0]?.id ?? null,
  );

  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId),
    [categories, selectedCategoryId],
  );

  const selectedProduct = useMemo(
    () =>
      selectedCategory?.products?.find(
        (p) => p.id === selectedProductId,
      ) ?? null,
    [selectedCategory, selectedProductId],
  );

  return (
    <div className="flex flex-col">
      <div className="flex gap-6 bg-[#FBFBFA] items-start">
        <CategoryEditTable
          menuId={menuId}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          selectedProductId={selectedProductId}
          onSelectCategory={(id) => {
            setSelectedCategoryId(id);
            setSelectedProductId(null);
          }}
          onSelectProduct={(id) => setSelectedProductId(id)}
        />

        <ProductPanel
          category={selectedCategory}
          product={selectedProduct}
        />
      </div>
    </div>
  );
}