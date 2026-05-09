import { redirect } from "next/navigation";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { getAuthUser } from "@/lib/queries/auth.queries";
import { getSubscriptionByUserId } from "@/lib/queries/subscription.queries";
import { isSubscriptionActive } from "@/lib/subscription";

export default async function OnboardingPage() {
  const user = await getAuthUser();
  const subscription = await getSubscriptionByUserId(user.id);

  if (isSubscriptionActive(subscription)) {
    redirect("/dashboard");
  }

  return (
    <main className="flex h-screen flex-col bg-[#FBFBFA]">
      <OnboardingWizard />
    </main>
  );
}
