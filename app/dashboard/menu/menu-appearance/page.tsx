import MenuWorkflow from "@/components/menu/MenuWorkflow";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function MenuAppearancePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: menu } = await supabase
    .from("menus")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  return (
    <div>
      <MenuWorkflow menu={menu} />
    </div>
  );
}
