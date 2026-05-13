"use client";

import { useSearchParams } from "next/navigation";
import { useTransition, useEffect, useState } from "react";

import ErrorScreen from "./ErrorScreen";
import PlanSelection from "./PlanSelection";
import SuccessScreen from "./SuccessScreen";
import HeaderLogo from "../shared/HeaderLogo";
import RedirectingScreen from "./RedirectingScreen";
import OnboardingProgress from "./OnboardingProgress";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import {
  createSubscription,
  handlePreapprovalCallback,
} from "@/actions/subscription.action";

export default function OnboardingWizard() {
  const {
    step,
    selectedPlan,
    billingCycle,
    nextStep,
    prevStep,
    reset,
    setError,
    goToStep,
    setSelectedPlan,
    setBillingCycle,
  } = useOnboardingStore();

  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  // Handle return from Mercado Pago checkout (back_url callback)
  useEffect(() => {
    const status = searchParams.get("status");
    const preapprovalId = searchParams.get("preapproval_id");
    const plan = searchParams.get("plan");
    const cycle = searchParams.get("cycle");

    if (status && preapprovalId) {
      // Restore plan selection from URL params
      if (plan === "basic" || plan === "pro") setSelectedPlan(plan);
      if (cycle === "monthly" || cycle === "annual") setBillingCycle(cycle);

      startTransition(async () => {
        try {
          const result = await handlePreapprovalCallback(preapprovalId);
          if (result.success) {
            goToStep("success");
          } else {
            setError(
              result.message || "El pago no se completó. Intentalo de nuevo.",
            );
            goToStep("error");
          }
        } catch {
          setError("Error al verificar el pago");
          goToStep("error");
        }
      });
    }
  }, []); // Run once on mount

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    startTransition(async () => {
      try {
        const result = await createSubscription(selectedPlan, billingCycle);
        if (result.success && result.checkoutUrl) {
          setCheckoutUrl(result.checkoutUrl);
          nextStep();
        } else {
          setError(result.message || "Error al crear suscripción");
          goToStep("error");
        }
      } catch {
        setError("Error inesperado");
        goToStep("error");
      }
    });
  };

  const renderStepContent = () => {
    switch (step) {
      case "plan":
        return <PlanSelection />;
      case "redirecting":
        return (
          <RedirectingScreen
            checkoutUrl={checkoutUrl ?? undefined}
            onRetry={handleSubscribe}
          />
        );
      case "success":
        return <SuccessScreen />;
      case "error":
        return <ErrorScreen />;
      default:
        return <PlanSelection />;
    }
  };

  const getProgressProps = () => {
    switch (step) {
      case "plan":
        return {
          currentStep: 1 as const,
          totalSteps: 2 as const,
          showNext: true,
          onNext: handleSubscribe,
          nextDisabled: !selectedPlan || isPending,
          nextLabel: isPending ? "Creando suscripción..." : undefined,
        };
      case "redirecting":
        return {
          currentStep: 2 as const,
          totalSteps: 2 as const,
          showBack: true,
          onBack: prevStep,
        };
      case "success":
        return {
          currentStep: 2 as const,
          totalSteps: 2 as const,
          showBack: true,
          onBack: prevStep,
          actionLabel: "Ir al dashboard" as const,
          actionHref: "/dashboard" as const,
        };
      case "error":
        return {
          currentStep: 2 as const,
          totalSteps: 2 as const,
          showBack: true,
          onBack: prevStep,
          actionLabel: "Reintentar" as const,
          onAction: reset,
        };
      default:
        return {
          currentStep: 1 as const,
          totalSteps: 2 as const,
        };
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white relative">
      <HeaderLogo />
      <div className="px-4 py-6 flex-1 overflow-y-auto pb-28">
        {renderStepContent()}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white px-4 py-4 border-t border-[#DDE3ED]">
        <OnboardingProgress {...getProgressProps()} />
      </div>
    </div>
  );
}
