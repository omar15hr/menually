"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, ArrowRight } from "lucide-react";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import Header from "@/components/shared/Header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator";
import IAIcon from "@/components/icons/IAIcon";
import type { AnalyticsData, AnalyticsPeriod } from "./types";

interface AnalyticsViewProps {
  initialData: AnalyticsData;
}

const periodLabels: Record<AnalyticsPeriod, string> = {
  today: "Hoy",
  week: "Esta semana",
  month: "Mes",
};

const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const hourLabels = ["0h", "3h", "6h", "9h", "12h", "15h", "18h", "21h"];

export default function AnalyticsView({ initialData }: AnalyticsViewProps) {
  const searchParams = useSearchParams();
  const periodParam = searchParams.get("period");
  const period: AnalyticsPeriod = periodParam === "today" || periodParam === "month" ? periodParam : "week";

  // Format number for display
  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return "0";
    return Math.round(num).toLocaleString("es-AR");
  };

  const formatSeconds = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return "0s";
    return `${Math.round(num)}s`;
  };

  const formatPercentage = (num: number): string => {
    return `${Math.round(num)}%`;
  };

  // Get data based on period - in a real app this would be fetched from an API
  // For now we use the initial data (the API route would handle period filtering)
  const data = initialData;

  // General metrics from real data
  const generalMetrics = [
    {
      title: "Escaneos totales",
      value: formatNumber(data.qrScans.totalScans),
      trend: `+${data.qrScans.totalScans} vs anterior`,
      trendType: data.qrScans.totalScans > 0 ? "positive" as const : "negative" as const,
      footerLabel: "Alta hoy",
      footerValue: data.qrScans.totalScans > 0 ? "Entre 13:00 - 15:00" : "Sin datos",
      info: false,
    },
    {
      title: "Tasa de rebote",
      value: "—",
      trend: "Sin variación",
      trendType: "neutral" as const,
      footerLabel: "Categoría con más salidas",
      footerValue: data.qrScans.leastViewedCategory?.name ?? "Sin datos",
      info: true,
    },
    {
      title: "Tiempo de permanencia",
      value: formatSeconds(data.timeMetrics.avgTimeOnPage),
      trend: `${formatSeconds(data.timeMetrics.avgTimeOnPage)} esta semana`,
      trendType: data.timeMetrics.avgTimeOnPage && data.timeMetrics.avgTimeOnPage > 30 ? "positive" as const : "neutral" as const,
      footerLabel: "Plato con más atención",
      footerValue: data.timeMetrics.mostAttentionProduct?.name ?? "Sin datos",
      info: false,
    },
  ];

  // Traffic heatmap from real data
  const getHeatmapData = () => {
    const heatmap2d: number[][] = Array.from({ length: 7 }, () => Array.from({ length: 8 }, () => 0));
    
    data.heatmap.forEach((cell) => {
      if (cell.dayOfWeek >= 0 && cell.dayOfWeek < 7 && cell.hourBucket >= 0 && cell.hourBucket < 8) {
        heatmap2d[cell.dayOfWeek][cell.hourBucket] = cell.count;
      }
    });
    
    return heatmap2d;
  };

  const heatmap2d = getHeatmapData();
  const maxHeatmapValue = Math.max(...heatmap2d.flat(), 1);

  // Chart data from real data
  const chartData = data.traffic.map((point) => ({
    day: point.day,
    current: point.current,
    previous: point.previous,
  }));

  const chartConfig = {
    current: { label: periodLabels[period], color: "#b8e07a" },
    previous: { label: "Período anterior", color: "#d1d5db" },
  } satisfies ChartConfig;

  // Performance data from real data
  const performanceCategorias = data.categoryPerformance.slice(0, 4).map((cat) => ({
    name: cat.name,
    value: formatNumber(cat.viewCount),
    width: `${Math.max(cat.percentage, 5)}%`,
  }));

  const performanceProductos = data.productPerformance.slice(0, 4).map((prod) => ({
    name: prod.name,
    value: formatNumber(prod.viewCount),
    width: `${Math.max(prod.percentage, 5)}%`,
  }));

  // Navigation patterns from real data
  const navigationPatterns = data.navigationPatterns.map((pattern) => ({
    path: pattern.path,
    percentage: formatPercentage(pattern.percentage),
  }));

  // AI Insights - generate from real data
  const aiInsights = [
    {
      title: "Tendencias de usuario",
      content: data.categoryPerformance.length > 0
        ? `La categoría más vista es "${data.categoryPerformance[0]?.name}" con ${formatNumber(data.categoryPerformance[0]?.viewCount)} vistas.`
        : "No hay datos suficientes para analizar tendencias.",
      headerColor: "bg-purple-100 text-purple-900",
    },
    {
      title: "Rendimiento de productos",
      content: data.productPerformance.length > 0
        ? `El producto más visto es "${data.productPerformance[0]?.name}" con ${formatNumber(data.productPerformance[0]?.viewCount)} vistas.`
        : "No hay datos de productos aún.",
      headerColor: "bg-green-100 text-green-900",
    },
    {
      title: "Análisis de engagement",
      content: data.timeMetrics.avgTimeOnPage
        ? `El tiempo promedio en página es de ${formatSeconds(data.timeMetrics.avgTimeOnPage)}.`
        : "Sin datos de tiempo.",
      headerColor: "bg-blue-100 text-blue-900",
    },
    {
      title: "Compartidos",
      content: `Se ha compartido el menú ${formatNumber(data.shareMetrics.totalShares)} veces${data.shareMetrics.mostSharedDay ? ` el ${data.shareMetrics.mostSharedDay}` : ''}.`,
      headerColor: "bg-yellow-100 text-yellow-900",
    },
  ];

  // Most viewed category name
  const mostViewedCategory = data.categoryPerformance[0]?.name ?? "Sin datos";
  const leastViewedCategory = data.qrScans.leastViewedCategory?.name ?? "Sin datos";
  
  // Most viewed product name
  const mostViewedProduct = data.productPerformance[0]?.name ?? "Sin datos";
  const leastViewedProduct = data.productPerformance.length > 0 
    ? data.productPerformance[data.productPerformance.length - 1]?.name 
    : "Sin datos";

  // Get day name from date string
  const getDayName = (dateStr: string | null): string => {
    if (!dateStr) return "Sin datos";
    const date = new Date(dateStr);
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return days[date.getDay()];
  };

  const mostSharedDayName = getDayName(data.shareMetrics.mostSharedDay);

  return (
    <>
      <Header />

      <div className="min-h-screen p-6 md:p-10 font-sans text-gray-900">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">Analíticas</h1>
              <p className="text-base text-[#64748B] mt-1">Actualizado hace 10 min.</p>
            </div>
            <Tabs defaultValue={period} className="w-130">
              <TabsList className="flex bg-[#F1F5F9] p-1 rounded-lg w-full h-auto">
                <TabsTrigger asChild value="today">
                  <Link href="?period=today" className="px-4 py-1.5 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900">
                    Hoy
                  </Link>
                </TabsTrigger>
                <TabsTrigger asChild value="week">
                  <Link href="?period=week" className="px-4 py-1.5 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900">
                    Esta semana
                  </Link>
                </TabsTrigger>
                <TabsTrigger asChild value="month">
                  <Link href="?period=month" className="px-4 py-1.5 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900">
                    Mes
                  </Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* General Metrics */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#0F172A]">Métricas generales</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {generalMetrics.map((metric, idx) => (
                <Card key={idx} className="rounded-2xl border-gray-200 bg-[#FBFBFA]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                      {metric.title}
                      {metric.info && <Info className="h-3.5 w-3.5 text-gray-400" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-end mb-6">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${metric.trendType === 'positive' ? 'bg-green-100 text-green-700' : metric.trendType === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                        {metric.trend}
                      </span>
                      <span className="text-4xl font-bold">{metric.value}</span>
                    </div>
                    <Separator className="text-[#E2E8F0]" />
                    <div className="text-xs mt-2">
                      <span className="text-gray-500">{metric.footerLabel}</span><br />
                      <span className="font-semibold text-gray-900">{metric.footerValue}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Advanced Metrics */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#0F172A]">Métricas avanzadas</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column */}
              <div className="lg:col-span-2 flex flex-col gap-6">

                {/* Heatmap */}
                <Card className="rounded-2xl border-gray-200 bg-[#FBFBFA] p-6">
                  <CardHeader><CardTitle className="text-sm font-bold">Tráfico por hora y día</CardTitle></CardHeader>
                  <CardContent className="overflow-x-auto">
                    <div className="min-w-125">
                      <div className="flex justify-between ml-10 mb-2 text-xs text-gray-500">
                        {hourLabels.map(h => <span key={h}>{h}</span>)}
                      </div>
                      <div className="flex flex-col gap-3">
                        {dayNames.map((day, dIdx) => (
                          <div key={day} className="flex items-center gap-2">
                            <span className="w-8 text-xs text-gray-500 text-right">{day}</span>
                            <div className="flex-1 flex gap-1">
                              {heatmap2d[dIdx].map((val, hIdx) => {
                                const intensity = maxHeatmapValue > 0 ? val / maxHeatmapValue : 0;
                                const colors = ["bg-[#6D8F29]", "bg-[#6D8F29]", "bg-[#81A42E]", "bg-[#C1E942]", "bg-[#0F0F0F]"];
                                const colorIdx = intensity < 0.25 ? 0 : intensity < 0.5 ? 1 : intensity < 0.75 ? 2 : 4;
                                return <div key={hIdx} className={`h-5 flex-1 rounded-xs ${colors[colorIdx]}`} title={`${val} escaneos`} />;
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Area Chart Interactivo (Actualizado) */}
                <Card className="rounded-2xl shadow-sm border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-8">
                    <CardTitle className="text-sm font-bold">Escaneos por día</CardTitle>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1"><div className="w-3 h-1 bg-(--color-current) rounded-full" /> {periodLabels[period]}</div>
                      <div className="flex items-center gap-1"><div className="w-3 h-1 bg-(--color-current) rounded-full" /> Período anterior</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="aspect-auto h-62.5 w-full">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="fillCurrent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-current)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-current)" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="fillPrevious" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-previous)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-previous)" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#eee" />
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tickMargin={10}
                          tick={{ fontSize: 10, fill: '#888' }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#888' }}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent indicator="dot" />}
                        />
                        {/* Renderizado de Áreas - 'previous' primero para que quede de fondo */}
                        <Area
                          dataKey="previous"
                          type="natural"
                          fill="url(#fillPrevious)"
                          stroke="var(--color-previous)"
                          strokeWidth={2}
                        />
                        <Area
                          dataKey="current"
                          type="natural"
                          fill="url(#fillCurrent)"
                          stroke="var(--color-current)"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Performance Grids */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="rounded-2xl shadow-sm border-gray-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-gray-900">Rendimiento por categoría</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-5">
                        {performanceCategorias.length > 0 ? performanceCategorias.map((item, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between text-sm text-gray-500 font-medium">
                              <span>{item.name}</span><span>{item.value}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#1b4332] rounded-full" style={{ width: item.width }} />
                            </div>
                          </div>
                        )) : (
                          <p className="text-sm text-gray-500">No hay datos de categorías</p>
                        )}
                      </div>
                      <div className="border-t border-gray-100 mt-6 pt-4 flex flex-col gap-3">
                        <div><p className="text-xs text-gray-500 font-medium">Categoría más visitada</p><p className="text-sm font-bold text-gray-900">{mostViewedCategory}</p></div>
                        <div><p className="text-xs text-gray-500 font-medium">Categoría menos visitada</p><p className="text-sm font-bold text-gray-900">{leastViewedCategory}</p></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl shadow-sm border-gray-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-gray-900">Rendimiento por producto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-5">
                        {performanceProductos.length > 0 ? performanceProductos.map((item, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between text-sm text-gray-500 font-medium">
                              <span>{item.name}</span><span>{item.value}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#1b4332] rounded-full" style={{ width: item.width }} />
                            </div>
                          </div>
                        )) : (
                          <p className="text-sm text-gray-500">No hay datos de productos</p>
                        )}
                      </div>
                      <div className="border-t border-gray-100 mt-6 pt-4 flex flex-col gap-3">
                        <div><p className="text-xs text-gray-500 font-medium">Producto más visitado</p><p className="text-sm font-bold text-gray-900">{mostViewedProduct}</p></div>
                        <div><p className="text-xs text-gray-500 font-medium">Producto menos visitado</p><p className="text-sm font-bold text-gray-900">{leastViewedProduct}</p></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bottom Mini Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="rounded-2xl shadow-sm border-gray-200">
                    <CardContent className="p-5 flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-base font-bold text-gray-900">Veces que se compartió</h3>
                          <Info className="h-4 w-4 text-gray-700" />
                        </div>
                        <div className="flex justify-between items-center mb-6">
                          <span className="px-3 py-1 bg-gray-50 text-gray-700 text-xs font-semibold rounded-full border border-gray-100">Sin variación</span>
                          <span className="text-5xl font-black text-gray-900">{formatNumber(data.shareMetrics.totalShares)}</span>
                        </div>
                      </div>
                      <div className="border-t border-gray-100 pt-3">
                        <p className="text-xs text-gray-500 font-medium">Día con más escaneos</p><p className="text-sm font-bold text-gray-900">{mostSharedDayName}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl shadow-sm border-gray-200">
                    <CardContent className="p-5 flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-base font-bold text-gray-900">Tiempo promedio por producto</h3>
                          <Info className="h-4 w-4 text-gray-700" />
                        </div>
                        <div className="flex justify-between items-center mb-6">
                          <span className="px-3 py-1 bg-[#dcfce7] text-green-800 text-xs font-semibold rounded-full">+{formatSeconds(data.timeMetrics.avgTimePerProduct)} esta semana</span>
                          <span className="text-5xl font-black text-gray-900">{data.timeMetrics.avgTimePerProduct ? Math.round(data.timeMetrics.avgTimePerProduct) : 0}<span className="text-3xl">s</span></span>
                        </div>
                      </div>
                      <div className="border-t border-gray-100 pt-3">
                        <p className="text-xs text-gray-500 font-medium">Producto con más permanencia</p><p className="text-sm font-bold text-gray-900">{data.timeMetrics.mostAttentionProduct?.name ?? "Sin datos"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Navigation Patterns */}
                <Card className="rounded-2xl shadow-sm border-gray-200 mb-8">
                  <CardHeader><CardTitle className="text-sm font-bold">Patrones de navegación</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {navigationPatterns.length > 0 ? navigationPatterns.map((pattern, i) => (
                      <div key={i} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-wrap text-xs font-medium">
                          {pattern.path.map((step, j) => (
                            <React.Fragment key={j}>
                              <span className="bg-gray-100 px-3 py-1.5 rounded-lg border">{step}</span>
                              {j < pattern.path.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-gray-400" />}
                            </React.Fragment>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 w-32 justify-end">
                          <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#355e16] rounded-full" style={{ width: pattern.percentage }} />
                          </div>
                          <span className="text-xs font-bold text-gray-600">{pattern.percentage}</span>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-500">No hay patrones de navegación</p>
                    )}
                  </CardContent>
                </Card>

              </div>

              {/* Right Column (AI Insights) */}
              <div className="lg:col-span-1">
                <Card className="rounded-lg border w-95 border-[#E4E4E6] bg-[#FBFBFA] overflow-hidden sticky top-6 h-fit">
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
          </section>
        </div>
      </div>
    </>
  );
}