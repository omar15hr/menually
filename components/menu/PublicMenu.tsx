"use client";

import { useEffect } from "react";
import { useMenuStore } from "@/store/useMenuStore";
import { useMenuTracking } from "@/hooks/useMenuTracking";
import { MenuPreview } from "@/components/menu/MenuPreview";
import { PrivacyBanner } from "@/components/PrivacyBanner";
import type { Database } from "@/types/database.types";
import type { Promotion } from "@/types/promotions.types";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type Product = Database["public"]["Tables"]["products"]["Row"];
type Menu = Database["public"]["Tables"]["menus"]["Row"];

type CategoryWithProducts = Category & {
  products: Product[];
};

interface PublicMenuProps {
  menu: Menu;
  categories: CategoryWithProducts[];
  promotions?: Promotion[];
}

export function PublicMenu({ menu, categories, promotions = [] }: PublicMenuProps) {
  const { setCategories, selectCategory, selectedCategoryId } = useMenuStore();

  // Hydrate store with categories
  useEffect(() => {
    setCategories(categories);
  }, [categories, setCategories]);

  // Select first category if none selected
  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      selectCategory(categories[0].id);
    }
  }, [categories, selectedCategoryId, selectCategory]);

  // Initialize tracking
  const { trackShare, trackProductClick } = useMenuTracking({
    businessId: menu.user_id,
    menuSlug: menu.slug,
  });

  function handleCategoryChange(categoryId: string) {
    selectCategory(categoryId);
  }

  return (
    <>
      <PrivacyBanner />
      <MenuPreview
        menu={menu}
        categories={categories}
        onShare={trackShare}
        onProductClick={trackProductClick}
        onCategoryChange={handleCategoryChange}
        promotions={promotions}
      />
    </>
  );
}