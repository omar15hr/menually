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

  return (
    <div>
      <MenuWorkflow menu={menu} categories={categories} profiles={profiles} />
    </div>
  );
}
