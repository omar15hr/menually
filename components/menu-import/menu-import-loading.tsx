"use client";

import { cn } from "@/lib/utils";

interface MenuImportLoadingProps {
  message?: string;
  progress?: number; // 0-100, optional
}

const STEPS = [
  "Recibiendo imagen...",
  "Analizando contenido...",
  "Identificando categorías...",
  "Extrayendo productos...",
  "Finalizando...",
];

export function MenuImportLoading({
  message,
  progress,
}: MenuImportLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      {/* Animated progress bar */}
      <div className="w-80 h-2 bg-[#E4E4E6] rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full bg-gradient-to-r from-[#CDF545] to-[#114821] rounded-full",
            "transition-all duration-500 ease-out",
            "animate-progress"
          )}
          style={{
            width: progress ? `${progress}%` : "100%",
          }}
        />
      </div>

      {/* Current message */}
      <div className="text-center">
        <p className="text-[#1C1C1C] text-lg font-semibold animate-pulse">
          {message || "Analizando menú..."}
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, index) => (
          <div
            key={step}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300"
            )}
          >
            {/* Step dot */}
            <div
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-500",
                "animate-pulse"
              )}
              style={{
                backgroundColor:
                  index === 2
                    ? "#CDF545"
                    : index < 2
                      ? "#114821"
                      : "#E4E4E6",
                opacity: index <= 2 ? 1 : 0.5,
              }}
            />
            {/* Step label */}
            <span
              className={cn(
                "text-xs whitespace-nowrap transition-all duration-300",
                index <= 2 ? "text-[#114821] font-medium" : "text-[#58606E]/50"
              )}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
