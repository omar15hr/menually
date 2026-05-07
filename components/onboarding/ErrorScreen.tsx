"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/useOnboardingStore";

export default function ErrorScreen() {
  const { error, reset } = useOnboardingStore();

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      <AlertTriangle
        data-testid="warning-icon"
        className="size-16 text-red-500"
      />
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#114821]">
          Algo salió mal
        </h2>
        {error && (
          <p className="mt-2 text-[#58606E]">{error}</p>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <Button
          onClick={reset}
          className="bg-[#CDF545] text-[#114821] hover:bg-[#b8df3e]"
        >
          Reintentar
        </Button>
        <Link
          href="https://menually.cl/soporte"
          className="text-center text-sm text-[#58606E] underline hover:text-[#114821]"
        >
          Contactar soporte
        </Link>
      </div>
    </div>
  );
}
