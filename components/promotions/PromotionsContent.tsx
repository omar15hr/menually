"use client";

import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useState, useMemo } from "react";

import Header from "@/components/shared/Header";
import type { Database } from "@/types/database.types";
import type { Promotion } from "@/types/promotions.types";
import { PromotionCarousel } from "./PromotionCarousel";
import { PromotionStats } from "./PromotionStats";
import { PromotionFilterBar } from "./PromotionFilterBar";
import { PromotionTable } from "./PromotionTable";
import { PromotionSidebar } from "./PromotionSidebar";
import {
  deletePromotion,
  togglePromotionActive,
} from "@/actions/promotion.action";
import {
  computePromotionsMetrics,
  type FilterStatus,
} from "@/lib/promotions";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface Props {
  initialPromotions: Promotion[];
  products: Product[];
  menuId: string;
}

export default function PromotionsContent({
  initialPromotions,
  products,
}: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null,
  );
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setTimeout(() => {
      setSelectedPromotion(null);
    }, 300);
  };

  const openCreate = () => {
    setSelectedPromotion(null);
    setIsSidebarOpen(true);
  };

  const openEdit = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsSidebarOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta promoción? Esta acción no se puede deshacer."))
      return;
    const result = await deletePromotion(id);
    if (result.success) {
      setPromotions((prev) => prev.filter((p) => p.id !== id));
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleToggle = async (promotion: Promotion) => {
    const result = await togglePromotionActive(
      promotion.id,
      !promotion.is_active,
    );
    if (result.success) {
      setPromotions((prev) =>
        prev.map((p) => (p.id === promotion.id ? result.promotion! : p)),
      );
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleSuccess = (promotion: Promotion) => {
    setPromotions((prev) => {
      const exists = prev.some((p) => p.id === promotion.id);
      if (exists) {
        return prev.map((p) => (p.id === promotion.id ? promotion : p));
      }
      return [promotion, ...prev];
    });
  };

  // Single-pass computation: statusMap + stats + filtered + carousel + filterCounts
  const computed = useMemo(
    () => computePromotionsMetrics(promotions, filter, search),
    [promotions, filter, search],
  );

  return (
    <>
      <Header />
      <div className="p-8 max-w-6xl mx-auto space-y-8 relative">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0F172A]">
              Promociones
            </h1>
            <p className="text-[#64748B] text-base mt-1">
              Crea y gestiona promociones, y productos que quieras destacar para
              atraer más clientes.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-[#CDF545] text-[#114821] h-10 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm cursor-pointer"
          >
            <Plus size={18} /> Nueva promoción
          </button>
        </div>

        {/* STATS GRID */}
        <PromotionStats stats={computed.stats} />

        {/* CAROUSEL PREVIEW */}
        <div className="bg-[#FBFBFA] border border-[#E2E8F0] rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4 text-[#1C1C1C]">
            Vista previa del carrusel
          </h2>
          {computed.carouselPromotions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No hay promociones activas para mostrar.
            </p>
          ) : (
            <PromotionCarousel promotions={computed.carouselPromotions} />
          )}
        </div>

        {/* HISTORY TABLE */}
        <div>
          <h2 className="text-xl font-bold text-[#1C1C1C] mb-4">
            Historial de promociones
          </h2>
          <PromotionFilterBar
            filterButtons={computed.filterButtons}
            activeFilter={filter}
            onFilterChange={setFilter}
            searchValue={search}
            onSearchChange={setSearch}
          />
          <PromotionTable
            promotions={computed.filtered}
            statusMap={computed.statusMap}
            onEdit={openEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
            activeFilter={filter}
          />
        </div>
      </div>

      <PromotionSidebar
        isOpen={isSidebarOpen}
        promotion={selectedPromotion}
        products={products}
        onClose={closeSidebar}
        onSuccess={handleSuccess}
      />
    </>
  );
}
