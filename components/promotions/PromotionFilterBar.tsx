"use client";

import type { FilterStatus } from "@/lib/promotions";

interface FilterButton {
  label: string;
  value: FilterStatus;
}

interface PromotionFilterBarProps {
  filterButtons: FilterButton[];
  activeFilter: FilterStatus;
  onFilterChange: (value: FilterStatus) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function PromotionFilterBar({
  filterButtons,
  activeFilter,
  onFilterChange,
  searchValue,
  onSearchChange,
}: PromotionFilterBarProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-2 flex-wrap">
        {filterButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => onFilterChange(btn.value)}
            className={`px-4 py-2 rounded-md text-base font-bold transition-colors ${
              activeFilter === btn.value
                ? "bg-[#F5FDDA] text-green-800"
                : "bg-[#FBFBFA] text-[#1C1C1C] border border-[#E2E8F0]"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
      <div className="w-72">
        <div className="relative w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[#64748B]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar promoción..."
            className="w-full pl-10 pr-3 py-2 bg-[#F1F5F9] border-none shadow-none text-sm h-10 rounded-lg placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-gray-200"
          />
        </div>
      </div>
    </div>
  );
}
