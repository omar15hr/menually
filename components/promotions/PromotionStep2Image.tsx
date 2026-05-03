"use client";

import Image from "next/image";
import { Camera, Info, X } from "lucide-react";

interface Props {
  imagePreview: string | null;
  imageUrl: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
}

export function PromotionStep2Image({
  imagePreview,
  imageUrl,
  onImageChange,
  onImageRemove,
}: Props) {
  return (
    <div className="space-y-6">
      <h3 className="font-bold text-sm text-gray-900">Imagen del banner</h3>
      <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="hidden"
        />
        {imagePreview || imageUrl ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <Image
              src={imagePreview || imageUrl || ""}
              alt="Preview"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onImageRemove();
              }}
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
              <p className="font-bold text-sm text-gray-900">
                Sube una imagen
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Recomendado 328 x 200px PNG.
              </p>
              <span className="text-[#34A853] text-xs font-bold mt-2 inline-block">
                Seleccionar archivo
              </span>
            </div>
          </>
        )}
      </label>
      <div className="bg-[#F8F9FA] rounded-xl p-4 flex gap-3 items-start">
        <Info size={20} className="text-gray-800 shrink-0 mt-0.5" />
        <p className="text-xs text-gray-600 leading-relaxed">
          El 70% del banner es imagen. Una foto con buena luz y colores
          cálidos puede aumentar el interés y las ventas de tus platos.
        </p>
      </div>
    </div>
  );
}
