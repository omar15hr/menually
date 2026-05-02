import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Database } from "@/types/database.types";
import DashboardMenuCard from "./DashboardMenuCard";
import DashboardProductTable from "./DashboardProductTable";
import { CategoryWithProducts } from "../menu/MenuWorkflow";
import DashboardInsightsCard from "./DashboardInsightsCard";
import DashboardAnalyticsCard from "./DashboardAnalyticsCard";

const metrics = [
  {
    id: "scans",
    title: "Escaneos totales",
    subtitle: "hoy",
    value: "88",
    trend: "-3 vs ayer",
    trendUp: false,
    isPositive: false,
  },
  {
    id: "bounce",
    title: "Tasa de rebote",
    subtitle: "Últimos 7 días",
    value: "17,5%",
    trend: "-3% esta semana",
    trendUp: false,
    isPositive: true,
    tooltip: "Menos de 2s en el menú",
  },
  {
    id: "time",
    title: "Tiempo de permanencia",
    subtitle: "Promedio por sesión",
    value: "25s",
    trend: "+5s vs ayer",
    trendUp: true,
    isPositive: true,
  },
];

const aiInsights = [
  {
    title: "Tendencias de usuario",
    content:
      "Además, los usuarios tienden a abandonar el menú en la sección de bebidas frías. Recomendamos destacar 1–2 productos clave o simplificar la categoría.",
    headerColor: "bg-[#FBEBFF] text-[#431148]",
  },
  {
    title: "Problemas con el menú",
    content:
      "Además, los usuarios tienden a abandonar el menú en la sección de bebidas frías. Recomendamos destacar 1–2 productos clave o simplificar la categoría.",
    headerColor: "bg-[#FFF7B8] text-[#534A03]",
  },
  {
    title: "Recomendaciones de productos",
    content:
      "Además, los usuarios tienden a abandonar el menú en la sección de bebidas frías. Recomendamos destacar 1–2 productos clave o simplificar la categoría.",
    headerColor: "bg-[#E4FFB8] text-[#114821]",
  },
];

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface WithMenuProps {
  profile: Profile | null;
  categories: CategoryWithProducts[];
}

export default async function WithMenu({ profile, categories }: WithMenuProps) {
  const result = categories.map((category) => ({
    ...category,
    productCount: category.products.length,
  }));

  const allProducts = result
    .flatMap((category) =>
      category.products.map((product) => ({
        ...product,
        categoryName: category.name,
      })),
    )
    .slice(0, 7);

  return (
    <section className="max-w-7xl mx-auto w-full px-18 mb-10">
      <div className="flex flex-col w-full my-5">
        <h1 className="text-3xl font-extrabold text-left text-[#0F172A] mb-2 capitalize">
          {`Hola ${profile?.full_name || ""}`}
        </h1>
        <p className="text-[#64748B] text-base font-normal">
          Tu menú está activo y recibiendo visitas. Acá está el resumen de hoy.
        </p>
      </div>

      <div className="flex gap-10">
        <div className="w-full max-w-3xl flex flex-col gap-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <DashboardAnalyticsCard key={metric.id} metric={metric} />
            ))}
          </div>

          <div className="flex justify-end mt-2">
            <Link
              href="/dashboard/analytics"
              className="text-sm font-medium flex items-center gap-1 transition-colors text-[#114821]"
            >
              Ver todas las métricas
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <DashboardMenuCard business_name={profile?.business_name} />
      </div>

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

          <Link
            href="/dashboard/product-management"
            className="text-sm font-medium flex items-center gap-1 transition-colors text-[#114821] self-end"
          >
            Ver todos <ArrowRightIcon size={16} />
          </Link>
        </div>

        <DashboardInsightsCard insights={aiInsights} />
      </div>
    </section>
  );
}
