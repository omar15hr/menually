"use client";

import type { Database } from "@/types/database.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Menu = Database["public"]["Tables"]["menus"]["Row"];
type EditableFieldType = "color" | "select" | "toggle";

interface MenuFieldInputProps {
  field: keyof Menu;
  type: EditableFieldType;
  value: Menu[keyof Menu];
  options?: { value: string; label: string }[];
  onChange: (field: keyof Menu, value: string | boolean) => void;
}

export function MenuFieldInput({
  field,
  type,
  value,
  options,
  onChange,
}: MenuFieldInputProps) {
  if (type === "select" && options) {
    return (
      <Select
        value={value as string}
        onValueChange={(val) => onChange(field, val)}
      >
        <SelectTrigger className="w-full border-[#E4E4E6] text-sm focus:ring-[#CDF545]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (type === "toggle") {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={value as boolean}
        onClick={() => onChange(field, !(value as boolean))}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 ${
          value ? "bg-[#114821]" : "bg-gray-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform ring-0 transition duration-200 ease-in-out ${
            value ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    );
  }

  return null;
}
