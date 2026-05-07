import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
}

interface OnboardingProgressProps {
  currentStep: number;
  steps: Step[];
}

export default function OnboardingProgress({
  currentStep,
  steps,
}: OnboardingProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isPending = stepNumber > currentStep;

          return (
            <div key={step.label} className="flex flex-1 items-center">
              <div
                role="listitem"
                data-status={
                  isActive ? "active" : isCompleted ? "completed" : "pending"
                }
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border-2 text-sm font-medium",
                    isActive &&
                      "border-[#114821] bg-[#114821] text-white",
                    isCompleted &&
                      "border-[#CDF545] bg-[#CDF545] text-[#114821]",
                    isPending &&
                      "border-[#58606E] bg-white text-[#58606E]",
                  )}
                >
                  {isCompleted ? (
                    <Check data-testid="check-icon" className="size-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isActive && "text-[#114821]",
                    isCompleted && "text-[#114821]",
                    isPending && "text-[#58606E]",
                  )}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className="mx-2 h-0.5 flex-1 bg-gray-200">
                  <div
                    className={cn(
                      "h-full transition-all",
                      isCompleted ? "w-full bg-[#CDF545]" : "w-0",
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
