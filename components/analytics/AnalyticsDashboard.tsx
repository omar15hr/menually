import AnalyticsView from "./AnalyticsView";
import type { AnalyticsPeriod } from "./types";
import { AnalyticsData } from "./AnalyticsData";

interface Props {
  businessId: string;
  menuId: string;
  period: AnalyticsPeriod;
}

export async function AnalyticsDashboard({
  businessId,
  menuId,
  period,
}: Props) {
  const analyticsData = await AnalyticsData({ businessId, period, menuId });

  return <AnalyticsView initialData={analyticsData} />;
}
