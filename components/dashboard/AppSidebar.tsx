"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import QRIcon from "../icons/QRIcon";
import SignOutButton from "./SignOutButton";
import UserSidebarInfo from "./UserCardInfo";
import MenuallyIcon from "../icons/MenuallyIcon";
import MenuallyText from "../icons/MenuallyText";
import OpenBookIcon from "../icons/OpenBookIcon";
import AnalyticsIcon from "../icons/AnalyticsIcon";
import SquareGroupIcon from "../icons/SquareGroupIcon";

const menuLinks = [
  {
    name: "Inicio",
    url: "/dashboard",
    icon: SquareGroupIcon,
  },
  {
    name: "Analíticas",
    url: "/dashboard/analytics",
    icon: AnalyticsIcon,
  },
  {
    name: "Mi menú",
    url: "/dashboard/menu",
    icon: OpenBookIcon,
  },
  {
    name: "QR",
    url: "/dashboard/qr",
    icon: QRIcon,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-white">
        <SidebarHeader className="text-2xl text-[#114821] font-bold pb-8 bg-white">
          {state === "collapsed" ? (
            <MenuallyIcon />
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2 p-2">
              <MenuallyIcon /> <MenuallyText />
            </Link>
          )}
        </SidebarHeader>
        <SidebarMenu>
          {menuLinks.map((link) => (
            <SidebarMenuItem key={link.name} className="pr-6">
              <SidebarMenuButton asChild className="hover:bg-[#CDF54533]">
                <Link
                  href={link.url}
                  className={cn(
                    "my-2 ml-2 pl-4",
                    pathname === link.url
                      ? "text-[#114821] bg-[#CDF54533]"
                      : "text-[#475569]",
                  )}
                >
                  <link.icon />
                  <span className="text-base font-medium">{link.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="bg-white border-t border-[#E2E8F0] p-6">
        <SidebarMenu className="flex flex-row items-center justify-between">
          <SidebarMenuItem
            className={cn(
              "flex gap-3 items-center",
              state === "collapsed" && "hidden",
            )}
          >
            <span className="bg-gray-400 size-8 rounded-full"></span>
            <UserSidebarInfo />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SignOutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
