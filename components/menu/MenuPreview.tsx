"use client";

import Image from "next/image";
import { useState } from "react";
import type { Database } from "@/types/database.types";
import type { Promotion } from "@/types/promotions.types";
import type { CategoryWithProducts } from "@/types/categories.types";
import { PromotionCarousel } from "../promotions/PromotionCarousel";
import ShareIcon from "../icons/ShareIcon";
import ChevronDownSmallIcon from "../icons/ChevronDownSmallIcon";
import { ProductCard } from "./ProductCard";
import { CategoryTabs } from "./CategoryTabs";
import { EmptyProductsState } from "./EmptyProductsState";

 type Menu = Database["public"]["Tables"]["menus"]["Row"];

interface Props {
  menu: Menu;
  logoUrlSelected?: string | null;
  coverUrlSelected?: string | null;
  categories?: CategoryWithProducts[];
  businessName?: string | null;
  onShare?: () => void;
  onProductClick?: (productId: string) => void;
  onCategoryChange?: (categoryId: string) => void;
  promotions?: Promotion[];
  onPromotionClick?: (promotion: Promotion) => void;
}

const shapeMap: Record<string, string> = {
  square: "rounded-none",
  rounded: "rounded-xl",
  circle: "rounded-full",
};

interface DisplayProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
}

export function MenuPreview({
  menu,
  logoUrlSelected = null,
  coverUrlSelected = null,
  categories,
  businessName = "Nombre del local",
  onShare,
  onProductClick,
  onCategoryChange,
  promotions = [],
  onPromotionClick,
}: Props) {
  const [activeTab, setActiveTab] = useState(0);

  const formatPrice = (price: number) => `$${price.toLocaleString("es-CL")}`;

  const coverImage = coverUrlSelected ? coverUrlSelected : menu.bg_image_url;
  const logoImage = logoUrlSelected ? logoUrlSelected : menu.logo_url;

  const imageShape =
    shapeMap[menu.image_product_shape ?? "rounded"] ?? "rounded-xl";

  const tabs =
    categories && categories.length > 0 ? categories.map((c) => c.name) : [];

  function handleTabChange(index: number) {
    setActiveTab(index);
    const cat = categories?.[index];
    if (cat && onCategoryChange) {
      onCategoryChange(cat.id);
    }
  }

  const products: DisplayProduct[] =
    categories && categories.length > 0
      ? (categories[activeTab]?.products ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          image: p.image_url,
        }))
      : [];
  const coverPlaceholder =
    "https://rfizreodpxlnsskujhyg.supabase.co/storage/v1/object/public/images/menually/background-image-placeholder.png";
  const logoPlaceholder =
    "https://rfizreodpxlnsskujhyg.supabase.co/storage/v1/object/public/images/menually/logo-image-placeholder.png";

  return (
    <div
      className="relative flex flex-col bg-white rounded-2xl overflow-hidden p-2 border border-[#E4E4E6] my-10 mx-auto"
      style={{
        width: 344,
        height: 800,
        flexShrink: 0,
        fontFamily: `var(--font-${menu.typography}, inherit)`,
        backgroundColor: menu.bg_color,
      }}
    >
      <div
        className="relative w-full flex items-center justify-center"
        style={{ height: 190 }}
      >
        {coverImage ? (
          <Image
            fill
            loading="eager"
            src={coverImage}
            alt="Portada del menú"
            className="object-cover rounded-2xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <Image
            fill
            loading="eager"
            src={coverPlaceholder}
            alt="Portada del menú"
            className="object-cover rounded-2xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}

        <div
          className="absolute bg-[#D1D5DB] border-2 border-white rounded-full overflow-hidden flex items-center justify-center"
          style={{ width: 52, height: 52, bottom: -26, left: 16 }}
        >
          {logoImage ? (
            <Image
              src={logoImage}
              alt="Logo"
              fill
              loading="eager"
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <Image
              fill
              alt="Logo"
              loading="eager"
              src={logoPlaceholder}
              className="object-cover rounded-2xl"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>
      </div>

      <div className="pt-10 px-4 pb-4 flex items-start justify-between gap-2">
        <div>
          <p
            className="font-bold text-base leading-tight"
            style={{ color: menu.text_color || "#000000" }}
          >
            {businessName || "Nombre del local"}
          </p>
        </div>
        {menu.show_filters && (
          <button className="flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12px] text-gray-600 font-medium whitespace-nowrap shrink-0 mt-0.5">
            Español
            <ChevronDownSmallIcon />
          </button>
        )}
        {onShare && (
          <button
            onClick={onShare}
            className="flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12px] text-gray-600 font-medium whitespace-nowrap shrink-0 mt-0.5 hover:bg-gray-50"
            title="Share menu"
          >
            <ShareIcon />
            Share
          </button>
        )}
      </div>

      {/* Promotions Carousel — arriba de los tabs */}
      <div className="px-4">
        <PromotionCarousel
          promotions={promotions}
          onPromotionClick={onPromotionClick}
        />
      </div>

      <CategoryTabs
        tabs={tabs}
        activeTab={activeTab}
        primaryColor={menu.primary_color || undefined}
        onTabChange={handleTabChange}
      />

      <div className="overflow-y-auto flex-1 px-4 flex flex-col divide-y divide-gray-100">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            imageShape={imageShape}
            isVertical={menu.layout_card === "vertical"}
            textColor={menu.text_color || undefined}
            descriptionColor={menu.description_color || undefined}
            priceColor={menu.price_color || undefined}
            showDescriptions={menu.show_descriptions}
            showPrice={menu.show_price}
            onProductClick={onProductClick}
            formatPrice={formatPrice}
          />
        ))}
        {products.length === 0 && <EmptyProductsState />}
      </div>
    </div>
  );
}
