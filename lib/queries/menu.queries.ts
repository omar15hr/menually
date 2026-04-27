import { createClient } from "../supabase/server";
import type { Database } from "@/types/database.types";

type Menu = Database["public"]["Tables"]["menus"]["Row"];

export async function getMenuBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;

  return data;
}

export async function getMenuByUserId(userId: string): Promise<Menu | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("menus")
    .select("*")
    .eq("user_id", userId)
    .single();

  return data ?? null;
}
