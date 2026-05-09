import Image from "next/image";
import Link from "next/link";

export default function HeaderLogo() {
  return (
    <header className="bg-white py-4 px-8 h-18 flex items-center">
      <Link href="/">
        <Image
          src="/images/menually-logo.png"
          alt="Logo"
          width={120}
          height={120}
        />
      </Link>
    </header>
  );
}
