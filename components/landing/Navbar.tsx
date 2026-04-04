import Link from "next/link";
import MenuallyIcon from "../icons/MenuallyIcon";
import MenuallyText from "../icons/MenuallyText";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/benefits", label: "Beneficios" },
  { href: "/plans", label: "Plan" },
  { href: "/how-it-works", label: "¿Cómo funciona?" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <MenuallyIcon /> <MenuallyText />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium transition-colors hover:text-[#114821]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="border border-[#114821] text-[#114821] bg-white px-4 py-2 rounded-lg font-bold text-base cursor-pointer"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/signup"
              className="border border-[#CDF545] bg-[#CDF545] text-[#114821] px-4 py-2 rounded-lg font-bold text-base cursor-pointer"
            >
              Regístrate
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
