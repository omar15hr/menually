"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import GripIcon from "../icons/GrapIcon";
import type { CategoryWithProducts } from "@/types/categories.types";

interface SortableCategoryItemProps {
  category: CategoryWithProducts;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function SortableCategoryItem({
  category,
  isSelected,
  onSelect,
}: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Button
        type="button"
        variant="ghost"
        className={cn(
          "h-auto w-full p-4 justify-between rounded-none text-[#1C1C1C] bg-white text-sm font-semibold capitalize",
          isSelected && "bg-[#CDF5454D] hover:bg-[#CDF5454D]",
        )}
        style={{
          borderLeft: isSelected
            ? "2px solid #114821"
            : "2px solid transparent",
        }}
        onClick={() => onSelect(category.id)}
        aria-pressed={isSelected}
      >
        {category.name}
        <span
          className="cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripIcon />
        </span>
      </Button>
    </div>
  );
}
