"use client";

import type { Database } from "@/types/database.types";

type Menu = Database["public"]["Tables"]["menus"]["Row"];

type EditableField = {
  label: string;
  field: keyof Menu;
  type: "color" | "text" | "select" | "toggle";
  options?: { value: string; label: string }[];
};

const EDITABLE_FIELDS: EditableField[] = [
  { label: "Activo", field: "is_active", type: "toggle" },
  {
    label: "Tipografía",
    field: "typography",
    type: "select",
    options: [
      { value: "inter", label: "Inter" },
      { value: "roboto", label: "Roboto" },
      { value: "montserrat", label: "Montserrat" },
    ],
  },
  {
    label: "Layout",
    field: "layout_card",
    type: "select",
    options: [
      { value: "horizontal", label: "Horizontal" },
      { value: "vertical", label: "Vertical" },
    ],
  },
  {
    label: "Forma de imagen",
    field: "image_product_shape",
    type: "select",
    options: [
      { value: "square", label: "Cuadrada" },
      { value: "rounded", label: "Redondeada" },
      { value: "circle", label: "Circular" },
    ],
  },
  { label: "Mostrar precio", field: "show_price", type: "toggle" },
  { label: "Mostrar descripciones", field: "show_descriptions", type: "toggle" },
  { label: "Mostrar filtros", field: "show_filters", type: "toggle" },
  { label: "Color primario", field: "primary_color", type: "color" },
  { label: "Color de texto", field: "text_color", type: "color" },
  { label: "Color de fondo", field: "bg_color", type: "color" },
  { label: "Color de precio", field: "price_color", type: "color" },
  { label: "Color descripción", field: "description_color", type: "color" },
  { label: "Imagen de fondo (URL)", field: "bg_image_url", type: "text" },
  { label: "Logo (URL)", field: "logo_url", type: "text" },
];

interface Props {
  menu: Menu;
  onChange: (field: keyof Menu, value: string | boolean) => void;
  onSave: () => void;
  isPending: boolean;
  error: string | null;
  successMsg: string | null;
}

export function MenuEditTable({
  menu,
  onChange,
  onSave,
  isPending,
  error,
  successMsg,
}: Props) {
  return (
    <div className="flex flex-col w-full max-w-md">
      <h2 className="text-lg font-semibold mb-3">Configuración del menú</h2>

      <div className="border border-[#E4E4E6] rounded-xl bg-white overflow-hidden divide-y divide-[#E4E4E6]">
        {/* Slug — read only */}
        <Row label="Slug">
          <span className="text-sm text-gray-400 font-mono truncate max-w-50">
            {menu.slug}
          </span>
        </Row>

        {/* Editable fields */}
        {EDITABLE_FIELDS.map(({ label, field, type, options }) => (
          <Row key={field} label={label}>
            {type === "color" && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">
                  {menu[field] as string}
                </span>
                <input
                  id={`edit-${field}`}
                  type="color"
                  value={menu[field] as string}
                  onChange={(e) => onChange(field, e.target.value)}
                  className="w-7 h-7 rounded-md border border-[#E4E4E6] cursor-pointer p-0.5"
                />
              </div>
            )}

            {type === "text" && (
              <input
                id={`edit-${field}`}
                type="text"
                value={menu[field] as string}
                onChange={(e) => onChange(field, e.target.value)}
                placeholder="https://..."
                className="w-44 px-2.5 py-1.5 border border-[#E4E4E6] rounded-lg text-right text-sm bg-[#FBFBFA] focus:outline-none focus:ring-2 focus:ring-black/10 transition-shadow"
              />
            )}

            {type === "select" && options && (
              <select
                id={`edit-${field}`}
                value={menu[field] as string}
                onChange={(e) => onChange(field, e.target.value)}
                className="px-2.5 py-1.5 border border-[#E4E4E6] rounded-lg text-sm bg-[#FBFBFA] focus:outline-none focus:ring-2 focus:ring-black/10 transition-shadow cursor-pointer"
              >
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {type === "toggle" && (
              <button
                id={`edit-${field}`}
                type="button"
                role="switch"
                aria-checked={menu[field] as boolean}
                onClick={() => onChange(field, !(menu[field] as boolean))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 ${menu[field] ? "bg-black" : "bg-gray-200"
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform ring-0 transition duration-200 ease-in-out ${menu[field] ? "translate-x-5" : "translate-x-0"
                    }`}
                />
              </button>
            )}
          </Row>
        ))}
      </div>

      {/* Messages */}
      {error && (
        <div className="mt-3 px-4 py-2.5 text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mt-3 px-4 py-2.5 text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg">
          {successMsg}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={onSave}
        disabled={isPending}
        className="mt-4 w-full px-4 py-2.5 text-sm font-medium bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 min-h-12">
      <span className="text-sm text-gray-600 shrink-0">{label}</span>
      {children}
    </div>
  );
}
