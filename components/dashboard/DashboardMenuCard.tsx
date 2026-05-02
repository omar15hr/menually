import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import CopyIcon from "../icons/CopyIcon";
import { Card, CardContent } from "../ui/card";

interface DashboardMenuCardProps {
  business_name?: string | null;
}

export default function DashboardMenuCard({ business_name }: DashboardMenuCardProps) {
  return (
    <Card className="max-w-xs w-full p-6 rounded-3xl relative overflow-hidden border-2 border-[#CDF545]">
      <CardContent className="p-0 flex flex-col gap-6 relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-[#1C1C1C] capitalize">
              {business_name}
            </h3>

            <p className="text-xs text-[#58606E]">Actualizado hace 2 horas</p>
          </div>

          <Badge className="bg-linear-to-r from-[#CDF545] to-[#22D756] text-[#114821] border-none rounded-2xl px-2 py-1 text-xs font-medium gap-1.5 flex items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-[#18D549]"></span>
            Menú activo
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="w-[132.5px] rounded-lg font-medium text-[#0F172A] border-gray-300 hover:bg-muted h-8 py-2 px-4 text-base cursor-pointer"
          >
            Pausar
          </Button>

          <Button className="w-[132.5px] rounded-lg text-base font-medium text-[#114821] bg-[#CDF545] h-8 py-2 px-4 cursor-pointer">
            Editar menú
          </Button>
        </div>

        <div className="flex items-center gap-3 bg-[#FBFBFA] p-4 rounded-lg border border-[#E4E4E6] h-10">
          <span className="text-sm font-semibold text-[#1C1C1C] truncate">
            menually.app/menu/cafecostero
          </span>

          <Button className="gap-2 text-sm font-semibold p-0 h-auto transition-colors cursor-pointer text-[#114821] bg-transparent">
            <CopyIcon />
            Copiar link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
