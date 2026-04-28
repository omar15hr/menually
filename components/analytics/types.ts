export interface QRScanSummary {
  totalScans: number;
  avgTimeOnPage: number | null;
  leastViewedCategory: {
    id: string;
    name: string;
  } | null;
}

export interface CategoryPerformance {
  id: string;
  name: string;
  viewCount: number;
  percentage: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  viewCount: number;
  percentage: number;
}

export interface TrafficDataPoint {
  day: string;
  current: number;
  previous: number;
}

export interface HeatmapCell {
  dayOfWeek: number; // 0=Sun, 6=Sat in Postgres EXTRACT(DOW)
  hourBucket: number; // 0-7 (each bucket = 3 hours)
  count: number;
}

export interface NavigationPattern {
  path: string[]; // category names
  count: number;
  percentage: number;
}

export interface ShareMetrics {
  totalShares: number;
  mostSharedDay: string | null;
}

export interface TimeOnPageMetrics {
  avgTimeOnPage: number | null;
  avgTimePerProduct: number | null;
  mostAttentionProduct: {
    id: string;
    name: string;
    duration: number;
  } | null;
}

export interface AnalyticsData {
  qrScans: QRScanSummary;
  traffic: TrafficDataPoint[];
  heatmap: HeatmapCell[];
  categoryPerformance: CategoryPerformance[];
  productPerformance: ProductPerformance[];
  navigationPatterns: NavigationPattern[];
  shareMetrics: ShareMetrics;
  timeMetrics: TimeOnPageMetrics;
}

export type AnalyticsPeriod = "today" | "week" | "month";
