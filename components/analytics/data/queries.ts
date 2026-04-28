import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { DateRange } from "./dateRanges";

type QrScanRow = Pick<
  Database["public"]["Tables"]["qr_scans"]["Row"],
  "scanned_at"
>;
type MenuEventRow = Database["public"]["Tables"]["menu_events"]["Row"];
type CategoryRow = Pick<
  Database["public"]["Tables"]["categories"]["Row"],
  "id" | "name"
>;
type ProductRow = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "id" | "name"
>;

function toIsoRange(range: DateRange): { from: string; to: string } {
  return {
    from: range.start.toISOString(),
    to: range.end.toISOString(),
  };
}

export async function fetchTotalScans(
  supabase: SupabaseClient<Database>,
  businessId: string,
  range: DateRange,
): Promise<number> {
  const { from, to } = toIsoRange(range);
  const { count } = await supabase
    .from("qr_scans")
    .select("*", { count: "exact", head: true })
    .eq("business_id", businessId)
    .gte("scanned_at", from)
    .lte("scanned_at", to);

  return count ?? 0;
}

export async function fetchScansTimeline(
  supabase: SupabaseClient<Database>,
  businessId: string,
  range: DateRange,
): Promise<QrScanRow[]> {
  const { from, to } = toIsoRange(range);
  const { data } = await supabase
    .from("qr_scans")
    .select("scanned_at")
    .eq("business_id", businessId)
    .gte("scanned_at", from)
    .lte("scanned_at", to)
    .order("scanned_at");

  return data ?? [];
}

export async function fetchCategoryViews(
  supabase: SupabaseClient<Database>,
  businessId: string,
  range: DateRange,
): Promise<
  Array<Pick<MenuEventRow, "category_id" | "created_at" | "session_id">>
> {
  const { from, to } = toIsoRange(range);
  const { data } = await supabase
    .from("menu_events")
    .select("category_id, created_at, session_id")
    .eq("business_id", businessId)
    .eq("event_type", "category_view")
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at");

  return data ?? [];
}

export async function fetchProductViews(
  supabase: SupabaseClient<Database>,
  businessId: string,
  range: DateRange,
): Promise<Array<Pick<MenuEventRow, "product_id">>> {
  const { from, to } = toIsoRange(range);
  const { data } = await supabase
    .from("menu_events")
    .select("product_id")
    .eq("business_id", businessId)
    .eq("event_type", "product_view")
    .gte("created_at", from)
    .lte("created_at", to);

  return data ?? [];
}

export async function fetchShareEvents(
  supabase: SupabaseClient<Database>,
  businessId: string,
  range: DateRange,
): Promise<Array<Pick<MenuEventRow, "created_at">>> {
  const { from, to } = toIsoRange(range);
  const { data } = await supabase
    .from("menu_events")
    .select("created_at")
    .eq("business_id", businessId)
    .eq("event_type", "share")
    .gte("created_at", from)
    .lte("created_at", to);

  return data ?? [];
}

export async function fetchExitEvents(
  supabase: SupabaseClient<Database>,
  businessId: string,
  range: DateRange,
): Promise<Array<Pick<MenuEventRow, "duration_seconds" | "product_id">>> {
  const { from, to } = toIsoRange(range);
  const { data } = await supabase
    .from("menu_events")
    .select("duration_seconds, product_id")
    .eq("business_id", businessId)
    .eq("event_type", "exit")
    .gte("created_at", from)
    .lte("created_at", to);

  return data ?? [];
}

export async function fetchCategoriesByMenu(
  supabase: SupabaseClient<Database>,
  menuId: string,
): Promise<CategoryRow[]> {
  const { data } = await supabase
    .from("categories")
    .select("id, name")
    .eq("menu_id", menuId)
    .order("position");

  return data ?? [];
}

export async function fetchProductsByCategoryIds(
  supabase: SupabaseClient<Database>,
  categoryIds: string[],
): Promise<ProductRow[]> {
  if (categoryIds.length === 0) {
    return [];
  }

  const { data } = await supabase
    .from("products")
    .select("id, name")
    .in("category_id", categoryIds)
    .order("position");

  return data ?? [];
}
