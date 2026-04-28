import { redirect } from "next/navigation";

import { getAuthUser } from "@/lib/queries/auth.queries";
import { getProfileByUserId } from "@/lib/queries/profile.queries";
import { ProfileForm } from "../../../components/settings/ProfileForm";

export default async function ContactDataPage() {
  const user = await getAuthUser();

  const profile = await getProfileByUserId(user.id);
  if (!profile) redirect("/auth/signin");

  return <ProfileForm profile={profile} />;
}
