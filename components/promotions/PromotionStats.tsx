interface StatItem {
  id: number;
  title: string;
  desc: string;
  value: number;
}

interface PromotionStatsProps {
  stats: StatItem[];
}

export function PromotionStats({ stats }: PromotionStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((s) => (
        <div
          key={s.id}
          className="w-full border border-[#E2E8F0] rounded-2xl p-5 flex justify-between items-center bg-[#FBFBFA]"
        >
          <div>
            <p className="text-sm font-semibold text-gray-800">{s.title}</p>
            <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
          </div>
          <span className="text-4xl font-bold text-gray-900">{s.value}</span>
        </div>
      ))}
    </div>
  );
}
