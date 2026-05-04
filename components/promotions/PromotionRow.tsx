"use client";

import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import type { Promotion, PromotionStatus } from "@/types/promotions.types";
import { formatDateRange } from "@/lib/promotions";
import { STATUS_COLORS, STATUS_LABELS } from "./constants";

interface PromotionRowProps {
  promotion: Promotion;
  status: PromotionStatus;
  onEdit: (p: Promotion) => void;
  onDelete: (id: string) => void;
  onToggle: (p: Promotion) => void;
}

export function PromotionRow({
  promotion,
  status,
  onEdit,
  onDelete,
  onToggle,
}: PromotionRowProps) {
  return (
    <tr key={promotion.id} className="hover:bg-gray-50">
      <td className="p-4">
        <div className="flex items-center gap-3">
          {promotion.image_url && (
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              <Image
                src={promotion.image_url}
                alt={promotion.title}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <div>
            <p className="font-bold text-gray-900">{promotion.title}</p>
            <p className="text-gray-500 text-xs truncate max-w-50">
              {promotion.product_ids?.length ?? 0} producto(s)
            </p>
          </div>
        </div>
      </td>
      <td className="p-4">{promotion.keyword || "—"}</td>
      <td className="p-4">
        <span
          className={`px-2 py-1 rounded-md text-xs font-semibold ${STATUS_COLORS[status]}`}
        >
          {STATUS_LABELS[status]}
        </span>
      </td>
      <td className="p-4 text-gray-500">{formatDateRange(promotion)}</td>
      <td className="p-4">
        <button
          onClick={() => onToggle(promotion)}
          className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
            promotion.is_active ? "bg-blue-500" : "bg-gray-200"
          }`}
          title={promotion.is_active ? "Pausar" : "Activar"}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
              promotion.is_active ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(promotion)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            title="Editar"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(promotion.id)}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
