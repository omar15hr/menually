"use client";

import { useState } from "react";
import Link from "next/link";
import { XIcon } from "lucide-react";

interface IncompleteProfileBannerProps {
  hasBusiness: boolean;
}

export default function IncompleteProfileBanner({
  hasBusiness,
}: IncompleteProfileBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (hasBusiness || !isVisible) {
    return null;
  }

  return (
    <div className="bg-[#FEFAD2] text-[#534A03] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex gap-3 items-center">
        <p className="text-sm font-semibold bg-[#90700A] text-[#FEFAD2] w-fit px-2 py-1 rounded-lg">Pendiente</p>
        <p className="text-sm font-medium text-[#1C1C1C]">
          Tu perfil está incompleto. Agrega los datos para mejorar tu experiencia.
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/settings"
          className="text-sm font-semibold px-2 py-1 rounded-lg border border-[#90700A] text-[#90700A]"
        >
          Completar perfil
        </Link>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="p-1 -mr-1 rounded hover:bg-[#534A03]/10 transition-colors"
          aria-label="Cerrar"
        >
          <XIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}
