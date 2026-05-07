export type OnboardingStep = "plan" | "redirecting" | "success" | "error";
export type PlanId = "basic" | "pro";
export type BillingCycle = "monthly" | "annual";

export interface PlanConfig {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  features: string[];
  isRecommended: boolean;
  badgeText?: string;
}

export const STEP_LABELS = ["Plan", "Pago", "¡Listo!"] as const;
