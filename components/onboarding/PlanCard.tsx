import { cn } from "@/lib/utils";
import type { BillingCycle } from "@/types/onboarding.types";
import CircleCheckIcon from "../icons/CircleCheckIcon";

interface PlanCardProps {
  name: string;
  description?: string;
  price: number;
  annualPrice: number;
  currency: string;
  features: string[];
  billingCycle: BillingCycle;
  isRecommended: boolean;
  isSelected: boolean;
  isCurrentPlan?: boolean;
  onSelect: () => void;
}

function formatPrice(price: number): string {
  return `$${price.toLocaleString("es-CL")}`;
}

export default function PlanCard({
  name,
  description,
  price,
  annualPrice,
  features,
  billingCycle,
  isRecommended,
  isSelected,
  isCurrentPlan,
  onSelect,
}: PlanCardProps) {
  const isAnnual = billingCycle === "annual";
  const displayPrice = isAnnual ? annualPrice : price;
  const periodLabel = isAnnual ? "/año" : "/mes";
  const monthlyEquivalent = isAnnual ? Math.round(annualPrice / 12) : price;
  const savings = isAnnual ? price * 12 - annualPrice : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      data-selected={isSelected}
      className={cn(
        "relative w-full h-fit rounded-2xl border-2 p-6 text-left transition-all duration-200",
        isSelected
          ? "border-[#CDF545] bg-white"
          : "border-[#E4E4E6] bg-white hover:border-gray-300",
      )}
    >
      {/* Badge RECOMENDADO — centrado en el borde superior */}
      {isRecommended && !isCurrentPlan && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#3D7A4F] px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap">
          Recomendado
        </span>
      )}

      {/* Badge PLAN ACTUAL */}
      {isCurrentPlan && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#114821] px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap">
          Plan actual
        </span>
      )}

      {/* Indicador top-right */}
      <div className="absolute top-4 right-4">
        {isSelected ? (
          <CircleCheckIcon />
        ) : (
          <span className="flex size-6 items-center justify-center rounded-full border-2 border-gray-300" />
        )}
      </div>

      {/* Header */}
      <div className="mb-5 pr-8">
        <h3 className="text-xl font-bold text-[#0F172A]">{name}</h3>
        {description && (
          <p className="mt-1 text-sm text-[#475569] leading-snug">
            {description}
          </p>
        )}
      </div>

      {/* Precio */}
      <div className="mb-1 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold text-[#0F1B3C]">
          {formatPrice(displayPrice)}
        </span>
        <span className="text-base font-medium text-[#58606E]">{periodLabel}</span>
      </div>

      {/* Nota anual */}
      {isAnnual && (
        <p className="mb-5 text-xs font-medium text-[#3D7A4F]">
          Anual — pagas una vez, usas todo el año
        </p>
      )}

      {/* Ahorro anual */}
      {isAnnual && savings > 0 && (
        <p className="mb-5 text-xs font-medium text-[#3D7A4F]">
          Ahorras {Math.round((savings / (price * 12)) * 100)}% (~{formatPrice(savings)} al año)
        </p>
      )}

      {/* Features */}
      <ul className="space-y-3 mt-5">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-sm text-[#3B4352]"
          >
            <CircleCheckIcon size={15} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}
