import Link from "next/link";

import { Button } from "../ui/button";
import { signOut } from "@/actions/auth.action";
import SettingsIcon from "../icons/SettingsIcon";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

export default function SignOutButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-transparent cursor-pointer">
          <SettingsIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
          <DropdownMenuItem>
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem>
            Suscripción
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/settings">Ajustes</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <form action={signOut}>
            <DropdownMenuItem className="hover:bg-[#CDF545] hover:text-[#114821]">
              <button type="submit" className="bg-transparent text-[#0F172A] font-medium cursor-pointer hover:text-[#114821]">
                Cerrar sesión
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>

  )
}