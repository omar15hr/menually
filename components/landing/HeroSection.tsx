import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative w-full pt-10 px-6 animate-fade-in">
      <div className="bg-[#FBFBFA] border border-[#E4E4E6] pt-16 pb-32 md:pt-20 md:pb-48 lg:pb-50 max-w-7xl mx-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
            <div className="relative inline-flex items-center rounded-lg p-[1.5px] bg-linear-to-r from-[#CDF545] to-[#A3D300]">
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#F8FFE1] px-4 py-1.5 text-">
                <span className="text-foreground">Go to service with</span>
                <span className="text-[#009B2D] font-semibold">
                  menu intelligence
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif italic text-[#1A1A1A] text-balance">
                De PDF a menu digital.
              </h1>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] text-balance">
                Crea y optimiza tu menu con IA
              </h2>
            </div>

            <p className="text-[#585858] text-lg max-w-xl text-pretty">
              Crea menus en minutos. Actualiza platos, precios y disponibilidad
              en tiempo real y transforma cada escaneo en insights para tomar
              mejores decisiones
            </p>

            <Link href="/dashboard/customize">
              <button className="border border-[#CDF545] bg-[#CDF545] text-[#114821] px-4 py-2 rounded-lg font-bold text-base cursor-pointer">
                Crear Mi Menú
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="relative -mt-24 md:-mt-40 lg:-mt-38 pb-12 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start justify-center gap-4 md:gap-6">
            <div className="w-full md:w-70 lg:w-[320px] aspect-3/4 relative rounded-2xl overflow-hidden shadow-lg order-2 md:order-1 md:mt-12 lg:mt-16">
              <Image
                src="/images/imagen-example.png"
                alt="Cafe exterior with warm lighting"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 320px"
                priority
              />
            </div>

            <div className="w-full md:w-70 lg:w-[320px] aspect-3/4 relative rounded-2xl overflow-hidden shadow-lg order-1 md:order-2">
              <Image
                src="/images/imagen-example.png"
                alt="Scanning QR code menu"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 320px"
                priority
              />
            </div>

            <div className="w-full md:w-70 lg:w-[320px] aspect-3/4 relative rounded-2xl overflow-hidden shadow-lg order-3 md:mt-12 lg:mt-16">
              <Image
                src="/images/imagen-example.png"
                alt="Outdoor restaurant terrace"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 320px"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
