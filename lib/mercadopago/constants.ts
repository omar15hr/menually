import type { PlanId, BillingCycle } from "@/types/onboarding.types";

export const MP_API_BASE_URL = "https://api.mercadopago.com";
export const MP_SANDBOX_BASE_URL = "https://api.mercadopago.com";

export const MP_PLAN_ENV_VARS: Record<PlanId, Record<BillingCycle, string>> = {
  basic: {
    monthly: "MP_PLAN_BASIC_MONTHLY_ID",
    annual: "MP_PLAN_BASIC_ANNUAL_ID",
  },
  pro: {
    monthly: "MP_PLAN_PRO_MONTHLY_ID",
    annual: "MP_PLAN_PRO_ANNUAL_ID",
  },
};

export const MP_WEBHOOK_TOPICS = [
  "subscription_preapproval",
  "subscription_authorized_payment",
] as const;

export const MP_STATUS_MAPPING: Record<string, string> = {
  authorized: "active",
  cancelled: "cancelled",
  paused: "past_due",
};

export function getPlanEnvVar(planId: PlanId, billingCycle: BillingCycle): string {
  return MP_PLAN_ENV_VARS[planId][billingCycle];
}
