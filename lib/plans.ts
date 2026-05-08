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
      "1 menú digital",
      "QR personalizado",
      "Hasta 50 productos",
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
      "Menús ilimitados",
      "QR personalizado",
      "Productos ilimitados",
      "Promociones y ofertas",
      "Analíticas avanzadas",
      "Soporte prioritario",
    ],
    isRecommended: true,
    badgeText: "Recomendado",
  },
};

export const BILLING_CYCLES = ["monthly", "annual"] as const;

export const TRIAL_BADGE = "Prueba gratis";
