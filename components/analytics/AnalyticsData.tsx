import {
  buildQrSummary,
  buildHeatmapData,
  buildTimeMetrics,
  buildTrafficData,
  buildShareMetrics,
  buildProductPerformance,
  buildNavigationPatterns,
  buildCategoryPerformance,
} from "./data/aggregations";
import {
  fetchTotalScans,
  fetchExitEvents,
  fetchShareEvents,
  fetchProductViews,
  fetchCategoryViews,
  fetchScansTimeline,
  fetchCategoriesByMenu,
  fetchProductsByCategoryIds,
} from "./data/queries";
import { createClient } from "@/lib/supabase/server";
import type { AnalyticsData, AnalyticsPeriod } from "./types";
import { getCurrentDateRange, getPreviousDateRange } from "./data/dateRanges";

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

  const currentRange = getCurrentDateRange(period);
  const previousRange = getPreviousDateRange(period, currentRange);

  const [
    categories,
    totalScans,
    currentScans,
    previousScans,
    categoryViews,
    productViews,
    shareEvents,
    exitEvents,
  ] = await Promise.all([
    fetchCategoriesByMenu(supabase, menuId),
    fetchTotalScans(supabase, businessId, currentRange),
    fetchScansTimeline(supabase, businessId, currentRange),
    fetchScansTimeline(supabase, businessId, previousRange),
    fetchCategoryViews(supabase, businessId, currentRange),
    fetchProductViews(supabase, businessId, currentRange),
    fetchShareEvents(supabase, businessId, currentRange),
    fetchExitEvents(supabase, businessId, currentRange),
  ]);

  const categoryIds = categories.map((category) => category.id);
  const products = await fetchProductsByCategoryIds(supabase, categoryIds);

  return {
    qrScans: buildQrSummary(totalScans, categoryViews, categories, exitEvents),
    traffic: buildTrafficData(
      period,
      currentRange,
      currentScans,
      previousScans,
    ),
    heatmap: buildHeatmapData(currentScans),
    categoryPerformance: buildCategoryPerformance(categories, categoryViews),
    productPerformance: buildProductPerformance(products, productViews),
    navigationPatterns: buildNavigationPatterns(categoryViews, categories),
    shareMetrics: buildShareMetrics(shareEvents),
    timeMetrics: buildTimeMetrics(products, exitEvents),
  };
}
