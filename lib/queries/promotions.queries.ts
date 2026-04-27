import { createClient } from "@/lib/supabase/server";

export async function getActivePromotionsByMenuId(menuId: string) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data } = await supabase
    .from("promotions")
    .select("*")
    .eq("menu_id", menuId)
    .eq("is_active", true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order("position", { ascending: true })
    .limit(10);

  return data ?? [];
}

export async function getAllPromotionsByMenuId(menuId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("promotions")
    .select("*")
    .eq("menu_id", menuId)
    .order("created_at", { ascending: false });

  return data ?? [];
}
