"use client";

import { ChangeEvent, useRef, useState } from "react";

import { uploadImageToStorage } from "@/actions/uploadImageToStorage.action";

interface Props {
  onPhotoUploaded: (url: string) => void;
  imagePath: string;
  children: React.ReactNode;
}

export default function PhotoUpload({ onPhotoUploaded, imagePath, children }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona una imagen");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("El tamaño de la imagen debe ser menos de 5 MB");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await uploadImageToStorage(file, imagePath);
      if (result.success && result.url) {
        onPhotoUploaded(result.url);
        setError(null);
      } else {
        setError(result.error ?? "Error al subir la imagen");
      }
    } catch (err) {
      setError("Fallo al subir la imagen");
    } finally {
      setUploading(false);
    }
  }

  function handleClick() {
    fileInputRef.current?.click();
  }

  return (
    <div className="relative w-full">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      {children}
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        title="Seleccionar archivo"
      />
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
          <div className="size-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute bottom-0 left-0 right-0 text-red-600 text-xs bg-red-50 px-2 py-1 rounded-b-2xl">
          {error}
        </div>
      )}
    </div>
  );
}
