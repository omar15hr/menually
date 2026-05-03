"use client";

import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import type { PromotionFormData } from "./types";

interface Props {
  formData: PromotionFormData;
  updateField: <K extends keyof PromotionFormData>(
    key: K,
    value: PromotionFormData[K],
  ) => void;
  toggleDay: (day: number) => void;
  daysOfWeek: string[];
  selectedProductCount: number;
}

export function PromotionStep3Schedule({
  formData,
  updateField,
  toggleDay,
  daysOfWeek,
  selectedProductCount,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-gray-900">
            Definir periodo de tiempo
          </h3>
          <p className="text-xs text-gray-500">
            Si no defines fecha, se muestran de forma permanente.
          </p>
        </div>
        <Switch
          checked={formData.has_date_range}
          onCheckedChange={(checked) =>
            updateField("has_date_range", checked)
          }
        />
      </div>

      {formData.has_date_range && (
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Fecha inicio
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => updateField("start_date", e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#114821]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Fecha fin
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => updateField("end_date", e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#114821]"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-gray-900">
            Día de la semana
          </h3>
          <p className="text-xs text-gray-500">
            Elige los días en que estará disponible la promoción.
          </p>
        </div>
        <Switch
          checked={formData.has_day_filter}
          onCheckedChange={(checked) =>
            updateField("has_day_filter", checked)
          }
        />
      </div>

      {formData.has_day_filter && (
        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map((day, idx) => {
            const isActive = formData.days_of_week.includes(idx);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border ${
                  isActive
                    ? "bg-[#114821] text-white border-[#114821]"
                    : "bg-gray-100 text-gray-600 border-transparent"
                }`}
              >
                {day}
                {isActive && <X size={12} />}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-gray-900">
            Activar promoción
          </h3>
          <p className="text-xs text-gray-500">
            Mostrar en el menú público inmediatamente.
          </p>
        </div>
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => updateField("is_active", checked)}
        />
      </div>

      {/* Summary */}
      <div className="bg-[#F8F9FA] rounded-xl p-5 space-y-4 border border-gray-100 mt-4">
        <h4 className="font-bold text-sm text-gray-900">Resumen</h4>
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-semibold">
              Título
            </p>
            <p className="text-xs font-medium text-gray-900">
              {formData.title || "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-semibold">
              Descripción
            </p>
            <p className="text-xs font-medium text-gray-900">
              {formData.description || "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-semibold">
              Palabra clave
            </p>
            <p className="text-xs font-medium text-gray-900">
              {formData.keyword || "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-semibold">
              Productos
            </p>
            <p className="text-xs font-medium text-gray-900">
              {selectedProductCount} producto(s)
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-semibold">
              Vigencia
            </p>
            <p className="text-xs font-medium text-gray-900">
              {formData.has_date_range &&
              formData.start_date &&
              formData.end_date
                ? `Del ${formData.start_date} al ${formData.end_date}`
                : "Sin fecha de término"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
