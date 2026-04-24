"use client";

import Image from "next/image";
import type { Promotion } from "@/types/promotions.types";

interface Props {
  promotion: Promotion;
  onClick?: (promotion: Promotion) => void;
}

export function PromotionCardCover({ promotion, onClick }: Props) {
  const imageUrl =
    promotion.image_url ||
    "https://rfizreodpxlnsskujhyg.supabase.co/storage/v1/object/public/images/menually/background-image-placeholder.png";

  return (
    <div className="rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 my-2 mx-2">
      <button
        onClick={() => onClick?.(promotion)}
        className="relative flex w-full min-h-25 bg-white rounded-lg overflow-hidden text-left cursor-pointer"
      >
        {/* Sección Izquierda: Imagen */}
        <div className="relative w-[38%] shrink-0 min-h-25">
          <Image
            src={imageUrl}
            alt={promotion.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 40vw, 20vw"
          />
        </div>

        {/* Sección Derecha: Contenido */}
        <div className="flex flex-col justify-center gap-1.5 flex-1 px-4 py-4 bg-white">
          {/* Badge */}
          <div>
            <span className="inline-block bg-[#EDFCBC] text-[#25A73A] text-xs font-semibold px-2 py-1 rounded-lg">
              {promotion.keyword || "Promoción"}
            </span>
          </div>

          {/* Título */}
          <h3 className="font-bold text-[#0F172A] text-sm leading-snug line-clamp-2">
            {promotion.title}
          </h3>

          {/* Descripción */}
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
            {promotion.description || "Descripción promoción dos líneas máximo."}
          </p>
        </div>
      </button>
    </div>
  );
}