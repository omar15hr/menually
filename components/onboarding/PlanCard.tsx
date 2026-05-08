import { cn } from "@/lib/utils";
import type { BillingCycle } from "@/types/onboarding.types";
import CircleCheckIcon from "../icons/CircleCheckIcon";

interface PlanCardProps {
  name: string;
  description?: string;
  price: number;
  currency: string;
  features: string[];
  billingCycle: BillingCycle;
  isRecommended: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

function formatPrice(price: number): string {
  return `$${price.toLocaleString("es-CL")}`;
}

export default function PlanCard({
  name,
  description,
  price,
  features,
  billingCycle,
  isRecommended,
  isSelected,
  onSelect,
}: PlanCardProps) {
  const isAnnual = billingCycle === "annual";

  return (
    <button
      type="button"
      onClick={onSelect}
      data-selected={isSelected}
      className={cn(
        "relative w-full h-fit rounded-2xl border-2 p-6 text-left transition-all duration-200",
        isSelected
          ? "border-[#C8F135] bg-white shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300 shadow-sm",
      )}
    >
      {/* Badge RECOMENDADO — centrado en el borde superior */}
      {isRecommended && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#3D7A4F] px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white whitespace-nowrap">
          Recomendado
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
          {formatPrice(price)}
        </span>
        <span className="text-base font-medium text-[#58606E]">/mes</span>
      </div>

      {/* Nota anual */}
      {isAnnual && (
        <p className="mb-5 text-xs font-medium text-[#3D7A4F]">
          Anual — pagas una vez, usas todo el año
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
