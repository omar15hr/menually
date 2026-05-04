"use client";

import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import type { Promotion, PromotionStatus } from "@/types/promotions.types";
import type { FilterStatus } from "@/lib/promotions";
import { STATUS_LABELS } from "./constants";
import { PromotionRow } from "./PromotionRow";

interface PromotionTableProps {
  promotions: Promotion[];
  statusMap: Map<string, PromotionStatus>;
  onEdit: (p: Promotion) => void;
  onDelete: (id: string) => void;
  onToggle: (p: Promotion) => void;
  activeFilter: FilterStatus;
}

export function PromotionTable({
  promotions,
  statusMap,
  onEdit,
  onDelete,
  onToggle,
  activeFilter,
}: PromotionTableProps) {
  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      {promotions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <p className="text-sm">
            No hay promociones{" "}
            {activeFilter !== "all"
              ? `con estado "${STATUS_LABELS[activeFilter]}"`
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
            {promotions.map((p) => {
              const status = statusMap.get(p.id) ?? "active";
              return (
                <PromotionRow
                  key={p.id}
                  promotion={p}
                  status={status}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggle={onToggle}
                />
              );
            })}
          </tbody>
        </table>
      )}

      {promotions.length > 0 && (
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
  );
}
