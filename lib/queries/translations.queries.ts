import { createClient } from "@/lib/supabase/server";
import type { Translation } from "@/types/translations.types";

export async function getTranslationsByMenuId(
  menuId: string,
): Promise<Translation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("translations")
    .select("*")
    .eq("menu_id", menuId);

  if (error) {
    console.error("Error fetching translations:", error.message);
    return [];
  }

  return (data as Translation[]) ?? [];
}
