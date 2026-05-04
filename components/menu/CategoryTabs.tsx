"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CategoryTabsProps {
  tabs: string[];
  activeTab: number;
  primaryColor?: string;
  onTabChange: (index: number) => void;
}

export function CategoryTabs({
  tabs,
  activeTab,
  primaryColor = "#2563EB",
  onTabChange,
}: CategoryTabsProps) {
  return (
    <ScrollArea className="w-full mt-1">
      <div className="flex px-4 gap-5 border-b border-gray-100 pb-2">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => onTabChange(i)}
            className="pb-2 text-base font-bold whitespace-nowrap"
            style={{
              color: activeTab === i ? primaryColor : "#9CA3AF",
              borderBottom:
                activeTab === i
                  ? `2px solid ${primaryColor}`
                  : "2px solid transparent",
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
