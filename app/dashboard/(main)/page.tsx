import { redirect } from "next/navigation";

import Header from "@/components/shared/Header";
import WithMenu from "@/components/dashboard/WithMenu";
import { getAuthUser } from "@/lib/queries/auth.queries";
import WithoutMenu from "@/components/dashboard/WithoutMenu";
import { getMenuByUserId } from "@/lib/queries/menu.queries";

export default async function DashboardPage() {
  const user = await getAuthUser();

  const menu = await getMenuByUserId(user.id);
  if (!menu) redirect("/auth/signin");

  return (
    <div className="w-full bg-white flex flex-col min-h-screen">
      <Header />

      {menu ? <WithMenu /> : <WithoutMenu />}
    </div>
  );
}
