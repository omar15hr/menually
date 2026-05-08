"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { STEP_LABELS } from "@/types/onboarding.types";
import OnboardingProgress from "./OnboardingProgress";
import PlanSelection from "./PlanSelection";
import RedirectingScreen from "./RedirectingScreen";
import SuccessScreen from "./SuccessScreen";
import ErrorScreen from "./ErrorScreen";
import HeaderLogo from "../shared/HeaderLogo";

const stepToProgressMap: Record<string, number> = {
  plan: 1,
  redirecting: 2,
  success: 3,
  error: 3,
};

export default function OnboardingWizard() {
  const { step, selectedPlan, nextStep, prevStep, reset } = useOnboardingStore();

  const currentStep = stepToProgressMap[step] ?? 1;

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

  const renderRightButton = () => {
    switch (step) {
      case "plan":
        return (
          <Button
            onClick={nextStep}
            disabled={!selectedPlan}
            className="bg-[#CDF545] text-[#114821] hover:bg-[#b8df3e] disabled:opacity-50"
          >
            Siguiente
          </Button>
        );
      case "success":
        return (
          <Button
            asChild
            className="bg-[#CDF545] text-[#114821] hover:bg-[#b8df3e]"
          >
            <Link href="/dashboard">Ir al dashboard</Link>
          </Button>
        );
      case "error":
        return (
          <Button
            onClick={reset}
            className="bg-[#CDF545] text-[#114821] hover:bg-[#b8df3e]"
          >
            Reintentar
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <HeaderLogo />
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {renderStepContent()}
      </div>

      <div className="bg-white px-4 py-4">
        <OnboardingProgress
          currentStep={currentStep}
          steps={STEP_LABELS.map((label) => ({ label }))}
        />

        <div
          data-testid="wizard-nav"
          className="mt-4 flex items-center justify-between"
        >
          {step !== "plan" ? (
            <Button
              variant="outline"
              onClick={prevStep}
              className="border-[#114821] text-[#114821] hover:bg-[#114821]/5"
            >
              Volver
            </Button>
          ) : (
            <div />
          )}

          {renderRightButton()}
        </div>
      </div>
    </div>
  );
}
