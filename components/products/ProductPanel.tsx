"use client";

import PencilIcon from "../icons/PencilIcont";
import ProductForm from "./ProductForm";
import { useMenuStore } from "@/store/useMenuStore";

export default function ProductPanel() {
  const { getSelectedCategory, getSelectedProduct, selectedProductId, selectProduct } =
    useMenuStore();

  const category = getSelectedCategory();
  const selectedProduct = getSelectedProduct();

  if (!category) {
    return <div className="p-6">Selecciona una categoría</div>;
  }

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 sticky top-0 h-screen overflow-y-auto">
      <span className="flex gap-2 items-center">
        <h2 className="text-xl font-bold">{category.name}</h2>
        <PencilIcon />
      </span>

      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-[#1C1C1C]">Productos</h3>
        <ProductForm
          key={selectedProductId ?? `new-${category.id}`}
          product={selectedProduct}
          categoryId={category.id}
        />
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
                  selectProduct(isSelected ? null : product.id)
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
