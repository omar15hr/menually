"use client";

import React, {
  useActionState,
  useState,
  useTransition,
  useEffect,
} from "react";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { createPromotion, updatePromotion } from "@/actions/promotion.action";
import { uploadImageToStorage } from "@/actions/uploadImageToStorage.action";
import type {
  Promotion,
  PromotionActionResult,
} from "@/types/promotions.types";
import type { Product } from "@/types/categories.types";
import { PromotionStep1BasicInfo } from "./PromotionStep1BasicInfo";
import { PromotionStep2Image } from "./PromotionStep2Image";
import { PromotionStep3Schedule } from "./PromotionStep3Schedule";

interface Props {
  promotion?: Promotion | null;
  products: Product[];
  onClose: () => void;
  onSuccess?: (promotion: Promotion) => void;
}

const DAYS_ES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const initialState: PromotionActionResult = {
  success: false,
  message: "",
  errors: {},
};

export function PromotionForm({
  promotion,
  products,
  onClose,
  onSuccess,
}: Props) {
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
    has_day_filter: !!(
      promotion?.days_of_week && promotion.days_of_week.length > 0
    ),
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(promotion?.product_ids ?? []),
  );

  const [state, formAction, isPending] = useActionState(
    promotion ? updatePromotion : createPromotion,
    initialState,
  );

  // Handle state updates
  const updateField = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K],
  ) => {
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

  const handleImageRemove = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description || "");
    fd.append("keyword", formData.keyword);
    fd.append("start_date", formData.has_date_range ? formData.start_date : "");
    fd.append("end_date", formData.has_date_range ? formData.end_date : "");
    fd.append(
      "days_of_week",
      JSON.stringify(formData.has_day_filter ? formData.days_of_week : []),
    );
    fd.append("is_active", String(formData.is_active));

    if (promotion) {
      fd.append("id", promotion.id);
    }

    // Upload image if selected
    if (imageFile) {
      const uploadResult = await uploadImageToStorage(
        imageFile,
        "images/promotions",
      );
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
    if (
      state?.success &&
      state.promotion &&
      state.promotion !== prevPromotionRef.current
    ) {
      prevPromotionRef.current = state.promotion;
      onSuccess?.(state.promotion);
      onClose();
    }
  }, [state?.success, state?.promotion, onSuccess, onClose]);

  return (
    <div className="flex flex-col h-full">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-4 px-6 py-8">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step > item
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
              <div
                className={`w-12 h-0.5 mb-6 mx-2 ${step > item ? "bg-[#CDF545]" : "bg-gray-100"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error banner */}
      {state?.success === false &&
        Object.keys(state.errors ?? {}).length > 0 && (
          <div className="mx-6 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-semibold text-red-700 mb-1">
              Corrige los siguientes errores:
            </p>
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
        {step === 1 && (
          <PromotionStep1BasicInfo
            formData={formData}
            updateField={updateField}
            products={products}
            selectedProducts={selectedProducts}
            toggleProduct={toggleProduct}
          />
        )}
        {step === 2 && (
          <PromotionStep2Image
            imagePreview={imagePreview}
            imageUrl={formData.image_url}
            onImageChange={handleImageChange}
            onImageRemove={handleImageRemove}
          />
        )}
        {step === 3 && (
          <PromotionStep3Schedule
            formData={formData}
            updateField={updateField}
            toggleDay={toggleDay}
            daysOfWeek={DAYS_ES}
            selectedProductCount={selectedProducts.size}
          />
        )}
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
            promotion ? (
              "Guardar cambios"
            ) : (
              "Crear promoción"
            )
          ) : (
            "Continuar"
          )}
        </button>
      </div>
    </div>
  );
}
