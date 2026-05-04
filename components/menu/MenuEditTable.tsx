"use client";

import type { Database } from "@/types/database.types";
import ImageUploader from "@/components/shared/ImageUploader";
import { MenuFieldRow } from "./MenuFieldRow";
import { MenuFieldInput } from "./MenuFieldInput";
import { MenuLayoutSelector } from "./MenuLayoutSelector";
import { MenuShapeSelector } from "./MenuShapeSelector";
import { ColorPickerGroup } from "./ColorPickerGroup";
import { MenuVisibilitySection } from "./MenuVisibilitySection";

type Menu = Database["public"]["Tables"]["menus"]["Row"];

type EditableField = {
  label: string;
  field: keyof Menu;
  type: "color" | "select" | "toggle";
  options?: { value: string; label: string }[];
};

const EDITABLE_FIELDS: EditableField[] = [
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
  { label: "Primario", field: "primary_color", type: "color" },
  { label: "Texto", field: "text_color", type: "color" },
  { label: "Fondo", field: "bg_color", type: "color" },
  { label: "Precio", field: "price_color", type: "color" },
  { label: "Descripción", field: "description_color", type: "color" },
  { label: "Mostrar precio", field: "show_price", type: "toggle" },
  {
    label: "Mostrar descripciones",
    field: "show_descriptions",
    type: "toggle",
  },
  { label: "Mostrar filtros", field: "show_filters", type: "toggle" },
];

const colorFields = EDITABLE_FIELDS.filter((f) => f.type === "color");
const toggleFields = EDITABLE_FIELDS.filter((f) => f.type === "toggle");
const otherFields = EDITABLE_FIELDS.filter(
  (f) => f.type !== "color" && f.type !== "toggle",
);

interface Props {
  menu: Menu;
  error: string | null;
  successMsg: string | null;
  logoUrl: string;
  coverUrl: string;
  onLogoUrlSelected: (url: string) => void;
  onCoverUrlSelected: (url: string) => void;
  onChange: (field: keyof Menu, value: string | boolean) => void;
}

export function MenuEditTable({
  menu,
  onChange,
  logoUrl,
  coverUrl,
  onLogoUrlSelected,
  onCoverUrlSelected,
}: Props) {
  const colorValues = Object.fromEntries(
    colorFields.map(({ field }) => [field, (menu[field] as string) ?? ""]),
  );

  const visibilityValues = Object.fromEntries(
    toggleFields.map(({ field }) => [field, (menu[field] as boolean) ?? false]),
  );

  return (
    <div className="flex flex-col w-full max-w-sm bg-white border border-[#E4E4E6]">
      <div className="flex flex-col p-4 border-b">
        <h2 className="text-[#0F172A] text-base font-extrabold">Diseño</h2>
        <p className="text-[#58606E] text-sm">
          Ajusta colores, tipografías y estilo en segundos.
        </p>
      </div>

      <div className="bg-white overflow-hidden">
        <MenuFieldRow label="Slug">
          <span className="text-sm text-gray-400 font-semibold truncate max-w-50">
            {menu.slug}
          </span>
        </MenuFieldRow>

        <ImageUploader
          label="Logo"
          imagePath="logos"
          imageUrl={logoUrl}
          onImageUploaded={onLogoUrlSelected}
        />

        <ImageUploader
          label="Portada"
          imagePath="backgrounds"
          imageUrl={coverUrl}
          onImageUploaded={onCoverUrlSelected}
        />

        <ColorPickerGroup
          colorFields={colorFields}
          values={colorValues}
          onChange={onChange}
        />

        {otherFields.map(({ label, field, type, options }) => (
          <MenuFieldRow
            key={field}
            label={label}
            layout={type === "toggle" ? "row" : "col"}
          >
            {field === "layout_card" ? (
              <MenuLayoutSelector
                value={menu[field] as string}
                onChange={(val) => onChange(field, val)}
              />
            ) : field === "image_product_shape" ? (
              <MenuShapeSelector
                value={menu[field] as string}
                onChange={(val) => onChange(field, val)}
              />
            ) : (
              <MenuFieldInput
                field={field}
                type={type}
                value={menu[field]}
                options={options}
                onChange={onChange}
              />
            )}
          </MenuFieldRow>
        ))}

        <MenuVisibilitySection
          fields={toggleFields}
          values={visibilityValues}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
