import { getAuthUser } from "@/lib/queries/auth.queries";
import { getMenuByUserId } from "@/lib/queries/menu.queries";
import { getCategoriesByMenuId } from "@/lib/queries/categories.queries";
import CategoriesWorkflow from "@/components/categories/CategoriesWorkflow";

export default async function MenuContentPage() {
  const user = await getAuthUser();

  const menu = await getMenuByUserId(user.id);
  if (!menu) return null;

  const categories = await getCategoriesByMenuId(menu.id);

  return (
    <div>
      <CategoriesWorkflow menuId={menu.id} categories={categories ?? []} />
    </div>
  );
}
