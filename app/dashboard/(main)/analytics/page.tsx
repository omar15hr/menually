"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, ArrowRight } from "lucide-react";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import Header from "@/components/shared/Header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator";
import IAIcon from "@/components/icons/IAIcon";

// --- MOCK DATA ---

const generalMetrics = [
  { title: "Escaneos totales", value: "88", trend: "- 3 vs ayer", trendType: "negative", footerLabel: "Alta hoy", footerValue: "Entre 13:00 - 15:00" },
  { title: "Tasa de rebote", value: "17,5%", trend: "-3% esta semana", trendType: "positive", footerLabel: "Categoría con más salidas", footerValue: "Bebidas frías", info: true },
  { title: "Tiempo de permanencia", value: "38s", trend: "+10s esta semana", trendType: "positive", footerLabel: "Plato con más atención", footerValue: "Tarta Vasca" },
];

const trafficHeatmap = {
  days: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  hours: ["0h", "3h", "6h", "9h", "12h", "15h", "18h", "21h"],
  data: Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => Math.floor(Math.random() * 5))),
};

const chartData = [
  { day: "LUN", current: 50, previous: 80 }, { day: "MAR", current: 80, previous: 60 },
  { day: "MIE", current: 120, previous: 90 }, { day: "JUE", current: 90, previous: 70 },
  { day: "VIE", current: 299, previous: 180 }, { day: "SAB", current: 140, previous: 100 },
  { day: "DOM", current: 130, previous: 90 },
];

const chartConfig = {
  current: { label: "Esta semana", color: "#b8e07a" },
  previous: { label: "Semana anterior", color: "#d1d5db" },
} satisfies ChartConfig;

const performanceCategorias = [
  { name: "Categoría 1", value: "35,929", width: "40%" }, { name: "Categoría 2", value: "28,85", width: "30%" },
  { name: "Categoría 3", value: "1,84", width: "85%" }, { name: "Categoría 4", value: "49,94", width: "15%" },
];

const performanceProductos = [
  { name: "Producto 1", value: "35,929", width: "40%" }, { name: "Producto 2", value: "28,85", width: "30%" },
  { name: "Producto 3", value: "1,84", width: "85%" }, { name: "Producto 4", value: "49,94", width: "15%" },
];

const aiInsights = [
  { title: "Tendencias de usuario", content: "Además, los usuarios tienden a abandonar el menú en la sección de bebidas frías. Recomendamos destacar 1-2 productos clave.", headerColor: "bg-purple-100 text-purple-900" },
  { title: "Problemas con el menú", content: "Además, los usuarios tienden a abandonar el menú en la sección de bebidas frías. Recomendamos destacar 1-2 productos clave.", headerColor: "bg-yellow-100 text-yellow-900" },
  { title: "Recomendaciones de productos", content: "Además, los usuarios tienden a abandonar el menú en la sección de bebidas frías.", headerColor: "bg-green-100 text-green-900" },
  { title: "Análisis de ventas", content: "Las ventas en la categoría de postres han mostrado un crecimiento del 15% en el último trimestre.", headerColor: "bg-blue-100 text-blue-900" },
];

const navigationPatterns = [
  { path: ["Platos principales", "Bebidas", "Postres"], percentage: "34%" },
  { path: ["Pizzas", "Bebidas", "Postres"], percentage: "34%" },
  { path: ["Entradas", "Pizzas", "Postres", "Cafetería"], percentage: "34%" },
  { path: ["Entradas", "Postres", "Cafetería"], percentage: "34%" },
];

