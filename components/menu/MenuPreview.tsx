"use client";

import Image from "next/image";
import { useState } from "react";
import type { Database } from "@/types/database.types";
import type { Promotion } from "@/types/promotions.types";
import type { CategoryWithProducts } from "@/types/categories.types";
import type { TranslationsMap } from "@/types/translations.types";
import { useLanguageStore } from "@/store/useLanguageStore";
import { applyTranslations, UI_STRINGS } from "@/lib/translations";
import { PromotionCarousel } from "../promotions/PromotionCarousel";
import ShareIcon from "../icons/ShareIcon";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import { CategoryTabs } from "./CategoryTabs";
import { EmptyProductsState } from "./EmptyProductsState";
import { LanguageSelector } from "./LanguageSelector";

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
  responsive?: boolean;
  translations?: TranslationsMap;
  showLanguageSelector?: boolean;
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
  responsive = false,
  translations,
  showLanguageSelector = false,
}: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const { language } = useLanguageStore();

  const formatPrice = (price: number) => `$${price.toLocaleString("es-CL")}`;

  const coverImage = coverUrlSelected ? coverUrlSelected : menu.bg_image_url;
  const logoImage = logoUrlSelected ? logoUrlSelected : menu.logo_url;

  const imageShape =
    shapeMap[menu.image_product_shape ?? "rounded"] ?? "rounded-xl";

  // Apply translations if available and language is not Spanish
  const translatedCategories =
    translations && language !== "es" && categories
      ? applyTranslations(categories, translations, language, "category", [
          "name",
        ]).map((cat) => ({
          ...cat,
          products: applyTranslations(
            cat.products,
            translations,
            language,
            "product",
            ["name", "description"],
          ),
        }))
      : categories;

  const translatedPromotions =
    translations && language !== "es"
      ? applyTranslations(promotions, translations, language, "promotion", [
          "title",
          "description",
        ])
      : promotions;

  const tabs =
    translatedCategories && translatedCategories.length > 0
      ? translatedCategories.map((c) => c.name)
      : [];

  function handleTabChange(index: number) {
    setActiveTab(index);
    const cat = translatedCategories?.[index];
    if (cat && onCategoryChange) {
      onCategoryChange(cat.id);
    }
  }

  const products: DisplayProduct[] =
    translatedCategories && translatedCategories.length > 0
      ? (translatedCategories[activeTab]?.products ?? []).map((p) => ({
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

  const ui = UI_STRINGS[language];

  return (
    <div
      className={cn(
        "relative flex flex-col bg-white overflow-hidden rounded-2xl",
        !responsive && "border border-[#E4E4E6] my-10 mx-auto",
      )}
      style={{
        ...(responsive
          ? { width: "100%", height: "100dvh" }
          : { width: 344, height: 800, flexShrink: 0 }
        ),
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
            alt={ui.coverAlt}
            className={cn("object-cover rounded-2xl p-2")}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <Image
            fill
            loading="eager"
            src={coverPlaceholder}
            alt={ui.coverAlt}
            className={cn("object-cover rounded-2xl p-2")}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}

        {/* Share overlay — rendered when onShare provided and responsive */}
        {onShare && responsive && (
          <button
            onClick={onShare}
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
            aria-label={ui.shareAriaLabel}
          >
            <ShareIcon />
          </button>
        )}

        {/* Language selector — rendered when show_filters is true and responsive, or when showLanguageSelector is true */}
        {((menu.show_filters && responsive) || showLanguageSelector) && (
          <div className="absolute top-3 left-3">
            <LanguageSelector />
          </div>
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
        {responsive && (
          <button className="flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12px] text-gray-600 font-medium whitespace-nowrap shrink-0 mt-0.5">
            {ui.filter}
          </button>
        )}
      </div>

      {/* Promotions Carousel — arriba de los tabs */}
      <div className="px-4">
        <PromotionCarousel
          promotions={translatedPromotions}
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
