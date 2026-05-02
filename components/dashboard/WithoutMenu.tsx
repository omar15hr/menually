import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import CreateMenuBanner from "./CreateMenuBanner";

export default async function WithoutMenu() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <section className="max-w-7xl mx-auto w-full px-18 mb-10">
      <div className="flex flex-col w-full my-5">
        <h1 className="text-3xl font-extrabold text-left text-[#0F172A] mb-2 capitalize">
          {`Hola, ${profile?.full_name}`}
        </h1>
        <p className="text-[#64748B] text-base font-normal">
          Tu cuenta está lista. Solo falta crear tu menú.
        </p>
      </div>

      <CreateMenuBanner />
    </section>
  );
}
