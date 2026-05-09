import type { PlanConfig, PlanId } from "@/types/onboarding.types";

export const PLANS: Record<PlanId, PlanConfig> = {
  basic: {
    id: "basic",
    name: "Plan Básico",
    description: "Para pequeños locales o que estén iniciando",
    monthlyPrice: 24990,
    annualPrice: 254990, // ~15% discount from 12 × 24990 (299880)
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
    annualPrice: 305990, // ~15% discount from 12 × 29990 (359880)
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
