import IAIcon from "../icons/IAIcon";
import { Card, CardContent } from "../ui/card";

interface Insight {
  title: string;
  content: string;
  headerColor: string;
}

export default function DashboardInsightsCard({ insights }: { insights: Insight[] }) {
  return (
    <Card className="rounded-lg max-w-xs border-[#E4E4E6] bg-[#FBFBFA] overflow-hidden sticky top-6 h-fit">
      <div className="px-5 pt-3 flex items-center gap-2">
        <IAIcon className="h-5 w-5 text-[#29AE50]" />

        <h3 className="font-bold text-[#29AE50] text-base">
          AI Insights y recomendaciones
        </h3>
      </div>

      <CardContent className="px-5 pt-2 space-y-4">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="border border-[#E4E4E6] rounded-lg overflow-hidden"
          >
            <div
              className={`px-4 py-2 text-sm font-bold ${insight.headerColor}`}
            >
              {insight.title}
            </div>

            <div className="p-4 text-xs text-[#58606E] leading-relaxed bg-white">
              <p>{insight.content}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
