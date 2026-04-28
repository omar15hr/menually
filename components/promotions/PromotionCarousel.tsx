"use client";

import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { PromotionCardCover } from "./PromotionCardCover";
import type { Promotion } from "@/types/promotions.types";

interface Props {
  promotions: Promotion[];
  onPromotionClick?: (promotion: Promotion) => void;
}

function PromotionCarouselWithData({ promotions, onPromotionClick }: Props) {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    api.on("select", handleSelect);
    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  return (
    <div className="py-3">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          loop: true,
        }}
      >
        <CarouselContent className="-ml-2">
          {promotions.map((promotion) => (
            <CarouselItem key={promotion.id} className="pl-2">
              <PromotionCardCover
                promotion={promotion}
                onClick={onPromotionClick}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Puntos de paginación */}
      <div className="flex justify-center gap-2 mt-3">
        {promotions.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === selectedIndex
                ? "bg-[#22C55E] w-6"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Ir a promoción ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export function PromotionCarousel({ promotions, onPromotionClick }: Props) {
  if (!promotions || promotions.length === 0) {
    return null;
  }

  return (
    <PromotionCarouselWithData
      promotions={promotions}
      onPromotionClick={onPromotionClick}
    />
  );
}
