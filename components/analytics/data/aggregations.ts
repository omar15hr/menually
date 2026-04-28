import type {
  AnalyticsPeriod,
  CategoryPerformance,
  HeatmapCell,
  NavigationPattern,
  ProductPerformance,
  QRScanSummary,
  ShareMetrics,
  TimeOnPageMetrics,
  TrafficDataPoint,
} from "../types";
import type { DateRange } from "./dateRanges";

interface CategoryRef {
  id: string;
  name: string;
}

interface ProductRef {
  id: string;
  name: string;
}

interface ScanEvent {
  scanned_at: string;
}

interface CategoryViewEvent {
  category_id: string | null;
  created_at?: string | null;
  session_id: string | null;
}

interface ProductViewEvent {
  product_id: string | null;
}

interface ExitEvent {
  duration_seconds: number | null;
  product_id: string | null;
}

interface ShareEvent {
  created_at: string | null;
}

function normalizeDateKey(isoDate: string): string {
  return isoDate.slice(0, 10);
}

function mondayFirstDayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function safeAverage(values: Array<number | null | undefined>): number | null {
  if (values.length === 0) {
    return null;
  }

  const sum = values.reduce<number>((acc, value) => acc + (value ?? 0), 0);
  return sum / values.length;
}

function countByNullableId<T>(
  rows: T[],
  extractor: (row: T) => string | null | undefined,
): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const id = extractor(row);
    if (id) {
      acc[id] = (acc[id] ?? 0) + 1;
    }
    return acc;
  }, {});
}

export function buildQrSummary(
  totalScans: number,
  categoryViews: CategoryViewEvent[],
  categories: CategoryRef[],
  exitEvents: ExitEvent[],
): QRScanSummary {
  const avgTimeOnPage = safeAverage(
    exitEvents.map((event) => event.duration_seconds),
  );
  const categoryCounts = countByNullableId(
    categoryViews,
    (event) => event.category_id,
  );
  const categoryNameById = Object.fromEntries(
    categories.map((category) => [category.id, category.name]),
  );

  let leastViewedCategory: QRScanSummary["leastViewedCategory"] = null;
  const categoryEntries = Object.entries(categoryCounts);
  if (categoryEntries.length > 0) {
    const [leastCategoryId] = categoryEntries.sort(([, a], [, b]) => a - b)[0];
    leastViewedCategory = {
      id: leastCategoryId,
      name: categoryNameById[leastCategoryId] ?? "Sin nombre",
    };
  }

  return {
    totalScans,
    avgTimeOnPage,
    leastViewedCategory,
  };
}

