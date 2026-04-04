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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      <DashboardForms menu={menu} />
    </div>
  );
}