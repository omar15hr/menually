"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";
import { processMenuAI } from "@/actions/ai-process-menu.action";
import { useImportStore } from "@/store/useImportStore";
import DownloadCloudIcon from "../icons/DownloadCloudIcon";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MenuImportLoading } from "./MenuImportLoading";

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
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const { setStep, setImportedData, setFile, setError, setConfidenceWarning } =
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
      setIsLoading(true);
      setLoadingMessage("Analizando menú con IA...");

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
          if (
            result.data.confidence !== undefined &&
            result.data.confidence < 0.5
          ) {
            setConfidenceWarning(true);
          } else {
            setConfidenceWarning(false);
          }

          setStep("preview");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error desconocido";
        setError(message);
        setStep("error");
        toast.error("Error al procesar el archivo");
      } finally {
        setIsLoading(false);
        setLoadingMessage("");
      }
    },
    [setFile, setImportedData, setConfidenceWarning, setStep, setError],
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
    [handleFile],
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
    [handleFile],
  );

  return (
    <div
      className="w-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <Empty>
        <div
          className={`border-2 bg-[#FBFBFA] w-full flex flex-col justify-center items-center h-53 rounded-xl gap-6 transition-colors ${
            isDragOver
              ? "border-[#CDF545] bg-[#CDF545]/5"
              : "border-dashed border-[#E4E4E6] p-8"
          }`}
        >
          <div className="bg-[#CDF5454D] p-5 rounded-full my-2">
            <DownloadCloudIcon />
          </div>
          <div>
            <EmptyTitle className="text-[#114821] font-bold text-xl underline w-full">
              {isDragOver
                ? "Soltá el archivo aquí"
                : isLoading
                  ? "Procesando imagen..."
                  : "Arrastra tu archivo aquí o haz clic en continuar para subirlo"}
            </EmptyTitle>
            <EmptyDescription>
              {isLoading
                ? loadingMessage
                : `PDF, PNG, JPG o WEBP hasta ${MAX_SIZE_MB}MB`}
            </EmptyDescription>
          </div>
        </div>
        <EmptyContent className="flex flex-row gap-4 justify-center items-center">
          <Link href="/dashboard/menu">
            <Button
              size="lg"
              className="bg-transparent text-secondary font-bold cursor-pointer text-base"
            >
              Volver
            </Button>
          </Link>
          <label htmlFor="file-upload" className="cursor-pointer">
            <Button
              className={cn(
                "bg-[#CDF545] text-[#114821] font-semibold text-base py-2 px-4 rounded-lg h-10 min-w-32",
                isLoading && "bg-gray-400 cursor-not-allowed",
              )}
              size="lg"
              disabled={isLoading}
              asChild
            >
              <span>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="size-4" />
                    Procesando
                  </span>
                ) : (
                  "Continuar"
                )}
              </span>
            </Button>
            <input
              id="file-upload"
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              onChange={handleInputChange}
              className="hidden"
              disabled={isLoading}
            />
          </label>
        </EmptyContent>
      </Empty>

      {isLoading && <MenuImportLoading />}
    </div>
  );
}
