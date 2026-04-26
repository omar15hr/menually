import Image from "next/image";

import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import SettingsSidebar from "@/components/settings/SettingsSidebar";

export default async function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <main className="min-h-screen bg-neutral-50 text-neutral-900 w-full">
          <header className="border-b bg-white px-6 py-6 flex items-center justify-between">
            <Image src="/images/menually-logo.png" alt="Menually Logo" width={120} height={40} />
          </header>

          <div className='flex'>
            <SettingsSidebar />
            {children}
          </div>
        </main>
      </TooltipProvider>
    </SidebarProvider>
  );
}
