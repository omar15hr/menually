import { MenuSidebar } from "@/components/menu/MenuSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default async function MenuLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <MenuSidebar />
        <main className="flex-1 flex flex-col overflow-y-auto bg-white">
          {children}
        </main>
      </TooltipProvider>
    </SidebarProvider>
  );
}
