"use client";

import PencilIcon from "../icons/PencilIcont";
import ProductForm from "./ProductForm";
import { Database } from "@/types/database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];

type CategoryWithProducts =
  Database["public"]["Tables"]["categories"]["Row"] & {
    products: Product[];
  };

interface Props {
  category: CategoryWithProducts | undefined;
  selectedProductId: string | null;
  onSelectProduct: (id: string | null) => void;
}

export default function ProductPanel({
  category,
  selectedProductId,
  onSelectProduct,
}: Props) {
  if (!category) {
    return <div className="p-6">Selecciona una categoría</div>;
  }

  const selectedProduct =
    category.products?.find((p) => p.id === selectedProductId) ?? null;

  return (
    <div className="flex-1 p-6 flex flex-col gap-6">
      <span className="flex gap-2 items-center">
        <h2 className="text-xl font-bold">{category.name}</h2>
        <PencilIcon />
      </span>

      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-[#1C1C1C]">Productos</h3>
        <ProductForm product={selectedProduct} categoryId={category.id} />
      </div>

      {category.products && category.products.length > 0 && (
        <div className="flex flex-col gap-2">
          {category.products.map((product) => {
            const isSelected = product.id === selectedProductId;
            return (
              <button
                key={product.id}
                type="button"
                onClick={() =>
                  onSelectProduct(isSelected ? null : product.id)
                }
                className={`w-full text-left p-4 rounded-lg border transition-all ${isSelected
                  ? "border-[#114821] bg-[#CDF5454D]"
                  : "border-[#E4E4E6] bg-white hover:border-[#114821]/40 hover:bg-[#FBFBFA]"
                  }`}
              >
                <p className="text-sm font-semibold text-[#1C1C1C]">
                  {product.name}
                </p>
                {product.description && (
                  <p className="text-sm text-[#58606E] mt-0.5 line-clamp-1">
                    {product.description}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
