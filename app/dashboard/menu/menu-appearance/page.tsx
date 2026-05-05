import { redirect } from "next/navigation";

import { getAuthUser } from "@/lib/queries/auth.queries";
import MenuWorkflow from "@/components/menu/MenuWorkflow";
import { getMenuByUserId } from "@/lib/queries/menu.queries";
import { getProfileByUserId } from "@/lib/queries/profile.queries";
import { getCategoriesByMenuId } from "@/lib/queries/categories.queries";
import { getActivePromotionsByMenuId } from "@/lib/queries/promotions.queries";
import { getTranslationsByMenuId } from "@/lib/queries/translations.queries";
import { buildTranslationsMap } from "@/lib/translations";

export default async function MenuAppearancePage() {
  const user = await getAuthUser();

  const menu = await getMenuByUserId(user.id);
  if (!menu) redirect("/dashboard");

  const [categories, promotions, profile, translations] = await Promise.all([
    getCategoriesByMenuId(menu.id),
    getActivePromotionsByMenuId(menu.id),
    getProfileByUserId(user.id),
    getTranslationsByMenuId(menu.id),
  ]);

  if (!categories || !profile) return null;

  const translationsMap = buildTranslationsMap(translations);

  return (
    <div>
      <MenuWorkflow
        menu={menu}
        categories={categories}
        profiles={profile}
        promotions={promotions ?? []}
        translations={translationsMap}
      />
    </div>
  );
}
