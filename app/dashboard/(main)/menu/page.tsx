import { redirect } from "next/navigation";
import BellIcon from "@/components/icons/BellIcon";
import { createClient } from "@/lib/supabase/server";
import { SidebarTrigger } from "@/components/ui/sidebar";
import WithoutMenu from "@/components/dashboard/WithoutMenu";
import QuestionCircleIcon from "@/components/icons/QuestionCircleIcon";
import WithMenu from "@/components/dashboard/WithMenu";
import SearchInput from "@/components/dashboard/SearchInput";

export default async function MenuPage() {
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
      <header className="border-b border-[#E2E8F0] w-full flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3 w-full max-w-md">
          <SidebarTrigger className="cursor-pointer -ml-2 text-[#64748B] hover:text-[#0F172A]" />
          <SearchInput />
        </div>
        <div className="flex items-center gap-6 pr-2">
          <button className="hover:opacity-70 transition-opacity cursor-pointer flex items-center justify-center">
            <BellIcon />
          </button>
          <button className="hover:opacity-70 transition-opacity cursor-pointer flex items-center justify-center">
            <QuestionCircleIcon />
          </button>
        </div>
      </header>

      {menu ? <WithMenu /> : <WithoutMenu />}
    </div>
  );
}
