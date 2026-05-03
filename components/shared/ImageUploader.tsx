"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import CameraIcon from "@/components/icons/CameraIcon";
import XIcon from "@/components/icons/XIcon";
import PhotoUpload from "@/components/shared/PhotoUpload";

interface ImageUploaderProps {
  /** Display label above the upload area */
  label: string;
  /** Supabase storage bucket path: "logos" | "backgrounds" | "products" */
  imagePath: string;
  /** Current image URL (empty string if none) */
  imageUrl: string;
  /** Called when a new image is uploaded successfully */
  onImageUploaded: (url: string) => void;
  /** Recommended dimensions text, e.g. "Recomendado 328 x 200px PNG." */
  recommendedSize?: string;
}

export default function ImageUploader({
  label,
  imagePath,
  imageUrl,
  onImageUploaded,
  recommendedSize = "Recomendado 328 x 200px PNG.",
}: ImageUploaderProps) {
  return (
    <div className="flex flex-col gap-2 p-4">
      <span className="text-sm text-[#1C1C1C] font-semibold shrink-0">
        {label}
      </span>
      <PhotoUpload imagePath={imagePath} onPhotoUploaded={onImageUploaded}>
        <div
          className={cn(
            "flex gap-4 justify-center rounded-2xl p-4 cursor-pointer transition-colors items-center",
            imageUrl
              ? "border-[#E4E4E6] border-2"
              : "border-dashed border-[#E4E4E6] border-2",
          )}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={label}
              width={300}
              height={300}
              className="rounded-lg size-15"
            />
          ) : (
            <span className="bg-[#E5E7EA] px-2.5 py-4 rounded-full">
              <CameraIcon />
            </span>
          )}
          <div className="text-sm w-full">
            {!imageUrl ? (
              <div>
                <h2 className="text-[#1C1C1C] font-semibold">
                  Sube una imagen
                </h2>
                <p className="text-[#58606E]">{recommendedSize}</p>
                <span className="text-[#25B205]">Seleccionar archivo</span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[#58606E]">
                <span>Archivo subido</span>
                <XIcon />
              </div>
            )}
          </div>
        </div>
      </PhotoUpload>
    </div>
  );
}
