import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

export async function getSubscriptionByUserId(
  userId: string,
): Promise<SubscriptionRow | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return data ?? null;
}
