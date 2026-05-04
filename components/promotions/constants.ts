import type { PromotionStatus } from "@/types/promotions.types";

export const STATUS_COLORS: Record<PromotionStatus, string> = {
  active: "bg-green-100 text-green-700",
  scheduled: "bg-purple-100 text-purple-700",
  paused: "bg-yellow-100 text-yellow-700",
  expired: "bg-red-100 text-red-700",
};

export const STATUS_LABELS: Record<PromotionStatus, string> = {
  active: "Activa",
  scheduled: "Programada",
  paused: "Pausada",
  expired: "Vencida",
};
