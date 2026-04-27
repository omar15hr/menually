import { notFound } from "next/navigation";

import { PublicMenu } from "@/components/menu/PublicMenu";
import { getMenuBySlug } from "@/lib/queries/menu.queries";
import { getCategoriesByMenuId } from "@/lib/queries/categories.queries";
import { getActivePromotionsByMenuId } from "@/lib/queries/promotions.queries";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PublicMenuPage({ params }: Props) {
  const { slug } = await params;

  const menu = await getMenuBySlug(slug);
  if (!menu) notFound();

  const [categories, promotions] = await Promise.all([
    getCategoriesByMenuId(menu.id),
    getActivePromotionsByMenuId(menu.id),
  ]);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <PublicMenu
        menu={menu}
        categories={categories ?? []}
        promotions={promotions ?? []}
      />
    </div>
  );
}