export function buildTrafficData(
  period: AnalyticsPeriod,
  currentRange: DateRange,
  currentScans: ScanEvent[],
  previousScans: ScanEvent[],
): TrafficDataPoint[] {
  if (period === "today") {
    const currentByHour = currentScans.reduce<Record<number, number>>(
      (acc, scan) => {
        const hour = new Date(scan.scanned_at).getHours();
        acc[hour] = (acc[hour] ?? 0) + 1;
        return acc;
      },
      {},
    );

    const previousByHour = previousScans.reduce<Record<number, number>>(
      (acc, scan) => {
        const hour = new Date(scan.scanned_at).getHours();
        acc[hour] = (acc[hour] ?? 0) + 1;
        return acc;
      },
      {},
    );

    return Array.from({ length: 24 }, (_, hour) => ({
      day: `${hour}h`,
      current: currentByHour[hour] ?? 0,
      previous: previousByHour[hour] ?? 0,
    }));
  }

  if (period === "week") {
    const labels = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"];
    const currentByDow = currentScans.reduce<Record<number, number>>(
      (acc, scan) => {
        const index = mondayFirstDayIndex(new Date(scan.scanned_at));
        acc[index] = (acc[index] ?? 0) + 1;
        return acc;
      },
      {},
    );

    const previousByDow = previousScans.reduce<Record<number, number>>(
      (acc, scan) => {
        const index = mondayFirstDayIndex(new Date(scan.scanned_at));
        acc[index] = (acc[index] ?? 0) + 1;
        return acc;
      },
      {},
    );

    return labels.map((label, index) => ({
      day: label,
      current: currentByDow[index] ?? 0,
      previous: previousByDow[index] ?? 0,
    }));
  }

  const currentByDate = currentScans.reduce<Record<string, number>>(
    (acc, scan) => {
      const key = normalizeDateKey(scan.scanned_at);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const previousByDate = previousScans.reduce<Record<string, number>>(
    (acc, scan) => {
      const key = normalizeDateKey(scan.scanned_at);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const currentStart = new Date(currentRange.start);
  return Array.from({ length: 30 }, (_, index) => {
    const currentDate = new Date(currentStart);
    currentDate.setDate(currentDate.getDate() + index);
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 30);

    const currentKey = normalizeDateKey(currentDate.toISOString());
    const previousKey = normalizeDateKey(previousDate.toISOString());

    return {
      day: `${index + 1}`,
      current: currentByDate[currentKey] ?? 0,
      previous: previousByDate[previousKey] ?? 0,
    };
  });
}

export function buildHeatmapData(scans: ScanEvent[]): HeatmapCell[] {
  const heatmap = scans.reduce<Record<string, number>>((acc, scan) => {
    const date = new Date(scan.scanned_at);
    const dayOfWeek = mondayFirstDayIndex(date);
    const hourBucket = Math.floor(date.getHours() / 3);
    const key = `${dayOfWeek}-${hourBucket}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(heatmap).map(([key, count]) => {
    const [dayOfWeek, hourBucket] = key.split("-").map(Number);
    return { dayOfWeek, hourBucket, count };
  });
}

export function buildCategoryPerformance(
  categories: CategoryRef[],
  categoryViews: CategoryViewEvent[],
): CategoryPerformance[] {
  const counts = countByNullableId(categoryViews, (event) => event.category_id);
  const total = categoryViews.length;

  return categories
    .map((category) => {
      const viewCount = counts[category.id] ?? 0;
      return {
        id: category.id,
        name: category.name,
        viewCount,
        percentage: total > 0 ? (viewCount / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.viewCount - a.viewCount);
}

export function buildProductPerformance(
  products: ProductRef[],
  productViews: ProductViewEvent[],
): ProductPerformance[] {
  const counts = countByNullableId(productViews, (event) => event.product_id);
  const totalViews = Object.values(counts).reduce(
    (acc, value) => acc + value,
    0,
  );

  return products
    .filter((product) => (counts[product.id] ?? 0) > 0)
    .map((product) => {
      const viewCount = counts[product.id] ?? 0;
      return {
        id: product.id,
        name: product.name,
        viewCount,
        percentage: totalViews > 0 ? (viewCount / totalViews) * 100 : 0,
      };
    })
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 10);
}

export function buildShareMetrics(shares: ShareEvent[]): ShareMetrics {
  if (shares.length === 0) {
    return { totalShares: 0, mostSharedDay: null };
  }

  const sharesByDay = shares.reduce<Record<string, number>>((acc, share) => {
    if (!share.created_at) {
      return acc;
    }

    const day = normalizeDateKey(share.created_at);
    acc[day] = (acc[day] ?? 0) + 1;
    return acc;
  }, {});

  const mostSharedDay =
    Object.entries(sharesByDay).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;

  return {
    totalShares: shares.length,
    mostSharedDay,
  };
}

export function buildTimeMetrics(
  products: ProductRef[],
  exits: ExitEvent[],
): TimeOnPageMetrics {
  const avgTimeOnPage = safeAverage(
    exits.map((event) => event.duration_seconds),
  );
  const exitsWithProduct = exits.filter((event) => event.product_id);
  const avgTimePerProduct = safeAverage(
    exitsWithProduct.map((event) => event.duration_seconds),
  );

  const productNameById = Object.fromEntries(
    products.map((product) => [product.id, product.name]),
  );
  const durationsByProduct = exitsWithProduct.reduce<
    Record<string, { sum: number; count: number }>
  >((acc, event) => {
    const productId = event.product_id;
    if (!productId) {
      return acc;
    }

    if (!acc[productId]) {
      acc[productId] = { sum: 0, count: 0 };
    }

    acc[productId].sum += event.duration_seconds ?? 0;
    acc[productId].count += 1;
    return acc;
  }, {});

  const mostAttention = Object.entries(durationsByProduct)
    .map(([id, values]) => ({
      id,
      name: productNameById[id] ?? "Sin nombre",
      duration: values.count > 0 ? values.sum / values.count : 0,
    }))
    .sort((a, b) => b.duration - a.duration)[0];

  return {
    avgTimeOnPage,
    avgTimePerProduct,
    mostAttentionProduct: mostAttention
      ? {
          id: mostAttention.id,
          name: mostAttention.name,
          duration: mostAttention.duration,
        }
      : null,
  };
}

export function buildNavigationPatterns(
  categoryViews: CategoryViewEvent[],
  categories: CategoryRef[],
): NavigationPattern[] {
  const categoryNameById = Object.fromEntries(
    categories.map((category) => [category.id, category.name]),
  );
  const sessionPaths = categoryViews.reduce<Record<string, string[]>>(
    (acc, event) => {
      if (!event.session_id || !event.category_id) {
        return acc;
      }

      if (!acc[event.session_id]) {
        acc[event.session_id] = [];
      }

      const path = acc[event.session_id];
      if (path.length >= 5) {
        return acc;
      }

      const previousCategory = path[path.length - 1];
      if (previousCategory !== event.category_id) {
        path.push(event.category_id);
      }

      return acc;
    },
    {},
  );

  const pathCounts = Object.values(sessionPaths).reduce<
    Record<string, { path: string[]; count: number }>
  >((acc, path) => {
    if (path.length < 2) {
      return acc;
    }

    const key = path.join("->");
    if (!acc[key]) {
      acc[key] = { path, count: 0 };
    }

    acc[key].count += 1;
    return acc;
  }, {});

  const totalSessions = Object.keys(sessionPaths).length;
  return Object.values(pathCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((entry) => ({
      path: entry.path.map(
        (categoryId) => categoryNameById[categoryId] ?? categoryId,
      ),
      count: entry.count,
      percentage: totalSessions > 0 ? (entry.count / totalSessions) * 100 : 0,
    }));
}
