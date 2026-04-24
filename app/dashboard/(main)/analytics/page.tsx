import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import AnalyticsView from "@/components/analytics/AnalyticsView";
import { AnalyticsData } from "@/components/analytics/AnalyticsData";
import type { AnalyticsPeriod } from "@/components/analytics/types";
import { LoaderIcon } from "lucide-react";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: AnalyticsPeriod }>;
}) {
  const supabase = await createClient();
  
  // Get authenticated user - this is the business_id
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Get user's menu to get menuId
  const { data: menu } = await supabase
    .from("menus")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  const menuId = menu?.id ?? "";

  const { period: periodParam } = await searchParams;
  const period: AnalyticsPeriod = periodParam === "today" || periodParam === "month" ? periodParam : "week";

  // Fetch analytics data - use user.id as businessId
  const analyticsData = await AnalyticsData({
    businessId: user.id,
    period,
    menuId,
  });

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <LoaderIcon className="h-8 w-8 animate-spin text-[#CDF545]" />
      </div>
    }>
      <AnalyticsView initialData={analyticsData} />
    </Suspense>
  );
}