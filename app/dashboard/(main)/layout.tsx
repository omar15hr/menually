import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import IncompleteProfileBanner from "@/components/dashboard/IncompleteProfileBanner";
import { getAuthUser } from "@/lib/queries/auth.queries";
import { getProfileByUserId } from "@/lib/queries/profile.queries";
import { getBusiness } from "@/actions/business.action";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getAuthUser();
  const profile = await getProfileByUserId(user.id);
  const business = await getBusiness(user.id);

  return (
    <SidebarProvider>
      <TooltipProvider>
        <AppSidebar businessName={profile?.business_name ?? null} />
        <main className="flex-1 flex flex-col overflow-y-auto bg-white">
          <IncompleteProfileBanner hasBusiness={business !== null} />
          {children}
        </main>
      </TooltipProvider>
    </SidebarProvider>
  );
}
