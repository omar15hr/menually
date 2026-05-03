"use client";

import type { PromotionFormData } from "./types";
import type { Product } from "@/types/categories.types";

interface Props {
  formData: PromotionFormData;
  updateField: <K extends keyof PromotionFormData>(
    key: K,
    value: PromotionFormData[K],
  ) => void;
  products: Product[];
  selectedProducts: Set<string>;
  toggleProduct: (productId: string) => void;
}

export function PromotionStep1BasicInfo({
  formData,
  updateField,
  products,
  selectedProducts,
  toggleProduct,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Título *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Ej: Dos cafés por $3.990"
          maxLength={100}
          className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#114821]"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Descripción (opcional)
        </label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Ej: Válido todos los días, solo en el local."
          maxLength={500}
          className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#114821] resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Palabra clave *
        </label>
        <input
          type="text"
          value={formData.keyword}
          onChange={(e) => updateField("keyword", e.target.value)}
          placeholder="Ej: Promo Verano"
          maxLength={30}
          className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#114821]"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Productos vinculados *
        </label>
        <div className="space-y-2 border border-gray-100 rounded-lg p-3">
          {products.length === 0 ? (
            <p className="text-sm text-gray-400">
              No hay productos disponibles
            </p>
          ) : (
            products.map((product) => (
              <label
                key={product.id}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.id)}
                  onChange={() => toggleProduct(product.id)}
                  className="w-4 h-4 rounded border-gray-300 text-[#114821] focus:ring-[#114821]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  {product.price > 0 && (
                    <p className="text-xs text-gray-500">
                      ${product.price.toLocaleString("es-CL")}
                    </p>
                  )}
                </div>
              </label>
            ))
          )}
        </div>
        {selectedProducts.size === 0 && (
          <p className="text-xs text-red-500 mt-1">
            Selecciona al menos un producto
          </p>
        )}
      </div>
    </div>
  );
}