export default function AnalyticsPage() {
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
            <Tabs defaultValue="semana" className="w-130">
              <TabsList className="flex bg-[#F1F5F9] p-1 rounded-lg w-full h-auto">
                <TabsTrigger
                  value="hoy"
                  className="px-4 py-1.5 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900"
                >
                  Hoy
                </TabsTrigger>
                <TabsTrigger
                  value="semana"
                  className="px-4 py-1.5 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900"
                >
                  Esta semana
                </TabsTrigger>
                <TabsTrigger
                  value="mes"
                  className="px-4 py-1.5 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900"
                >
                  Mes
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
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md ${metric.trendType === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
                        {trafficHeatmap.hours.map(h => <span key={h}>{h}</span>)}
                      </div>
                      <div className="flex flex-col gap-3">
                        {trafficHeatmap.days.map((day, dIdx) => (
                          <div key={day} className="flex items-center gap-2">
                            <span className="w-8 text-xs text-gray-500 text-right">{day}</span>
                            <div className="flex-1 flex gap-1">
                              {trafficHeatmap.data[dIdx].map((val, hIdx) => {
                                const colors = ["bg-[#6D8F29]", "bg-[#6D8F29]", "bg-[#81A42E]", "bg-[#C1E942]", "bg-[#0F0F0F]"];
                                return <div key={hIdx} className={`h-5 flex-1 rounded-xs ${colors[val]}`} />;
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
                      <div className="flex items-center gap-1"><div className="w-3 h-1 bg-(--color-current) rounded-full" /> Esta semana</div>
                      <div className="flex items-center gap-1"><div className="w-3 h-1 bg-(--color-current) rounded-full" /> Semana anterior</div>
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
                        {performanceCategorias.map((item, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between text-sm text-gray-500 font-medium">
                              <span>{item.name}</span><span>{item.value}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#1b4332] rounded-full" style={{ width: item.width }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 mt-6 pt-4 flex flex-col gap-3">
                        <div><p className="text-xs text-gray-500 font-medium">Categoría más visitada</p><p className="text-sm font-bold text-gray-900">Pizzas</p></div>
                        <div><p className="text-xs text-gray-500 font-medium">Categoría menos visitada</p><p className="text-sm font-bold text-gray-900">Bebidas frías</p></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl shadow-sm border-gray-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-gray-900">Rendimiento por producto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-5">
                        {performanceProductos.map((item, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between text-sm text-gray-500 font-medium">
                              <span>{item.name}</span><span>{item.value}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#1b4332] rounded-full" style={{ width: item.width }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 mt-6 pt-4 flex flex-col gap-3">
                        <div><p className="text-xs text-gray-500 font-medium">Producto más visitado</p><p className="text-sm font-bold text-gray-900">Pizzas 3 estaciones</p></div>
                        <div><p className="text-xs text-gray-500 font-medium">Producto menos visitado</p><p className="text-sm font-bold text-gray-900">Pizza hawaiiana</p></div>
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
                          <span className="text-5xl font-black text-gray-900">8</span>
                        </div>
                      </div>
                      <div className="border-t border-gray-100 pt-3">
                        <p className="text-xs text-gray-500 font-medium">Día con más escaneos</p><p className="text-sm font-bold text-gray-900">Viernes</p>
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
                          <span className="px-3 py-1 bg-[#dcfce7] text-green-800 text-xs font-semibold rounded-full">+5s esta semana</span>
                          <span className="text-5xl font-black text-gray-900">14<span className="text-3xl">s</span></span>
                        </div>
                      </div>
                      <div className="border-t border-gray-100 pt-3">
                        <p className="text-xs text-gray-500 font-medium">Producto con más permanencia</p><p className="text-sm font-bold text-gray-900">Pizza 3 estaciones</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Navigation Patterns */}
                <Card className="rounded-2xl shadow-sm border-gray-200 mb-8">
                  <CardHeader><CardTitle className="text-sm font-bold">Patrones de navegación</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {navigationPatterns.map((pattern, i) => (
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
                            <div className="h-full bg-[#355e16] rounded-full" style={{ width: '60%' }} />
                          </div>
                          <span className="text-xs font-bold text-gray-600">{pattern.percentage}</span>
                        </div>
                      </div>
                    ))}
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