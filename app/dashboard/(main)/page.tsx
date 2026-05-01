import Header from "@/components/shared/Header";
import WithMenu from "@/components/dashboard/WithMenu";
import { getAuthUser } from "@/lib/queries/auth.queries";
import WithoutMenu from "@/components/dashboard/WithoutMenu";
import { getMenuByUserId } from "@/lib/queries/menu.queries";
import { getProfileByUserId } from "@/lib/queries/profile.queries";
import { getCategoriesByMenuId } from "@/lib/queries/categories.queries";

export default async function DashboardPage() {
  const user = await getAuthUser();

  const menu = await getMenuByUserId(user.id);

  const [profile] = await Promise.all([getProfileByUserId(user.id)]);
  const categories = menu ? await getCategoriesByMenuId(menu.id) : [];

  return (
    <div className="w-full bg-white flex flex-col min-h-screen">
      <Header />

      {menu ? (
        <WithMenu profile={profile} categories={categories} />
      ) : (
        <WithoutMenu />
      )}
    </div>
  );
}
