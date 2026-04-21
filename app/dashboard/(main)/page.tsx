import { redirect } from "next/navigation";

import Header from "@/components/shared/Header";
import { createClient } from "@/lib/supabase/server";
import WithoutMenu from "@/components/dashboard/WithoutMenu";
import WithMenu from "@/components/dashboard/WithMenu";

export default async function DashboardPage() {
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

  return (
    <div className="w-full bg-white flex flex-col min-h-screen">
      <Header />

      {menu ? <WithMenu /> : <WithoutMenu />}
    </div>
  );
}
