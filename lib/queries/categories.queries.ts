import { createClient } from "@/lib/supabase/server";
import type { CategoryWithProducts, Product } from "@/types/categories.types";

export type CategorySummaryWithProducts = {
  id: string;
  name: string;
  products: Product[];
};

export async function getCategoriesByMenuId(
  menuId: string,
): Promise<CategoryWithProducts[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("categories")
    .select("*, products (*)")
    .eq("menu_id", menuId)
    .order("position", { ascending: true });

  return (data as CategoryWithProducts[]) ?? [];
}

export async function getCategoriesWithProductsByMenuId(
  menuId: string,
): Promise<CategorySummaryWithProducts[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("categories")
    .select("id, name, products(*)")
    .eq("menu_id", menuId)
    .order("position", { ascending: true });

  return (data as CategorySummaryWithProducts[]) ?? [];
}
