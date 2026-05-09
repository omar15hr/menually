"use client";

import { cn } from "@/lib/utils";
import PlanCard from "./PlanCard";
import { PLANS } from "@/lib/plans";
import { useOnboardingStore } from "@/store/useOnboardingStore";

export default function PlanSelection() {
  const { selectedPlan, billingCycle, setSelectedPlan, setBillingCycle } =
    useOnboardingStore();

  const handleSelect = (planId: "basic" | "pro") => {
    setSelectedPlan(planId);
  };

  return (
    <div className="flex flex-col gap-10 bg-white">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-[#1C1C1C] text-3xl font-extrabold">
          Escoge el plan que quieres contratar
        </h1>
        <p className="text-[#58606E] text-lg">
          Tenemos planes para todos todos los negocios, escoge el que mejor se
          adapte a ti.
        </p>
      </div>
      <div className="flex items-center gap-1 bg-[#F1F5F9] w-fit mx-auto rounded-2xl p-1.5 px-2">
        <button
          type="button"
          onClick={() => setBillingCycle("monthly")}
          className={cn(
            "px-6 py-2.5 text-base font-semibold transition-all duration-200 rounded-xl",
            billingCycle === "monthly"
              ? "bg-white text-[#0F1B3C] border border-[#C8F135] shadow-sm"
              : "text-[#8C939D] bg-transparent",
          )}
        >
          Mensualmente
        </button>
        <button
          type="button"
          onClick={() => setBillingCycle("annual")}
          className={cn(
            "px-6 py-2.5 text-base font-semibold transition-all duration-200 rounded-xl",
            billingCycle === "annual"
              ? "bg-white text-[#0F1B3C] border border-[#C8F135] shadow-sm"
              : "text-[#8C939D] bg-transparent",
          )}
        >
          Anualmente
        </button>
      </div>

      <p className="text-center text-sm text-[#58606E]">
        30 días de prueba gratis. Cancelá cuando quieras.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 max-w-4xl mx-auto">
        <PlanCard
          name={PLANS.basic.name}
          description={PLANS.basic.description}
          price={PLANS.basic.monthlyPrice}
          currency={PLANS.basic.currency}
          features={PLANS.basic.features}
          billingCycle={billingCycle}
          isRecommended={PLANS.basic.isRecommended}
          isSelected={selectedPlan === "basic"}
          onSelect={() => handleSelect("basic")}
        />
        <PlanCard
          name={PLANS.pro.name}
          description={PLANS.pro.description}
          price={PLANS.pro.monthlyPrice}
          currency={PLANS.pro.currency}
          features={PLANS.pro.features}
          billingCycle={billingCycle}
          isRecommended={PLANS.pro.isRecommended}
          isSelected={selectedPlan === "pro"}
          onSelect={() => handleSelect("pro")}
        />
      </div>
    </div>
  );
}
