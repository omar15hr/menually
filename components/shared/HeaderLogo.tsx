import Image from "next/image";
import Link from "next/link";

export default function HeaderLogo() {
  return (
    <Link href="/" className="bg-white py-4 px-8 h-18 flex items-center">
      <Image
        src="/images/menually-logo.png"
        alt="Logo"
        width={120}
        height={120}
      />
    </Link>
  );
}
