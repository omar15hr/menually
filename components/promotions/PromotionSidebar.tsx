"use client";

import { X } from "lucide-react";
import type { Promotion } from "@/types/promotions.types";
import type { Product } from "@/types/categories.types";
import { PromotionForm } from "./PromotionForm";

interface PromotionSidebarProps {
  isOpen: boolean;
  promotion: Promotion | null;
  products: Product[];
  onClose: () => void;
  onSuccess: (promotion: Promotion) => void;
}

export function PromotionSidebar({
  isOpen,
  promotion,
  products,
  onClose,
  onSuccess,
}: PromotionSidebarProps) {
  return (
    <>
      {/* OVERLAY / BACKDROP */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={onClose}
          role="presentation"
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-112.5 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header Sidebar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {promotion ? "Editar promoción" : "Nueva promoción"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <PromotionForm
            promotion={promotion}
            products={products}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        </div>
      </div>
    </>
  );
}
