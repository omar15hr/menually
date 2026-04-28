import { redirect } from "next/navigation";

import { getOrCreateBusiness } from "@/actions/business.action";
import { BusinessSettingsForm } from "@/components/settings/BusinessSettingsForm";
import { getAuthUser } from "@/lib/queries/auth.queries";
import { getMenuByUserId } from "@/lib/queries/menu.queries";
import { getProfileByUserId } from "@/lib/queries/profile.queries";

export default async function BusinessSettingsPage() {
  const user = await getAuthUser();

  const [profile, menu, business] = await Promise.all([
    getProfileByUserId(user.id),
    getMenuByUserId(user.id),
    getOrCreateBusiness(user.id),
  ]);

  if (!profile) redirect("/auth/signin");

  return (
    <BusinessSettingsForm
      profile={{ id: user.id, business_name: profile.business_name }}
      business={business}
      menuLogoUrl={menu?.logo_url ?? null}
    />
  );
}
