import { createClient } from "@/lib/supabase/server";
import type {
  AnalyticsData,
  AnalyticsPeriod,
  QRScanSummary,
  TrafficDataPoint,
  HeatmapCell,
  CategoryPerformance,
  ProductPerformance,
  NavigationPattern,
  ShareMetrics,
  TimeOnPageMetrics,
} from "./types";

function getDateRange(period: AnalyticsPeriod): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  if (period === "today") {
    start.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    start.setDate(start.getDate() - 7);
  } else {
    start.setDate(start.getDate() - 30);
  }

  return { start, end };
}

function getPreviousDateRange(period: AnalyticsPeriod): { start: Date; end: Date } {
  const { end } = getDateRange(period);
  const start = new Date(end);

  if (period === "today") {
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    start.setDate(start.getDate() - 14);
  } else {
    start.setDate(start.getDate() - 60);
  }

  return { start, end };
}

interface AnalyticsDataProps {
  businessId: string;
  period: AnalyticsPeriod;
  menuId: string;
}

export async function AnalyticsData({
  businessId,
  period,
  menuId,
}: AnalyticsDataProps): Promise<AnalyticsData> {
  const supabase = await createClient();

  const { start, end } = getDateRange(period);
  const { start: prevStart, end: prevEnd } = getPreviousDateRange(period);

  // 1. QR Scans summary
  const { count: totalScans } = await supabase
    .from("qr_scans")
    .select("*", { count: "exact", head: true })
    .eq("business_id", businessId)
    .gte("scanned_at", start.toISOString())
    .lte("scanned_at", end.toISOString());

  // 2. Avg time on page
  const { data: avgTimeData } = await supabase
    .from("menu_events")
    .select("duration_seconds")
    .eq("business_id", businessId)
    .eq("event_type", "exit")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  const avgTimeOnPage =
    avgTimeData && avgTimeData.length > 0
      ? avgTimeData.reduce((acc, e) => acc + (e.duration_seconds ?? 0), 0) /
        avgTimeData.length
      : null;

  // 3. Least viewed category
  const { data: categoryViews } = await supabase
    .from("menu_events")
    .select("category_id")
    .eq("business_id", businessId)
    .eq("event_type", "category_view")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  const viewCounts: Record<string, number> = {};
  categoryViews?.forEach((e) => {
    if (e.category_id) {
      viewCounts[e.category_id] = (viewCounts[e.category_id] || 0) + 1;
    }
  });

  let leastViewedCategory: QRScanSummary["leastViewedCategory"] = null;
  if (Object.keys(viewCounts).length > 0) {
    const sorted = Object.entries(viewCounts).sort(([, a], [, b]) => a - b);
    const leastId = sorted[0][0];
    const { data: cat } = await supabase
      .from("categories")
      .select("id, name")
      .eq("id", leastId)
      .single();
    if (cat) {
      leastViewedCategory = { id: cat.id, name: cat.name };
    }
  }

  // 4. Traffic by day
  const { data: trafficData } = await supabase
    .from("qr_scans")
    .select("scanned_at")
    .eq("business_id", businessId)
    .gte("scanned_at", start.toISOString())
    .lte("scanned_at", end.toISOString())
    .order("scanned_at");

  const { data: prevTrafficData } = await supabase
    .from("qr_scans")
    .select("scanned_at")
    .eq("business_id", businessId)
    .gte("scanned_at", prevStart.toISOString())
    .lte("scanned_at", prevEnd.toISOString())
    .order("scanned_at");

  // Build traffic data points
  const trafficMap: Record<string, number> = {};
  const prevTrafficMap: Record<string, number> = {};

  trafficData?.forEach((e) => {
    const day = e.scanned_at.split("T")[0];
    trafficMap[day] = (trafficMap[day] || 0) + 1;
  });

  prevTrafficData?.forEach((e) => {
    const day = e.scanned_at.split("T")[0];
    prevTrafficMap[day] = (prevTrafficMap[day] || 0) + 1;
  });

  const dayLabels =
    period === "today"
      ? Array.from({ length: 24 }, (_, i) => `${i}h`)
      : period === "week"
        ? ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"]
        : Array.from({ length: 30 }, (_, i) => `${i + 1}`);

  const traffic: TrafficDataPoint[] = dayLabels.map((label, i) => {
    let current = 0;
    let previous = 0;

    if (period === "today") {
      current = trafficData?.filter((e) => {
        const hour = parseInt(e.scanned_at.split("T")[1].split(":")[0]);
        return hour === i;
      }).length ?? 0;
      previous = prevTrafficData?.filter((e) => {
        const hour = parseInt(e.scanned_at.split("T")[1].split(":")[0]);
        return hour === i;
      }).length ?? 0;
    } else if (period === "week") {
      const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const dayName = label;
      const dayIndex = days.indexOf(dayName);
      current = trafficData?.filter((e) => {
        const d = new Date(e.scanned_at).getDay();
        return d === dayIndex;
      }).length ?? 0;
      previous = prevTrafficData?.filter((e) => {
        const d = new Date(e.scanned_at).getDay();
        return d === dayIndex;
      }).length ?? 0;
    } else {
      current = trafficMap[`${start.toISOString().split("T")[0].slice(0, 8)}${String(i + 1).padStart(2, "0")}`] ?? 0;
      previous = prevTrafficMap[`${prevStart.toISOString().split("T")[0].slice(0, 8)}${String(i + 1).padStart(2, "0")}`] ?? 0;
    }

    return { day: label, current, previous };
  });

  // 5. Heatmap data
  const { data: heatmapData } = await supabase
    .from("qr_scans")
    .select("scanned_at")
    .eq("business_id", businessId)
    .gte("scanned_at", start.toISOString())
    .lte("scanned_at", end.toISOString());

  const heatmapMap: Record<string, number> = {};
  heatmapData?.forEach((e) => {
    const d = new Date(e.scanned_at);
    const dow = d.getDay(); // 0=Sun, 6=Sat
    const hour = d.getHours();
    const bucket = Math.floor(hour / 3);
    const key = `${dow}-${bucket}`;
    heatmapMap[key] = (heatmapMap[key] || 0) + 1;
  });

  const heatmap: HeatmapCell[] = Object.entries(heatmapMap).map(([key, count]) => {
    const [dow, bucket] = key.split("-").map(Number);
    return { dayOfWeek: dow, hourBucket: bucket, count };
  });

  // 6. Category performance
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("menu_id", menuId)
    .order("position");

  const categoryPerformance: CategoryPerformance[] =
    (categories ?? []).map((cat) => {
      const count = viewCounts[cat.id] || 0;
      return {
        id: cat.id,
        name: cat.name,
        viewCount: count,
        percentage:
          categoryViews && categoryViews.length > 0
            ? (count / categoryViews.length) * 100
            : 0,
      };
    }).sort((a, b) => b.viewCount - a.viewCount);

  // 7. Product performance
  const categoryIds = categories?.map((c) => c.id) ?? [];
  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .in("category_id", categoryIds)
    .order("position");

  const { data: productViews } = await supabase
    .from("menu_events")
    .select("product_id")
    .eq("business_id", businessId)
    .eq("event_type", "product_view")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  const productViewCounts: Record<string, number> = {};
  productViews?.forEach((e) => {
    if (e.product_id) {
      productViewCounts[e.product_id] = (productViewCounts[e.product_id] || 0) + 1;
    }
  });

  const totalProductViews = Object.values(productViewCounts).reduce((a, b) => a + b, 0);

  const productPerformance: ProductPerformance[] = (products ?? [])
    .filter((p) => (productViewCounts[p.id] || 0) > 0)
    .map((p) => ({
      id: p.id,
      name: p.name,
      viewCount: productViewCounts[p.id] || 0,
      percentage:
        totalProductViews > 0
          ? ((productViewCounts[p.id] || 0) / totalProductViews) * 100
          : 0,
    }))
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 10);

  // 8. Share metrics
  const { count: totalShares } = await supabase
    .from("menu_events")
    .select("*", { count: "exact", head: true })
    .eq("business_id", businessId)
    .eq("event_type", "share")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  const { data: shareByDay } = await supabase
    .from("menu_events")
    .select("created_at")
    .eq("business_id", businessId)
    .eq("event_type", "share")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  let mostSharedDay: string | null = null;
  if (shareByDay && shareByDay.length > 0) {
    const dayCounts: Record<string, number> = {};
    shareByDay.forEach((e) => {
      const day = e.created_at.split("T")[0];
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const maxDay = Object.entries(dayCounts).sort(([, a], [, b]) => b - a)[0];
    mostSharedDay = maxDay[0];
  }

  const shareMetrics: ShareMetrics = {
    totalShares: totalShares ?? 0,
    mostSharedDay,
  };

  // 9. Time metrics
  const { data: productExitData } = await supabase
    .from("menu_events")
    .select("duration_seconds, product_id")
    .eq("business_id", businessId)
    .eq("event_type", "exit")
    .not("product_id", "is", null)
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  const avgTimePerProduct =
    productExitData && productExitData.length > 0
      ? productExitData.reduce((acc, e) => acc + (e.duration_seconds ?? 0), 0) /
        productExitData.length
      : null;

  let mostAttentionProduct: TimeOnPageMetrics["mostAttentionProduct"] = null;
  if (productExitData && productExitData.length > 0) {
    const productDurations: Record<string, { sum: number; count: number; name: string }> = {};
    for (const e of productExitData) {
      if (e.product_id) {
        if (!productDurations[e.product_id]) {
          const p = products?.find((pr) => pr.id === e.product_id);
          productDurations[e.product_id] = { sum: 0, count: 0, name: p?.name ?? "Unknown" };
        }
        productDurations[e.product_id].sum += e.duration_seconds ?? 0;
        productDurations[e.product_id].count += 1;
      }
    }
    const best = Object.entries(productDurations)
      .map(([id, d]) => ({ id, avgDuration: d.sum / d.count, name: d.name }))
      .sort((a, b) => b.avgDuration - a.avgDuration)[0];
    if (best) {
      mostAttentionProduct = {
        id: best.id,
        name: best.name,
        duration: best.avgDuration,
      };
    }
  }

  const timeMetrics: TimeOnPageMetrics = {
    avgTimeOnPage,
    avgTimePerProduct,
    mostAttentionProduct,
  };

  // 10. Navigation patterns
  const { data: categoryEvents } = await supabase
    .from("menu_events")
    .select("session_id, category_id, created_at")
    .eq("business_id", businessId)
    .eq("event_type", "category_view")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString())
    .order("created_at");

  const sessionPaths: Record<string, string[]> = {};
  categoryEvents?.forEach((e) => {
    if (e.session_id && e.category_id) {
      if (!sessionPaths[e.session_id]) sessionPaths[e.session_id] = [];
      if (sessionPaths[e.session_id].length < 5) {
        const last = sessionPaths[e.session_id][sessionPaths[e.session_id].length - 1];
        if (last !== e.category_id) {
          sessionPaths[e.session_id].push(e.category_id);
        }
      }
    }
  });

  const pathCounts: Record<string, { path: string[]; count: number }> = {};
  Object.values(sessionPaths).forEach((path) => {
    if (path.length >= 2) {
      const key = path.join("→");
      if (!pathCounts[key]) {
        pathCounts[key] = { path, count: 0 };
      }
      pathCounts[key].count++;
    }
  });

  const totalSessions = Object.keys(sessionPaths).length;
  const navigationPatterns: NavigationPattern[] = Object.values(pathCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((p) => ({
      path: p.path.map((id) => categories?.find((c) => c.id === id)?.name ?? id),
      count: p.count,
      percentage: totalSessions > 0 ? (p.count / totalSessions) * 100 : 0,
    }));

  return {
    qrScans: {
      totalScans: totalScans ?? 0,
      avgTimeOnPage,
      leastViewedCategory,
    },
    traffic,
    heatmap,
    categoryPerformance,
    productPerformance,
    navigationPatterns,
    shareMetrics,
    timeMetrics,
  };
}