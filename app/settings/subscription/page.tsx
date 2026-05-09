import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SubscriptionSettings from "@/components/settings/SubscriptionSettings";

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/signin");
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return <SubscriptionSettings subscription={subscription} />;
}
