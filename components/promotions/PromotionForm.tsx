"use client";

import React, { useActionState, useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Camera, Info, Check, X, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { createPromotion, updatePromotion } from "@/actions/promotion.action";
import { uploadImageToStorage } from "@/actions/uploadImageToStorage.action";
import type { Promotion, PromotionActionResult } from "@/types/promotions.types";
import type { Database } from "@/types/database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface Props {
  promotion?: Promotion | null;
  products: Product[];
  onClose: () => void;
  onSuccess?: (promotion: Promotion) => void;
}

const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const initialState: PromotionActionResult = {
  success: false,
  message: "",
  errors: {},
};

export function PromotionForm({ promotion, products, onClose, onSuccess }: Props) {
  const [_isPending, startTransition] = useTransition();
  const [step, setStep] = useState(promotion ? 3 : 1);

  const [formData, setFormData] = useState({
    title: promotion?.title ?? "",
    description: promotion?.description ?? "",
    keyword: promotion?.keyword ?? "",
    image_url: promotion?.image_url ?? "",
    product_ids: promotion?.product_ids ?? [],
    start_date: promotion?.start_date ?? "",
    end_date: promotion?.end_date ?? "",
    days_of_week: promotion?.days_of_week ?? [],
    is_active: promotion?.is_active ?? true,
    has_date_range: !!(promotion?.start_date || promotion?.end_date),
    has_day_filter: !!(promotion?.days_of_week && promotion.days_of_week.length > 0),
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(promotion?.product_ids ?? [])
  );

  const [state, formAction, isPending] = useActionState(
    promotion ? updatePromotion : createPromotion,
    initialState
  );

  // Handle state updates
  const updateField = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleDay = (day: number) => {
    setFormData((prev) => {
      const current = prev.days_of_week;
      const next = current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day];
      return { ...prev, days_of_week: next };
    });
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description || "");
    fd.append("keyword", formData.keyword);
    fd.append("start_date", formData.has_date_range ? formData.start_date : "");
    fd.append("end_date", formData.has_date_range ? formData.end_date : "");
    fd.append("days_of_week", JSON.stringify(formData.has_day_filter ? formData.days_of_week : []));
    fd.append("is_active", String(formData.is_active));

    if (promotion) {
      fd.append("id", promotion.id);
    }

    // Upload image if selected
    if (imageFile) {
      const uploadResult = await uploadImageToStorage(imageFile, "images/promotions");
      if (uploadResult.success && uploadResult.url) {
        fd.append("image_url", uploadResult.url);
      }
    }

    // Append product_ids
    selectedProducts.forEach((id) => fd.append("product_ids", id));

    if (selectedProducts.size === 0) {
      toast.error("Selecciona al menos un producto");
      setStep(1);
      return;
    }

    startTransition(() => {
      formAction(fd);
    });
  };

  // Handle state changes safely in useEffect — nunca en render

  // Toast: depende SOLO de state.success
  useEffect(() => {
    if (!state?.success) return;
    toast.success(state.message ?? "Operación exitosa");
  }, [state?.success, state?.message]);

  // Callback al padre: separado para evitar loop infinito
  // Solo se dispara cuando state.promotion cambia (no cada render)
  const prevPromotionRef = React.useRef(state?.promotion);
  useEffect(() => {
    if (state?.success && state.promotion && state.promotion !== prevPromotionRef.current) {
      prevPromotionRef.current = state.promotion;
      onSuccess?.(state.promotion);
      onClose();
    }
  }, [state?.success, state?.promotion, onSuccess, onClose]);

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Título *</label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción (opcional)</label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-1">Palabra clave *</label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Productos vinculados *</label>
              <div className="space-y-2 border border-gray-100 rounded-lg p-3">
                {products.length === 0 ? (
                  <p className="text-sm text-gray-400">No hay productos disponibles</p>
                ) : (
                  products.map((product) => (
                    <label key={product.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => toggleProduct(product.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#114821] focus:ring-[#114821]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        {product.price > 0 && (
                          <p className="text-xs text-gray-500">${product.price.toLocaleString("es-CL")}</p>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
              {selectedProducts.size === 0 && (
                <p className="text-xs text-red-500 mt-1">Selecciona al menos un producto</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="font-bold text-sm text-gray-900">Imagen del banner</h3>
            <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {(imagePreview || formData.image_url) ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview || formData.image_url || ""}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setImagePreview(null); setImageFile(null); }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <Camera size={24} className="text-gray-500" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="font-bold text-sm text-gray-900">Sube una imagen</p>
                    <p className="text-xs text-gray-500 mt-1">Recomendado 328 x 200px PNG.</p>
                    <span className="text-[#34A853] text-xs font-bold mt-2 inline-block">Seleccionar archivo</span>
                  </div>
                </>
              )}
            </label>
            <div className="bg-[#F8F9FA] rounded-xl p-4 flex gap-3 items-start">
              <Info size={20} className="text-gray-800 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 leading-relaxed">
                El 70% del banner es imagen. Una foto con buena luz y colores cálidos puede aumentar el interés y las ventas de tus platos.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Definir periodo de tiempo</h3>
                <p className="text-xs text-gray-500">Si no defines fecha, se muestran de forma permanente.</p>
              </div>
              <Switch
                checked={formData.has_date_range}
                onCheckedChange={(checked) => updateField("has_date_range", checked)}
              />
            </div>

            {formData.has_date_range && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha inicio</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => updateField("start_date", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#114821]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha fin</label>
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
                <h3 className="font-bold text-sm text-gray-900">Día de la semana</h3>
                <p className="text-xs text-gray-500">Elige los días en que estará disponible la promoción.</p>
              </div>
              <Switch
                checked={formData.has_day_filter}
                onCheckedChange={(checked) => updateField("has_day_filter", checked)}
              />
            </div>

            {formData.has_day_filter && (
              <div className="flex flex-wrap gap-2">
                {DAYS_ES.map((day, idx) => {
                  const isActive = formData.days_of_week.includes(idx);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border ${isActive
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
                <h3 className="font-bold text-sm text-gray-900">Activar promoción</h3>
                <p className="text-xs text-gray-500">Mostrar en el menú público inmediatamente.</p>
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
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Título</p>
                  <p className="text-xs font-medium text-gray-900">{formData.title || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Descripción</p>
                  <p className="text-xs font-medium text-gray-900">{formData.description || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Palabra clave</p>
                  <p className="text-xs font-medium text-gray-900">{formData.keyword || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Productos</p>
                  <p className="text-xs font-medium text-gray-900">{selectedProducts.size} producto(s)</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Vigencia</p>
                  <p className="text-xs font-medium text-gray-900">
                    {formData.has_date_range && formData.start_date && formData.end_date
                      ? `Del ${formData.start_date} al ${formData.end_date}`
                      : "Sin fecha de término"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-4 px-6 py-8">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step > item
                  ? "bg-[#CDF545] text-[#114821]"
                  : step === item
                    ? "bg-[#114821] text-white"
                    : "bg-gray-100 text-gray-500"
                  }`}
              >
                {step > item ? <Check size={16} /> : item}
              </div>
              <span className="text-xs font-semibold text-gray-600">
                {item === 1 ? "Contenido" : item === 2 ? "Imagen" : "Tiempo"}
              </span>
            </div>
            {item < 3 && (
              <div className={`w-12 h-0.5 mb-6 mx-2 ${step > item ? "bg-[#CDF545]" : "bg-gray-100"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Error banner */}
      {state?.success === false && Object.keys(state.errors ?? {}).length > 0 && (
        <div className="mx-6 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs font-semibold text-red-700 mb-1">Corrige los siguientes errores:</p>
          <ul className="space-y-0.5">
            {Object.entries(state.errors).map(([field, messages]) => (
              <li key={field} className="text-xs text-red-600">
                <span className="font-medium capitalize">{field}: </span>
                {Array.isArray(messages) ? messages.join(", ") : messages}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {renderStepContent()}
      </div>

      {/* Footer actions */}
      <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
        <button
          type="button"
          onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
          className="text-sm font-bold text-[#114821]"
        >
          {step === 1 ? "Cerrar" : "Volver"}
        </button>

        <button
          type="button"
          onClick={() => (step < 3 ? setStep(step + 1) : handleSubmit())}
          disabled={isPending}
          className="bg-[#CDF545] text-[#114821] px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#bce635] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              {promotion ? "Guardando..." : "Creando..."}
            </span>
          ) : step === 3 ? (
            promotion ? "Guardar cambios" : "Crear promoción"
          ) : (
            "Continuar"
          )}
        </button>
      </div>
    </div>
  );
}