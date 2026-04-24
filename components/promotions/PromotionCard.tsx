"use client";

import Image from "next/image";
import type { Promotion } from "@/types/promotions.types";

interface Props {
  promotion: Promotion;
  onClick?: (promotion: Promotion) => void;
}

export function PromotionCard({ promotion, onClick }: Props) {
  const imageUrl =
    promotion.image_url ||
    "https://rfizreodpxlnsskujhyg.supabase.co/storage/v1/object/public/images/menually/background-image-placeholder.png";

  return (
    <button
      onClick={() => onClick?.(promotion)}
      className="min-w-70 max-w-70 shrink-0 bg-white border border-gray-100 rounded-xl overflow-hidden text-left hover:scale-[1.02] transition-all duration-200 cursor-pointer"
    >
      {/* Image */}
      <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
        <Image
          src={imageUrl}
          alt={promotion.title}
          fill
          loading="eager"
          className="object-cover"
          sizes="280px"
        />
        {promotion.keyword && (
          <span className="absolute top-2 left-2 bg-[#D0E3FF] text-[#0167F7] text-[10px] font-semibold px-2 py-1 rounded-md">
            {promotion.keyword}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-bold text-sm text-[#41464E] leading-tight line-clamp-1">
          {promotion.title}
        </h3>
        {promotion.description && (
          <p className="text-xs text-[#58606E] mt-1 line-clamp-2 leading-relaxed">
            {promotion.description}
          </p>
        )}
      </div>
    </button>
  );
}