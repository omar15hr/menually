import { redirect } from "next/navigation";

import { getAuthUser } from "@/lib/queries/auth.queries";
import { getMenuByUserId } from "@/lib/queries/menu.queries";
import { getOrCreateBusiness } from "@/actions/business.action";
import { getProfileByUserId } from "@/lib/queries/profile.queries";
import { BusinessSettingsForm } from "@/components/settings/BusinessSettingsForm";

export default async function BusinessConfigurationPage() {
  const user = await getAuthUser();

  const [profile, menu, business] = await Promise.all([
    getProfileByUserId(user.id),
    getMenuByUserId(user.id),
    getOrCreateBusiness(user.id),
  ]);

  if (!profile) redirect("/auth/signin");

  return (
    <div className="grid md:grid-cols-[240px,1fr] gap-10 py-6 md:py-10 max-w-7xl mx-auto">
      <BusinessSettingsForm
        profile={profile}
        business={business}
        menuLogoUrl={menu?.logo_url || null}
      />
    </div>
  );
}