"use client";

import { useState } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import XIcon from "../icons/XIcon";

type Option = {
  label: string;
  value: string;
};

type MultiSelectChipsProps = {
  options: Option[];
  value?: string[];
  onChange?: (value: string[]) => void;
  name?: string;
};

export function MultiSelectChips({
  options,
  value,
  onChange,
  name,
}: MultiSelectChipsProps) {
  const [selected, setSelected] = useState<string[]>(value ?? []);

  const handleChange = (val: string[]) => {
    setSelected(val);
    onChange?.(val);
  };

  return (
    <div className="space-y-2">
      <ToggleGroup
        type="multiple"
        value={selected}
        onValueChange={handleChange}
        spacing={2}
        className="flex flex-wrap justify-start gap-2"
      >
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <ToggleGroupItem
              key={opt.value}
              value={opt.value}
              className={cn(
                "rounded-full px-4 py-1 text-sm font-medium transition-colors",
                "h-auto min-w-0 flex items-center gap-2",
                isSelected
                  ? "bg-green-800 text-white hover:bg-green-700 data-[state=on]:bg-green-800 data-[state=on]:text-white"
                  : "bg-muted text-foreground hover:bg-muted/80 data-[state=on]:bg-green-800 data-[state=on]:text-white"
              )}
            >
              {opt.label}
              {isSelected && (
                <div className="bg-white rounded-full p-1 flex items-center justify-center">
                  <XIcon
                    fill="#000000"
                    className="size-1.5 shrink-0 opacity-80"
                  />
                </div>
              )}
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>

      {name &&
        selected.map((val) => (
          <input key={val} type="hidden" name={name} value={val} />
        ))}
    </div>
  );
}
