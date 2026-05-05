import Link from "next/link";

interface IncompleteProfileBannerProps {
  hasBusiness: boolean;
}

export default function IncompleteProfileBanner({
  hasBusiness,
}: IncompleteProfileBannerProps) {
  if (hasBusiness) {
    return null;
  }

  return (
    <div className="bg-[#FFF7B8] text-[#534A03] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
      <p className="text-sm font-medium">
        Completá los datos de tu negocio para personalizar tu menú
      </p>
      <Link
        href="/settings/business"
        className="text-sm font-semibold underline hover:no-underline shrink-0"
      >
        Ir a configuración
      </Link>
    </div>
  );
}
