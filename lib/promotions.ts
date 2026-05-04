import type { Promotion, PromotionStatus } from "@/types/promotions.types";

export type FilterStatus = "all" | "scheduled" | "expired" | "paused";

export interface ComputedPromotions {
  statusMap: Map<string, PromotionStatus>;
  filtered: Promotion[];
  carouselPromotions: Promotion[];
  stats: { id: number; title: string; desc: string; value: number }[];
  filterButtons: { label: string; value: FilterStatus }[];
}

export function computeStatus(p: Promotion, now = new Date()): PromotionStatus {
  if (!p.is_active) return "paused";
  if (p.start_date && new Date(p.start_date) > now) return "scheduled";
  if (p.end_date && new Date(p.end_date) < now) return "expired";
  return "active";
}

export function formatDateRange(p: Promotion): string {
  if (!p.start_date && !p.end_date) return "Sin fecha de término";
  if (p.start_date && p.end_date) {
    const fmt = (d: string) => {
      const date = new Date(d);
      return date.toLocaleDateString("es-CL", {
        day: "numeric",
        month: "short",
      });
    };
    return `${fmt(p.start_date)} - ${fmt(p.end_date)}`;
  }
  if (p.start_date)
    return `Desde ${new Date(p.start_date).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}`;
  return `Hasta ${new Date(p.end_date!).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}`;
}

export function computePromotionsMetrics(
  promotions: Promotion[],
  filter: FilterStatus,
  search: string,
  now: Date = new Date(),
): ComputedPromotions {
  let activeCount = 0;
  let scheduledCount = 0;
  let expiredCount = 0;
  let pausedCount = 0;
  let thisMonthCount = 0;
  const thisMonthNum = now.getMonth();
  const thisYearNum = now.getFullYear();

  const statusMap = new Map<string, PromotionStatus>();
  const filteredList: Promotion[] = [];
  const carouselList: Promotion[] = [];

  for (const p of promotions) {
    const status = computeStatus(p, now);
    statusMap.set(p.id, status);

    // Stats
    if (status === "active") activeCount++;
    else if (status === "scheduled") scheduledCount++;
    else if (status === "expired") expiredCount++;
    else if (status === "paused") pausedCount++;

    // This month
    const d = new Date(p.created_at);
    if (d.getMonth() === thisMonthNum && d.getFullYear() === thisYearNum) {
      thisMonthCount++;
    }

    // Filter
    const matchesFilter = filter === "all" || status === filter;
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.keyword?.toLowerCase().includes(search.toLowerCase());
    if (matchesFilter && matchesSearch) {
      filteredList.push(p);
    }

    // Carousel
    if (status === "active" || status === "scheduled") {
      carouselList.push(p);
    }
  }

  return {
    statusMap,
    filtered: filteredList,
    carouselPromotions: carouselList,
    stats: [
      { id: 1, title: "Activas", desc: "Mostrándose actualmente", value: activeCount },
      { id: 2, title: "Programadas", desc: "Inicia pronto", value: scheduledCount },
      { id: 3, title: "Este mes", desc: "Promociones publicadas", value: thisMonthCount },
    ],
    filterButtons: [
      { label: `Todas (${promotions.length})`, value: "all" },
      { label: `Programadas (${scheduledCount})`, value: "scheduled" },
      { label: `Vencidas (${expiredCount})`, value: "expired" },
      { label: `Pausadas (${pausedCount})`, value: "paused" },
    ],
  };
}
