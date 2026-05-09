"use client";

import { CheckCircle } from "lucide-react";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { PLANS } from "@/lib/plans";

export default function SuccessScreen() {
  const { selectedPlan, billingCycle } = useOnboardingStore();

  const plan = selectedPlan ? PLANS[selectedPlan] : null;
  const displayPrice = plan
    ? billingCycle === "annual"
      ? plan.monthlyPrice * 12
      : plan.monthlyPrice
    : 0;
  const periodLabel = billingCycle === "annual" ? "/año" : "/mes";

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      <CheckCircle
        data-testid="success-checkmark"
        className="size-16 text-[#CDF545]"
      />
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#114821]">
          ¡Tu suscripción está activa!
        </h2>
        {plan && (
          <p className="mt-2 text-[#58606E]">
            Plan {plan.name} — {displayPrice.toLocaleString("es-CL")} {plan.currency}
            {periodLabel}
          </p>
        )}
      </div>
    </div>
  );
}
