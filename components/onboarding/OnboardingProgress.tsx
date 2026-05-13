import Link from "next/link";
import { Button } from "@/components/ui/button";

interface OnboardingProgressProps {
  currentStep: 1 | 2;
  totalSteps: 2;
  nextDisabled?: boolean;
  showBack?: boolean;
  showNext?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  nextLabel?: string;
}

export default function OnboardingProgress({
  currentStep,
  totalSteps,
  nextDisabled,
  showBack,
  showNext,
  onBack,
  onNext,
  actionLabel,
  onAction,
  actionHref,
  nextLabel,
}: OnboardingProgressProps) {
  const progressPercent = currentStep === 1 ? "25%" : "100%";

  return (
    <div className="w-full space-y-2">
      <div
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={0}
        aria-valuemax={totalSteps}
        className="h-2 w-full rounded-full bg-[#DDE3ED]"
      >
        <div
          data-testid="progress-fill"
          className="h-full rounded-full bg-[#114821] transition-all duration-500"
          style={{ width: progressPercent }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#114821]">
          Paso {currentStep} de {totalSteps}
        </span>

        <div className="flex items-center gap-2">
          {showBack && onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="border-[#114821] text-[#114821] hover:bg-[#114821]/5"
            >
              Volver
            </Button>
          )}

          {showNext && onNext && (
            <Button
              onClick={onNext}
              disabled={nextDisabled}
              className="bg-[#CDF545] text-[#114821] hover:bg-[#b8df3e] disabled:opacity-50 text-base font-semibold py-2 px-4 h-10"
            >
              {nextLabel || "Continuar"}
            </Button>
          )}

          {actionLabel && actionHref && (
            <Button
              asChild
              className="bg-[#CDF545] text-[#114821] hover:bg-[#b8df3e]"
            >
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          )}

          {actionLabel && onAction && !actionHref && (
            <Button
              onClick={onAction}
              className="bg-[#CDF545] text-[#114821] hover:bg-[#b8df3e]"
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
