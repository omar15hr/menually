
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import DownloadCloudIcon from "@/components/icons/DownloadCloudIcon";

export default function MenuImportPage() {
  return (
    <div className="py-8 max-w-7xl mx-auto flex flex-col items-center justify-center gap-4">
      <h1 className="text-[#1C1C1C] font-extrabold text-3xl">Sube el menú de tu restaurante</h1>
      <p className="text-[#58606E] font-normal text-lg">Lo analizamos automáticamente y lo convertimos en tu menú digital.</p>
      <Empty className="border-2 border-dashed border-[#E4E4E6] bg-[#FBFBFA]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <DownloadCloudIcon />
          </EmptyMedia>
          <EmptyTitle>Arrastra tu archivo aquí o haz clic para buscarlo</EmptyTitle>
          <EmptyDescription>
            PDF, PNG, JPG o JPEG, como lo tengas está bien.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex flex-row gap-2 items-center justify-center">
          <Button variant="outline" size="sm">
            Volver
          </Button>
          <Button variant="outline" size="sm">
            Continuar
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}