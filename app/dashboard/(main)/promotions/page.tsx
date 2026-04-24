import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PromotionsContent from "@/components/promotions/PromotionsContent";
import type { Promotion } from "@/types/promotions.types";
import type { Database } from "@/types/database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export default async function PromotionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's menu
  const { data: menu } = await supabase
    .from("menus")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!menu) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <p className="text-gray-500">No tienes un menú activo.</p>
      </div>
    );
  }

  // Fetch promotions
  const { data: promotions } = await supabase
    .from("promotions")
    .select("*")
    .eq("menu_id", menu.id)
    .order("created_at", { ascending: false });

  // Fetch products for the selector
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, products(*)")
    .eq("menu_id", menu.id)
    .order("position", { ascending: true });

  const products: Product[] =
    categories?.flatMap((cat) => cat.products as unknown as Product[]) ?? [];

  return (
    <PromotionsContent
      initialPromotions={(promotions as unknown as Promotion[]) ?? []}
      products={products}
      menuId={menu.id}
    />
  );
}