import { Suspense } from "react";
import { LoaderIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { getAuthUser } from "@/lib/queries/auth.queries";
import { getMenuByUserId } from "@/lib/queries/menu.queries";
import type { AnalyticsPeriod } from "@/components/analytics/types";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: AnalyticsPeriod }>;
}) {
  const user = await getAuthUser();

  const menu = await getMenuByUserId(user.id);
  if (!menu) redirect("/dashboard");

  const { period: periodParam } = await searchParams;
  const period: AnalyticsPeriod =
    periodParam === "today" || periodParam === "month" ? periodParam : "week";

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <LoaderIcon className="h-8 w-8 animate-spin text-[#CDF545]" />
        </div>
      }
    >
      <AnalyticsDashboard
        businessId={user.id}
        menuId={menu.id}
        period={period}
      />
    </Suspense>
  );
}
