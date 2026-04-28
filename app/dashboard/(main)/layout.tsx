import { redirect } from "next/navigation";

import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { getAuthUser } from "@/lib/queries/auth.queries";
import { getProfileByUserId } from "@/lib/queries/profile.queries";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getAuthUser();
  const profile = await getProfileByUserId(user.id);

  return (
    <SidebarProvider>
      <TooltipProvider>
        <AppSidebar businessName={profile?.business_name ?? null} />
        <main className="flex-1 flex flex-col overflow-y-auto bg-white">
          {children}
        </main>
      </TooltipProvider>
    </SidebarProvider>
  );
}
