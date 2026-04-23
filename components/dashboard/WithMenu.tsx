import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Info, TrendingUp, TrendingDown, ArrowRightIcon, Sparkles } from "lucide-react";
import { TooltipProvider, TooltipTrigger, TooltipContent, Tooltip } from "../ui/tooltip";
import { Button } from "../ui/button";
import CopyIcon from "../icons/CopyIcon";
import { Badge } from "../ui/badge";
import DashboardProductTable from "./DashboardProductTable";
import IAIcon from "../icons/IAIcon";

const metrics = [
  {
    id: "scans",
    title: "Escaneos totales",
    subtitle: "hoy",
    value: "88",
    trend: "-3 vs ayer",
    trendUp: false,
    isPositive: false, // Menos escaneos es negativo (rojo)
  },
  {
    id: "bounce",
    title: "Tasa de rebote",
    subtitle: "Últimos 7 días",
    value: "17,5%",
    trend: "-3% esta semana",
    trendUp: false,
    isPositive: true, // Menor rebote es positivo (verde)
    tooltip: "Menos de 2s en el menú",
  },
  {
    id: "time",
    title: "Tiempo de permanencia",
    subtitle: "Promedio por sesión",
    value: "25s",
    trend: "+5s vs ayer",
    trendUp: true,
    isPositive: true, // Más tiempo es positivo (verde)
  },
];

const aiInsights = [
  { title: "Tendencias de usuario", content: "Además, los usuarios tienden a abandonar el menú en la sección de bebidas frías. Recomendamos destacar 1–2 productos clave o simplificar la categoría.", headerColor: "bg-[#FBEBFF] text-[#431148]" },
  { title: "Problemas con el menú", content: "Además, los usuarios tienden a abandonar el menú en la sección de bebidas frías. Recomendamos destacar 1–2 productos clave o simplificar la categoría.", headerColor: "bg-[#FFF7B8] text-[#534A03]" },
  { title: "Recomendaciones de productos", content: "Además, los usuarios tienden a abandonar el menú en la sección de bebidas frías. Recomendamos destacar 1–2 productos clave o simplificar la categoría.", headerColor: "bg-[#E4FFB8] text-[#114821]" },
];

export default async function WithMenu() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: menu } = await supabase
    .from("menus")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!menu) return null;

  const { data: categoriesWithProducts, error } = await supabase
    .from("categories")
    .select(
      `
      *,
      products (*)
    `,
    )
    .eq("menu_id", menu.id);

  if (error || !categoriesWithProducts) return null;

  const result = categoriesWithProducts.map((category) => ({
    ...category,
    productCount: category.products.length,
  }));

  const allProducts = result.flatMap((category) =>
    category.products.map((product) => ({
      ...product,
      categoryName: category.name,
    })),
  ).slice(0, 7);

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="flex flex-col w-full mt-5 px-18 max-w-7xl mx-auto p-6">
          <h1 className="text-3xl font-extrabold text-left text-gray-900 mb-2 capitalize">
            {`Hola ${profile?.full_name || ""}`}
          </h1>
          <p className="text-[#64748B] text-base font-normal">
            Tu menú está activo y recibiendo visitas. Acá está el resumen de hoy.
          </p>
        </div>
      </div>

      <div className="flex">
        <div className="w-full max-w-3xl flex flex-col gap-2 px-18">
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metrics.map((metric) => (
                <Card key={metric.id} className="bg-[#FBFBFA] border-[#E2E8F0] rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[#1C1C1C]">
                      {metric.title}
                      {metric.tooltip && (
                        <TooltipProvider>
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-800 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-md">
                              <p>{metric.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </CardTitle>
                    <p className="text-xs text-[#58606E]">{metric.subtitle}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-end">
                      <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                        {metric.value}
                      </span>
                      <div
                        className={`flex items-center text-sm font-medium mt-1 ${metric.isPositive ? "text-[#00A32F]" : "text-[#AB0505]"
                          }`}
                      >
                        {metric.trendUp ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {metric.trend}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <Link
              href="/analytics"
              className="text-sm font-medium flex items-center gap-1 transition-colors text-[#114821]"
            >
              Ver todas las métricas
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <Card className="max-w-xs w-full p-6 rounded-3xl relative overflow-hidden border-2 border-[#CDF545]">
          <CardContent className="p-0 flex flex-col gap-6 relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-[#1C1C1C] capitalize">{profile?.business_name}</h3>
                <p className="text-xs text-[#58606E]">Actualizado hace 2 horas</p>
              </div>

              <Badge className="bg-linear-to-r from-[#CDF545] to-[#22D756] text-[#114821] border-none rounded-2xl px-2 py-1 text-xs font-medium gap-1.5 flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-[#18D549]"></span>
                Menú activo
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-[132.5px] rounded-lg font-medium text-[#0F172A] border-gray-300 hover:bg-muted h-8 py-2 px-4 text-base cursor-pointer">
                Pausar
              </Button>
              <Button className="w-[132.5px] rounded-lg text-base font-medium text-[#114821] bg-[#bef264] hover:bg-[#a3e635] h-8 py-2 px-4 cursor-pointer">
                Editar menú
              </Button>
            </div>

            <div className="flex items-center gap-3 bg-[#FBFBFA] p-4 rounded-lg border border-[#E4E4E6] h-10">
              <span className="text-sm font-semibold text-[#1C1C1C] truncate">menually.app/menu/cafecostero</span>
              <Button className="gap-2 text-sm font-semibold p-0 h-auto transition-colors cursor-pointer text-[#114821] bg-transparent">
                <CopyIcon />
                Copiar link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="p-8 max-w-7xl mx-auto font-sans px-18">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#1C1C1C]">
              Gestión de productos
            </h1>
          </div>

          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
            {result.map((cat) => (
              <button
                key={cat.id}
                className={`px-4 py-2 rounded-lg text-sm font-bold text-[#114821] whitespace-nowrap bg-[#F5FDDA]`}
              >
                {cat.name} ({cat.products.length})
              </button>
            ))}
          </div>

          <div className="flex gap-14">
            <div className="w-full max-w-3xl flex flex-col gap-4">
              <DashboardProductTable products={allProducts} />
              <Link href="/dashboard/product-management" className="text-[#114821] text-xs font-normal flex gap-2 self-end">Ver todos <ArrowRightIcon size={16} /></Link>
            </div>
            <Card className="rounded-lg border w-75 border-[#E4E4E6] bg-[#FBFBFA] overflow-hidden sticky top-6 h-fit">
              <div className="px-5 pt-3 flex items-center gap-2">
                <IAIcon className="h-5 w-5 text-[#29AE50]" />
                <h3 className="font-bold text-[#29AE50] text-base">AI Insights y recomendaciones</h3>
              </div>
              <CardContent className="px-5 pt-2 space-y-4">
                {aiInsights.map((insight, idx) => (
                  <div key={idx} className="border border-[#E4E4E6] rounded-lg overflow-hidden">
                    <div className={`px-4 py-2 text-sm font-bold ${insight.headerColor}`}>
                      {insight.title}
                    </div>
                    <div className="p-4 text-xs text-[#58606E] leading-relaxed bg-white">
                      <p>{insight.content}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
