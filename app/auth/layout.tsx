import Link from "next/link";
import Image from "next/image";

import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden p-4">
      <div className="hidden md:flex w-3/4 h-full relative">
        <Image
          src="/images/auth-image.png"
          alt="Imagen decorativa de autenticación"
          width={1050}
          height={1050}
          loading="eager"
          className="object-cover rounded-3xl w-auto"
        />
      </div>

      <main className="w-full lg:w-[30%] bg-white flex flex-col px-8">
        <div className="flex justify-between items-center py-6">
          <Link
            href="/"
            aria-label="Volver a la página principal"
            className="flex gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon /> Volver
          </Link>
          <Image
            src="/images/menually-logo.png"
            alt="Menually Logo"
            width={220}
            height={220}
            loading="eager"
            className="w-30"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="flex-1 flex items-start justify-center">{children}</div>
      </main>
    </div>
  );
}
