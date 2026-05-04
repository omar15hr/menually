"use client";

import Image from "next/image";
import ProductPlaceholderIcon from "@/components/icons/ProductPlaceholderIcon";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image: string | null;
  };
  imageShape: string;
  isVertical: boolean;
  textColor?: string;
  descriptionColor?: string;
  priceColor?: string;
  showDescriptions: boolean;
  showPrice: boolean;
  onProductClick?: (productId: string) => void;
  formatPrice: (price: number) => string;
}

export function ProductCard({
  product,
  imageShape,
  isVertical,
  textColor = "#000000",
  descriptionColor = "#6B7280",
  priceColor = "#000000",
  showDescriptions,
  showPrice,
  onProductClick,
  formatPrice,
}: ProductCardProps) {
  return (
    <div
      onClick={() => onProductClick?.(product.id)}
      className={`flex gap-3 py-3 cursor-pointer ${isVertical ? "flex-col" : "flex-row items-center"}`}
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
            style={isVertical ? { height: 120 } : { width: 56, height: 56 }}
          />
        ) : (
          <ProductPlaceholderIcon size={isVertical ? 36 : 28} />
        )}
      </div>

      <div
        className={`flex min-w-0 ${isVertical ? "flex-col" : "flex-1 flex-row items-center gap-3"}`}
      >
        <div className="flex-1 min-w-0">
          <p
            className="font-semibold text-sm leading-tight truncate"
            style={{ color: textColor }}
          >
            {product.name}
          </p>
          {showDescriptions && product.description && (
            <p
              className="text-sm leading-tight mt-0.5 truncate"
              style={{ color: descriptionColor }}
            >
              {product.description}
            </p>
          )}
        </div>

        {showPrice && product.price > 0 && (
          <span
            className={`text-sm font-bold shrink-0 ${isVertical ? "mt-1" : ""}`}
            style={{ color: priceColor }}
          >
            {formatPrice(product.price)}
          </span>
        )}
      </div>
    </div>
  );
}
