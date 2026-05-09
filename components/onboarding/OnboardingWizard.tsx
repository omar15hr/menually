"use client";

import ErrorScreen from "./ErrorScreen";
import PlanSelection from "./PlanSelection";
import SuccessScreen from "./SuccessScreen";
import HeaderLogo from "../shared/HeaderLogo";
import RedirectingScreen from "./RedirectingScreen";
import OnboardingProgress from "./OnboardingProgress";
import { useOnboardingStore } from "@/store/useOnboardingStore";

export default function OnboardingWizard() {
  const { step, selectedPlan, nextStep, prevStep, reset } =
    useOnboardingStore();

  const renderStepContent = () => {
    switch (step) {
      case "plan":
        return <PlanSelection />;
      case "redirecting":
        return <RedirectingScreen />;
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
          onNext: nextStep,
          nextDisabled: !selectedPlan,
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
    <div className="flex h-full flex-col bg-white">
      <HeaderLogo />
      <div className="px-4 py-6">
        {renderStepContent()}
      </div>

      <div className="bg-white px-4 py-4">
        <OnboardingProgress {...getProgressProps()} />
      </div>
    </div>
  );
}
