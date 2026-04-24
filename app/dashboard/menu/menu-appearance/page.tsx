import MenuWorkflow from "@/components/menu/MenuWorkflow";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function MenuAppearancePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const { data: menu } = await supabase
    .from("menus")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!menu) redirect("/dashboard");

  const { data: categories } = await supabase
    .from("categories")
    .select("*, products(*)")
    .eq("menu_id", menu.id)
    .order("position", { ascending: true });

  if (!categories) return;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profiles) return;

  // Promociones activas para el carrusel
  const now = new Date().toISOString();
  const { data: promotions } = await supabase
    .from("promotions")
    .select("*")
    .eq("menu_id", menu.id)
    .eq("is_active", true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order("position", { ascending: true })
    .limit(10);

  return (
    <div>
      <MenuWorkflow menu={menu} categories={categories} profiles={profiles} promotions={promotions ?? []} />
    </div>
  );
}
