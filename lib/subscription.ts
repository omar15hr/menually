import type { Database } from "@/types/database.types";
import { PLANS } from "@/lib/plans";
import { MP_TRIAL_DURATION_DAYS } from "@/lib/mercadopago/constants";

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

export function mapMpStatusToDbStatus(mpStatus: string): Database["public"]["Enums"]["subscription_status"] {
  switch (mpStatus) {
    case "authorized":
      return "active";
    case "pending":
      return "trial";
    case "cancelled":
      return "cancelled";
    case "paused":
      return "past_due";
    default:
      console.warn(`Unknown Mercado Pago status: ${mpStatus}, defaulting to past_due`);
      return "past_due";
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
  return new Date(Date.now() + MP_TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);
}

export function getPlanAmount(planType: string, billingCycle: string): number {
  const plan = PLANS[planType as keyof typeof PLANS];
  if (!plan) return 0;
  return billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;
}

export function calculatePeriodDates(
  billingCycle: "monthly" | "annual",
  referenceDate: Date = new Date(),
): {
  current_period_start: Date;
  current_period_end: Date;
  next_billing_date: Date;
} {
  const start = new Date(referenceDate.getTime());
  const end = new Date(referenceDate.getTime());

  if (billingCycle === "annual") {
    end.setMonth(end.getMonth() + 12);
  } else {
    end.setMonth(end.getMonth() + 1);
  }

  return {
    current_period_start: start,
    current_period_end: end,
    next_billing_date: new Date(end.getTime()),
  };
}

export function calculatePeriodEndFromFrequency(
  frequency: number,
  frequencyType: "days" | "months",
  referenceDate: Date = new Date(),
): Date {
  const end = new Date(referenceDate.getTime());

  if (frequencyType === "days") {
    end.setDate(end.getDate() + frequency);
  } else {
    end.setMonth(end.getMonth() + frequency);
  }

  return end;
}
