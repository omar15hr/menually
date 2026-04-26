import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default async function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <main className="flex-1 flex flex-col overflow-y-auto bg-white">
          {children}
        </main>
      </TooltipProvider>
    </SidebarProvider>
  );
}
