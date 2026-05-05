import { notFound } from "next/navigation";

import { PublicMenu } from "@/components/menu/PublicMenu";
import { getMenuBySlug } from "@/lib/queries/menu.queries";
import { getCategoriesByMenuId } from "@/lib/queries/categories.queries";
import { getActivePromotionsByMenuId } from "@/lib/queries/promotions.queries";
import { getTranslationsByMenuId } from "@/lib/queries/translations.queries";
import { buildTranslationsMap } from "@/lib/translations";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PublicMenuPage({ params }: Props) {
  const { slug } = await params;

  const menu = await getMenuBySlug(slug);
  if (!menu) notFound();

  const [categories, promotions, translations] = await Promise.all([
    getCategoriesByMenuId(menu.id),
    getActivePromotionsByMenuId(menu.id),
    getTranslationsByMenuId(menu.id),
  ]);

  const translationsMap = buildTranslationsMap(translations);

  return (
    <div className="min-h-screen">
      <div className="max-w-md mx-auto">
        <PublicMenu
          menu={menu}
          categories={categories ?? []}
          promotions={promotions ?? []}
          translations={translationsMap}
        />
      </div>
    </div>
  );
}
