import Image from "next/image";
import Link from "next/link";

export default function HeaderLogo() {
  return (
    <header className="bg-white py-4 px-8 h-18 flex items-center">
      <Link href="/">
        <Image
          src="/images/menually-logo.png"
          alt="Logo"
          width={160}
          height={160}
          className="w-auto h-auto"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </Link>
    </header>
  );
}
