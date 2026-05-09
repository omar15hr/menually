import type { Database } from "@/types/database.types";
import { PLANS } from "@/lib/plans";

type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

export function isSubscriptionActive(subscription: SubscriptionRow | null): boolean {
  if (subscription === null) return false;
  if (subscription.status === "active") return true;
  if (subscription.status === "trial") {
    if (!subscription.trial_ends_at) return false;
    return new Date(subscription.trial_ends_at) > new Date();
  }
  return false;
}

export function isTrialExpired(subscription: SubscriptionRow | null): boolean {
  if (subscription === null) return true;
  if (subscription.status !== "trial") return false;
  if (!subscription.trial_ends_at) return true;
  return new Date(subscription.trial_ends_at) <= new Date();
}

export function mapMpStatusToDbStatus(mpStatus: string): "active" | "cancelled" | "past_due" {
  switch (mpStatus) {
    case "authorized":
      return "active";
    case "cancelled":
      return "cancelled";
    case "paused":
      return "past_due";
    default:
      throw new Error(`Unknown Mercado Pago status: ${mpStatus}`);
  }
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getPlanDescription(planType: string, billingCycle: string): string {
  const planName = PLANS[planType as keyof typeof PLANS]?.name ?? planType;
  const cycleLabel = billingCycle === "monthly" ? "Mensual" : "Anual";
  return `${planName} ${cycleLabel}`;
}

export function calculateTrialEnd(): Date {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

export function getPlanAmount(planType: string, billingCycle: string): number {
  const plan = PLANS[planType as keyof typeof PLANS];
  if (!plan) return 0;
  return billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;
}
