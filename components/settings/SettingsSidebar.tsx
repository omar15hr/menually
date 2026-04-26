import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const menuLinks = [
  {
    name: "Configuración del negocio",
    url: "/settings",
  },
  {
    name: "Datos de contacto",
    url: "/settings/contact-data",
  },
  {
    name: "Preferencias",
    url: "/settings/preferences",
  },
  {
    name: "Suscripción",
    url: "/settings/subscription",
  },
];

export default function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="py-6 px-18">
      <Link href="/dashboard" className="flex items-center gap-2 mb-6 text-sm text-[#114821] hover:text-black transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span className='text-base font-semibold'>Volver</span>
      </Link>
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold px-1 text-[#1C1C1C]">Ajustes</h1>
        <nav className="space-y-1.5 text-sm text-neutral-700">
          {menuLinks.map((link) => (
            <Link key={link.name} href={link.url} className={cn(
              "block px-3 py-1.5 rounded-md bg-transparent text-[#114821] text-sm font-semibold hover:underline",
              pathname === link.url && "underline"
            )}>
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}