import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "./_components/profile-form";

export default async function ContactDataPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, phone_number, full_name, business_name, created_at, updated_at")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/auth/signin");
  }

  return <ProfileForm profile={profile} />;
}