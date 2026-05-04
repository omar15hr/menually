"use client";

import { useMenuStore } from "@/store/useMenuStore";
import { useMenuTracking } from "@/hooks/useMenuTracking";
import { useCategoryHydration } from "@/hooks/useCategoryHydration";
import { MenuPreview } from "@/components/menu/MenuPreview";
import type { Database } from "@/types/database.types";
import type { Promotion } from "@/types/promotions.types";
import type { CategoryWithProducts } from "@/types/categories.types";

type Menu = Database["public"]["Tables"]["menus"]["Row"];

interface PublicMenuProps {
  menu: Menu;
  categories: CategoryWithProducts[];
  promotions?: Promotion[];
}

export function PublicMenu({
  menu,
  categories,
  promotions = [],
}: PublicMenuProps) {
  useCategoryHydration(categories);

  const selectCategory = useMenuStore((s) => s.selectCategory);

  const { trackShare, trackProductClick } = useMenuTracking({
    businessId: menu.user_id,
    menuSlug: menu.slug,
  });

  function handleCategoryChange(categoryId: string) {
    selectCategory(categoryId);
  }

  return (
    <>
      <MenuPreview
        menu={menu}
        categories={categories}
        onShare={trackShare}
        onProductClick={trackProductClick}
        onCategoryChange={handleCategoryChange}
        promotions={promotions}
        responsive={true}
      />
    </>
  );
}
