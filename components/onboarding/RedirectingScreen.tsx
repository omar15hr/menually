"use client";

import { Loader2 } from "lucide-react";

export default function RedirectingScreen() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <Loader2 data-testid="loader-spinner" className="size-10 animate-spin text-[#114821]" />
      <p className="text-lg font-medium text-[#114821]">
        Redirigiendo a Mercado Pago...
      </p>
    </div>
  );
}
