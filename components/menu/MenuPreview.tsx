"use client";

import Image from "next/image";
import { useState } from "react";
import type { Database } from "@/types/database.types";
import type { Promotion } from "@/types/promotions.types";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { PromotionCarousel } from "../promotions/PromotionCarousel";

type Menu = Database["public"]["Tables"]["menus"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Product = Database["public"]["Tables"]["products"]["Row"];

type CategoryWithProducts = Category & {
  products: Product[];
};

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
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        )}
        {onShare && (
          <button
            onClick={onShare}
            className="flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12px] text-gray-600 font-medium whitespace-nowrap shrink-0 mt-0.5 hover:bg-gray-50"
            title="Share menu"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
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

      <ScrollArea className="w-full mt-1">
        <div className="flex px-4 gap-5 border-b border-gray-100 pb-2">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => handleTabChange(i)}
              className="pb-2 text-base font-bold whitespace-nowrap"
              style={{
                color:
                  activeTab === i ? menu.primary_color || "#2563EB" : "#9CA3AF",
                borderBottom:
                  activeTab === i
                    ? `2px solid ${menu.primary_color || "#2563EB"}`
                    : "2px solid transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="overflow-y-auto flex-1 px-4 flex flex-col divide-y divide-gray-100">
        {products.map((product) => {
          const isVertical = menu.layout_card === "vertical";

          return (
            <div
              key={product.id}
              onClick={() => onProductClick?.(product.id)}
              className={`flex gap-3 py-3 ${isVertical ? "flex-col" : "flex-row items-center"} cursor-pointer`}
            >
              <div>
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={80}
                    height={80}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={`${imageShape} object-cover overflow-hidden bg-[#F5EEE8] shrink-0 flex items-center justify-center ${isVertical ? "w-full" : ""}`}
                    style={
                      isVertical ? { height: 120 } : { width: 56, height: 56 }
                    }
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={isVertical ? 36 : 28}
                    height={isVertical ? 36 : 28}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C8A882"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.6}
                  >
                    <path d="M3 2l1.5 1.5M21 2l-1.5 1.5M12 2v2M4.5 6A7.5 7.5 0 0 0 12 21a7.5 7.5 0 0 0 7.5-7.5c0-3-1.7-5.6-4.2-6.9" />
                    <path d="M12 6a6 6 0 0 1 6 6" />
                  </svg>
                )}
              </div>

              <div
                className={`flex min-w-0 ${isVertical ? "flex-col" : "flex-1 flex-row items-center gap-3"}`}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-sm leading-tight truncate"
                    style={{ color: menu.text_color || "#000000" }}
                  >
                    {product.name}
                  </p>
                  {menu.show_descriptions && product.description && (
                    <p
                      className="text-sm leading-tight mt-0.5 truncate"
                      style={{ color: menu.description_color || "#6B7280" }}
                    >
                      {product.description}
                    </p>
                  )}
                </div>

                {menu.show_price && product.price > 0 && (
                  <span
                    className={`text-sm font-bold shrink-0 ${isVertical ? "mt-1" : ""}`}
                    style={{ color: menu.price_color || "#000000" }}
                  >
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-10 h-full text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-2 opacity-50"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <p className="text-sm">
              Aún no hay productos <br />
              en esta categoría.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
