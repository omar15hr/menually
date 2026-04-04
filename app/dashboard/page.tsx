import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardForms from "./forms";

export default async function DashboardPage() {
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
    <div className="p-6">
      <DashboardForms menu={menu} />
    </div>
  );
}