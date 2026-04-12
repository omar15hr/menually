"use client";

import { useCallback, useState } from "react";
import { UploadCloudIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { processMenuAI } from "@/actions/ai-process-menu.action";
import { useImportStore } from "@/store/useImportStore";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

const MAX_SIZE_MB = 10;

export function MenuImportDropzone() {
  const [isDragOver, setIsDragOver] = useState(false);
  const { setStep, setImportedData, setFile, setLoading, setError, setConfidenceWarning } =
    useImportStore();

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Tipo de archivo no soportado. Usa PDF, PNG, JPG o WEBP.`;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_SIZE_MB) {
      return `El archivo es demasiado grande (${sizeMB.toFixed(2)}MB). Máximo: ${MAX_SIZE_MB}MB.`;
    }

    return null;
  };

  const handleFile = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }

      setFile(file);
      setLoading(true, "Analizando menú con IA...");

      try {
        const formData = new FormData();
        formData.append("file", file);

        const result = await processMenuAI(formData);

        if (result.error) {
          setError(result.error);
          setStep("error");
          toast.error(result.error);
          return;
        }

        if (result.data) {
          setImportedData(result.data);

          // Set confidence warning if low
          if (result.data.confidence !== undefined && result.data.confidence < 0.5) {
            setConfidenceWarning(true);
          } else {
            setConfidenceWarning(false);
          }

          setStep("preview");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error desconocido";
        setError(message);
        setStep("error");
        toast.error("Error al procesar el archivo");
      } finally {
        setLoading(false);
      }
    },
    [setFile, setLoading, setImportedData, setConfidenceWarning, setStep, setError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <div
      className="w-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <Empty
        className={`border-2 bg-[#FBFBFA] transition-colors ${
          isDragOver ? "border-[#CDF545] bg-[#CDF545]/5" : "border-dashed border-[#E4E4E6]"
        }`}
      >
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UploadCloudIcon className="size-8 text-[#58606E]" />
          </EmptyMedia>
          <EmptyTitle>
            {isDragOver
              ? "Soltá el archivo aquí"
              : "Arrastrá tu archivo aquí o hacé clic para buscarlo"}
          </EmptyTitle>
          <EmptyDescription>
            PDF, PNG, JPG o WEBP hasta {MAX_SIZE_MB}MB
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <label htmlFor="file-upload" className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span>Buscar archivo</span>
            </Button>
            <input
              id="file-upload"
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              onChange={handleInputChange}
              className="hidden"
            />
          </label>
        </EmptyContent>
      </Empty>
    </div>
  );
}
