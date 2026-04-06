import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CategoriesWorkflow from "@/components/categories/CategoriesWorkflow";

export default async function MenuContentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: menu } = await supabase
    .from("menus")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!menu) return null;

  const { data: categories } = await supabase
  .from("categories")
  .select(`
    *,
    products (
      id,
      name,
      price,
      description,
      category_id
    )
  `)
  .eq("menu_id", menu.id)
  .order("position", { ascending: true });

  return (
    <div>
      <CategoriesWorkflow menuId={menu.id} categories={categories ?? []} />
    </div>
  );
}
