import type { Database } from "@/types/database.types";

export type Promotion = Database["public"]["Tables"]["promotions"]["Row"];

export type CreatePromotion =
  Database["public"]["Tables"]["promotions"]["Insert"];

export type UpdatePromotion =
  Database["public"]["Tables"]["promotions"]["Update"];

export type PromotionStatus = "active" | "scheduled" | "paused" | "expired";

export type PromotionStatusUi = Promotion & {
  computed_status: PromotionStatus;
};

export type PromotionActionResult = {
  success: boolean;
  message: string;
  errors: Record<string, string[]>;
  promotion?: Promotion;
};

export type PromotionFormData = {
  title: string;
  description: string | null;
  keyword: string;
  image_url: string | null;
  product_ids: string[];
  start_date: string | null;
  end_date: string | null;
  days_of_week: number[];
  is_active: boolean;
};
