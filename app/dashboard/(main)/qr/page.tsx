import CopyIcon from "@/components/icons/CopyIcon";
import DownloadIcon from "@/components/icons/DownloadIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";
import Image from "next/image";
import Header from "@/components/shared/Header";
import { Badge } from "@/components/ui/badge";
import { getMenuByUserId } from "@/lib/queries/menu.queries";
import { LinkIcon } from "lucide-react";
import { getAuthUser } from "@/lib/queries/auth.queries";
import { generateQrCode } from "@/actions/generateQrCode.action";
import ExternalLinkIcon from "@/components/icons/ExternalLinkIcon";
import WhatsappIcon from "@/components/icons/WhatsappIcon";

export default async function QRPage() {
  const user = await getAuthUser();
  const menu = await getMenuByUserId(user.id);

  if (!menu) {
    return (
      <div className="flex flex-col w-full max-w-md bg-white border border-[#E4E4E6] h-screen">
        <div className="flex flex-col p-4 border-b">
          <h2 className="text-[#0F172A] text-base font-extrabold">
            QR y enlace
          </h2>
          <p className="text-[#58606E] text-sm">
            No tienes un menú configurado.
          </p>
        </div>
      </div>
    );
  }

  let qrUrl: string = "";

  const result = await generateQrCode(menu.id, menu.slug);
  if (result.success && result.qrUrl) {
    qrUrl = result.qrUrl;
  }
  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto p-6 space-y-6 font-sans">
        {/* Banner Analíticas */}
        <div className="relative flex items-center justify-between p-8 overflow-hidden bg-white border-l-8 border-t-8 border-[#b4f052] rounded-3xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[#17462b] rounded-l-[100px] hidden md:block"></div>
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Tu menú tiene actividad esta semana
            </h2>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">
              Descubre qué platos ven más tus clientes, cuándo te visitan y
              desde dónde llegan con nuestras analíticas avanzadas
            </p>
            <button className="mt-5 px-6 py-2.5 text-sm font-semibold text-black bg-[#b4f052] rounded-lg hover:bg-[#a3df41] transition-colors">
              Ver analíticas
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarjeta Código QR */}
          <div className="p-6 bg-white border border-gray-200 rounded-2xl flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-[#1C1C1C]">
                Código QR
              </h3>
              <Badge className="bg-linear-to-r from-[#CDF545] to-[#22D756] text-[#114821] border-none rounded-2xl px-2 py-1 text-xs font-medium gap-1.5 flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-[#18D549]"></span>
                Menú activo
              </Badge>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Placeholder del QR */}
              <div className="p-4 border border-[#E8E8E4] rounded-xl mb-6 relative">
                <div className="w-54 h-60 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Image
                    src={qrUrl}
                    alt="QR Code"
                    fill
                    loading="eager"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="flex w-full gap-2 mt-auto">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-[#2D5000] bg-[#b4f052] rounded-lg hover:bg-[#a3df41] transition-colors">
                  <DownloadIcon />
                  Descargar PNG
                </button>
                <button
                  className="p-2.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Abrir previsualización en una nueva pestaña"
                >
                  <ExternalLinkIcon />
                </button>
              </div>
            </div>
          </div>

          {/* Tarjeta Enlace y personalización */}
          <div className="p-6 bg-white border border-gray-200 rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Enlace y personalización
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-500 mb-2">
                  Enlace de tu menú
                </label>
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">
                    menually.app/menu/la-trattoria
                  </span>
                  <button className="flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800 transition-colors cursor-pointer">
                    <CopyIcon />
                    Copiar link
                  </button>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                <label className="block text-sm text-gray-500 mb-2">
                  Personalizar enlace (slug)
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center px-3 border border-gray-200 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#b4f052]">
                    <span className="text-sm text-gray-400 select-none">
                      menually.app/menu/
                    </span>
                    <input
                      type="text"
                      defaultValue="la-trattoria"
                      className="w-full py-2.5 text-sm font-medium text-gray-900 outline-none"
                    />
                  </div>
                  <button className="px-5 py-2.5 text-sm font-semibold text-green-800 bg-[#e5fcc2] rounded-xl hover:bg-[#d6f7a1] transition-colors">
                    Guardar
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Solo letras minúsculas, números y guiones. Mínimo 3
                  caracteres.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta Compartir */}
        <div className="p-6 bg-white border border-gray-200 rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Compartir
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="flex flex-col items-center justify-center gap-3 p-4 bg-[#FBFBFA] border border-[#E8E8E4] rounded-xl hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-green-100 text-green-600 rounded-full">
                <WhatsappIcon />
              </div>
              <span className="text-sm font-medium text-gray-600">
                WhatsApp
              </span>
            </button>

            <button className="flex flex-col items-center justify-center gap-3 p-4 bg-[#FBFBFA] border border-[#E8E8E4] rounded-xl hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-pink-100 text-pink-500 rounded-full">
                <InstagramIcon />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Instagram
              </span>
            </button>

            <button className="flex flex-col items-center justify-center gap-3 p-4 bg-[#FBFBFA] border border-[#E8E8E4] rounded-xl hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-[#e5fcc2] text-green-700 rounded-full">
                <LinkIcon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Copiar enlace
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
