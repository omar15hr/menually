import type { Database } from "@/types/database.types";
import { MenuFieldInput } from "./MenuFieldInput";

type Menu = Database["public"]["Tables"]["menus"]["Row"];

interface VisibilityField {
  label: string;
  field: keyof Menu;
}

interface MenuVisibilitySectionProps {
  fields: VisibilityField[];
  values: Record<string, boolean>;
  onChange: (field: keyof Menu, value: string | boolean) => void;
}

export function MenuVisibilitySection({
  fields,
  values,
  onChange,
}: MenuVisibilitySectionProps) {
  return (
    <div className="flex flex-col px-4 py-3 gap-1">
      <span className="text-sm text-[#1C1C1C] font-semibold mb-2">
        Visibilidad
      </span>
      {fields.map(({ label, field }) => (
        <div
          key={field}
          className="flex items-center justify-between py-2.5"
        >
          <span className="text-sm text-[#58606E]">{label}</span>
          <MenuFieldInput
            field={field}
            type="toggle"
            value={values[field] ?? false}
            onChange={onChange}
          />
        </div>
      ))}
    </div>
  );
}
