import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BillingCycle } from "@/types/onboarding.types";
import { TRIAL_BADGE } from "@/lib/plans";

interface PlanCardProps {
  name: string;
  price: number;
  currency: string;
  features: string[];
  billingCycle: BillingCycle;
  isRecommended: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

function formatPrice(price: number, currency: string): string {
  return `${price.toLocaleString("es-CL")} ${currency}`;
}

export default function PlanCard({
  name,
  price,
  currency,
  features,
  billingCycle,
  isRecommended,
  isSelected,
  onSelect,
}: PlanCardProps) {
  const displayPrice = billingCycle === "annual" ? price * 12 : price;
  const periodLabel = billingCycle === "annual" ? "/año" : "/mes";

  return (
    <button
      type="button"
      onClick={onSelect}
      data-selected={isSelected}
      className={cn(
        "relative w-full rounded-xl border-2 p-4 text-left transition-all",
        isSelected
          ? "border-[#CDF545] bg-[#CDF545]/10 ring-2 ring-[#CDF545]"
          : "border-gray-200 bg-white hover:border-gray-300",
      )}
    >
      {isRecommended && (
        <span className="absolute -top-3 left-4 rounded-full bg-[#114821] px-3 py-1 text-xs font-medium text-white">
          Recomendado
        </span>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[#114821]">{name}</h3>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-[#114821]">
            {formatPrice(displayPrice, currency)}
          </span>
          <span className="text-sm text-[#58606E]">{periodLabel}</span>
        </div>
        <span className="mt-2 inline-block rounded-full bg-[#CDF545]/20 px-2 py-0.5 text-xs font-medium text-[#114821]">
          {TRIAL_BADGE}
        </span>
      </div>

      <ul className="space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-[#58606E]">
            <Check className="mt-0.5 size-4 shrink-0 text-[#114821]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}
