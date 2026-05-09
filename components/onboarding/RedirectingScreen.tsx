"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RedirectingScreenProps {
  checkoutUrl?: string;
  onRetry?: () => void;
}

export default function RedirectingScreen({
  checkoutUrl,
  onRetry,
}: RedirectingScreenProps) {
  useEffect(() => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  }, [checkoutUrl]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <Loader2 data-testid="loader-spinner" className="size-10 animate-spin text-[#114821]" />
      <p className="text-lg font-medium text-[#114821]">
        {checkoutUrl
          ? "Redirigiendo a Mercado Pago..."
          : "Serás redirigido en un momento..."}
      </p>
      {!checkoutUrl && onRetry && (
        <Button
          onClick={onRetry}
          className="bg-[#CDF545] text-[#114821] hover:bg-[#b8df3e]"
        >
          Reintentar
        </Button>
      )}
    </div>
  );
}
