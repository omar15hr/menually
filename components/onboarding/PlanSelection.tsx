"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import { PLANS } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import PlanCard from "./PlanCard";
import { cn } from "@/lib/utils";

export default function PlanSelection() {
  const {
    selectedPlan,
    billingCycle,
    setSelectedPlan,
    setBillingCycle,
    nextStep,
  } = useOnboardingStore();

  const handleSelect = (planId: "basic" | "pro") => {
    setSelectedPlan(planId);
  };

  const handleNext = () => {
    if (selectedPlan) {
      nextStep();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setBillingCycle("monthly")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            billingCycle === "monthly"
              ? "bg-[#114821] text-white"
              : "bg-gray-100 text-[#58606E] hover:bg-gray-200",
          )}
        >
          Mensual
        </button>
        <button
          type="button"
          onClick={() => setBillingCycle("annual")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            billingCycle === "annual"
              ? "bg-[#114821] text-white"
              : "bg-gray-100 text-[#58606E] hover:bg-gray-200",
          )}
        >
          Anual
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PlanCard
          name={PLANS.basic.name}
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
          price={PLANS.pro.monthlyPrice}
          currency={PLANS.pro.currency}
          features={PLANS.pro.features}
          billingCycle={billingCycle}
          isRecommended={PLANS.pro.isRecommended}
          isSelected={selectedPlan === "pro"}
          onSelect={() => handleSelect("pro")}
        />
      </div>

      <p className="text-center text-sm text-[#58606E]">
        30 días de prueba gratis. Cancelá cuando quieras.
      </p>

      <Button
        onClick={handleNext}
        disabled={!selectedPlan}
        className="w-full bg-[#CDF545] text-[#114821] hover:bg-[#b8df3e] disabled:opacity-50"
      >
        Siguiente
      </Button>
    </div>
  );
}
