import type { ReactNode } from "react";

interface MenuFieldRowProps {
  label: string;
  children: ReactNode;
  layout?: "row" | "col";
}

export function MenuFieldRow({
  label,
  children,
  layout = "col",
}: MenuFieldRowProps) {
  return (
    <div
      className={`flex px-4 py-3 min-h-12 ${
        layout === "row"
          ? "flex-row items-center justify-between"
          : "flex-col items-start gap-2"
      }`}
    >
      <span className="text-sm text-[#1C1C1C] font-semibold shrink-0">
        {label}
      </span>
      {children}
    </div>
  );
}
