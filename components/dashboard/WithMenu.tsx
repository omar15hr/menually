import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Info, TrendingUp, TrendingDown, Link, ArrowRight } from "lucide-react";
import { TooltipProvider, TooltipTrigger, TooltipContent, Tooltip } from "../ui/tooltip";

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
  );

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="flex flex-col w-full mt-5 px-10 max-w-7xl mx-auto p-6">
          <h1 className="text-3xl font-extrabold text-left text-gray-900 mb-2 capitalize">
            {`Hola ${profile?.full_name || ""}`}
          </h1>
          <p className="text-[#64748B] text-base font-normal">
            Tu menú está activo y recibiendo visitas. Acá está el resumen de hoy.
          </p>
        </div>
      </div>

      <div className="w-full max-w-4xl flex flex-col gap-4 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.id} className="shadow-sm border-gray-200 rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900">
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
                <p className="text-sm text-muted-foreground">{metric.subtitle}</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-end">
                  <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                    {metric.value}
                  </span>
                  <div
                    className={`flex items-center text-sm font-medium mt-1 ${metric.isPositive ? "text-green-600" : "text-red-600"
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

        <div className="flex justify-end mt-2">
          <Link
            href="/metricas"
            className="text-sm font-medium text-emerald-800 hover:text-emerald-900 flex items-center gap-1 transition-colors"
          >
            Ver todas las métricas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
