"use client";

import Image from "next/image";
import { useState } from "react";
import type { Database } from "@/types/database.types";
import { cn } from "@/lib/utils";

type Menu = Database["public"]["Tables"]["menus"]["Row"];

interface Props {
  menu: Menu;
}

const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Croissant Mantequilla",
    description: "Hojaldre artesanal francés.",
    price: 3490,
    image: null,
  },
  {
    id: "2",
    name: "Croissant Mantequilla",
    description: "Hojaldre artesanal francés, lista de ingredientes ha...",
    price: 3490,
    image: null,
  },
  {
    id: "3",
    name: "Croissant Mantequilla",
    description: "Hojaldre artesanal francés.",
    price: 3490,
    image: null,
  },
  {
    id: "4",
    name: "Avocado Toast",
    description: "Hojaldre artesanal francés, lista de ingredientes ha...",
    price: 3490,
    image: null,
  },
];

const MOCK_TABS = ["Nombre tab", "Nombre tab", "Nombre tab"];

export function MenuPreview({ menu }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  const formatPrice = (price: number) =>
    `$${price.toLocaleString("es-CL")}`;

  return (
    <div
      className="relative flex flex-col bg-white rounded-2xl overflow-hidden p-2 border border-[#E4E4E6] my-6"
      style={{ width: 344, minHeight: 600, flexShrink: 0 }}
    >
      <div className="relative w-full flex items-center justify-center" style={{ height: 160 }}>
        <Image
          src={menu.bg_image_url}
          alt="Portada del menú"
          fill
          className="object-cover rounded-2xl"
        />

        <div
          className="absolute bg-[#D1D5DB] border-2 border-white rounded-full overflow-hidden flex items-center justify-center"
          style={{ width: 52, height: 52, bottom: -26, left: 16 }}
        >
          <Image src={menu.logo_url} alt="Logo" fill className="object-cover" />
        </div>
      </div>

      <div className="pt-10 px-4 pb-4 flex items-start justify-between gap-2">
        <div>
          <p className={cn(
            "font-bold text-base leading-tight",
            menu.text_color === `text-${menu.text_color}`
          )}>Nombre del local</p>
          <p className={cn(
            "text-sm leading-tight mt-0.5",
            menu.description_color === `text-${menu.description_color}`
          )}>Bajada o slogan</p>
        </div>
        <button className="flex items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12px] text-gray-600 font-medium whitespace-nowrap shrink-0 mt-0.5">
          Español
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      <div className="flex border-b border-gray-100 px-4 gap-5 mt-1">
        {MOCK_TABS.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className="pb-2 text-base font-bold whitespace-nowrap"
            style={{
              color: activeTab === i ? (menu.primary_color || "#2563EB") : "#9CA3AF",
              borderBottom: activeTab === i ? `2px solid ${menu.primary_color || "#2563EB"}` : "2px solid transparent",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col divide-y divide-gray-100 overflow-y-auto flex-1 px-4">
        {MOCK_PRODUCTS.map((product) => (
          <div key={product.id} className="flex items-center gap-3 py-3">
            <div
              className="rounded-xl overflow-hidden bg-[#F5EEE8] shrink-0 flex items-center justify-center"
              style={{ width: 56, height: 56 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
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
            </div>

            <div className="flex-1 min-w-0">
              <p className={cn(
                "font-semibold text-sm text-gray-900 leading-tight truncate",
                menu.text_color === `text-${menu.text_color}`
              )}>
                {product.name}
              </p>
              <p className={cn(
                "text-sm text-gray-400 leading-tight mt-0.5 truncate",
                menu.description_color === `text-${menu.description_color}`
              )}>
                {product.description}
              </p>
            </div>

            {product.price > 0 && (
              <span className={cn(
                "text-sm font-bold text-gray-900 shrink-0 self-start py-2",
                menu.price_color === `text-${menu.price_color}`
              )}>
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
