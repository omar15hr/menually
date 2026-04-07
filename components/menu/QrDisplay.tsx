"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CopyIcon from "@/components/icons/CopyIcon";
import DownloadIcon from "@/components/icons/DownloadIcon";
import PrintIcon from "@/components/icons/PrintIcon";
import WhatsappIcon from "@/components/icons/WhatsappIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";

interface QrDisplayProps {
  qrUrl: string;
  menuSlug: string;
}

export function QrDisplay({ qrUrl, menuSlug }: QrDisplayProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const menuUrl = `${baseUrl}/menu/${menuSlug}`;

  const handleDownload = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `menu-${menuSlug}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("QR descargado correctamente");
    } catch (error) {
      toast.error("Error al descargar el QR");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Menu - ${menuSlug}</title>
            <style>
              body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <img src="${qrUrl}" alt="QR Code" />
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      toast.success("Enlace copiado al portapapeles");
    } catch (error) {
      toast.error("Error al copiar el enlace");
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`¡Mira nuestro menú! ${menuUrl}`);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleInstagram = () => {
    // Copy to clipboard for Instagram - user will paste in their post
    navigator.clipboard.writeText(menuUrl);
    toast.success("Enlace copiado. Compártelo en Instagram");
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* QR Image */}
      <div className="flex justify-center">
        <div className="relative w-48 h-48 bg-white rounded-xl border border-[#E4E4E6] p-2">
          <Image
            src={qrUrl}
            alt="QR Code"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Download and Print Buttons */}
      <div className="flex gap-3 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="flex gap-2"
        >
          <DownloadIcon />
          <span>Descargar</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="flex gap-2"
        >
          <PrintIcon />
          <span>Imprimir</span>
        </Button>
      </div>

      {/* Menu URL */}
      <div className="flex flex-col gap-2">
        <p className="text-[#1C1C1C] text-sm font-semibold">Enlace del menú</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-[#F5F5F5] rounded-lg text-sm text-[#58606E] truncate">
            {menuUrl}
          </div>
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            <CopyIcon /> <span>Copiar enlace</span>
          </Button>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex flex-col gap-2">
        <p className="text-[#1C1C1C] text-sm font-semibold">Compartir</p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleWhatsApp}
            className="flex gap-2 flex-1"
          >
            <WhatsappIcon />
            <span>WhatsApp</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleInstagram}
            className="flex gap-2 flex-1"
          >
            <InstagramIcon />
            <span>Instagram</span>
          </Button>
        </div>
      </div>
    </div>
  );
}