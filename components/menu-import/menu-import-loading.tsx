"use client";

import { Spinner } from "@/components/ui/spinner";

interface MenuImportLoadingProps {
  message?: string;
}

export function MenuImportLoading({ message = "Analizando menú con IA..." }: MenuImportLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <Spinner className="size-10 text-[#114821]" />
      <p className="text-[#58606E] text-lg font-medium animate-pulse">
        {message}
      </p>
      <p className="text-[#58606E]/70 text-sm">
        Esto puede tardar unos segundos...
      </p>
    </div>
  );
}
