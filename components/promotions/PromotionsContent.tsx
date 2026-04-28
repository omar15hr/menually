"use client";

import { toast } from "sonner";
import Image from "next/image";
import { useState } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  Pencil,
  Trash2,
} from "lucide-react";

import Header from "@/components/shared/Header";
import { PromotionForm } from "./PromotionForm";
import type { Database } from "@/types/database.types";
import { PromotionCarousel } from "./PromotionCarousel";
import type { Promotion, PromotionStatus } from "@/types/promotions.types";
import {
  deletePromotion,
  togglePromotionActive,
} from "@/actions/promotion.action";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface Props {
  initialPromotions: Promotion[];
  products: Product[];
  menuId: string;
}

type FilterStatus = "all" | "scheduled" | "expired" | "paused";

function computeStatus(p: Promotion): PromotionStatus {
  if (!p.is_active) return "paused";
  const now = new Date();
  if (p.start_date && new Date(p.start_date) > now) return "scheduled";
  if (p.end_date && new Date(p.end_date) < now) return "expired";
  return "active";
}

function formatDateRange(p: Promotion): string {
  if (!p.start_date && !p.end_date) return "Sin fecha de término";
  if (p.start_date && p.end_date) {
    const fmt = (d: string) => {
      const date = new Date(d);
      return date.toLocaleDateString("es-CL", {
        day: "numeric",
        month: "short",
      });
    };
    return `${fmt(p.start_date)} - ${fmt(p.end_date)}`;
  }
  if (p.start_date)
    return `Desde ${new Date(p.start_date).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}`;
  return `Hasta ${new Date(p.end_date!).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}`;
}

const STATUS_COLORS: Record<PromotionStatus, string> = {
  active: "bg-green-100 text-green-700",
  scheduled: "bg-purple-100 text-purple-700",
  paused: "bg-yellow-100 text-yellow-700",
  expired: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<PromotionStatus, string> = {
  active: "Activa",
  scheduled: "Programada",
  paused: "Pausada",
  expired: "Vencida",
};

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

  // Stats
  const activePromos = promotions.filter(
    (p) => computeStatus(p) === "active",
  ).length;
  const scheduledPromos = promotions.filter(
    (p) => computeStatus(p) === "scheduled",
  ).length;
  const thisMonth = promotions.filter((p) => {
    const d = new Date(p.created_at);
    const now = new Date();
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const stats = [
    {
      id: 1,
      title: "Activas",
      desc: "Mostrándose actualmente",
      value: activePromos,
    },
    {
      id: 2,
      title: "Programadas",
      desc: "Inicia pronto",
      value: scheduledPromos,
    },
    {
      id: 3,
      title: "Este mes",
      desc: "Promociones publicadas",
      value: thisMonth,
    },
  ];

  // Filter
  const filtered = promotions.filter((p) => {
    const status = computeStatus(p);
    const matchesFilter = filter === "all" || status === filter;
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.keyword?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Carousel preview — only active/scheduled
  const carouselPromotions = promotions.filter((p) => {
    const s = computeStatus(p);
    return s === "active" || s === "scheduled";
  });

  const filterButtons: { label: string; value: FilterStatus }[] = [
    { label: `Todas (${promotions.length})`, value: "all" },
    {
      label: `Programadas (${promotions.filter((p) => computeStatus(p) === "scheduled").length})`,
      value: "scheduled",
    },
    {
      label: `Vencidas (${promotions.filter((p) => computeStatus(p) === "expired").length})`,
      value: "expired",
    },
    {
      label: `Pausadas (${promotions.filter((p) => computeStatus(p) === "paused").length})`,
      value: "paused",
    },
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.id}
              className="w-full border border-[#E2E8F0] rounded-2xl p-5 flex justify-between items-center bg-[#FBFBFA]"
            >
              <div>
                <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
              </div>
              <span className="text-4xl font-bold text-gray-900">
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* CAROUSEL PREVIEW */}
        <div className="bg-[#FBFBFA] border border-[#E2E8F0] rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4 text-[#1C1C1C]">
            Vista previa del carrusel
          </h2>
          {carouselPromotions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No hay promociones activas para mostrar.
            </p>
          ) : (
            <PromotionCarousel promotions={carouselPromotions} />
          )}
        </div>

        {/* HISTORY TABLE */}
        <div>
          <h2 className="text-xl font-bold text-[#1C1C1C] mb-4">
            Historial de promociones
          </h2>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2 flex-wrap">
              {filterButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setFilter(btn.value)}
                  className={`px-4 py-2 rounded-md text-base font-bold transition-colors ${
                    filter === btn.value
                      ? "bg-[#F5FDDA] text-green-800"
                      : "bg-[#FBFBFA] text-[#1C1C1C] border border-[#E2E8F0]"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <div className="w-72">
              <div className="relative w-full">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[#64748B]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar promoción..."
                  className="w-full pl-10 pr-3 py-2 bg-[#F1F5F9] border-none shadow-none text-sm h-10 rounded-lg placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-gray-200"
                />
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <p className="text-sm">
                  No hay promociones{" "}
                  {filter !== "all"
                    ? `con estado "${STATUS_LABELS[filter]}"`
                    : "aún"}
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-white border-b border-gray-200 text-gray-900">
                  <tr>
                    <th className="p-4 font-semibold">Promoción</th>
                    <th className="p-4 font-semibold">Palabra clave</th>
                    <th className="p-4 font-semibold">Estado</th>
                    <th className="p-4 font-semibold">Vigencia</th>
                    <th className="p-4 font-semibold">Disponibilidad</th>
                    <th className="p-4 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((p) => {
                    const status = computeStatus(p);
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {p.image_url && (
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                <Image
                                  src={p.image_url}
                                  alt={p.title}
                                  width={40}
                                  height={40}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-gray-900">
                                {p.title}
                              </p>
                              <p className="text-gray-500 text-xs truncate max-w-50">
                                {p.product_ids?.length ?? 0} producto(s)
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{p.keyword || "—"}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-semibold ${STATUS_COLORS[status]}`}
                          >
                            {STATUS_LABELS[status]}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500">
                          {formatDateRange(p)}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggle(p)}
                            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                              p.is_active ? "bg-blue-500" : "bg-gray-200"
                            }`}
                            title={p.is_active ? "Pausar" : "Activar"}
                          >
                            <div
                              className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
                                p.is_active ? "left-5" : "left-0.5"
                              }`}
                            />
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {filtered.length > 0 && (
              <div className="flex items-center justify-center gap-2 p-4 text-sm text-gray-600 border-t border-gray-100">
                <button className="flex items-center gap-1 hover:text-gray-900">
                  <ChevronLeft size={16} /> Anterior
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100">
                  1
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-md bg-[#0f3d32] text-white">
                  2
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100">
                  3
                </button>
                <MoreHorizontal size={16} className="text-gray-400" />
                <button className="flex items-center gap-1 hover:text-gray-900">
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OVERLAY / BACKDROP */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-112.5 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header Sidebar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedPromotion ? "Editar promoción" : "Nueva promoción"}
          </h2>
          <button
            onClick={closeSidebar}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <PromotionForm
            promotion={selectedPromotion}
            products={products}
            onClose={closeSidebar}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </>
  );
}
