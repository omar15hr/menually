import { Suspense } from "react";
import { LoaderIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { getAuthUser } from "@/lib/queries/auth.queries";
import { getMenuByUserId } from "@/lib/queries/menu.queries";
import AnalyticsView from "@/components/analytics/AnalyticsView";
import type { AnalyticsPeriod } from "@/components/analytics/types";
import { AnalyticsData } from "@/components/analytics/AnalyticsData";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: AnalyticsPeriod }>;
}) {
  const user = await getAuthUser();

  const menu = await getMenuByUserId(user.id);
  if (!menu) redirect("/dashboard");

  const menuId = menu?.id ?? "";

  const { period: periodParam } = await searchParams;
  const period: AnalyticsPeriod =
    periodParam === "today" || periodParam === "month" ? periodParam : "week";

  const analyticsData = await AnalyticsData({
    businessId: user.id,
    period,
    menuId,
  });

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <LoaderIcon className="h-8 w-8 animate-spin text-[#CDF545]" />
        </div>
      }
    >
      <AnalyticsView initialData={analyticsData} />
    </Suspense>
  );
}
