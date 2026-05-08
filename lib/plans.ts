import type { PlanConfig, PlanId } from "@/types/onboarding.types";

export const PLANS: Record<PlanId, PlanConfig> = {
  basic: {
    id: "basic",
    name: "Plan Básico",
    description: "Para pequeños locales o que estén iniciando",
    monthlyPrice: 24990,
    annualPrice: 24990 * 12,
    currency: "CLP",
    features: [
      "1 menú digital personalizado",
      "Conversión de PDF a menú con IA",
      "Métricas básicas",
      "Manejo de stock en tiempo real",
      "100% autoadministrable y editable",
      "Soporte por email",
    ],
    isRecommended: false,
  },
  pro: {
    id: "pro",
    name: "Plan Pro",
    description: "Full control para restaurantes en crecimiento",
    monthlyPrice: 29990,
    annualPrice: 29990 * 12,
    currency: "CLP",
    features: [
      "Todo lo del Plan Básico",
      "Métricas avanzadas + IA Insights",
      "IA aplicada a la optimización de menú",
      "Manejo de stock en tiempo real",
      "Creación de Promociones ilimitadas",
      "100% autoadministrable y editable",
      "Soporte prioritario por email",
    ],
    isRecommended: true,
    badgeText: "Recomendado",
  },
};

export const BILLING_CYCLES = ["monthly", "annual"] as const;

export const TRIAL_BADGE = "Prueba gratis";
