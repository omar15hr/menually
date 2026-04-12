"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { MenuImportDropzone } from "@/components/menu-import";
import { MenuImportLoading } from "@/components/menu-import";
import { MenuImportPreview } from "@/components/menu-import";
import { useImportStore } from "@/store/useImportStore";

export default function MenuImportPage() {
  const { step, loadingMessage, error, reset } = useImportStore();

  useEffect(() => {
    reset();
  }, [reset]);
  const renderContent = () => {
    switch (step) {
      case "upload":
        return <MenuImportDropzone />;

      case "processing":
        return <MenuImportLoading message={loadingMessage || "Analizando menú con IA..."} />;

      case "preview":
        return <MenuImportPreview />;

      case "importing":
        return <MenuImportLoading message="Importando productos..." />;

      case "error":
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-red-600 font-medium">{error || "Ocurrió un error"}</p>
            </div>
            <Button onClick={() => reset()}>Intentar de nuevo</Button>
          </div>
        );

      case "success":
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
              <p className="text-green-600 font-medium">¡Menú importado correctamente!</p>
              <p className="text-green-600/70 text-sm mt-1">Redirigiendo al editor...</p>
            </div>
          </div>
        );

      default:
        return <MenuImportDropzone />;
    }
  };

  return (
    <div className="p-12 w-full mx-auto flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-[#1C1C1C] font-extrabold text-3xl">
          Sube el menú de tu restaurante
        </h1>
        <p className="text-[#58606E] font-normal text-lg mt-2">
          Lo analizamos automáticamente y lo convertimos en tu menú digital.
        </p>
      </div>

      {renderContent()}

      <div className="flex justify-between max-w-4xl mx-auto items-center pt-4 border-t border-[#E4E4E6]">
        <Link href="/dashboard/menu">
          <Button variant="outline" size="sm">
            Volver al menú
          </Button>
        </Link>

        {step === "preview" && (
          <Link href="/dashboard/menu/menu-content">
            <Button variant="ghost" size="sm" className="text-[#58606E]">
              Ver menú actual
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
