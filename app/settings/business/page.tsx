import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import { getOrCreateBusiness } from "@/actions/business.action";
import { BusinessSettingsForm } from "@/app/settings/_components/BusinessSettingsForm";

export default async function BusinessSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Get profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, business_name")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/auth/signin");
  }

  // Get or create business record
  const business = await getOrCreateBusiness(user.id);

  // Get logo from menus table
  const { data: menu } = await supabase
    .from("menus")
    .select("logo_url")
    .eq("user_id", user.id)
    .single();

  return (
    <BusinessSettingsForm
      business={business}
      profileBusinessName={profile.business_name}
      logoUrl={menu?.logo_url ?? null}
    />
  );
}