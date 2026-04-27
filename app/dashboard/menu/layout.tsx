import { Inter, Roboto, Montserrat } from "next/font/google";

import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MenuSidebar } from "@/components/menu/MenuSidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export default async function MenuLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <MenuSidebar />
        <main
          className={cn(
            "flex-1 flex flex-col overflow-y-auto bg-white",
            inter.variable,
            roboto.variable,
            montserrat.variable,
          )}
        >
          {children}
        </main>
      </TooltipProvider>
    </SidebarProvider>
  );
}
