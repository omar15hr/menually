export type OnboardingStep = "plan" | "redirecting" | "success" | "error";
export type PlanId = "basic" | "pro";
export type BillingCycle = "monthly" | "annual";

export interface PlanConfig {
  id: PlanId;
  name: string;
  description?: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  features: string[];
  isRecommended: boolean;
  badgeText?: string;
}


