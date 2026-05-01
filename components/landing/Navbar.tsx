"use client";

import { useState } from "react";
import Link from "next/link";
import MenuallyIcon from "../icons/MenuallyIcon";
import MenuallyText from "../icons/MenuallyText";
import XIcon from "../icons/XIcon";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/benefits", label: "Beneficios" },
  { href: "/plans", label: "Plan" },
  { href: "/how-it-works", label: "¿Cómo funciona?" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <MenuallyIcon /> <MenuallyText />
        </Link>

        {/* Desktop nav — hidden on mobile */}
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
              href="/auth/signin"
              className="border border-[#114821] text-[#114821] bg-white px-4 py-2 rounded-lg font-bold text-base cursor-pointer"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/signup"
              className="border border-[#CDF545] bg-[#CDF545] text-[#114821] px-4 py-2 rounded-lg font-bold text-base cursor-pointer"
            >
              Regístrate
            </Link>
          </div>
        </nav>

        {/* Mobile hamburger button — visible only on mobile */}
        <button
          type="button"
          className="md:hidden flex items-center justify-center p-2 text-[#114821]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Abrir menú"
        >
          {mobileOpen ? <XIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E4E4E6] bg-background px-4 py-4">
          <nav className="flex flex-col gap-4">
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium transition-colors hover:text-[#114821] block py-1"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 pt-2 border-t border-[#E4E4E6]">
              <Link
                href="/auth/signin"
                className="border border-[#114821] text-[#114821] bg-white px-4 py-2 rounded-lg font-bold text-base cursor-pointer text-center"
                onClick={() => setMobileOpen(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth/signup"
                className="border border-[#CDF545] bg-[#CDF545] text-[#114821] px-4 py-2 rounded-lg font-bold text-base cursor-pointer text-center"
                onClick={() => setMobileOpen(false)}
              >
                Regístrate
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function HamburgerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
