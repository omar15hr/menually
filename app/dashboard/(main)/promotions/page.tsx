import type { Database } from "@/types/database.types";
import { getAuthUser } from "@/lib/queries/auth.queries";
import type { Promotion } from "@/types/promotions.types";
import { getMenuByUserId } from "@/lib/queries/menu.queries";
import PromotionsContent from "@/components/promotions/PromotionsContent";
import { getAllPromotionsByMenuId } from "@/lib/queries/promotions.queries";
import { getCategoriesWithProductsByMenuId } from "@/lib/queries/categories.queries";

type Product = Database["public"]["Tables"]["products"]["Row"];

export default async function PromotionsPage() {
  const user = await getAuthUser();

  const menu = await getMenuByUserId(user.id);
  if (!menu) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <p className="text-gray-500">No tienes un menú activo.</p>
      </div>
    );
  }

  const [promotions, categories] = await Promise.all([
    getAllPromotionsByMenuId(menu.id),
    getCategoriesWithProductsByMenuId(menu.id),
  ]);

  const products: Product[] =
    categories?.flatMap((cat) => cat.products as unknown as Product[]) ?? [];

  return (
    <PromotionsContent
      initialPromotions={(promotions as unknown as Promotion[]) ?? []}
      products={products}
      menuId={menu.id}
    />
  );
}
