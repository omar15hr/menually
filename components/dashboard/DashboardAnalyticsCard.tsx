import { Info, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  Tooltip,
} from "../ui/tooltip";

interface Metric {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  trend: string;
  trendUp: boolean;
  isPositive: boolean;
  tooltip?: string;
}

interface DashboardAnalyticsCardProps {
  metric: Metric;
}

export default function DashboardAnalyticsCard({
  metric,
}: DashboardAnalyticsCardProps) {
  return (
    <Card key={metric.id} className="bg-[#FBFBFA] border-[#E2E8F0] rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[#1C1C1C]">
          {metric.title}

          {metric.tooltip && (
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-800 cursor-help" />
                </TooltipTrigger>

                <TooltipContent className="bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-md">
                  <p>{metric.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>

        <p className="text-xs text-[#58606E]">{metric.subtitle}</p>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-end">
          <span className="text-4xl font-extrabold tracking-tight text-gray-900">
            {metric.value}
          </span>

          <div
            className={`flex items-center text-sm font-medium mt-1 ${
              metric.isPositive ? "text-[#00A32F]" : "text-[#AB0505]"
            }`}
          >
            {metric.trendUp ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}

            {metric.trend}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
