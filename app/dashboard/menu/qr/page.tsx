import CopyIcon from "@/components/icons/CopyIcon";
import DownloadIcon from "@/components/icons/DownloadIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";
import PrintIcon from "@/components/icons/PrintIcon";
import WhatsappIcon from "@/components/icons/WhatsappIcon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function QrPage() {
  return (
    <div className="flex flex-col w-full max-w-md bg-white border border-[#E4E4E6] h-screen">
      <div className="flex flex-col p-4 border-b">
        <h2 className="text-[#0F172A] text-base font-extrabold">QR y enlace</h2>
        <p className="text-[#58606E] text-sm">
          Listo para compartir: usa tu QR o envía el link.
        </p>
      </div>

      <div className="max-w-sm py-6 flex gap-1 px-4 mx-auto">
        <Button className="flex gap-2 items-center border border-[#E4E4E6] rounded-lg py-2 px-4 bg-white text-[#0F172A] text-sm cursor-pointer hover:bg-white/70">
          <DownloadIcon /> <span>Descargar</span>
        </Button>
        <Button className="flex gap-2 items-center border border-[#E4E4E6] rounded-lg py-2 px-4 bg-white text-[#0F172A] text-sm cursor-pointer hover:bg-white/70">
          <PrintIcon /> <span>Imprimir</span>
        </Button>
      </div>

      <div className="w-full py-6 flex flex-col gap-4 px-4 mx-auto">
        <Label className="text-[#1C1C1C] text-sm font-semibold">
          Enlace del menú
        </Label>
        <div className="flex items-center gap-4">
          <Button className="border border-[#E4E4E6] rounded-lg py-2 px-4 bg-white text-[#0F172A] text-sm cursor-pointer hover:bg-white/70">
            menually.app/menu/cafecostero
          </Button>

          <Button className="flex gap-2 items-center border border-[#E4E4E6] rounded-lg py-2 px-4 bg-white text-[#0F172A] text-sm cursor-pointer hover:bg-white/70">
            <CopyIcon /> <span>Copiar enlace</span>
          </Button>
        </div>
      </div>

      <div className="w-full py-6 flex flex-col gap-4 px-4 mx-auto">
        <Label className="text-[#1C1C1C] text-sm font-semibold">
          Compartir
        </Label>
        <div className="flex items-center gap-4">
          <Button className="flex gap-2 items-center border border-[#E4E4E6] rounded-lg py-2 px-4 bg-white text-[#0F172A] text-sm cursor-pointer hover:bg-white/70">
            <WhatsappIcon /> <span>Por Whatsapp</span>
          </Button>

          <Button className="flex gap-2 items-center border border-[#E4E4E6] rounded-lg py-2 px-4 bg-white text-[#0F172A] text-sm cursor-pointer hover:bg-white/70">
            <InstagramIcon /> <span>Por Instagram</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
