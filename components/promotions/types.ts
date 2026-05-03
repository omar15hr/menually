export interface PromotionFormData {
  title: string;
  description: string;
  keyword: string;
  image_url: string;
  product_ids: string[];
  start_date: string;
  end_date: string;
  days_of_week: number[];
  is_active: boolean;
  has_date_range: boolean;
  has_day_filter: boolean;
}
