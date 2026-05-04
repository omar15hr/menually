import type { Database } from "@/types/database.types";

type Menu = Database["public"]["Tables"]["menus"]["Row"];

interface ColorField {
  label: string;
  field: keyof Menu;
}

interface ColorPickerGroupProps {
  colorFields: ColorField[];
  values: Record<string, string>;
  onChange: (field: keyof Menu, value: string) => void;
}

export function ColorPickerGroup({
  colorFields,
  values,
  onChange,
}: ColorPickerGroupProps) {
  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <span className="text-sm text-[#1C1C1C] font-semibold">Colores</span>
      <div className="flex flex-row flex-wrap gap-x-4 gap-y-3 justify-between px-2">
        {colorFields.map(({ label, field }) => (
          <div key={field} className="flex flex-col items-center gap-1">
            <input
              id={`edit-${field}`}
              type="color"
              value={values[field] ?? "#000000"}
              onChange={(e) => onChange(field, e.target.value)}
              className="size-10 rounded-md cursor-pointer p-0.5"
            />
            <span className="text-xs font-mono text-gray-400">
              {values[field] ?? ""}
            </span>
            <span className="text-xs text-[#58606E] text-center leading-tight max-w-14">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
